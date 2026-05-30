# DMMK Pay — Zero-Fee Payment Network

Digital Myanmar Kyat (DMMK) retail payments on an EVM Layer-2 with **0% merchant fees**, on-chain settlement, P2P agent cash-outs (KPay/Wave), and a merchant dashboard.

## Repository layout

| Path | Purpose |
|------|---------|
| `database/schema.sql` | MySQL schema |
| `database/seed-demo.sql` | Demo merchant + agent users |
| `contracts/` | Solidity + Hardhat deploy |
| `backend/` | Express API + blockchain listener |
| `frontend/` | React merchant dashboard (Vite) |

## Docker (recommended)

### API + dashboard only (no local chain)

```bash
cp .env.docker.example .env
docker compose up --build -d
# Dashboard → http://localhost:8080
# API       → http://localhost:3000/health
```

`SKIP_BLOCKCHAIN=true` by default — set `RPC_URL` and `ROUTER_CONTRACT_ADDRESS` in `.env` when you connect to a real L2.

### Full stack (Hardhat node + deploy + listener)

```bash
cp .env.docker.example .env
echo "SKIP_BLOCKCHAIN=false" >> .env
docker compose --profile blockchain up --build
# or: make docker-up-chain
```

| Service | URL |
|---------|-----|
| Merchant UI | http://localhost:8080 |
| API | http://localhost:3000 |
| Hardhat RPC | http://localhost:8545 |
| MySQL | localhost:3306 |

```bash
docker compose logs -f backend
make docker-down      # stop
make docker-reset     # stop + delete volumes
```

---

## Quick start (manual)

### 1. Database

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed-demo.sql
```

### 2. Contracts (Hardhat)

```bash
cd contracts
cp .env.example .env
npm install
npm run compile

# Terminal A — local chain
npm run node

# Terminal B — deploy
npm run deploy:local
```

Copy addresses from `contracts/deployments/localhost.json` into `backend/.env`:

- `ROUTER_CONTRACT_ADDRESS`
- `DMMK_TOKEN_ADDRESS` (if MockDMMK was deployed)

Polygon / Base:

```bash
npm run deploy:polygon
# or
npm run deploy:base
```

### 3. Backend

```bash
cd backend
cp .env.example .env
npm install
npm start
```

### 4. Merchant dashboard

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Vite proxies `/api` to port 3000.

## API reference

### Merchant

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/merchant/invoice` | Create pending order + Base64 QR |
| POST | `/api/merchant/cashout` | Queue high-priority fiat cash-out |
| GET | `/api/merchant/orders?merchantId=1` | List POS orders |
| GET | `/api/merchant/cashouts?merchantId=1` | List cash-out requests |

### P2P agent (cash-out matching)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/agent/cashout/pool` | Unclaimed `queued` requests (priority FIFO) |
| GET | `/api/agent/cashout/assignments?agentId=2` | Agent’s active jobs |
| POST | `/api/agent/cashout/:id/claim` | Body: `{ "agentId": 2 }` |
| POST | `/api/agent/cashout/:id/fiat-sent` | After KPay/Wave transfer |
| POST | `/api/agent/cashout/:id/complete` | Close the loop |

### Cash-out state machine

```
queued (unclaimed) → claim → queued (assigned)
  → fiat_sent → completed
```

## Settlement flow

1. Merchant creates invoice → order `pending` + QR payload `DMMK-PAY`.
2. Customer wallet calls `processPayment(token, merchant, amount)` on the router.
3. Daemon hears `PaymentProcessed` → matches merchant wallet + amount → `completed`, `platform_fee = 0`.

## Production notes

- Add JWT/API keys before mainnet; this boilerplate uses ID-based demo auth.
- Use `WS_RPC_URL` for reliable event listening on L2.
- Regenerate `backend/abi/ZeroFeePaymentRouter.json` from Hardhat artifacts after contract changes.
