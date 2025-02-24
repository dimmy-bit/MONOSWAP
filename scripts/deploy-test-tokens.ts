import { ethers } from "hardhat";

async function main() {
  const TestToken = await ethers.getContractFactory("TestToken");
  
  // Deploy USDC with 6 decimals
  const usdc = await TestToken.deploy("USD Coin", "USDC", 6);
  await usdc.deployed();
  console.log("Test USDC deployed to:", usdc.address);

  // Deploy USDT with 6 decimals
  const usdt = await TestToken.deploy("Tether USD", "USDT", 6);
  await usdt.deployed();
  console.log("Test USDT deployed to:", usdt.address);

  // Verify contract addresses are properly checksummed
  console.log("Checksummed addresses:");
  console.log("USDC:", ethers.utils.getAddress(usdc.address));
  console.log("USDT:", ethers.utils.getAddress(usdt.address));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 