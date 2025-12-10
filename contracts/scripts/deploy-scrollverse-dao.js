const { ethers } = require("hardhat");
const fs = require("fs");

/**
 * Deployment Script for ScrollVerseDAO - Phase 1, Step 1.6
 * 
 * This script deploys the ScrollVerseDAO contract to establish the ultimate
 * governing body of the ScrollVerse ecosystem.
 * 
 * Prerequisites:
 * - MirrorToken ($MIRROR) deployed (Step 1.4)
 * - PharaohConsciousnessFusion NFT deployed (Step 1.5)
 * - TimelockController deployed (Step 1.1)
 * 
 * Post-Deployment:
 * - Execute hand-off sequence to transfer all admin roles to DAO
 * - Grant DAO Proposer and Executor roles over integrated contracts
 * - Transfer Treasury and Minter roles to DAO
 * 
 * Usage:
 *   npx hardhat run scripts/deploy-scrollverse-dao.js --network sepolia
 */

// Configuration constants
const CONFIG = {
  // Voting delay: 1 day in blocks (~7200 blocks on mainnet, ~6 seconds per block)
  VOTING_DELAY: 7200n,
  
  // Voting period: 1 week in blocks (~50400 blocks)
  VOTING_PERIOD: 50400n,
  
  // Proposal threshold: 100,000 MIRROR tokens (with 18 decimals)
  PROPOSAL_THRESHOLD: ethers.parseEther("100000"),
  
  // Quorum percentage: 4% of total voting power
  QUORUM_PERCENTAGE: 4n,
  
  // Timelock delay: 2 days in seconds
  TIMELOCK_DELAY: 2n * 24n * 60n * 60n,
  
  // PFC-NFT Base URI
  PFC_BASE_URI: "ipfs://QmScrollVersePFC/"
};

