"use strict";

const { pool } = require("./pool");

async function getUserByIdAndRole(userId, role) {
  const [rows] = await pool.execute(
    `SELECT id, role, wallet_address, display_name, kpay_id, wave_id
     FROM users
     WHERE id = ? AND role = ? AND is_active = 1
     LIMIT 1`,
    [userId, role]
  );
  return rows[0] || null;
}

async function getMerchantById(merchantId) {
  return getUserByIdAndRole(merchantId, "merchant");
}

async function getAgentById(agentId) {
  return getUserByIdAndRole(agentId, "agent");
}

module.exports = { getMerchantById, getAgentById };
