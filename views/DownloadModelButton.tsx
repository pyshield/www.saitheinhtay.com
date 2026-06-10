import { useState } from "react";

interface ModelInputs {
  revenue: number;
  ebitdaMargin: number;
  entryMultiple: number;
  exitMultiple: number;
  revenueGrowth: number;
  holdPeriod: number;
  leverage: number;
}

const DEFAULT_INPUTS: ModelInputs = {
  revenue: 20,
  ebitdaMargin: 0.2,
  entryMultiple: 7,
  exitMultiple: 8.5,
  revenueGrowth: 0.1,
  holdPeriod: 5,
  leverage: 0.4,
};

export default function DownloadModelButton() {
  const [open, setOpen] = useState(false);
  const [inputs, setInputs] = useState<ModelInputs>(DEFAULT_INPUTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(key: keyof ModelInputs, raw: string) {
    const val = parseFloat(raw);
    if (!isNaN(val)) setInputs((prev) => ({ ...prev, [key]: val }));
  }

  async function handleDownload() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate-model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });
      if (!res.ok) throw new Error("Failed to generate model");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "acquisition_model.xlsx";
      a.click();
      URL.revokeObjectURL(url);
      setOpen(false);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Derived preview numbers
  const ebitda = inputs.revenue * inputs.ebitdaMargin;
  const entryEV = ebitda * inputs.entryMultiple;
  const equityIn = entryEV * (1 - inputs.leverage);
  const exitRev = inputs.revenue * Math.pow(1 + inputs.revenueGrowth, inputs.holdPeriod);
  const exitEV = exitRev * inputs.ebitdaMargin * inputs.exitMultiple;
  const debt = entryEV * inputs.leverage;
  const equityOut = Math.max(exitEV - debt, 0);
  const moic = equityIn > 0 ? equityOut / equityIn : 0;
  const irr = moic > 0 ? (Math.pow(moic, 1 / inputs.holdPeriod) - 1) * 100 : 0;

  const fieldStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    color: "#555",
    minWidth: 160,
  };

  const inputStyle: React.CSSProperties = {
    width: 90,
    padding: "5px 8px",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    fontSize: 13,
    textAlign: "right",
    outline: "none",
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "#1F3864",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "10px 20px",
          fontSize: 14,
          fontWeight: 500,
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(31,56,100,0.18)",
        }}
      >
        <span>📊</span> Download Model
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              width: 460,
              maxWidth: "95vw",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                background: "#1F3864",
                color: "#fff",
                padding: "16px 20px",
                borderRadius: "16px 16px 0 0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>
                  📊 Acquisition Model
                </div>
                <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>
                  Customise inputs → download Excel
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  fontSize: 20,
                  cursor: "pointer",
                  opacity: 0.8,
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "20px 24px" }}>
              {/* Inputs */}
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  color: "#888",
                  marginBottom: 12,
                }}
              >
                DEAL INPUTS
              </div>

              {[
                { key: "revenue", label: "Entry Revenue ($M)", step: 1 },
                { key: "ebitdaMargin", label: "EBITDA Margin (%)", step: 0.01 },
                { key: "entryMultiple", label: "Entry EV/EBITDA (×)", step: 0.5 },
                { key: "exitMultiple", label: "Exit EV/EBITDA (×)", step: 0.5 },
                { key: "revenueGrowth", label: "Revenue CAGR (%)", step: 0.01 },
                { key: "holdPeriod", label: "Hold Period (years)", step: 1 },
                { key: "leverage", label: "Debt / EV (%)", step: 0.05 },
              ].map(({ key, label, step }) => {
                const k = key as keyof ModelInputs;
                const isPct = ["ebitdaMargin", "revenueGrowth", "leverage"].includes(key);
                const val = inputs[k];
                const display = isPct
                  ? (val * 100).toFixed(0)
                  : val.toString();
                return (
                  <div key={key} style={fieldStyle}>
                    <span style={labelStyle}>{label}</span>
                    <input
                      type="number"
                      step={isPct ? 1 : step}
                      value={display}
                      onChange={(e) =>
                        update(k, isPct ? String(parseFloat(e.target.value) / 100) : e.target.value)
                      }
                      style={inputStyle}
                    />
                  </div>
                );
              })}

              {/* Live preview */}
              <div
                style={{
                  background: "#f0f4fa",
                  borderRadius: 10,
                  padding: "14px 16px",
                  marginTop: 16,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    color: "#888",
                    marginBottom: 10,
                  }}
                >
                  LIVE PREVIEW
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 10,
                  }}
                >
                  {[
                    { label: "Entry EV", value: `$${entryEV.toFixed(1)}M` },
                    { label: "Equity In", value: `$${equityIn.toFixed(1)}M` },
                    { label: "Exit EV", value: `$${exitEV.toFixed(1)}M` },
                    { label: "Equity Out", value: `$${equityOut.toFixed(1)}M` },
                    {
                      label: "MOIC",
                      value: `${moic.toFixed(1)}×`,
                      color: moic >= 2.5 ? "#27500A" : moic >= 1.5 ? "#1F3864" : "#791F1F",
                    },
                    {
                      label: "IRR",
                      value: `${irr.toFixed(0)}%`,
                      color: irr >= 25 ? "#27500A" : irr >= 15 ? "#1F3864" : "#791F1F",
                    },
                  ].map(({ label, value, color }) => (
                    <div
                      key={label}
                      style={{
                        background: "#fff",
                        borderRadius: 8,
                        padding: "8px 10px",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>
                        {label}
                      </div>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 600,
                          color: color || "#1F3864",
                        }}
                      >
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div
                  style={{
                    color: "#791F1F",
                    background: "#FCEBEB",
                    borderRadius: 8,
                    padding: "8px 12px",
                    fontSize: 13,
                    marginBottom: 12,
                  }}
                >
                  {error}
                </div>
              )}

              {/* Download button */}
              <button
                onClick={handleDownload}
                disabled={loading}
                style={{
                  width: "100%",
                  background: loading ? "#aaa" : "#1F3864",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "12px 0",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {loading ? (
                  <>⏳ Generating model…</>
                ) : (
                  <>📥 Download Excel Model</>
                )}
              </button>

              <div
                style={{
                  fontSize: 11,
                  color: "#aaa",
                  textAlign: "center",
                  marginTop: 10,
                }}
              >
                Includes: Income Statement · Cash Flow · Returns · DD Checklist
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
