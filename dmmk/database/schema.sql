-- DMMK Zero-Fee Payment Network — MySQL Schema
-- Charset/collation tuned for wallet addresses and external IDs.

CREATE DATABASE IF NOT EXISTS dmmk_pay
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE dmmk_pay;

-- ---------------------------------------------------------------------------
-- Users: customers, merchants, and P2P liquidity agents
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  role          ENUM('customer', 'merchant', 'agent') NOT NULL,
  wallet_address VARCHAR(42) NOT NULL,
  display_name  VARCHAR(128) DEFAULT NULL,
  phone         VARCHAR(32) DEFAULT NULL,
  kpay_id       VARCHAR(64) DEFAULT NULL COMMENT 'KPay account identifier',
  wave_id       VARCHAR(64) DEFAULT NULL COMMENT 'Wave Money account identifier',
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_wallet (wallet_address),
  KEY idx_users_role (role),
  KEY idx_users_role_active (role, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Orders: point-of-sale invoices linked to on-chain settlement
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  external_order_id VARCHAR(64) NOT NULL COMMENT 'Merchant-supplied POS order id',
  merchant_id     BIGINT UNSIGNED NOT NULL,
  customer_wallet VARCHAR(42) DEFAULT NULL,
  amount_dmmk     DECIMAL(36, 18) NOT NULL,
  platform_fee    DECIMAL(36, 18) NOT NULL DEFAULT 0.000000000000000000 COMMENT 'Always 0 for retail checkout',
  status          ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  tx_hash         VARCHAR(66) DEFAULT NULL,
  block_timestamp BIGINT UNSIGNED DEFAULT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_merchant_external (merchant_id, external_order_id),
  KEY idx_orders_status (status),
  KEY idx_orders_merchant_status (merchant_id, status),
  KEY idx_orders_pending_match (merchant_id, amount_dmmk, status),
  KEY idx_orders_tx_hash (tx_hash),
  CONSTRAINT fk_orders_merchant FOREIGN KEY (merchant_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Cash-out requests: P2P agent pool for KPay / Wave Money fiat rails
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cash_out_requests (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  requester_id    BIGINT UNSIGNED NOT NULL COMMENT 'Usually merchant_id',
  agent_id        BIGINT UNSIGNED DEFAULT NULL,
  amount_dmmk     DECIMAL(36, 18) NOT NULL,
  fiat_channel    ENUM('kpay', 'wave') NOT NULL,
  fiat_account    VARCHAR(128) NOT NULL,
  priority        TINYINT UNSIGNED NOT NULL DEFAULT 5 COMMENT '1=highest, 10=lowest',
  status          ENUM('queued', 'fiat_sent', 'completed') NOT NULL DEFAULT 'queued',
  matched_at      TIMESTAMP NULL DEFAULT NULL,
  fiat_sent_at    TIMESTAMP NULL DEFAULT NULL,
  completed_at    TIMESTAMP NULL DEFAULT NULL,
  notes           TEXT DEFAULT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_cashout_status_priority (status, priority, created_at),
  KEY idx_cashout_requester (requester_id, status),
  KEY idx_cashout_agent (agent_id, status),
  KEY idx_cashout_queued_pool (status, priority, amount_dmmk),
  CONSTRAINT fk_cashout_requester FOREIGN KEY (requester_id) REFERENCES users (id),
  CONSTRAINT fk_cashout_agent FOREIGN KEY (agent_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