async function main() {
  console.log("=".repeat(70));
  console.log("ScrollVerse Genesis Sequence - Phase 1, Step 1.6");
  console.log("ScrollVerseDAO Deployment Script");
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

  // Check for existing deployments
  const deploymentsDir = "./deployments";
  const deploymentFile = `${deploymentsDir}/${network.name}-${network.chainId}-scrollverse.json`;
  
  let existingDeployments = {};
  if (fs.existsSync(deploymentFile)) {
    existingDeployments = JSON.parse(fs.readFileSync(deploymentFile));
    console.log("\nExisting deployments found:");
    if (existingDeployments.mirrorToken) console.log("  - MirrorToken:", existingDeployments.mirrorToken);
    if (existingDeployments.pfcNft) console.log("  - PFC-NFT:", existingDeployments.pfcNft);
    if (existingDeployments.timelock) console.log("  - TimelockController:", existingDeployments.timelock);
    if (existingDeployments.dao) console.log("  - ScrollVerseDAO:", existingDeployments.dao);
  }

  console.log("\n" + "-".repeat(70));
  console.log("Step 1: Deploying TimelockController (if not exists)...");
  console.log("-".repeat(70));

  let timelockAddress;
  if (existingDeployments.timelock) {
    timelockAddress = existingDeployments.timelock;
    console.log("Using existing TimelockController:", timelockAddress);
  } else {
    const TimelockController = await ethers.getContractFactory("TimelockController");
    const timelock = await TimelockController.deploy(
      CONFIG.TIMELOCK_DELAY,
      [], // proposers - will be set to DAO after deployment
      [], // executors - will be set to DAO after deployment
      deployer.address // admin - temporary, will be renounced
    );
    await timelock.waitForDeployment();
    timelockAddress = await timelock.getAddress();
    console.log("✅ TimelockController deployed:", timelockAddress);
    existingDeployments.timelock = timelockAddress;
  }

  console.log("\n" + "-".repeat(70));
  console.log("Step 2: Deploying MirrorToken (if not exists)...");
  console.log("-".repeat(70));

  let mirrorTokenAddress;
  if (existingDeployments.mirrorToken) {
    mirrorTokenAddress = existingDeployments.mirrorToken;
    console.log("Using existing MirrorToken:", mirrorTokenAddress);
  } else {
    const MirrorToken = await ethers.getContractFactory("MirrorToken");
    const mirrorToken = await MirrorToken.deploy(deployer.address);
    await mirrorToken.waitForDeployment();
    mirrorTokenAddress = await mirrorToken.getAddress();
    console.log("✅ MirrorToken deployed:", mirrorTokenAddress);
    existingDeployments.mirrorToken = mirrorTokenAddress;
  }

  console.log("\n" + "-".repeat(70));
  console.log("Step 3: Deploying PharaohConsciousnessFusion NFT (if not exists)...");
  console.log("-".repeat(70));

  let pfcNftAddress;
  if (existingDeployments.pfcNft) {
    pfcNftAddress = existingDeployments.pfcNft;
    console.log("Using existing PFC-NFT:", pfcNftAddress);
  } else {
    const PharaohConsciousnessFusion = await ethers.getContractFactory("PharaohConsciousnessFusion");
    const pfcNft = await PharaohConsciousnessFusion.deploy(
      deployer.address,
      deployer.address, // Treasury - will be updated to DAO
      CONFIG.PFC_BASE_URI
    );
    await pfcNft.waitForDeployment();
    pfcNftAddress = await pfcNft.getAddress();
    console.log("✅ PharaohConsciousnessFusion NFT deployed:", pfcNftAddress);
    existingDeployments.pfcNft = pfcNftAddress;
  }

  console.log("\n" + "-".repeat(70));
  console.log("Step 4: Deploying ScrollVerseDAO...");
  console.log("-".repeat(70));

  const ScrollVerseDAO = await ethers.getContractFactory("ScrollVerseDAO");
  const dao = await ScrollVerseDAO.deploy(
    mirrorTokenAddress,
    pfcNftAddress,
    timelockAddress,
    CONFIG.VOTING_DELAY,
    CONFIG.VOTING_PERIOD,
    CONFIG.PROPOSAL_THRESHOLD,
    CONFIG.QUORUM_PERCENTAGE
  );
  await dao.waitForDeployment();
  const daoAddress = await dao.getAddress();
  console.log("✅ ScrollVerseDAO deployed:", daoAddress);
  existingDeployments.dao = daoAddress;

  console.log("\n" + "-".repeat(70));
  console.log("Step 5: Executing HAND-OFF SEQUENCE...");
  console.log("-".repeat(70));

  // Get contract instances
  const timelock = await ethers.getContractAt("TimelockController", timelockAddress);
  const pfcNft = await ethers.getContractAt("PharaohConsciousnessFusion", pfcNftAddress);

  // Get role identifiers
  const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
  const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
  const CANCELLER_ROLE = await timelock.CANCELLER_ROLE();
  const DEFAULT_ADMIN_ROLE = await timelock.DEFAULT_ADMIN_ROLE();

  console.log("\n5.1 Granting DAO roles on TimelockController...");
  
  // Grant Proposer role to DAO
  let tx = await timelock.grantRole(PROPOSER_ROLE, daoAddress);
  await tx.wait();
  console.log("  ✅ Granted PROPOSER_ROLE to DAO");

  // Grant Executor role to DAO (or address(0) for anyone)
  tx = await timelock.grantRole(EXECUTOR_ROLE, daoAddress);
  await tx.wait();
  console.log("  ✅ Granted EXECUTOR_ROLE to DAO");

  // Grant Canceller role to DAO
  tx = await timelock.grantRole(CANCELLER_ROLE, daoAddress);
  await tx.wait();
  console.log("  ✅ Granted CANCELLER_ROLE to DAO");

  console.log("\n5.2 Transferring PFC-NFT admin roles to DAO...");
  tx = await pfcNft.transferToDAO(daoAddress);
  await tx.wait();
  console.log("  ✅ Transferred PFC-NFT admin roles to DAO");

  console.log("\n5.3 Completing DAO hand-off sequence...");
  tx = await dao.completeHandOffSequence();
  await tx.wait();
  console.log("  ✅ Hand-off sequence completed");

  console.log("\n5.4 Renouncing deployer admin role on TimelockController...");
  tx = await timelock.renounceRole(DEFAULT_ADMIN_ROLE, deployer.address);
  await tx.wait();
  console.log("  ✅ Deployer admin role renounced - IRREVERSIBLE DECENTRALIZATION ACHIEVED");

  // Save deployment info
  console.log("\n" + "-".repeat(70));
  console.log("Saving deployment information...");
  console.log("-".repeat(70));

  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      timelock: timelockAddress,
      mirrorToken: mirrorTokenAddress,
      pfcNft: pfcNftAddress,
      dao: daoAddress
    },
    configuration: {
      votingDelay: CONFIG.VOTING_DELAY.toString(),
      votingPeriod: CONFIG.VOTING_PERIOD.toString(),
      proposalThreshold: ethers.formatEther(CONFIG.PROPOSAL_THRESHOLD) + " MIRROR",
      quorumPercentage: CONFIG.QUORUM_PERCENTAGE.toString() + "%",
      timelockDelay: (CONFIG.TIMELOCK_DELAY / 86400n).toString() + " days"
    },
    handOffComplete: true,
    phase: "Phase 1 Complete - Genesis Sequence Finalized"
  };

  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Deployment info saved to: ${deploymentFile}`);

  // Output summary
  console.log("\n" + "=".repeat(70));
  console.log("SCROLLVERSE GENESIS SEQUENCE - PHASE 1 COMPLETE");
  console.log("=".repeat(70));
  console.log(`
