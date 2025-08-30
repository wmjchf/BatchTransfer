require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
require("solidity-coverage");

// 从环境变量读取私钥和API密钥
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x" + "0".repeat(64);
const INFURA_API_KEY = process.env.INFURA_API_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY || "";
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    ethereum: {
      url: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
      gasPrice: 20000000000, // 20 gwei
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
      gasPrice: 5000000000, // 5 gwei
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
      gasPrice: 5000000000, // 5 gwei
    },
    bsc: {
      url: "https://bsc-dataseed1.binance.org/",
      accounts: [PRIVATE_KEY],
      gasPrice: 5000000000, // 5 gwei
    },
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      accounts: [PRIVATE_KEY],
      gasPrice: 10000000000, // 10 gwei
    },
    polygon: {
      url: "https://polygon-rpc.com/",
      accounts: [PRIVATE_KEY],
      gasPrice: 30000000000, // 30 gwei
    },
    polygonMumbai: {
      url: "https://rpc-mumbai.maticvigil.com/",
      accounts: [PRIVATE_KEY],
      gasPrice: 5000000000, // 5 gwei
    },
    arbitrum: {
      url: "https://arb1.arbitrum.io/rpc",
      accounts: [PRIVATE_KEY],
      gasPrice: 100000000, // 0.1 gwei
    },
    arbitrumGoerli: {
      url: "https://goerli-rollup.arbitrum.io/rpc",
      accounts: [PRIVATE_KEY],
      gasPrice: 100000000, // 0.1 gwei
    },
  },
  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_API_KEY,
      goerli: ETHERSCAN_API_KEY,
      sepolia: ETHERSCAN_API_KEY,
      bsc: BSCSCAN_API_KEY,
      bscTestnet: BSCSCAN_API_KEY,
      polygon: POLYGONSCAN_API_KEY,
      polygonMumbai: POLYGONSCAN_API_KEY,
      arbitrumOne: ETHERSCAN_API_KEY,
      arbitrumGoerli: ETHERSCAN_API_KEY,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  mocha: {
    timeout: 40000,
  },
};