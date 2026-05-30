"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");
const QRCode = require("qrcode");
const routerAbi = require("./abi/ZeroFeePaymentRouter.json");
const { pool } = require("./lib/pool");
const { getMerchantById } = require("./lib/users");
const { normalizeAmountForDb, amountToDbString } = require("./lib/amount");
const merchantRoutes = require("./routes/merchant");
const agentRoutes = require("./routes/agent");

const PORT = Number(process.env.PORT) || 3000;
const PLATFORM_FEE_RATE = 0;

const requiredEnv = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME", "RPC_URL", "ROUTER_CONTRACT_ADDRESS"];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.warn(`[config] Warning: ${key} is not set in environment`);
  }
}

let provider;
let paymentContract;

function initBlockchain() {
  if (!process.env.RPC_URL && !process.env.WS_RPC_URL) {
    throw new Error("RPC_URL (or WS_RPC_URL) must be configured");
  }

  provider = process.env.WS_RPC_URL
    ? new ethers.WebSocketProvider(process.env.WS_RPC_URL)
    : new ethers.JsonRpcProvider(process.env.RPC_URL);

  const routerAddress = process.env.ROUTER_CONTRACT_ADDRESS;
  if (!routerAddress || !ethers.isAddress(routerAddress)) {
    throw new Error("ROUTER_CONTRACT_ADDRESS must be a valid address");
  }

  paymentContract = new ethers.Contract(routerAddress, routerAbi, provider);
  return paymentContract;
}

function normalizeAddress(address) {
  return ethers.getAddress(address);
}

function buildQrPayload({ merchantWallet, amount, orderId }) {
  return JSON.stringify({
    network: "DMMK-PAY",
    token: "DMMK",
    merchant: merchantWallet,
    amount: String(amount),
    order: String(orderId),
  });
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    const block = provider ? await provider.getBlockNumber() : null;
    res.json({ status: "ok", database: "connected", blockNumber: block });
  } catch (err) {
    res.status(503).json({ status: "degraded", error: err.message });
  }
});

app.use("/api/merchant", merchantRoutes.router);

