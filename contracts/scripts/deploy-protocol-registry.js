const { ethers } = require("hardhat");
const fs = require("fs");

/**
 * Deployment script for ProtocolRegistry contract
 * Security Layer 2.0 - ScrollVerse Ecosystem
 * 
 * Usage:
 *   npx hardhat run scripts/deploy-protocol-registry.js --network sepolia
 * 
 * Post-Deployment Steps:
 * 1. Bootstrap critical native ScrollVerse protocols (e.g., CHXTOKEN)
 * 2. Transfer governance to ScrollVerseDAO Timelock Controller
 */

async function main() {
  console.log("=".repeat(60));
  console.log("ProtocolRegistry Deployment Script");
  console.log("Security Layer 2.0 - ScrollVerse Ecosystem");
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
  console.log("Deploying ProtocolRegistry contract...");
  console.log("-".repeat(60));

  // Deploy ProtocolRegistry
  const ProtocolRegistry = await ethers.getContractFactory("ProtocolRegistry");
  const protocolRegistry = await ProtocolRegistry.deploy();

  await protocolRegistry.waitForDeployment();
  const contractAddress = await protocolRegistry.getAddress();

  console.log("\n✅ ProtocolRegistry deployed successfully!");
  console.log("Contract address:", contractAddress);

  // Verify deployment
  console.log("\n" + "-".repeat(60));
  console.log("Verifying deployment...");
  console.log("-".repeat(60));

  const governor = await protocolRegistry.governor();
  const totalProtocols = await protocolRegistry.totalProtocols();

  console.log("Initial governor:", governor);
  console.log("Total protocols:", totalProtocols.toString());

  // Output deployment info for documentation
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log(`
Network: ${network.name} (Chain ID: ${network.chainId})
Contract: ProtocolRegistry
Address: ${contractAddress}
Governor: ${governor}
Block: ${await ethers.provider.getBlockNumber()}
Timestamp: ${new Date().toISOString()}

Verify on Etherscan:
npx hardhat verify --network sepolia ${contractAddress}

View on Sepolia Etherscan:
https://sepolia.etherscan.io/address/${contractAddress}

POST-DEPLOYMENT STEPS:
1. Bootstrap critical protocols using proposeProtocol()
2. Vet and approve initial protocols using vetProtocol() and approveProtocol()
3. Transfer governance to DAO Timelock using transferGovernor(timelockAddress)
`);

  // Save deployment info to file
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    contract: "ProtocolRegistry",
    address: contractAddress,
    governor: governor,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    constructorArgs: [],
    securityLayer: "2.0",
    postDeploymentSteps: [
      "Bootstrap critical native ScrollVerse protocols (e.g., CHXTOKEN)",
      "Transfer governance to ScrollVerseDAO Timelock Controller"
    ]
  };

  const deploymentPath = `./deployments/protocol-registry-${network.name}-${network.chainId}.json`;

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