Network: ${network.name} (Chain ID: ${network.chainId})

CONTRACT ADDRESSES:
  TimelockController: ${timelockAddress}
  MirrorToken:        ${mirrorTokenAddress}
  PFC-NFT:            ${pfcNftAddress}
  ScrollVerseDAO:     ${daoAddress}

CONFIGURATION:
  Voting Delay:       ${CONFIG.VOTING_DELAY} blocks (~1 day)
  Voting Period:      ${CONFIG.VOTING_PERIOD} blocks (~1 week)
  Proposal Threshold: ${ethers.formatEther(CONFIG.PROPOSAL_THRESHOLD)} MIRROR
  Quorum:             ${CONFIG.QUORUM_PERCENTAGE}% of total voting power
  Timelock Delay:     ${Number(CONFIG.TIMELOCK_DELAY) / 86400} days

HAND-OFF STATUS:
  ✅ DAO has PROPOSER_ROLE on TimelockController
  ✅ DAO has EXECUTOR_ROLE on TimelockController
  ✅ DAO has CANCELLER_ROLE on TimelockController
  ✅ DAO has ADMIN roles on PFC-NFT
  ✅ Deployer admin role renounced
  ✅ Irreversible decentralization achieved

The ScrollVerse ecosystem is now fully decentralized with sovereign governance.
All administrative roles have been transferred to the DAO.

Verify contracts on Etherscan:
  npx hardhat verify --network ${network.name} ${timelockAddress} ${CONFIG.TIMELOCK_DELAY} [] [] ${deployer.address}
  npx hardhat verify --network ${network.name} ${mirrorTokenAddress} ${deployer.address}
  npx hardhat verify --network ${network.name} ${pfcNftAddress} ${deployer.address} ${deployer.address} "${CONFIG.PFC_BASE_URI}"
  npx hardhat verify --network ${network.name} ${daoAddress} ${mirrorTokenAddress} ${pfcNftAddress} ${timelockAddress} ${CONFIG.VOTING_DELAY} ${CONFIG.VOTING_PERIOD} ${CONFIG.PROPOSAL_THRESHOLD} ${CONFIG.QUORUM_PERCENTAGE}
`);

  return {
    timelock: timelockAddress,
    mirrorToken: mirrorTokenAddress,
    pfcNft: pfcNftAddress,
    dao: daoAddress
  };
}

main()
  .then((addresses) => {
    console.log("\nDeployment completed successfully.");
    console.log("ScrollVerse Genesis Sequence Phase 1 - FINALIZED");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nDeployment failed:", error);
    process.exit(1);
  });
