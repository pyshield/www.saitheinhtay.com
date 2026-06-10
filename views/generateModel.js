/**
 * POST /api/generate-model
 *
 * Accepts deal inputs, generates an acquisition Excel model,
 * and streams the .xlsx file back as a download.
 *
 * Requires: npm install exceljs
 */

const ExcelJS = require("exceljs");

// ── Colour helpers ──────────────────────────────────────────────────────────
const C = {
  navyFill:  { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F3864" } },
  blueFill:  { type: "pattern", pattern: "solid", fgColor: { argb: "FFD6E4F0" } },
  greyFill:  { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F2F2" } },
  yellowFill:{ type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFF00" } },
  greenFill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFEAF3DE" } },
  white:     { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } },

  hdrFont:  (sz = 10) => ({ name: "Arial", bold: true, color: { argb: "FFFFFFFF" }, size: sz }),
  inpFont:  () => ({ name: "Arial", color: { argb: "FF0000FF" }, size: 10 }),
  calcFont: () => ({ name: "Arial", color: { argb: "FF000000" }, size: 10 }),
  linkFont: () => ({ name: "Arial", color: { argb: "FF008000" }, size: 10 }),
  boldFont: (color = "FF1F3864") => ({ name: "Arial", bold: true, color: { argb: color }, size: 10 }),

  thinBorder: {
    top:    { style: "thin", color: { argb: "FFB8B8B8" } },
    left:   { style: "thin", color: { argb: "FFB8B8B8" } },
    bottom: { style: "thin", color: { argb: "FFB8B8B8" } },
    right:  { style: "thin", color: { argb: "FFB8B8B8" } },
  },
};

const FMT = {
  M:   '$#,##0.0,,"M";($#,##0.0,,"M");"-"',
  PCT: '0.0%;(0.0%);"-"',
  MUL: '0.0"x";(0.0"x");"-"',
  INT: '#,##0;(#,##0);"-"',
};

function styleHdr(cell, text) {
  cell.value = text;
  cell.font = C.hdrFont();
  cell.fill = C.navyFill;
  cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  cell.border = C.thinBorder;
}

function styleSectionRow(ws, row, colStart, colEnd, label) {
  ws.getCell(row, colStart).value = label;
  ws.getCell(row, colStart).font = { name: "Arial", bold: true, color: { argb: "FF1F3864" }, size: 10 };
  for (let c = colStart; c <= colEnd; c++) {
    ws.getCell(row, c).fill = C.blueFill;
    ws.getCell(row, c).border = C.thinBorder;
  }
}

async function generateModel(inputs) {
  const {
    revenue       = 20,
    ebitdaMargin  = 0.20,
    entryMultiple = 7.0,
    exitMultiple  = 8.5,
    revenueGrowth = 0.10,
    holdPeriod    = 5,
    leverage      = 0.40,
  } = inputs;

  const wb = new ExcelJS.Workbook();
  wb.creator = "saitheinhtay.com";
  wb.created = new Date();

  const YEARS = ["2024A", "2025E", "2026E", "2027E", "2028E", "2029E"];

  // ── Pre-calculate projection arrays ──────────────────────────────────────
  const revs = [revenue];
  for (let i = 1; i < 6; i++) revs.push(revs[i - 1] * (1 + revenueGrowth));

  const margins = [ebitdaMargin, ...Array(5).fill(Math.min(ebitdaMargin + 0.01, 0.35))];
  const ebitdas = revs.map((r, i) => r * margins[i]);
  const das     = revs.map((r) => r * 0.04);
  const ebits   = ebitdas.map((e, i) => e - das[i]);
  const entryEV = ebitdas[0] * entryMultiple;
  const debt    = entryEV * leverage;
  const interest = debt * 0.065;
  const ebts    = ebits.map((e) => e - interest);
  const taxes   = ebts.map((e) => -Math.max(e, 0) * 0.25);
  const netIncs = ebts.map((e, i) => e + taxes[i]);
  const fcfs    = revs.map((r, i) => netIncs[i] + das[i] - r * 0.02);
  const debtRep = fcfs.map((f) => -Math.max(f, 0) * 0.50);

  // Cumulative debt repaid over hold period
  let remDebt = debt;
  for (let i = 0; i < holdPeriod; i++) remDebt += debtRep[i];
  remDebt = Math.max(remDebt, 0);

  const exitEV   = ebitdas[holdPeriod] * exitMultiple;
  const equityIn = entryEV * (1 - leverage) + entryEV * 0.015;
  const equityOut = Math.max(exitEV - remDebt, 0);
  const moic     = equityIn > 0 ? equityOut / equityIn : 0;
  const irr      = moic > 0 ? (Math.pow(moic, 1 / holdPeriod) - 1) * 100 : 0;

  // ══════════════════════════════════════════════════════════════════════════
  // SHEET 1 – ASSUMPTIONS
  // ══════════════════════════════════════════════════════════════════════════
  const wsA = wb.addWorksheet("Assumptions", { views: [{ showGridLines: false }] });
  wsA.properties.tabColor = { argb: "FF1F3864" };
  wsA.columns = [
    { key: "A", width: 3 }, { key: "B", width: 34 },
    ...YEARS.map(() => ({ width: 14 })), { key: "I", width: 28 }
  ];
  wsA.getRow(1).height = 28;

  // Title
  wsA.mergeCells("B1:H1");
  const titleCell = wsA.getCell("B1");
  titleCell.value = "ACQUISITION FINANCIAL MODEL — ASSUMPTIONS";
  titleCell.font = C.hdrFont(13);
  titleCell.fill = C.navyFill;
  titleCell.alignment = { horizontal: "center", vertical: "middle" };

  // Year headers
  const hdrRow = wsA.getRow(2);
  hdrRow.height = 20;
  styleHdr(wsA.getCell(2, 2), "Assumption");
  YEARS.forEach((yr, i) => styleHdr(wsA.getCell(2, 3 + i), yr));

  // Deal structure
  styleSectionRow(wsA, 3, 2, 8, "1. DEAL STRUCTURE");
  const dealItems = [
    ["Entry Revenue ($M)", revenue, FMT.M],
    ["Entry EBITDA Margin", ebitdaMargin, FMT.PCT],
    ["Entry EV/EBITDA Multiple", entryMultiple, FMT.MUL],
    ["Debt / EV (Leverage)", leverage, FMT.PCT],
    ["Debt Interest Rate", 0.065, FMT.PCT],
    ["Transaction Fees (% EV)", 0.015, FMT.PCT],
  ];
  dealItems.forEach(([label, val, fmt], i) => {
    const r = 4 + i;
    const lc = wsA.getCell(r, 2);
    lc.value = label; lc.font = C.calcFont(); lc.border = C.thinBorder;
    const vc = wsA.getCell(r, 3);
    vc.value = val; vc.font = C.inpFont(); vc.fill = C.yellowFill;
    vc.numFmt = fmt; vc.alignment = { horizontal: "right" }; vc.border = C.thinBorder;
    for (let c = 4; c <= 8; c++) { wsA.getCell(r, c).fill = C.greyFill; wsA.getCell(r, c).border = C.thinBorder; }
  });

  // IS assumptions
  styleSectionRow(wsA, 10, 2, 8, "2. INCOME STATEMENT ASSUMPTIONS");
  const growthRates = [null, revenueGrowth, revenueGrowth, revenueGrowth * 0.9, revenueGrowth * 0.8];
  const marginRates = [null, ebitdaMargin + 0.01, ebitdaMargin + 0.01, ebitdaMargin + 0.02, ebitdaMargin + 0.02];
  const daRates     = [null, 0.04, 0.04, 0.03, 0.03];
  const taxRates    = [null, 0.25, 0.25, 0.25, 0.25];
  const isAssump = [
    ["Revenue Growth Rate", growthRates, FMT.PCT],
    ["EBITDA Margin",       marginRates, FMT.PCT],
    ["D&A (% Revenue)",     daRates,     FMT.PCT],
    ["Tax Rate",            taxRates,    FMT.PCT],
  ];
  isAssump.forEach(([label, vals, fmt], i) => {
    const r = 11 + i;
    wsA.getCell(r, 2).value = label; wsA.getCell(r, 2).font = C.calcFont(); wsA.getCell(r, 2).border = C.thinBorder;
    wsA.getCell(r, 3).value = "2024A"; wsA.getCell(r, 3).font = { name: "Arial", color: { argb: "FF888888" }, size: 9 }; wsA.getCell(r, 3).border = C.thinBorder;
    vals.forEach((v, j) => {
      if (v === null) return;
      const c = wsA.getCell(r, 4 + j);
      c.value = v; c.font = C.inpFont(); c.fill = C.yellowFill;
      c.numFmt = fmt; c.alignment = { horizontal: "right" }; c.border = C.thinBorder;
    });
  });

  // Exit assumptions
  styleSectionRow(wsA, 16, 2, 8, "3. EXIT ASSUMPTIONS");
  const exitItems = [
    ["Hold Period (Years)", holdPeriod, FMT.INT],
    ["Exit EV/EBITDA Multiple", exitMultiple, FMT.MUL],
    ["Debt Repayment (% FCF p.a.)", 0.50, FMT.PCT],
  ];
  exitItems.forEach(([label, val, fmt], i) => {
    const r = 17 + i;
    wsA.getCell(r, 2).value = label; wsA.getCell(r, 2).font = C.calcFont(); wsA.getCell(r, 2).border = C.thinBorder;
    wsA.getCell(r, 3).value = val; wsA.getCell(r, 3).font = C.inpFont();
    wsA.getCell(r, 3).fill = C.yellowFill; wsA.getCell(r, 3).numFmt = fmt;
    wsA.getCell(r, 3).alignment = { horizontal: "right" }; wsA.getCell(r, 3).border = C.thinBorder;
    for (let c = 4; c <= 8; c++) { wsA.getCell(r, c).fill = C.greyFill; wsA.getCell(r, c).border = C.thinBorder; }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SHEET 2 – INCOME STATEMENT
  // ══════════════════════════════════════════════════════════════════════════
  const wsI = wb.addWorksheet("Income Statement", { views: [{ showGridLines: false }] });
  wsI.properties.tabColor = { argb: "FF2E5090" };
  wsI.columns = [{ width: 3 }, { width: 36 }, ...Array(6).fill({ width: 14 })];

  wsI.mergeCells("B1:H1");
  Object.assign(wsI.getCell("B1"), { value: "INCOME STATEMENT  ($M)", font: C.hdrFont(13), fill: C.navyFill, alignment: { horizontal: "center", vertical: "middle" } });
  wsI.getRow(1).height = 28;
  styleHdr(wsI.getCell(2, 2), "($M)");
  YEARS.forEach((yr, i) => styleHdr(wsI.getCell(2, 3 + i), yr));

  const isRows = [
    ["Revenue",        revs,    FMT.M,   true,  false],
    ["EBITDA",         ebitdas, FMT.M,   true,  false],
    ["EBITDA Margin",  margins, FMT.PCT, false, true],
    ["Less: D&A",      das.map(d => -d), FMT.M, false, false],
    ["EBIT",           ebits,   FMT.M,   true,  false],
    ["Less: Interest", Array(6).fill(-interest), FMT.M, false, false],
    ["EBT",            ebts,    FMT.M,   true,  false],
    ["Less: Taxes",    taxes,   FMT.M,   false, false],
    ["Net Income",     netIncs, FMT.M,   true,  false],
  ];

  isRows.forEach(([label, vals, fmt, bold, italic], i) => {
    const r = 3 + i;
    const lc = wsI.getCell(r, 2);
    lc.value = label;
    lc.font = bold ? C.boldFont() : italic ? { name: "Arial", italic: true, color: { argb: "FF666666" }, size: 9 } : C.calcFont();
    lc.border = C.thinBorder;
    if (i === isRows.length - 1) { wsI.getCell(r, 2).fill = C.blueFill; }

    vals.forEach((v, j) => {
      const cell = wsI.getCell(r, 3 + j);
      cell.value = v;
      cell.numFmt = fmt;
      cell.alignment = { horizontal: "right" };
      cell.border = C.thinBorder;
      cell.font = bold ? C.boldFont() : italic ? { name: "Arial", italic: true, color: { argb: "FF666666" }, size: 9 } : C.calcFont();
      if (i === isRows.length - 1) cell.fill = C.blueFill;
      else if (bold) cell.fill = C.greyFill;
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SHEET 3 – CASH FLOW
  // ══════════════════════════════════════════════════════════════════════════
  const wsCF = wb.addWorksheet("Cash Flow", { views: [{ showGridLines: false }] });
  wsCF.properties.tabColor = { argb: "FF2E5090" };
  wsCF.columns = [{ width: 3 }, { width: 36 }, ...Array(6).fill({ width: 14 })];

  wsCF.mergeCells("B1:H1");
  Object.assign(wsCF.getCell("B1"), { value: "CASH FLOW STATEMENT  ($M)", font: C.hdrFont(13), fill: C.navyFill, alignment: { horizontal: "center", vertical: "middle" } });
  wsCF.getRow(1).height = 28;
  styleHdr(wsCF.getCell(2, 2), "($M)");
  YEARS.forEach((yr, i) => styleHdr(wsCF.getCell(2, 3 + i), yr));

  styleSectionRow(wsCF, 3, 2, 8, "OPERATING ACTIVITIES");
  const cfOpRows = [
    ["Net Income",             netIncs,                              false],
    ["  Add Back: D&A",        das,                                  false],
    ["  Change in Working Capital", revs.map((r, i) => i === 0 ? 0 : -(r - revs[i - 1]) * 0.05), false],
    ["Cash from Operations",   fcfs,                                 true],
  ];
  cfOpRows.forEach(([label, vals, bold], i) => {
    const r = 4 + i;
    const lc = wsCF.getCell(r, 2);
    lc.value = label; lc.font = bold ? C.boldFont() : C.calcFont(); lc.border = C.thinBorder;
    if (bold) lc.fill = C.greyFill;
    vals.forEach((v, j) => {
      const cell = wsCF.getCell(r, 3 + j);
      cell.value = v; cell.numFmt = FMT.M;
      cell.alignment = { horizontal: "right" }; cell.border = C.thinBorder;
      cell.font = bold ? C.boldFont() : C.calcFont();
      if (bold) cell.fill = C.greyFill;
    });
  });

  styleSectionRow(wsCF, 8, 2, 8, "INVESTING ACTIVITIES");
  const capex = revs.map((r) => -r * 0.02);
  [[" Capital Expenditures (2% Rev)", capex, false], ["Cash from Investing", capex, true]].forEach(([label, vals, bold], i) => {
    const r = 9 + i;
    const lc = wsCF.getCell(r, 2);
    lc.value = label; lc.font = bold ? C.boldFont() : C.calcFont(); lc.border = C.thinBorder;
    if (bold) lc.fill = C.greyFill;
    vals.forEach((v, j) => {
      const cell = wsCF.getCell(r, 3 + j);
      cell.value = v; cell.numFmt = FMT.M;
      cell.alignment = { horizontal: "right" }; cell.border = C.thinBorder;
      cell.font = bold ? C.boldFont() : C.calcFont();
      if (bold) cell.fill = C.greyFill;
    });
  });

  styleSectionRow(wsCF, 11, 2, 8, "FINANCING ACTIVITIES");
  [[" Debt Repayment", debtRep, false], ["Cash from Financing", debtRep, true]].forEach(([label, vals, bold], i) => {
    const r = 12 + i;
    const lc = wsCF.getCell(r, 2);
    lc.value = label; lc.font = bold ? C.boldFont() : C.calcFont(); lc.border = C.thinBorder;
    if (bold) lc.fill = C.greyFill;
    vals.forEach((v, j) => {
      const cell = wsCF.getCell(r, 3 + j);
      cell.value = v; cell.numFmt = FMT.M;
      cell.alignment = { horizontal: "right" }; cell.border = C.thinBorder;
      cell.font = bold ? C.boldFont() : C.calcFont();
      if (bold) cell.fill = C.greyFill;
    });
  });

  const netCash = fcfs.map((f, i) => f + capex[i] + debtRep[i]);
  const ncRow = wsCF.getRow(14);
  wsCF.getCell(14, 2).value = "Net Change in Cash";
  wsCF.getCell(14, 2).font = C.boldFont(); wsCF.getCell(14, 2).fill = C.blueFill; wsCF.getCell(14, 2).border = C.thinBorder;
  netCash.forEach((v, j) => {
    const cell = wsCF.getCell(14, 3 + j);
    cell.value = v; cell.numFmt = FMT.M; cell.alignment = { horizontal: "right" };
    cell.font = C.boldFont(); cell.fill = C.blueFill; cell.border = C.thinBorder;
  });

  // FCF
  wsCF.getCell(16, 2).value = "Free Cash Flow (FCF)";
  wsCF.getCell(16, 2).font = C.boldFont(); wsCF.getCell(16, 2).fill = C.greyFill; wsCF.getCell(16, 2).border = C.thinBorder;
  fcfs.forEach((v, j) => {
    const cell = wsCF.getCell(16, 3 + j);
    cell.value = v; cell.numFmt = FMT.M; cell.alignment = { horizontal: "right" };
    cell.font = C.boldFont(); cell.fill = C.greyFill; cell.border = C.thinBorder;
  });
  wsCF.getCell(17, 2).value = "  FCF Margin";
  wsCF.getCell(17, 2).font = { name: "Arial", italic: true, color: { argb: "FF666666" }, size: 9 };
  wsCF.getCell(17, 2).border = C.thinBorder;
  fcfs.forEach((v, j) => {
    const cell = wsCF.getCell(17, 3 + j);
    cell.value = revs[j] > 0 ? v / revs[j] : 0;
    cell.numFmt = FMT.PCT; cell.alignment = { horizontal: "right" };
    cell.font = { name: "Arial", italic: true, color: { argb: "FF666666" }, size: 9 };
    cell.border = C.thinBorder;
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SHEET 4 – RETURNS SUMMARY
  // ══════════════════════════════════════════════════════════════════════════
  const wsR = wb.addWorksheet("Returns Summary", { views: [{ showGridLines: false }] });
  wsR.properties.tabColor = { argb: "FF00B050" };
  wsR.columns = [{ width: 3 }, { width: 36 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }];

  wsR.mergeCells("B1:F1");
  Object.assign(wsR.getCell("B1"), { value: "ACQUISITION RETURNS SUMMARY", font: C.hdrFont(13), fill: C.navyFill, alignment: { horizontal: "center", vertical: "middle" } });
  wsR.getRow(1).height = 28;

  styleSectionRow(wsR, 2, 2, 6, "DEAL STRUCTURE AT ENTRY");
  const entryRows = [
    ["Entry Revenue ($M)",          revenue,                     FMT.M],
    ["EBITDA at Entry ($M)",        ebitdas[0],                  FMT.M],
    ["Entry Multiple (EV/EBITDA)",  entryMultiple,               FMT.MUL],
    ["Enterprise Value ($M)",       entryEV,                     FMT.M],
    ["Acquisition Debt ($M)",       debt,                        FMT.M],
    ["Transaction Fees ($M)",       entryEV * 0.015,             FMT.M],
    ["Equity Invested ($M)",        equityIn,                    FMT.M],
  ];
  entryRows.forEach(([label, val, fmt], i) => {
    const r = 3 + i;
    wsR.getCell(r, 2).value = label; wsR.getCell(r, 2).font = i === 6 ? C.boldFont() : C.calcFont();
    wsR.getCell(r, 2).border = C.thinBorder;
    if (i === 6) wsR.getCell(r, 2).fill = C.blueFill;
    wsR.getCell(r, 3).value = val; wsR.getCell(r, 3).numFmt = fmt;
    wsR.getCell(r, 3).alignment = { horizontal: "right" }; wsR.getCell(r, 3).border = C.thinBorder;
    wsR.getCell(r, 3).font = i === 6 ? C.boldFont() : C.calcFont();
    if (i === 6) wsR.getCell(r, 3).fill = C.blueFill;
  });

  styleSectionRow(wsR, 10, 2, 6, "EXIT ANALYSIS");
  const exitRows = [
    ["Hold Period (Years)",         holdPeriod,               FMT.INT],
    ["Exit Revenue ($M)",           revs[holdPeriod],         FMT.M],
    ["Exit EBITDA ($M)",            ebitdas[holdPeriod],      FMT.M],
    ["Exit Multiple (EV/EBITDA)",   exitMultiple,             FMT.MUL],
    ["Exit Enterprise Value ($M)",  exitEV,                   FMT.M],
    ["Remaining Debt ($M)",         remDebt,                  FMT.M],
    ["Exit Equity Value ($M)",      equityOut,                FMT.M],
  ];
  exitRows.forEach(([label, val, fmt], i) => {
    const r = 11 + i;
    wsR.getCell(r, 2).value = label; wsR.getCell(r, 2).font = i === 6 ? C.boldFont() : C.calcFont();
    wsR.getCell(r, 2).border = C.thinBorder;
    if (i === 6) wsR.getCell(r, 2).fill = C.blueFill;
    wsR.getCell(r, 3).value = val; wsR.getCell(r, 3).numFmt = fmt;
    wsR.getCell(r, 3).alignment = { horizontal: "right" }; wsR.getCell(r, 3).border = C.thinBorder;
    wsR.getCell(r, 3).font = i === 6 ? C.boldFont() : C.calcFont();
    if (i === 6) wsR.getCell(r, 3).fill = C.blueFill;
  });

  styleSectionRow(wsR, 18, 2, 6, "INVESTMENT RETURNS");
  const returnRows = [
    ["Money-on-Money (MOIC)", moic,       FMT.MUL],
    ["IRR",                   irr / 100,  FMT.PCT],
    ["Absolute Return ($M)",  equityOut - equityIn, FMT.M],
  ];
  returnRows.forEach(([label, val, fmt], i) => {
    const r = 19 + i;
    wsR.getRow(r).height = 24;
    wsR.getCell(r, 2).value = label;
    wsR.getCell(r, 2).font = { name: "Arial", bold: true, color: { argb: "FF1F3864" }, size: 14 };
    wsR.getCell(r, 2).fill = C.blueFill; wsR.getCell(r, 2).border = C.thinBorder;
    wsR.getCell(r, 3).value = val; wsR.getCell(r, 3).numFmt = fmt;
    wsR.getCell(r, 3).alignment = { horizontal: "right" };
    wsR.getCell(r, 3).font = { name: "Arial", bold: true, color: { argb: "FF1F3864" }, size: 14 };
    wsR.getCell(r, 3).fill = C.blueFill; wsR.getCell(r, 3).border = C.thinBorder;
  });

  // Sensitivity table
  styleSectionRow(wsR, 23, 2, 6, "SENSITIVITY: MOIC vs Entry × and Exit ×");
  wsR.getCell(24, 2).value = "Entry ↓ / Exit →";
  wsR.getCell(24, 2).font = { name: "Arial", bold: true, size: 9 }; wsR.getCell(24, 2).fill = C.blueFill; wsR.getCell(24, 2).border = C.thinBorder;
  const sensExit  = [6, 7, 8, 9, 10];
  const sensEntry = [5, 6, 7, 8, 9];
  sensExit.forEach((ex, j) => {
    const cell = wsR.getCell(24, 3 + j);
    cell.value = ex; cell.numFmt = FMT.MUL; cell.font = { name: "Arial", bold: true, size: 9 };
    cell.fill = C.blueFill; cell.border = C.thinBorder; cell.alignment = { horizontal: "center" };
  });
  sensEntry.forEach((en, i) => {
    wsR.getCell(25 + i, 2).value = en; wsR.getCell(25 + i, 2).numFmt = FMT.MUL;
    wsR.getCell(25 + i, 2).font = { name: "Arial", bold: true, size: 9 };
    wsR.getCell(25 + i, 2).fill = C.blueFill; wsR.getCell(25 + i, 2).border = C.thinBorder;
    wsR.getCell(25 + i, 2).alignment = { horizontal: "center" };
    sensExit.forEach((ex, j) => {
      const ev_in  = ebitdas[0] * en;
      const eq_in  = ev_in * (1 - leverage) + ev_in * 0.015;
      const ev_out = ebitdas[holdPeriod] * ex;
      const eq_out = Math.max(ev_out - debt, 0);
      const m      = eq_in > 0 ? eq_out / eq_in : 0;
      const cell   = wsR.getCell(25 + i, 3 + j);
      cell.value = m; cell.numFmt = FMT.MUL; cell.alignment = { horizontal: "center" };
      cell.font = { name: "Arial", bold: true, size: 9,
        color: { argb: m >= 2.5 ? "FF27500A" : m >= 1.5 ? "FF1F3864" : "FF791F1F" } };
      cell.fill = { type: "pattern", pattern: "solid",
        fgColor: { argb: m >= 2.5 ? "FFEAF3DE" : m >= 1.5 ? "FFFFFFFF" : "FFFCEBEB" } };
      cell.border = C.thinBorder;
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SHEET 5 – DD CHECKLIST
  // ══════════════════════════════════════════════════════════════════════════
  const wsDD = wb.addWorksheet("DD Checklist", { views: [{ showGridLines: false }] });
  wsDD.properties.tabColor = { argb: "FFFF6600" };
  wsDD.columns = [{ width: 3 }, { width: 38 }, { width: 18 }, { width: 18 }, { width: 18 }, { width: 18 }, { width: 22 }];

  wsDD.mergeCells("B1:G1");
  Object.assign(wsDD.getCell("B1"), { value: "DUE DILIGENCE CHECKLIST", font: C.hdrFont(13), fill: C.navyFill, alignment: { horizontal: "center", vertical: "middle" } });
  wsDD.getRow(1).height = 28;
  ["Item", "Category", "Status", "Owner", "Due Date", "Notes"].forEach((h, i) => styleHdr(wsDD.getCell(2, 2 + i), h));

  const ddItems = [
    ["Quality of Earnings (QoE) report",        "Financial",   "Not Started"],
    ["3-yr audited financial statements",        "Financial",   "Not Started"],
    ["Management accounts (LTM)",               "Financial",   "Not Started"],
    ["Working capital bridge analysis",         "Financial",   "Not Started"],
    ["Customer concentration (top 10)",         "Financial",   "Not Started"],
    ["Debt schedule & off-balance sheet items", "Financial",   "Not Started"],
    ["TAM / SAM market sizing",                 "Commercial",  "Not Started"],
    ["Competitive landscape analysis",          "Commercial",  "Not Started"],
    ["Customer churn & NPS data",               "Commercial",  "Not Started"],
    ["Sales pipeline & backlog review",         "Commercial",  "Not Started"],
    ["Management team interviews",              "Operational", "Not Started"],
    ["IT systems & cyber security review",      "Operational", "Not Started"],
    ["Regulatory & license compliance",         "Legal",       "Not Started"],
    ["Corporate structure & cap table",         "Legal",       "Not Started"],
    ["Material contracts review",               "Legal",       "Not Started"],
    ["IP ownership & encumbrances",             "Legal",       "Not Started"],
    ["Employment & HR obligations",             "Legal",       "Not Started"],
    ["Environmental / ESG screening",           "Legal",       "Not Started"],
  ];
  const catFill = {
    Financial:   { bg: "FFFFE2CC", fg: "FF633806" },
    Commercial:  { bg: "FFD6E4F0", fg: "FF0C447C" },
    Operational: { bg: "FFE2EFDA", fg: "FF27500A" },
    Legal:       { bg: "FFFCE4EC", fg: "FF791F1F" },
  };
  ddItems.forEach(([item, cat, status], i) => {
    const r = 3 + i;
    wsDD.getRow(r).height = 16;
    const bg = i % 2 === 0 ? C.greyFill : C.white;
    wsDD.getCell(r, 2).value = item; wsDD.getCell(r, 2).font = C.calcFont();
    wsDD.getCell(r, 2).fill = bg; wsDD.getCell(r, 2).border = C.thinBorder;
    const cc = wsDD.getCell(r, 3);
    const { bg: cbg, fg: cfg } = catFill[cat] || { bg: "FFFFFFFF", fg: "FF000000" };
    cc.value = cat; cc.font = { name: "Arial", bold: true, size: 9, color: { argb: cfg } };
    cc.fill = { type: "pattern", pattern: "solid", fgColor: { argb: cbg } };
    cc.alignment = { horizontal: "center" }; cc.border = C.thinBorder;
    wsDD.getCell(r, 4).value = status; wsDD.getCell(r, 4).font = { name: "Arial", size: 10, color: { argb: "FF888888" } };
    wsDD.getCell(r, 4).alignment = { horizontal: "center" }; wsDD.getCell(r, 4).border = C.thinBorder; wsDD.getCell(r, 4).fill = bg;
    [5, 6, 7].forEach((c) => { wsDD.getCell(r, c).fill = bg; wsDD.getCell(r, c).border = C.thinBorder; });
  });

  // Freeze panes on all sheets
  [wsA, wsI, wsCF, wsR, wsDD].forEach((ws) => { ws.views[0].state = "frozen"; ws.views[0].xSplit = 2; ws.views[0].ySplit = 2; });

  return wb;
}

// ── Express route handler ──────────────────────────────────────────────────
async function generateModelRoute(req, res) {
  try {
    const wb = await generateModel(req.body || {});
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", 'attachment; filename="acquisition_model.xlsx"');
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Model generation error:", err);
    res.status(500).json({ error: "Failed to generate model" });
  }
}

module.exports = { generateModelRoute };
