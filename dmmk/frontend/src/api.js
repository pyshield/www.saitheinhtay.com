const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.details || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  health: () => request("/health"),
  createInvoice: (body) =>
    request("/api/merchant/invoice", { method: "POST", body: JSON.stringify(body) }),
  queueCashout: (body) =>
    request("/api/merchant/cashout", { method: "POST", body: JSON.stringify(body) }),
  listOrders: (merchantId, status) => {
    const q = new URLSearchParams({ merchantId: String(merchantId) });
    if (status) q.set("status", status);
    return request(`/api/merchant/orders?${q}`);
  },
  listCashouts: (merchantId) =>
    request(`/api/merchant/cashouts?merchantId=${merchantId}`),
  agentPool: () => request("/api/agent/cashout/pool"),
  agentAssignments: (agentId) =>
    request(`/api/agent/cashout/assignments?agentId=${agentId}`),
  claimCashout: (id, agentId) =>
    request(`/api/agent/cashout/${id}/claim`, {
      method: "POST",
      body: JSON.stringify({ agentId }),
    }),
  markFiatSent: (id, agentId) =>
    request(`/api/agent/cashout/${id}/fiat-sent`, {
      method: "POST",
      body: JSON.stringify({ agentId }),
    }),
  completeCashout: (id, agentId) =>
    request(`/api/agent/cashout/${id}/complete`, {
      method: "POST",
      body: JSON.stringify({ agentId }),
    }),
};
