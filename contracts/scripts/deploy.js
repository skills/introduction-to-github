const { ethers } = require("hardhat");

/**
 * Deployment script for AnchorManifest contract
 * Target: Ethereum Sepolia Testnet
 * 
 * Usage:
 *   npx hardhat run scripts/deploy.js --network sepolia
 */

async function main() {
  console.log("=".repeat(60));
  console.log("AnchorManifest Deployment Script");
  console.log("=".repeat(60));

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("\nDeployer address:", deployer.address);
  
  // Get balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH");
  
  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "(Chain ID:", network.chainId.toString() + ")");
  
  console.log("\n" + "-".repeat(60));
  console.log("Deploying AnchorManifest contract...");
  console.log("-".repeat(60));
  
  // Deploy AnchorManifest
  const AnchorManifest = await ethers.getContractFactory("AnchorManifest");
  const anchorManifest = await AnchorManifest.deploy(deployer.address);
  
  await anchorManifest.waitForDeployment();
  const contractAddress = await anchorManifest.getAddress();
  
  console.log("\n✅ AnchorManifest deployed successfully!");
  console.log("Contract address:", contractAddress);
  
  // Verify deployment
  console.log("\n" + "-".repeat(60));
  console.log("Verifying deployment...");
  console.log("-".repeat(60));
  
  const owner = await anchorManifest.owner();
  const totalManifests = await anchorManifest.totalManifests();
  
  console.log("Contract owner:", owner);
  console.log("Total manifests:", totalManifests.toString());
  
  // Output deployment info for documentation
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log(`
Network: ${network.name} (Chain ID: ${network.chainId})
Contract: AnchorManifest
Address: ${contractAddress}
Owner: ${owner}
Block: ${await ethers.provider.getBlockNumber()}
Timestamp: ${new Date().toISOString()}

Verify on Etherscan:
npx hardhat verify --network sepolia ${contractAddress} ${deployer.address}

View on Sepolia Etherscan:
https://sepolia.etherscan.io/address/${contractAddress}
`);

  // Save deployment info to file
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    contract: "AnchorManifest",
    address: contractAddress,
    owner: owner,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    constructorArgs: [deployer.address]
  };
  
  const fs = require("fs");
  const deploymentPath = `./deployments/${network.name}-${network.chainId}.json`;
  
  // Ensure deployments directory exists
  if (!fs.existsSync("./deployments")) {
    fs.mkdirSync("./deployments", { recursive: true });
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Deployment info saved to: ${deploymentPath}`);
  
  return contractAddress;
}

main()
  .then((address) => {
    console.log("\nDeployment completed successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nDeployment failed:", error);
    process.exit(1);
  });