app.post("/api/merchant/invoice", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { merchantId, amount, orderId } = req.body;

    if (!merchantId || amount === undefined || amount === null || !orderId) {
      return res.status(400).json({
        error: "merchantId, amount, and orderId are required",
      });
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: "amount must be a positive number" });
    }

    const merchant = await getMerchantById(merchantId);
    if (!merchant) {
      return res.status(404).json({ error: "Merchant not found or inactive" });
    }

    const merchantWallet = normalizeAddress(merchant.wallet_address);
    const amountStr = normalizeAmountForDb(parsedAmount);

    await connection.beginTransaction();

    const [insertResult] = await connection.execute(
      `INSERT INTO orders (external_order_id, merchant_id, amount_dmmk, platform_fee, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [String(orderId), merchantId, amountStr, PLATFORM_FEE_RATE]
    );

    await connection.commit();

    const payload = buildQrPayload({
      merchantWallet,
      amount: amountStr,
      orderId: String(orderId),
    });

    const qrPngBase64 = await QRCode.toBuffer(payload, {
      type: "png",
      errorCorrectionLevel: "M",
      margin: 2,
      width: 320,
    }).then((buf) => buf.toString("base64"));

    res.status(201).json({
      success: true,
      order: {
        id: insertResult.insertId,
        externalOrderId: String(orderId),
        merchantId,
        merchantWallet,
        amount: amountStr,
        status: "pending",
        platformFeePercent: 0,
      },
      paymentPayload: JSON.parse(payload),
      qrCodeBase64: qrPngBase64,
      qrMimeType: "image/png",
    });
  } catch (err) {
    await connection.rollback().catch(() => {});
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Order ID already exists for this merchant" });
    }
    console.error("[invoice] Error:", err);
    res.status(500).json({ error: "Failed to create invoice", details: err.message });
  } finally {
    connection.release();
  }
});

app.post("/api/merchant/cashout", async (req, res) => {
  try {
    const { merchantId, amount, fiatChannel, fiatAccount, priority } = req.body;

    if (!merchantId || amount === undefined || !fiatChannel || !fiatAccount) {
      return res.status(400).json({
        error: "merchantId, amount, fiatChannel, and fiatAccount are required",
      });
    }

    const channel = String(fiatChannel).toLowerCase();
    if (!["kpay", "wave"].includes(channel)) {
      return res.status(400).json({ error: "fiatChannel must be 'kpay' or 'wave'" });
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: "amount must be a positive number" });
    }

    const merchant = await getMerchantById(merchantId);
    if (!merchant) {
      return res.status(404).json({ error: "Merchant not found or inactive" });
    }

    const requestPriority = priority !== undefined ? Math.min(10, Math.max(1, Number(priority))) : 1;
    const amountStr = normalizeAmountForDb(parsedAmount);

    const [result] = await pool.execute(
      `INSERT INTO cash_out_requests
         (requester_id, amount_dmmk, fiat_channel, fiat_account, priority, status)
       VALUES (?, ?, ?, ?, ?, 'queued')`,
      [merchantId, amountStr, channel, String(fiatAccount), requestPriority]
    );

    res.status(201).json({
      success: true,
      cashOutRequest: {
        id: result.insertId,
        merchantId,
        amount: amountStr,
        fiatChannel: channel,
        fiatAccount: String(fiatAccount),
        priority: requestPriority,
        status: "queued",
      },
      message: "Cash-out queued for P2P agent matching (KPay/Wave Money)",
    });
  } catch (err) {
    console.error("[cashout] Error:", err);
    res.status(500).json({ error: "Failed to queue cash-out", details: err.message });
  }
});

app.use("/api/agent", agentRoutes.router);

app.use((err, _req, res, _next) => {
  console.error("[express] Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

async function settleOrderFromEvent({ customer, merchant, tokenAddress, amount, timestamp, txHash }) {
  const connection = await pool.getConnection();
  try {
    const merchantAddress = normalizeAddress(merchant);
    const customerAddress = normalizeAddress(customer);
    const amountDb = amountToDbString(amount);

    await connection.beginTransaction();

    const [orders] = await connection.execute(
      `SELECT o.id, o.external_order_id, o.amount_dmmk
       FROM orders o
       INNER JOIN users u ON u.id = o.merchant_id
       WHERE o.status = 'pending'
         AND LOWER(u.wallet_address) = LOWER(?)
         AND o.amount_dmmk = ?
       ORDER BY o.created_at ASC
       LIMIT 1
       FOR UPDATE`,
      [merchantAddress, amountDb]
    );

    if (orders.length === 0) {
      await connection.rollback();
      console.warn(
        `[daemon] No pending order matched — merchant=${merchantAddress} amount=${amountDb} tx=${txHash}`
      );
      return null;
    }

    const order = orders[0];

    await connection.execute(
      `UPDATE orders
       SET status = 'completed',
           customer_wallet = ?,
           platform_fee = 0,
           tx_hash = ?,
           block_timestamp = ?
       WHERE id = ? AND status = 'pending'`,
      [customerAddress, txHash, Number(timestamp), order.id]
    );

    await connection.commit();

    console.log(
      `[daemon] Order #${order.id} (${order.external_order_id}) completed — ` +
        `0% fee, tx=${txHash}, customer=${customerAddress}, token=${tokenAddress}, amount=${amountDb}`
    );

    return order;
  } catch (err) {
    await connection.rollback().catch(() => {});
    console.error("[daemon] Settlement transaction failed:", err);
    throw err;
  } finally {
    connection.release();
  }
}

function startBlockchainDaemon() {
  if (!paymentContract) {
    initBlockchain();
  }

  console.log(
    `[daemon] Listening for PaymentProcessed on ${process.env.ROUTER_CONTRACT_ADDRESS}`
  );

  paymentContract.on(
    "PaymentProcessed",
    async (customer, merchant, tokenAddress, amount, timestamp, event) => {
      try {
        const txHash = event.log?.transactionHash || event.transactionHash;
        await settleOrderFromEvent({
          customer,
          merchant,
          tokenAddress,
          amount,
          timestamp,
          txHash,
        });
      } catch (err) {
        console.error("[daemon] Event handler error:", err);
      }
    }
  );

  provider.on("error", (err) => {
    console.error("[daemon] Provider error:", err);
  });
}

async function bootstrap() {
  try {
    await pool.query("SELECT 1");
    console.log("[db] MySQL pool connected");
  } catch (err) {
    console.error("[db] Failed to connect — ensure schema.sql has been applied:", err.message);
    process.exit(1);
  }

  if (process.env.SKIP_BLOCKCHAIN === "true") {
    console.log("[blockchain] Listener skipped (SKIP_BLOCKCHAIN=true)");
  } else {
    try {
      initBlockchain();
      startBlockchainDaemon();
    } catch (err) {
      console.error("[blockchain] Listener failed to start:", err.message);
      process.exit(1);
    }
  }

  app.listen(PORT, () => {
    console.log(`[server] DMMK Pay API listening on http://localhost:${PORT}`);
  });
}

process.on("SIGINT", async () => {
  console.log("\n[server] Shutting down...");
  if (paymentContract) {
    paymentContract.removeAllListeners();
  }
  await pool.end();
  process.exit(0);
});

bootstrap();
