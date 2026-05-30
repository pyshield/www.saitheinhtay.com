import { useCallback, useEffect, useState } from "react";
import { api } from "./api.js";

const MERCHANT_ID = Number(import.meta.env.VITE_MERCHANT_ID) || 1;
const AGENT_ID = Number(import.meta.env.VITE_AGENT_ID) || 2;

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-MM", { dateStyle: "short", timeStyle: "short" });
}

function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}

export default function App() {
  const [tab, setTab] = useState("pos");
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // POS
  const [orderId, setOrderId] = useState("");
  const [amount, setAmount] = useState("");
  const [invoice, setInvoice] = useState(null);

  // Cash-out
  const [cashAmount, setCashAmount] = useState("");
  const [fiatChannel, setFiatChannel] = useState("kpay");
  const [fiatAccount, setFiatAccount] = useState("");

  // Lists
  const [orders, setOrders] = useState([]);
  const [cashouts, setCashouts] = useState([]);

  // Agent console
  const [pool, setPool] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const refreshHealth = useCallback(async () => {
    try {
      const h = await api.health();
      setHealth(h);
    } catch {
      setHealth({ status: "offline" });
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    const data = await api.listOrders(MERCHANT_ID);
    setOrders(data.orders || []);
  }, []);

  const refreshCashouts = useCallback(async () => {
    const data = await api.listCashouts(MERCHANT_ID);
    setCashouts(data.cashOuts || []);
  }, []);

  const refreshAgent = useCallback(async () => {
    const [poolData, assignData] = await Promise.all([
      api.agentPool(),
      api.agentAssignments(AGENT_ID),
    ]);
    setPool(poolData.pool || []);
    setAssignments(assignData.assignments || []);
  }, []);

  useEffect(() => {
    refreshHealth();
    const id = setInterval(refreshHealth, 15000);
    return () => clearInterval(id);
  }, [refreshHealth]);

  useEffect(() => {
    setError("");
    setLoading(true);
    const run = async () => {
      try {
        if (tab === "history") {
          await Promise.all([refreshOrders(), refreshCashouts()]);
        } else if (tab === "cashout") {
          await refreshCashouts();
        } else if (tab === "agent") {
          await refreshAgent();
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [tab, refreshOrders, refreshCashouts, refreshAgent]);

  async function handleCreateInvoice(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setInvoice(null);
    try {
      const id = orderId.trim() || `POS-${Date.now()}`;
      const data = await api.createInvoice({
        merchantId: MERCHANT_ID,
        amount: amount.trim(),
        orderId: id,
      });
      setInvoice(data);
      setOrderId("");
      setAmount("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCashout(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.queueCashout({
        merchantId: MERCHANT_ID,
        amount: cashAmount.trim(),
        fiatChannel,
        fiatAccount: fiatAccount.trim(),
      });
      setCashAmount("");
      setFiatAccount("");
      await refreshCashouts();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function agentAction(fn) {
    setError("");
    setLoading(true);
    try {
      await fn();
      await refreshAgent();
      await refreshCashouts();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <p className="eyebrow">Digital Myanmar Kyat</p>
          <h1>DMMK Pay Merchant</h1>
          <p className="subtitle">0% retail fee · L2 settlement · KPay / Wave cash-out</p>
        </div>
        <div className="health">
          <span className={`dot ${health?.status === "ok" ? "ok" : "warn"}`} />
          {health?.status === "ok"
            ? `Live · block ${health.blockNumber ?? "—"}`
            : "API offline"}
        </div>
      </header>

      <nav className="tabs">
        {[
          ["pos", "POS & QR"],
          ["cashout", "Cash-out"],
          ["history", "History"],
          ["agent", "Agent pool"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={tab === key ? "active" : ""}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      {error && <div className="alert">{error}</div>}

      {tab === "pos" && (
        <section className="panel">
          <h2>Create invoice</h2>
          <form className="form" onSubmit={handleCreateInvoice}>
            <label>
              Amount (DMMK)
              <input
                type="text"
                inputMode="decimal"
                placeholder="15000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </label>
            <label>
              Order ID (optional)
              <input
                type="text"
                placeholder="Auto-generated if empty"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? "Generating…" : "Generate QR (0% fee)"}
            </button>
          </form>

          {invoice && (
            <div className="qr-card">
              <h3>Scan to pay</h3>
              <img
                src={`data:${invoice.qrMimeType};base64,${invoice.qrCodeBase64}`}
                alt="DMMK payment QR"
                width={280}
                height={280}
              />
              <dl className="meta">
                <div>
                  <dt>Order</dt>
                  <dd>{invoice.order.externalOrderId}</dd>
                </div>
                <div>
                  <dt>Amount</dt>
                  <dd>{invoice.order.amount} DMMK</dd>
                </div>
                <div>
                  <dt>Merchant wallet</dt>
                  <dd className="mono">{invoice.order.merchantWallet}</dd>
                </div>
                <div>
                  <dt>Platform fee</dt>
                  <dd>0%</dd>
                </div>
              </dl>
            </div>
          )}
        </section>
      )}

      {tab === "cashout" && (
        <section className="panel">
          <h2>Request fiat cash-out</h2>
          <p className="hint">High-priority queue for P2P agents (KPay / Wave Money).</p>
          <form className="form" onSubmit={handleCashout}>
            <label>
              Amount (DMMK)
              <input
                type="text"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                required
              />
            </label>
            <label>
              Channel
              <select value={fiatChannel} onChange={(e) => setFiatChannel(e.target.value)}>
                <option value="kpay">KPay</option>
                <option value="wave">Wave Money</option>
              </select>
            </label>
            <label>
              Account / phone
              <input
                type="text"
                value={fiatAccount}
                onChange={(e) => setFiatAccount(e.target.value)}
                placeholder="09xxxxxxxxx"
                required
              />
            </label>
            <button type="submit" disabled={loading}>
              Queue cash-out
            </button>
          </form>

          <h3>Your requests</h3>
          <CashoutTable rows={cashouts} />
        </section>
      )}

      {tab === "history" && (
        <section className="panel">
          <h2>Orders</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Tx</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.external_order_id}</td>
                    <td>{o.amount_dmmk}</td>
                    <td>
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="mono truncate">{o.tx_hash || "—"}</td>
                    <td>{formatDate(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && <p className="empty">No orders yet.</p>}
          </div>
        </section>
      )}

      {tab === "agent" && (
        <section className="panel">
          <h2>Agent pool (demo)</h2>
          <p className="hint">
            Agent ID {AGENT_ID} — claim queued merchant cash-outs, send fiat, then complete.
          </p>

          <h3>Available pool</h3>
          {pool.length === 0 ? (
            <p className="empty">No queued requests.</p>
          ) : (
            <ul className="agent-list">
              {pool.map((r) => (
                <li key={r.id}>
                  <div>
                    <strong>#{r.id}</strong> · {r.amount_dmmk} DMMK · {r.fiat_channel.toUpperCase()}
                    <br />
                    <span className="muted">
                      {r.merchant_name} → {r.fiat_account} · priority {r.priority}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      agentAction(() => api.claimCashout(r.id, AGENT_ID))
                    }
                    disabled={loading}
                  >
                    Claim
                  </button>
                </li>
              ))}
            </ul>
          )}

          <h3>My assignments</h3>
          {assignments.length === 0 ? (
            <p className="empty">No active assignments.</p>
          ) : (
            <ul className="agent-list">
              {assignments.map((r) => (
                <li key={r.id}>
                  <div>
                    <strong>#{r.id}</strong> · <StatusBadge status={r.status} /> · {r.amount_dmmk}{" "}
                    DMMK
                    <br />
                    <span className="muted">
                      {r.fiat_channel} · {r.fiat_account}
                    </span>
                  </div>
                  <div className="btn-row">
                    {r.status === "queued" && (
                      <button
                        type="button"
                        onClick={() =>
                          agentAction(() => api.markFiatSent(r.id, AGENT_ID))
                        }
                        disabled={loading}
                      >
                        Fiat sent
                      </button>
                    )}
                    {r.status === "fiat_sent" && (
                      <button
                        type="button"
                        onClick={() =>
                          agentAction(() => api.completeCashout(r.id, AGENT_ID))
                        }
                        disabled={loading}
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

function CashoutTable({ rows }) {
  if (!rows.length) return <p className="empty">No cash-out requests.</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Amount</th>
            <th>Channel</th>
            <th>Account</th>
            <th>Status</th>
            <th>Agent</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.amount_dmmk}</td>
              <td>{c.fiat_channel}</td>
              <td>{c.fiat_account}</td>
              <td>
                <StatusBadge status={c.status} />
              </td>
              <td>{c.agent_name || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
