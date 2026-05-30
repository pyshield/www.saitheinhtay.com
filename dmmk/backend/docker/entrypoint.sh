#!/bin/sh
set -eu

echo "[entrypoint] Waiting for MySQL at ${DB_HOST}:${DB_PORT}…"
i=0
while [ "$i" -lt 60 ]; do
  if node -e "
const mysql=require('mysql2/promise');
mysql.createConnection({
  host:process.env.DB_HOST,
  port:Number(process.env.DB_PORT||3306),
  user:process.env.DB_USER,
  password:process.env.DB_PASSWORD,
  database:process.env.DB_NAME
}).then((c)=>c.end()).then(()=>process.exit(0)).catch(()=>process.exit(1));
"; then
    echo "[entrypoint] MySQL is ready"
    break
  fi
  i=$((i + 1))
  sleep 2
done

if [ "$i" -ge 60 ]; then
  echo "[entrypoint] MySQL wait timeout"
  exit 1
fi

DEPLOYMENTS_FILE="${DEPLOYMENTS_FILE:-/deployments/localhost.json}"
if [ -f "$DEPLOYMENTS_FILE" ]; then
  echo "[entrypoint] Loading addresses from $DEPLOYMENTS_FILE"
  export ROUTER_CONTRACT_ADDRESS="${ROUTER_CONTRACT_ADDRESS:-$(node -e "const j=require(process.argv[1]);console.log(j.zeroFeePaymentRouter||'')" "$DEPLOYMENTS_FILE")}"
  export DMMK_TOKEN_ADDRESS="${DMMK_TOKEN_ADDRESS:-$(node -e "const j=require(process.argv[1]);console.log(j.dmmkToken||'')" "$DEPLOYMENTS_FILE")}"
  export RPC_URL="${RPC_URL:-http://chain:8545}"
  if [ -n "$ROUTER_CONTRACT_ADDRESS" ] && [ "$ROUTER_CONTRACT_ADDRESS" != "0x0000000000000000000000000000000000000000" ]; then
    export SKIP_BLOCKCHAIN="${SKIP_BLOCKCHAIN:-false}"
  fi
fi

echo "[entrypoint] SKIP_BLOCKCHAIN=${SKIP_BLOCKCHAIN:-false}"
echo "[entrypoint] ROUTER_CONTRACT_ADDRESS=${ROUTER_CONTRACT_ADDRESS:-unset}"

exec "$@"
