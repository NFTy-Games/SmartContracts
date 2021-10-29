require("@nomiclabs/hardhat-waffle");
require("solidity-coverage");
require("dotenv").config();
require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-contract-sizer");

require("./tasks/deployTradeStand");
require("./tasks/mintTradeStand");

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;
const GAS_PRICE = process.env.GAS_PRICE;

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

// rinkeby
const RINKEBY_RPC_PROVIDER_URL = process.env.RINKEBY_RPC_PROVIDER_URL;
const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY;

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config = {
  networks: {
    hardhat: {},
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
  },
  gasReporter: {
    enabled: !!COINMARKETCAP_API_KEY,
    coinmarketcap: COINMARKETCAP_API_KEY,
    currency: "EUR",
    gasPrice: Number(GAS_PRICE),
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  solidity: {
    compilers: [
      {
        version: "0.8.7",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ],
  },
};

if (RINKEBY_RPC_PROVIDER_URL && RINKEBY_PRIVATE_KEY) {
  config.networks.rinkeby = {
    accounts: [`${RINKEBY_PRIVATE_KEY}`],
    url: RINKEBY_RPC_PROVIDER_URL,
    throwOnTransactionFailures: true,
    throwOnCallFailures: true,
    allowUnlimitedContractSize: true,
    blockGasLimit: 0x1fffffffffffff,
  };
}

module.exports = config;
