"use strict";

const express = require("express");
const { pool } = require("../lib/pool");
const { getMerchantById } = require("../lib/users");

const router = express.Router();

/**
 * GET /api/merchant/orders?merchantId=1&status=pending
 */
router.get("/orders", async (req, res) => {
  try {
    const merchantId = Number(req.query.merchantId);
    const status = req.query.status;

    if (!merchantId) {
      return res.status(400).json({ error: "merchantId query parameter is required" });
    }

    const merchant = await getMerchantById(merchantId);
    if (!merchant) {
      return res.status(404).json({ error: "Merchant not found or inactive" });
    }

    const params = [merchantId];
    let statusClause = "";
    if (status) {
      const allowed = ["pending", "completed", "failed"];
      if (!allowed.includes(String(status))) {
        return res.status(400).json({ error: `status must be one of: ${allowed.join(", ")}` });
      }
      statusClause = " AND o.status = ?";
      params.push(status);
    }

    const [rows] = await pool.execute(
      `SELECT o.id, o.external_order_id, o.amount_dmmk, o.platform_fee, o.status,
              o.customer_wallet, o.tx_hash, o.created_at, o.updated_at
       FROM orders o
       WHERE o.merchant_id = ?${statusClause}
       ORDER BY o.created_at DESC
       LIMIT 100`,
      params
    );

    res.json({ success: true, orders: rows });
  } catch (err) {
    console.error("[merchant/orders] Error:", err);
    res.status(500).json({ error: "Failed to list orders", details: err.message });
  }
});

/**
 * GET /api/merchant/cashouts?merchantId=1
 */
router.get("/cashouts", async (req, res) => {
  try {
    const merchantId = Number(req.query.merchantId);
    if (!merchantId) {
      return res.status(400).json({ error: "merchantId query parameter is required" });
    }

    const merchant = await getMerchantById(merchantId);
    if (!merchant) {
      return res.status(404).json({ error: "Merchant not found or inactive" });
    }

    const [rows] = await pool.execute(
      `SELECT c.id, c.amount_dmmk, c.fiat_channel, c.fiat_account, c.priority, c.status,
              c.agent_id, a.display_name AS agent_name, c.matched_at, c.fiat_sent_at,
              c.completed_at, c.created_at
       FROM cash_out_requests c
       LEFT JOIN users a ON a.id = c.agent_id
       WHERE c.requester_id = ?
       ORDER BY c.created_at DESC
       LIMIT 100`,
      [merchantId]
    );

    res.json({ success: true, cashOuts: rows });
  } catch (err) {
    console.error("[merchant/cashouts] Error:", err);
    res.status(500).json({ error: "Failed to list cash-outs", details: err.message });
  }
});

module.exports = { router };
