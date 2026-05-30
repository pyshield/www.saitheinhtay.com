-- Demo users for local development (adjust wallet addresses before mainnet use)
USE dmmk_pay;

INSERT INTO users (role, wallet_address, display_name, phone, kpay_id, wave_id)
VALUES
  ('merchant', '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', 'Tea House Yangon', '09123456789', NULL, NULL),
  ('agent', '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', 'Agent Ko Htet', '09987654321', 'kp-agent-001', 'wave-agent-001')
ON DUPLICATE KEY UPDATE display_name = VALUES(display_name);
