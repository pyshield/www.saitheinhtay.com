require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const deployerKey = process.env.DEPLOYER_PRIVATE_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  paths: {
    sources: "./",
    artifacts: "./artifacts",
    cache: "./cache",
  },
  networks: {
    hardhat: {},
    localhost: {
      url: process.env.CHAIN_RPC_URL || "http://127.0.0.1:8545",
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL || "",
      accounts: deployerKey ? [deployerKey] : [],
      chainId: 137,
    },
    base: {
      url: process.env.BASE_RPC_URL || "",
      accounts: deployerKey ? [deployerKey] : [],
      chainId: 8453,
    },
  },
};
