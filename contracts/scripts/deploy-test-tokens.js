const { ethers } = require("hardhat");
require("dotenv").config();

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
  console.log("Waiting for USDC deployment transaction...");
  await usdc.deployed();
  console.log("USDC deployed to:", usdc.address);
  
  // Enable minting for USDC
  console.log("Enabling minting for USDC...");
  const usdcMintTx = await usdc.setMintingEnabled(true);
  console.log("Waiting for minting enable transaction...");
  await usdcMintTx.wait();
  console.log("Minting enabled for USDC");

  // Deploy USDT
  console.log("Deploying USDT...");
  const usdt = await TestToken.deploy(
    "Tether USD",
    "USDT",
    process.env.USDT_DECIMALS || 6
  );
  console.log("Waiting for USDT deployment transaction...");
  await usdt.deployed();
  console.log("USDT deployed to:", usdt.address);
  
  // Enable minting for USDT
  console.log("Enabling minting for USDT...");
  const usdtMintTx = await usdt.setMintingEnabled(true);
  console.log("Waiting for minting enable transaction...");
  await usdtMintTx.wait();
  console.log("Minting enabled for USDT");

  // Log the checksummed addresses
  console.log("\nDeployment Summary:");
  console.log("USDC:", ethers.utils.getAddress(usdc.address));
  console.log("USDT:", ethers.utils.getAddress(usdt.address));

  // Save the addresses to a file for future reference
  const fs = require('fs');
  const addresses = {
    USDC: usdc.address,
    USDT: usdt.address
  };
  fs.writeFileSync('deployed-addresses.json', JSON.stringify(addresses, null, 2));
  console.log("\nAddresses saved to deployed-addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 