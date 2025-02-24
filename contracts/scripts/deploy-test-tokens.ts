import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Deploying test tokens...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const TestToken = await ethers.getContractFactory("TestToken");
  
  // Deploy USDC
  console.log("Deploying USDC...");
  const usdc = await TestToken.deploy(
    "USD Coin",
    "USDC",
    process.env.USDC_DECIMALS || 6
  );
  await usdc.deployed();
  console.log("USDC deployed to:", usdc.address);
  
  // Enable minting for USDC
  await usdc.enableMinting();
  console.log("Minting enabled for USDC");

  // Deploy USDT
  console.log("Deploying USDT...");
  const usdt = await TestToken.deploy(
    "Tether USD",
    "USDT",
    process.env.USDT_DECIMALS || 6
  );
  await usdt.deployed();
  console.log("USDT deployed to:", usdt.address);
  
  // Enable minting for USDT
  await usdt.enableMinting();
  console.log("Minting enabled for USDT");

  // Log the checksummed addresses
  console.log("\nDeployment Summary:");
  console.log("USDC:", ethers.utils.getAddress(usdc.address));
  console.log("USDT:", ethers.utils.getAddress(usdt.address));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 