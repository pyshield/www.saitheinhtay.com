#!/bin/sh
set -eu

RPC="${CHAIN_RPC_URL:-http://chain:8545}"
echo "[deployer] Waiting for chain at $RPC…"

i=0
while [ "$i" -lt 60 ]; do
  if node -e "
fetch(process.argv[1],{
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({jsonrpc:'2.0',method:'eth_chainId',params:[],id:1})
}).then((r)=>r.json()).then((j)=>process.exit(j.result?0:1)).catch(()=>process.exit(1));
" "$RPC"; then
    echo "[deployer] Chain is ready"
    break
  fi
  i=$((i + 1))
  sleep 2
done

if [ "$i" -ge 60 ]; then
  echo "[deployer] Chain wait timeout"
  exit 1
fi

export DEPLOY_MOCK_TOKEN="${DEPLOY_MOCK_TOKEN:-true}"
export CHAIN_RPC_URL="$RPC"

echo "[deployer] Deploying contracts…"
npx hardhat run scripts/deploy.js --network localhost

echo "[deployer] Deployment artifact:"
cat /app/deployments/localhost.json
