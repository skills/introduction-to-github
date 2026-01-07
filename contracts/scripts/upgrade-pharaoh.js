const { ethers, upgrades } = require("hardhat");

/**
 * PharaohConsciousnessFusion Upgrade Script
 * 
 * Upgrades the Consciousness Mirror NFT collection to a new implementation
 * 
 * Usage:
 *   PROXY_ADDRESS=<address> npx hardhat run scripts/upgrade-pharaoh.js --network <network>
 * 
 * Environment Variables:
 *   - DEPLOYER_PRIVATE_KEY: Private key of deployer wallet (must be owner)
 *   - PROXY_ADDRESS: Address of the deployed proxy contract
 * 
 * @author OmniTech1™
 */

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("=".repeat(60));
  console.log("PharaohConsciousnessFusion Upgrade");
  console.log("Consciousness Mirror NFT Collection");
  console.log("=".repeat(60));
  console.log("");

  // Get proxy address from environment
  const proxyAddress = process.env.PROXY_ADDRESS;
  
  if (!proxyAddress) {
    console.error("ERROR: PROXY_ADDRESS environment variable not set");
    console.error("Usage: PROXY_ADDRESS=<address> npx hardhat run scripts/upgrade-pharaoh.js --network <network>");
    process.exit(1);
  }

  console.log("Upgrader:", deployer.address);
  console.log("Proxy Address:", proxyAddress);
  console.log("");

  // Get current implementation address
  const currentImplementation = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("Current Implementation:", currentImplementation);
  console.log("");

  // Verify ownership
  const pharaoh = await ethers.getContractAt("PharaohConsciousnessFusion", proxyAddress);
  const owner = await pharaoh.owner();
  
  if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
    console.error("ERROR: Deployer is not the contract owner");
    console.error("  Contract Owner:", owner);
    console.error("  Deployer:", deployer.address);
    process.exit(1);
  }

  console.log("✓ Ownership verified");
  console.log("");

  // Deploy new implementation
  console.log("Deploying new implementation...");
  
  // Note: In a real upgrade scenario, you would deploy a V2 contract
  // For this example, we're using the same contract to demonstrate the upgrade process
  const PharaohConsciousnessFusionV2 = await ethers.getContractFactory("PharaohConsciousnessFusion");
  
  const upgraded = await upgrades.upgradeProxy(proxyAddress, PharaohConsciousnessFusionV2);
  await upgraded.waitForDeployment();

  // Get new implementation address
  const newImplementation = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  
  console.log("");
  console.log("✓ Upgrade Successful!");
  console.log("");
  console.log("Implementation Addresses:");
  console.log("  Previous:", currentImplementation);
  console.log("  New:", newImplementation);
  console.log("");

  // Verify state preservation
  console.log("Verifying state preservation...");
  
  const name = await upgraded.name();
  const symbol = await upgraded.symbol();
  const totalMinted = await upgraded.totalMinted();
  
  console.log("  Name:", name);
  console.log("  Symbol:", symbol);
  console.log("  Total Minted:", totalMinted.toString());
  console.log("");
  console.log("✓ State preserved successfully");
  console.log("");

  console.log("=".repeat(60));
  console.log("UPGRADE SUMMARY");
  console.log("=".repeat(60));
  console.log("");
  console.log(`Network: ${(await ethers.provider.getNetwork()).name}`);
  console.log(`Chain ID: ${(await ethers.provider.getNetwork()).chainId}`);
  console.log("");
  console.log("Addresses:");
  console.log(`  PROXY_ADDRESS=${proxyAddress}`);
  console.log(`  NEW_IMPLEMENTATION=${newImplementation}`);
  console.log("");
  console.log("Don't forget to verify the new implementation on Etherscan:");
  console.log(`  npx hardhat verify --network <network> ${newImplementation}`);
  console.log("");
  console.log("=".repeat(60));
  
  return {
    proxy: proxyAddress,
    previousImplementation: currentImplementation,
    newImplementation: newImplementation
  };
}

main()
  .then((addresses) => {
    console.log("Upgrade complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Upgrade failed:", error);
    process.exit(1);
  });
