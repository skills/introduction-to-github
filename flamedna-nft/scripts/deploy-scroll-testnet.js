/**
 * FlameDNA NFT - Scroll Testnet Deployment Script
 * 
 * Deploys PromiseLandNFT and FlameDNAGenesis contracts to Scroll Sepolia testnet
 * 
 * Usage:
 *   npx hardhat run scripts/deploy-scroll-testnet.js --network scrollSepolia
 * 
 * @author Chais Hill - OmniTech1
 */

const hre = require("hardhat");

async function main() {
  console.log("=".repeat(60));
  console.log("FlameDNA NFT - Scroll Testnet Deployment");
  console.log("=".repeat(60));
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("\nDeploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");
  
  // Deployment parameters
  const config = {
    promiseLand: {
      name: "PromiseLand NFT",
      symbol: "PROMISE",
      baseURI: process.env.BASE_TOKEN_URI || "ipfs://QmPlaceholder/",
      contractURI: process.env.CONTRACT_URI || "ipfs://QmPlaceholderContract",
      royaltyReceiver: process.env.ROYALTY_RECEIVER || deployer.address,
      royaltyFeeNumerator: parseInt(process.env.ROYALTY_FEE_NUMERATOR || "500") // 5%
    },
    flameDNAGenesis: {
      name: "FlameDNA Genesis",
      symbol: "FDNAG",
      baseURI: process.env.BASE_TOKEN_URI || "ipfs://QmPlaceholder/"
    }
  };
  
  console.log("\n--- Deployment Configuration ---");
  console.log("Network:", hre.network.name);
  console.log("PromiseLand Name:", config.promiseLand.name);
  console.log("PromiseLand Symbol:", config.promiseLand.symbol);
  console.log("Royalty Receiver:", config.promiseLand.royaltyReceiver);
  console.log("Royalty Fee:", config.promiseLand.royaltyFeeNumerator / 100, "%");
  
  // Deploy PromiseLandNFT
  console.log("\n--- Deploying PromiseLandNFT ---");
  const PromiseLandNFT = await hre.ethers.getContractFactory("PromiseLandNFT");
  const promiseLand = await PromiseLandNFT.deploy(
    config.promiseLand.name,
    config.promiseLand.symbol,
    config.promiseLand.baseURI,
    config.promiseLand.contractURI,
    config.promiseLand.royaltyReceiver,
    config.promiseLand.royaltyFeeNumerator
  );
  
  await promiseLand.waitForDeployment();
  const promiseLandAddress = await promiseLand.getAddress();
  console.log("PromiseLandNFT deployed to:", promiseLandAddress);
  
  // Deploy FlameDNAGenesis
  console.log("\n--- Deploying FlameDNAGenesis ---");
  const FlameDNAGenesis = await hre.ethers.getContractFactory("FlameDNAGenesis");
  const flameDNAGenesis = await FlameDNAGenesis.deploy(
    config.flameDNAGenesis.name,
    config.flameDNAGenesis.symbol,
    config.flameDNAGenesis.baseURI
  );
  
  await flameDNAGenesis.waitForDeployment();
  const flameDNAGenesisAddress = await flameDNAGenesis.getAddress();
  console.log("FlameDNAGenesis deployed to:", flameDNAGenesisAddress);
  
  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT COMPLETE");
  console.log("=".repeat(60));
  console.log("\nContract Addresses:");
  console.log("  PromiseLandNFT:", promiseLandAddress);
  console.log("  FlameDNAGenesis:", flameDNAGenesisAddress);
  console.log("\nNetwork:", hre.network.name);
  console.log("Chain ID:", (await hre.ethers.provider.getNetwork()).chainId.toString());
  
  // Verification instructions
  console.log("\n--- Verification Commands ---");
  console.log(`npx hardhat verify --network ${hre.network.name} ${promiseLandAddress} "${config.promiseLand.name}" "${config.promiseLand.symbol}" "${config.promiseLand.baseURI}" "${config.promiseLand.contractURI}" "${config.promiseLand.royaltyReceiver}" ${config.promiseLand.royaltyFeeNumerator}`);
  console.log(`npx hardhat verify --network ${hre.network.name} ${flameDNAGenesisAddress} "${config.flameDNAGenesis.name}" "${config.flameDNAGenesis.symbol}" "${config.flameDNAGenesis.baseURI}"`);
  
  // OpenSea URLs
  console.log("\n--- OpenSea Integration ---");
  if (hre.network.name === "scrollSepolia") {
    console.log("Testnet Explorer:", `https://sepolia.scrollscan.com/address/${promiseLandAddress}`);
  } else if (hre.network.name === "scrollMainnet") {
    console.log("Mainnet Explorer:", `https://scrollscan.com/address/${promiseLandAddress}`);
    console.log("OpenSea:", `https://opensea.io/collection/${config.promiseLand.name.toLowerCase().replace(/\s+/g, '-')}`);
  }
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      PromiseLandNFT: {
        address: promiseLandAddress,
        ...config.promiseLand
      },
      FlameDNAGenesis: {
        address: flameDNAGenesisAddress,
        ...config.flameDNAGenesis
      }
    }
  };
  
  console.log("\n--- Deployment Info (JSON) ---");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
