require("dotenv").config();
require("hardhat-abi-exporter");
require("hardhat-deploy");
require("hardhat-watcher");
require("hardhat-contract-sizer");
require("hardhat-docgen");
require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-solhint");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("solidity-coverage");

require("./tasks/accounts");

const { removeConsoleLog } = require("hardhat-preprocessor");

const chainIds = {
  ganache: 1337,
  goerli: 5,
  hardhat: 31337,
  kovan: 42,
  mainnet: 1,
  rinkeby: 4,
  ropsten: 3,
};

// Detect if deployment is occurring
const isDeploying = process.argv.includes("deploy") || process.argv.includes("run");

const mnemonic = process.env.MNEMONIC;
const infuraApiKey = process.env.INFURA_API_KEY;

if (isDeploying && !mnemonic) {
  throw new Error("Please set your MNEMONIC in a .env file for deployment.");
}
if (isDeploying && !infuraApiKey) {
  throw new Error("Please set your INFURA_API_KEY in a .env file for deployment.");
}

function getChainConfig(network) {
  const url = `https://${network}.infura.io/v3/${infuraApiKey}`;
  return {
    accounts: {
      initialIndex: 0,
      count: 10,
      mnemonic: mnemonic || "test test test test test test test test test test test junk",
      path: "m/44'/60'/0'/0",
    },
    chainId: chainIds[network],
    tags: (network === "mainnet" && ["production"]) || ["staging"],
    url,
    live: network === "mainnet",
    saveDeployments: true,
  };
}

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.6",
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      accounts: {
        mnemonic: mnemonic || "test test test test test test test test test test test junk",
      },
      chainId: chainIds.hardhat,
      hardfork: process.env.CODE_COVERAGE ? "berlin" : "london",
      forking: {
        enabled: !!process.env.FORKING_URL,
        url: process.env.FORKING_URL || "https://eth-mainnet.alchemyapi.io/v2/<key>",
        blockNumber: (process.env.FORKING_BLOCK && parseInt(process.env.FORKING_BLOCK)) || 0,
      },
      tags: ["test", "local"],
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      tags: ["local"],
    },
    goerli: getChainConfig("goerli"),
    kovan: getChainConfig("kovan"),
    rinkeby: getChainConfig("rinkeby"),
    ropsten: getChainConfig("ropsten"),
    mainnet: getChainConfig("mainnet"),
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  abiExporter: {
    path: "./abi",
    clear: true,
    flat: true,
    spacing: 2,
  },
  preprocess: {
    eachLine: removeConsoleLog(
      (bre) => bre.network.name !== "hardhat" && bre.network.name !== "localhost"
    ),
  },
  gasReporter: {
    currency: "EUR",
    enabled: !!process.env.REPORT_GAS,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    outputFile: "gas-report.txt",
  },
  watcher: {
    compilation: {
      tasks: ["compile"],
      files: ["./contracts"],
      verbose: true,
    },
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: false,
    disambiguatePaths: false,
  },
  docgen: {
    path: "./docs",
    clear: true,
    runOnCompile: false,
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  mocha: {
    timeout: 60000,
  },
};

