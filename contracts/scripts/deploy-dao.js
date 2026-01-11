const { ethers } = require("hardhat");
const fs = require("fs");

/**
 * Deployment script for ScrollVerse DAO contracts
 * Deploys: MirrorToken, ScrollVerseTimelock, ScrollVerseDAO
 * 
 * Usage:
 *   npx hardhat run scripts/deploy-dao.js --network sepolia
 */

async function main() {
  console.log("=".repeat(70));
  console.log("ScrollVerse DAO Deployment Script");
  console.log("=".repeat(70));

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("\nDeployer address:", deployer.address);
  
  // Get balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH");
  
  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "(Chain ID:", network.chainId.toString() + ")");
  
  const deploymentRecord = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    contracts: {}
  };

  // ============================================
  // 1. Deploy MirrorToken
  // ============================================
  console.log("\n" + "-".repeat(70));
  console.log("Step 1: Deploying MirrorToken...");
  console.log("-".repeat(70));
  
  const MirrorToken = await ethers.getContractFactory("MirrorToken");
  const mirrorToken = await MirrorToken.deploy(deployer.address);
  await mirrorToken.waitForDeployment();
  const mirrorTokenAddress = await mirrorToken.getAddress();
  
  console.log("✅ MirrorToken deployed at:", mirrorTokenAddress);
  
  deploymentRecord.contracts.MirrorToken = {
    address: mirrorTokenAddress,
    constructorArgs: [deployer.address],
    deployedAt: new Date().toISOString()
  };

  // ============================================
  // 2. Deploy ScrollVerseTimelock
  // ============================================
  console.log("\n" + "-".repeat(70));
  console.log("Step 2: Deploying ScrollVerseTimelock...");
  console.log("-".repeat(70));
  
  const minDelay = 2 * 24 * 60 * 60; // 2 days in seconds
  const proposers = []; // Will add DAO after deployment
  const executors = [ethers.ZeroAddress]; // Anyone can execute
  const admin = deployer.address;
  
  const ScrollVerseTimelock = await ethers.getContractFactory("ScrollVerseTimelock");
  const timelock = await ScrollVerseTimelock.deploy(minDelay, proposers, executors, admin);
  await timelock.waitForDeployment();
  const timelockAddress = await timelock.getAddress();
  
  console.log("✅ ScrollVerseTimelock deployed at:", timelockAddress);
  console.log("   Min delay:", minDelay, "seconds (2 days)");
  
  deploymentRecord.contracts.ScrollVerseTimelock = {
    address: timelockAddress,
    constructorArgs: [minDelay, proposers, executors, admin],
    deployedAt: new Date().toISOString()
  };

  // ============================================
  // 3. Deploy ScrollVerseDAO
  // ============================================
  console.log("\n" + "-".repeat(70));
  console.log("Step 3: Deploying ScrollVerseDAO...");
  console.log("-".repeat(70));
  
  const ScrollVerseDAO = await ethers.getContractFactory("ScrollVerseDAO");
  const dao = await ScrollVerseDAO.deploy(
    mirrorTokenAddress,
    timelockAddress,
    deployer.address
  );
  await dao.waitForDeployment();
  const daoAddress = await dao.getAddress();
  
  console.log("✅ ScrollVerseDAO deployed at:", daoAddress);
  
  deploymentRecord.contracts.ScrollVerseDAO = {
    address: daoAddress,
    constructorArgs: [mirrorTokenAddress, timelockAddress, deployer.address],
    deployedAt: new Date().toISOString()
  };

  // ============================================
  // 4. Configure Timelock Roles
  // ============================================
  console.log("\n" + "-".repeat(70));
  console.log("Step 4: Configuring Timelock roles...");
  console.log("-".repeat(70));
  
  const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
  const CANCELLER_ROLE = await timelock.CANCELLER_ROLE();
  
  // Grant proposer role to DAO
  let tx = await timelock.grantRole(PROPOSER_ROLE, daoAddress);
  await tx.wait();
  console.log("✅ Granted PROPOSER_ROLE to DAO");
  
  // Grant canceller role to DAO
  tx = await timelock.grantRole(CANCELLER_ROLE, daoAddress);
  await tx.wait();
  console.log("✅ Granted CANCELLER_ROLE to DAO");

  // ============================================
  // Summary
  // ============================================
  console.log("\n" + "=".repeat(70));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(70));
  console.log(`
Network: ${network.name} (Chain ID: ${network.chainId})
Deployer: ${deployer.address}

Contracts Deployed:
  • MirrorToken:         ${mirrorTokenAddress}
  • ScrollVerseTimelock: ${timelockAddress}
  • ScrollVerseDAO:      ${daoAddress}

Governance Parameters:
  • Voting Delay:        7,200 blocks (~1 day)
  • Voting Period:       50,400 blocks (~7 days)
  • Proposal Threshold:  100,000 MIRROR
  • Quorum:              4% of total supply
  • Timelock Delay:      2 days

Next Steps:
  1. Execute initial token distribution
  2. Deploy MirrorStaking contract
  3. Deploy NFT contracts
  4. Verify all contracts on Etherscan

Verification Commands:
  npx hardhat verify --network ${network.name} ${mirrorTokenAddress} ${deployer.address}
  npx hardhat verify --network ${network.name} ${timelockAddress} ${minDelay} [] [${ethers.ZeroAddress}] ${admin}
  npx hardhat verify --network ${network.name} ${daoAddress} ${mirrorTokenAddress} ${timelockAddress} ${deployer.address}
`);

  // Save deployment record
  const deploymentPath = `./deployments/${network.name}-${network.chainId}-dao.json`;
  
  if (!fs.existsSync("./deployments")) {
    fs.mkdirSync("./deployments", { recursive: true });
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentRecord, null, 2));
  console.log(`Deployment info saved to: ${deploymentPath}`);
  
  return deploymentRecord;
}

main()
  .then(() => {
    console.log("\nDAO deployment completed successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nDeployment failed:", error);
    process.exit(1);
  });
