require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/**
 * ScrollVerse Hardhat Configuration
 * Target Networks: Polygon zkEVM Testnet & Scroll zkEVM Sepolia
 * 
 * ALLĀHU AKBAR! KUN FAYAKUN! 🔥🕋🚀♾️
 */

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  
  networks: {
    // Hardhat Local Network (default)
    hardhat: {
      chainId: 31337
    },
    
    // Polygon zkEVM Testnet (Phase 1 Primary)
    polygonZkEVMTestnet: {
      url: process.env.POLYGON_ZKEVM_RPC || "https://rpc.public.zkevm-test.net",
      chainId: 1442,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      gasPrice: "auto"
    },
    
    // Polygon zkEVM Mainnet
    polygonZkEVM: {
      url: process.env.POLYGON_ZKEVM_MAINNET_RPC || "https://zkevm-rpc.com",
      chainId: 1101,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      gasPrice: "auto"
    },
    
    // Scroll zkEVM Sepolia (Phase 2 Primary)
    scrollSepolia: {
      url: process.env.SCROLL_SEPOLIA_RPC || "https://sepolia-rpc.scroll.io",
      chainId: 534351,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      gasPrice: "auto"
    },
    
    // Scroll zkEVM Mainnet
    scroll: {
      url: process.env.SCROLL_MAINNET_RPC || "https://rpc.scroll.io",
      chainId: 534352,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      gasPrice: "auto"
    },
    
    // Ethereum Sepolia (for testing)
    sepolia: {
      url: process.env.SEPOLIA_RPC || "https://rpc.sepolia.org",
      chainId: 11155111,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : []
    }
  },
  
  // Etherscan/Polygonscan/Scrollscan verification
  etherscan: {
    apiKey: {
      // Polygon zkEVM
      polygonZkEVMTestnet: process.env.POLYGONSCAN_API_KEY || "",
      polygonZkEVM: process.env.POLYGONSCAN_API_KEY || "",
      // Scroll
      scrollSepolia: process.env.SCROLLSCAN_API_KEY || "",
      scroll: process.env.SCROLLSCAN_API_KEY || "",
      // Ethereum
      sepolia: process.env.ETHERSCAN_API_KEY || ""
    },
    customChains: [
      {
        network: "polygonZkEVMTestnet",
        chainId: 1442,
        urls: {
          apiURL: "https://api-testnet-zkevm.polygonscan.com/api",
          browserURL: "https://testnet-zkevm.polygonscan.com"
        }
      },
      {
        network: "scrollSepolia",
        chainId: 534351,
        urls: {
          apiURL: "https://api-sepolia.scrollscan.com/api",
          browserURL: "https://sepolia.scrollscan.com"
        }
      },
      {
        network: "scroll",
        chainId: 534352,
        urls: {
          apiURL: "https://api.scrollscan.com/api",
          browserURL: "https://scrollscan.com"
        }
      }
    ]
  },
  
  // Gas Reporter
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY || ""
  },
  
  // Paths
  paths: {
    sources: "./src",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
