const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;
  const chainId = (await hre.ethers.provider.getNetwork()).chainId;

  console.log(`Network: ${network} (chainId ${chainId})`);
  console.log(`Deployer: ${deployer.address}`);

  const deployment = {
    network,
    chainId: chainId.toString(),
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  const deployMock = process.env.DEPLOY_MOCK_TOKEN === "true" || network === "hardhat" || network === "localhost";

  if (deployMock) {
    const MockDMMK = await hre.ethers.getContractFactory("MockDMMK");
    const token = await MockDMMK.deploy();
    await token.waitForDeployment();
    deployment.dmmkToken = await token.getAddress();
    console.log(`MockDMMK: ${deployment.dmmkToken}`);
  }

  const Router = await hre.ethers.getContractFactory("ZeroFeePaymentRouter");
  const router = await Router.deploy();
  await router.waitForDeployment();
  deployment.zeroFeePaymentRouter = await router.getAddress();
  console.log(`ZeroFeePaymentRouter: ${deployment.zeroFeePaymentRouter}`);

  const outDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${network}.json`);
  fs.writeFileSync(outFile, JSON.stringify(deployment, null, 2));
  console.log(`Wrote ${outFile}`);

  console.log("\nBackend .env hints:");
  console.log(`ROUTER_CONTRACT_ADDRESS=${deployment.zeroFeePaymentRouter}`);
  if (deployment.dmmkToken) {
    console.log(`DMMK_TOKEN_ADDRESS=${deployment.dmmkToken}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
