"use strict";

const { ethers } = require("ethers");

const TOKEN_DECIMALS = Number(process.env.DMMK_DECIMALS) || 18;

function normalizeAmountForDb(value) {
  const asString = typeof value === "bigint" ? ethers.formatUnits(value, TOKEN_DECIMALS) : String(value);
  const units = ethers.parseUnits(asString, TOKEN_DECIMALS);
  return ethers.formatUnits(units, TOKEN_DECIMALS);
}

function amountToDbString(amountWei) {
  return normalizeAmountForDb(amountWei);
}

module.exports = { TOKEN_DECIMALS, normalizeAmountForDb, amountToDbString };
