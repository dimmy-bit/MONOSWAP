require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const MONAD_RPC_URL = process.env.MONAD_RPC_URL || "https://testnet-rpc.monad.xyz/";
const CHAIN_ID = parseInt(process.env.CHAIN_ID || "10143");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    monad: {
      url: MONAD_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: CHAIN_ID,
    }
  },
  namedAccounts: {
    deployer: {
      default: 0
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
