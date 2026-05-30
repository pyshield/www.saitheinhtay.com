"use strict";

const express = require("express");
const { pool } = require("../lib/pool");
const { getAgentById } = require("../lib/users");

const router = express.Router();

/**
 * GET /api/agent/cashout/pool
 * Lists unclaimed queued requests for P2P matching (priority ASC, FIFO).
 */
router.get("/cashout/pool", async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT c.id, c.requester_id, m.display_name AS merchant_name,
              c.amount_dmmk, c.fiat_channel, c.fiat_account, c.priority, c.created_at
       FROM cash_out_requests c
       INNER JOIN users m ON m.id = c.requester_id
       WHERE c.status = 'queued' AND c.agent_id IS NULL
       ORDER BY c.priority ASC, c.created_at ASC
       LIMIT 50`
    );

    res.json({ success: true, pool: rows });
  } catch (err) {
    console.error("[agent/pool] Error:", err);
    res.status(500).json({ error: "Failed to load cash-out pool", details: err.message });
  }
});

/**
 * GET /api/agent/cashout/assignments?agentId=2
 */
router.get("/cashout/assignments", async (req, res) => {
  try {
    const agentId = Number(req.query.agentId);
    if (!agentId) {
      return res.status(400).json({ error: "agentId query parameter is required" });
    }

    const agent = await getAgentById(agentId);
    if (!agent) {
      return res.status(404).json({ error: "Agent not found or inactive" });
    }

    const [rows] = await pool.execute(
      `SELECT c.id, c.requester_id, c.amount_dmmk, c.fiat_channel, c.fiat_account,
              c.priority, c.status, c.matched_at, c.fiat_sent_at, c.completed_at, c.created_at
       FROM cash_out_requests c
       WHERE c.agent_id = ? AND c.status IN ('queued', 'fiat_sent')
       ORDER BY c.priority ASC, c.created_at ASC
       LIMIT 50`,
      [agentId]
    );

    res.json({ success: true, assignments: rows });
  } catch (err) {
    console.error("[agent/assignments] Error:", err);
    res.status(500).json({ error: "Failed to list assignments", details: err.message });
  }
});

/**
 * POST /api/agent/cashout/:id/claim
 * Body: { agentId }
 */
router.post("/cashout/:id/claim", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const requestId = Number(req.params.id);
    const { agentId } = req.body;

    if (!requestId || !agentId) {
      return res.status(400).json({ error: "request id and agentId are required" });
    }

    const agent = await getAgentById(agentId);
    if (!agent) {
      return res.status(404).json({ error: "Agent not found or inactive" });
    }

    await connection.beginTransaction();

    const [rows] = await connection.execute(
      `SELECT id, status, agent_id
       FROM cash_out_requests
       WHERE id = ?
       FOR UPDATE`,
      [requestId]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Cash-out request not found" });
    }

    const request = rows[0];
    if (request.status !== "queued" || request.agent_id !== null) {
      await connection.rollback();
      return res.status(409).json({ error: "Request is no longer available in the pool" });
    }

    const [activeCount] = await connection.execute(
      `SELECT COUNT(*) AS cnt
       FROM cash_out_requests
       WHERE agent_id = ? AND status IN ('queued', 'fiat_sent')`,
      [agentId]
    );

    const maxActive = Number(process.env.AGENT_MAX_ACTIVE_CASHOUTS) || 5;
    if (activeCount[0].cnt >= maxActive) {
      await connection.rollback();
      return res.status(429).json({
        error: `Agent has reached maximum active cash-outs (${maxActive})`,
      });
    }

    await connection.execute(
      `UPDATE cash_out_requests
       SET agent_id = ?, matched_at = CURRENT_TIMESTAMP
       WHERE id = ? AND status = 'queued' AND agent_id IS NULL`,
      [agentId, requestId]
    );

    await connection.commit();

    console.log(`[agent] Agent #${agentId} claimed cash-out #${requestId}`);

    res.json({
      success: true,
      message: "Cash-out claimed — send fiat via KPay/Wave Money, then mark fiat_sent",
      requestId,
      agentId,
      status: "queued",
      agentAssigned: true,
    });
  } catch (err) {
    await connection.rollback().catch(() => {});
    console.error("[agent/claim] Error:", err);
    res.status(500).json({ error: "Failed to claim cash-out", details: err.message });
  } finally {
    connection.release();
  }
});

/**
 * POST /api/agent/cashout/:id/fiat-sent
 * Body: { agentId, notes? }
 */
router.post("/cashout/:id/fiat-sent", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const requestId = Number(req.params.id);
    const { agentId, notes } = req.body;

    if (!requestId || !agentId) {
      return res.status(400).json({ error: "request id and agentId are required" });
    }

    const agent = await getAgentById(agentId);
    if (!agent) {
      return res.status(404).json({ error: "Agent not found or inactive" });
    }

    await connection.beginTransaction();

    const [result] = await connection.execute(
      `UPDATE cash_out_requests
       SET status = 'fiat_sent',
           fiat_sent_at = CURRENT_TIMESTAMP,
           notes = COALESCE(?, notes)
       WHERE id = ? AND agent_id = ? AND status = 'queued'`,
      [notes || null, requestId, agentId]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(409).json({
        error: "Cannot mark fiat_sent — check assignment and current status",
      });
    }

    await connection.commit();

    console.log(`[agent] Agent #${agentId} marked fiat_sent on cash-out #${requestId}`);

    res.json({ success: true, requestId, status: "fiat_sent" });
  } catch (err) {
    await connection.rollback().catch(() => {});
    console.error("[agent/fiat-sent] Error:", err);
    res.status(500).json({ error: "Failed to update cash-out", details: err.message });
  } finally {
    connection.release();
  }
});

/**
 * POST /api/agent/cashout/:id/complete
 * Body: { agentId, notes? }
 */
router.post("/cashout/:id/complete", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const requestId = Number(req.params.id);
    const { agentId, notes } = req.body;

    if (!requestId || !agentId) {
      return res.status(400).json({ error: "request id and agentId are required" });
    }

    const agent = await getAgentById(agentId);
    if (!agent) {
      return res.status(404).json({ error: "Agent not found or inactive" });
    }

    await connection.beginTransaction();

    const [result] = await connection.execute(
      `UPDATE cash_out_requests
       SET status = 'completed',
           completed_at = CURRENT_TIMESTAMP,
           notes = COALESCE(?, notes)
       WHERE id = ? AND agent_id = ? AND status = 'fiat_sent'`,
      [notes || null, requestId, agentId]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(409).json({
        error: "Cannot complete — fiat must be marked sent first",
      });
    }

    await connection.commit();

    console.log(`[agent] Agent #${agentId} completed cash-out #${requestId}`);

    res.json({ success: true, requestId, status: "completed" });
  } catch (err) {
    await connection.rollback().catch(() => {});
    console.error("[agent/complete] Error:", err);
    res.status(500).json({ error: "Failed to complete cash-out", details: err.message });
  } finally {
    connection.release();
  }
});

module.exports = { router };
