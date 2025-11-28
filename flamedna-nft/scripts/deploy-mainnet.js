/**
 * FlameDNA NFT - Mainnet Deployment Script
 * 
 * Deploys PromiseLandNFT to Ethereum/Scroll Mainnet
 * 
 * IMPORTANT: Double-check all parameters before mainnet deployment!
 * 
 * Usage:
 *   npx hardhat run scripts/deploy-mainnet.js --network mainnet
 *   npx hardhat run scripts/deploy-mainnet.js --network scrollMainnet
 * 
 * @author Chais Hill - OmniTech1
 */

const hre = require("hardhat");

async function main() {
  console.log("=".repeat(60));
  console.log("FlameDNA NFT - MAINNET Deployment");
  console.log("=".repeat(60));
  console.log("\n⚠️  WARNING: This is a MAINNET deployment!");
  console.log("    Ensure all parameters are correct before proceeding.\n");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");
  
  // Mainnet deployment parameters - MUST be configured correctly!
  const config = {
    promiseLand: {
      name: "PromiseLand NFT",
      symbol: "PROMISE",
      baseURI: process.env.BASE_TOKEN_URI, // Must be set!
      contractURI: process.env.CONTRACT_URI, // Must be set!
      royaltyReceiver: process.env.ROYALTY_RECEIVER, // Must be set!
      royaltyFeeNumerator: parseInt(process.env.ROYALTY_FEE_NUMERATOR || "500")
    }
  };
  
  // Validation
  if (!config.promiseLand.baseURI || config.promiseLand.baseURI.includes("Placeholder")) {
    throw new Error("BASE_TOKEN_URI must be set to production IPFS URI!");
  }
  if (!config.promiseLand.contractURI || config.promiseLand.contractURI.includes("Placeholder")) {
    throw new Error("CONTRACT_URI must be set to production IPFS URI!");
  }
  if (!config.promiseLand.royaltyReceiver || config.promiseLand.royaltyReceiver === deployer.address) {
    console.log("⚠️  Warning: Using deployer address as royalty receiver");
  }
  
  console.log("\n--- Mainnet Deployment Configuration ---");
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", (await hre.ethers.provider.getNetwork()).chainId.toString());
  console.log("Name:", config.promiseLand.name);
  console.log("Symbol:", config.promiseLand.symbol);
  console.log("Base URI:", config.promiseLand.baseURI);
  console.log("Contract URI:", config.promiseLand.contractURI);
  console.log("Royalty Receiver:", config.promiseLand.royaltyReceiver);
  console.log("Royalty Fee:", config.promiseLand.royaltyFeeNumerator / 100, "%");
  
  // Confirmation prompt
  console.log("\n⏳ Starting deployment in 10 seconds...");
  console.log("   Press Ctrl+C to cancel.\n");
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // Deploy PromiseLandNFT
  console.log("--- Deploying PromiseLandNFT ---");
  const PromiseLandNFT = await hre.ethers.getContractFactory("PromiseLandNFT");
  const promiseLand = await PromiseLandNFT.deploy(
    config.promiseLand.name,
    config.promiseLand.symbol,
    config.promiseLand.baseURI,
    config.promiseLand.contractURI,
    config.promiseLand.royaltyReceiver,
    config.promiseLand.royaltyFeeNumerator
  );
  
  console.log("Transaction hash:", promiseLand.deploymentTransaction().hash);
  console.log("Waiting for confirmation...");
  
  await promiseLand.waitForDeployment();
  const promiseLandAddress = await promiseLand.getAddress();
  
  // Wait for additional confirmations on mainnet
  console.log("Waiting for 5 block confirmations...");
  await promiseLand.deploymentTransaction().wait(5);
  
  console.log("\n" + "=".repeat(60));
  console.log("✅ MAINNET DEPLOYMENT COMPLETE");
  console.log("=".repeat(60));
  console.log("\nPromiseLandNFT deployed to:", promiseLandAddress);
  console.log("Network:", hre.network.name);
  
  // Explorer and OpenSea URLs
  console.log("\n--- Important Links ---");
  if (hre.network.name === "mainnet") {
    console.log("Etherscan:", `https://etherscan.io/address/${promiseLandAddress}`);
    console.log("OpenSea:", `https://opensea.io/collection/${config.promiseLand.symbol.toLowerCase()}`);
  } else if (hre.network.name === "scrollMainnet") {
    console.log("ScrollScan:", `https://scrollscan.com/address/${promiseLandAddress}`);
  }
  
  // Verification command
  console.log("\n--- Verify Contract ---");
  console.log(`npx hardhat verify --network ${hre.network.name} ${promiseLandAddress} "${config.promiseLand.name}" "${config.promiseLand.symbol}" "${config.promiseLand.baseURI}" "${config.promiseLand.contractURI}" "${config.promiseLand.royaltyReceiver}" ${config.promiseLand.royaltyFeeNumerator}`);
  
  // Post-deployment checklist
  console.log("\n--- Post-Deployment Checklist ---");
  console.log("1. [ ] Verify contract on block explorer");
  console.log("2. [ ] Test mintGenesis and mintFounding functions");
  console.log("3. [ ] Set up allowlists via setGenesisAllowlist/setFoundingAllowlist");
  console.log("4. [ ] Activate mint phases via setMintPhases");
  console.log("5. [ ] Submit collection to OpenSea");
  console.log("6. [ ] Update website with contract address");
  
  return {
    network: hre.network.name,
    address: promiseLandAddress,
    config: config.promiseLand
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
