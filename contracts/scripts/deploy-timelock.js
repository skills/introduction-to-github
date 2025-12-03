const { ethers } = require("hardhat");

/**
 * Deployment script for ScrollVerse Genesis Sequence - Phase 1, Step 1.1
 * Deploys the TimelockController with ScrollVerseDAO as proposer and executor
 * 
 * Target: Ethereum Sepolia Testnet / Mainnet
 * 
 * Configuration:
 *   - Minimum delay: 48 hours (172800 seconds)
 *   - Proposer: ScrollVerseDAO contract
 *   - Executor: ScrollVerseDAO contract
 *   - Admin: Deployer (temporary, should be renounced after setup)
 * 
 * Usage:
 *   npx hardhat run scripts/deploy-timelock.js --network sepolia
 */

// 48 hours in seconds (2 days)
const MIN_DELAY = 48 * 60 * 60; // 172800 seconds

async function main() {
  console.log("=".repeat(70));
  console.log("ScrollVerse Genesis Sequence - Phase 1, Step 1.1");
  console.log("TimelockController Deployment");
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
  
  console.log("\n" + "-".repeat(70));
  console.log("Step 1: Deploying ScrollVerseDAO contract...");
  console.log("-".repeat(70));
  
  // Deploy ScrollVerseDAO first
  const ScrollVerseDAO = await ethers.getContractFactory("ScrollVerseDAO");
  const scrollVerseDAO = await ScrollVerseDAO.deploy(deployer.address);
  
  await scrollVerseDAO.waitForDeployment();
  const daoAddress = await scrollVerseDAO.getAddress();
  
  console.log("\n✅ ScrollVerseDAO deployed successfully!");
  console.log("ScrollVerseDAO address:", daoAddress);
  
  console.log("\n" + "-".repeat(70));
  console.log("Step 2: Deploying TimelockController...");
  console.log("-".repeat(70));
  
  console.log("\nTimelockController Configuration:");
  console.log("  - Minimum delay:", MIN_DELAY, "seconds (48 hours)");
  console.log("  - Proposer:", daoAddress, "(ScrollVerseDAO)");
  console.log("  - Executor:", daoAddress, "(ScrollVerseDAO)");
  console.log("  - Admin:", deployer.address, "(temporary)");
  
  // Prepare constructor arguments for TimelockController
  // constructor(uint256 minDelay, address[] memory proposers, address[] memory executors, address admin)
  const proposers = [daoAddress]; // ScrollVerseDAO as sole proposer
  const executors = [daoAddress]; // ScrollVerseDAO as sole executor
  const admin = deployer.address; // Temporary admin for initial setup
  
  // Deploy TimelockController from OpenZeppelin
  const TimelockController = await ethers.getContractFactory("TimelockController");
  const timelockController = await TimelockController.deploy(
    MIN_DELAY,
    proposers,
    executors,
    admin
  );
  
  await timelockController.waitForDeployment();
  const timelockAddress = await timelockController.getAddress();
  
  console.log("\n✅ TimelockController deployed successfully!");
  console.log("TimelockController address:", timelockAddress);
  
  console.log("\n" + "-".repeat(70));
  console.log("Step 3: Linking ScrollVerseDAO to TimelockController...");
  console.log("-".repeat(70));
  
  // Set the TimelockController in ScrollVerseDAO
  const setTx = await scrollVerseDAO.setTimelockController(timelockAddress);
  await setTx.wait();
  
  console.log("\n✅ ScrollVerseDAO linked to TimelockController!");
  
  // Verify deployment
  console.log("\n" + "-".repeat(70));
  console.log("Verification...");
  console.log("-".repeat(70));
  
  const daoOwner = await scrollVerseDAO.owner();
  const linkedTimelock = await scrollVerseDAO.getTimelockController();
  const minDelay = await timelockController.getMinDelay();
  
  console.log("\nScrollVerseDAO:");
  console.log("  - Owner:", daoOwner);
  console.log("  - Linked TimelockController:", linkedTimelock);
  
  console.log("\nTimelockController:");
  console.log("  - Minimum delay:", minDelay.toString(), "seconds (" + (Number(minDelay) / 3600) + " hours)");
  
  // Check roles
  const PROPOSER_ROLE = await timelockController.PROPOSER_ROLE();
  const EXECUTOR_ROLE = await timelockController.EXECUTOR_ROLE();
  const CANCELLER_ROLE = await timelockController.CANCELLER_ROLE();
  
  const hasProposerRole = await timelockController.hasRole(PROPOSER_ROLE, daoAddress);
  const hasExecutorRole = await timelockController.hasRole(EXECUTOR_ROLE, daoAddress);
  const hasCancellerRole = await timelockController.hasRole(CANCELLER_ROLE, daoAddress);
  
  console.log("\nRole Assignments (ScrollVerseDAO):");
  console.log("  - PROPOSER_ROLE:", hasProposerRole ? "✅ Granted" : "❌ Not granted");
  console.log("  - EXECUTOR_ROLE:", hasExecutorRole ? "✅ Granted" : "❌ Not granted");
  console.log("  - CANCELLER_ROLE:", hasCancellerRole ? "✅ Granted" : "❌ Not granted");
  
  // Etherscan network mapping for supported networks
  const etherscanNetworks = {
    mainnet: "",
    sepolia: "sepolia.",
    goerli: "goerli.",
    holesky: "holesky."
  };
  const etherscanPrefix = etherscanNetworks[network.name];
  const hasEtherscan = etherscanPrefix !== undefined;
  
  // Output deployment summary
  console.log("\n" + "=".repeat(70));
  console.log("SCROLLVERSE GENESIS SEQUENCE - DEPLOYMENT SUMMARY");
  console.log("=".repeat(70));
  console.log(`
Phase 1, Step 1.1: TimelockController Deployment COMPLETE

Network: ${network.name} (Chain ID: ${network.chainId})

Deployed Contracts:
-------------------
1. ScrollVerseDAO
   Address: ${daoAddress}
   Owner: ${daoOwner}

2. TimelockController
   Address: ${timelockAddress}
   Minimum Delay: ${minDelay.toString()} seconds (48 hours)

Configuration:
--------------
- Proposer: ScrollVerseDAO (${daoAddress})
- Executor: ScrollVerseDAO (${daoAddress})
- Canceller: ScrollVerseDAO (${daoAddress})
- Admin: ${deployer.address} (temporary - should be renounced)

Security Notes:
---------------
⚠️  The admin role should be renounced after initial setup is complete.
    This ensures true decentralization and prevents admin override.

Verification Commands:
----------------------
npx hardhat verify --network ${network.name} ${daoAddress} ${deployer.address}
npx hardhat verify --network ${network.name} ${timelockAddress} ${MIN_DELAY} "[${daoAddress}]" "[${daoAddress}]" ${deployer.address}
${hasEtherscan ? `
Etherscan Links:
----------------
ScrollVerseDAO: https://${etherscanPrefix}etherscan.io/address/${daoAddress}
TimelockController: https://${etherscanPrefix}etherscan.io/address/${timelockAddress}
` : `
Note: Etherscan links not available for ${network.name} network.
`}
Timestamp: ${new Date().toISOString()}
`);

  // Save deployment info to file
  const fs = require("fs");
  const deploymentInfo = {
    phase: "Phase 1",
    step: "Step 1.1",
    name: "ScrollVerse Genesis Sequence - TimelockController Deployment",
    network: network.name,
    chainId: network.chainId.toString(),
    contracts: {
      ScrollVerseDAO: {
        address: daoAddress,
        owner: daoOwner,
        constructorArgs: [deployer.address]
      },
      TimelockController: {
        address: timelockAddress,
        minDelay: MIN_DELAY,
        minDelayHours: 48,
        proposers: [daoAddress],
        executors: [daoAddress],
        admin: deployer.address,
        constructorArgs: [MIN_DELAY, [daoAddress], [daoAddress], deployer.address]
      }
    },
    deployedAt: new Date().toISOString(),
    deployer: deployer.address
  };
  
  const deploymentPath = `./deployments/timelock-${network.name}-${network.chainId}.json`;
  
  // Ensure deployments directory exists
  if (!fs.existsSync("./deployments")) {
    fs.mkdirSync("./deployments", { recursive: true });
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Deployment info saved to: ${deploymentPath}`);
  
  console.log("\n" + "=".repeat(70));
  console.log("ScrollVerse Genesis Sequence - Phase 1, Step 1.1 COMPLETE");
  console.log("=".repeat(70));
  
  return {
    scrollVerseDAO: daoAddress,
    timelockController: timelockAddress
  };
}

main()
  .then((addresses) => {
    console.log("\n✅ Deployment completed successfully.");
    console.log("ScrollVerseDAO:", addresses.scrollVerseDAO);
    console.log("TimelockController:", addresses.timelockController);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
