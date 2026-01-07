const { ethers } = require("hardhat");
const fs = require("fs");

/**
 * Deployment script for MirrorStaking and NFT contracts
 * Deploys: MirrorStaking, PharaohConsciousnessFusion
 * 
 * Prerequisites: MirrorToken must be deployed
 * 
 * Usage:
 *   npx hardhat run scripts/deploy-defi.js --network sepolia
 */

async function main() {
  console.log("=".repeat(70));
  console.log("ScrollVerse DeFi & NFT Deployment Script");
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

  // Check for existing DAO deployment
  const daoDeploymentPath = `./deployments/${network.name}-${network.chainId}-dao.json`;
  let mirrorTokenAddress;
  let daoAddress;
  
  if (fs.existsSync(daoDeploymentPath)) {
    const daoDeployment = JSON.parse(fs.readFileSync(daoDeploymentPath, "utf8"));
    mirrorTokenAddress = daoDeployment.contracts.MirrorToken?.address;
    daoAddress = daoDeployment.contracts.ScrollVerseDAO?.address;
    console.log("\n📋 Found existing DAO deployment:");
    console.log("   MirrorToken:", mirrorTokenAddress);
    console.log("   ScrollVerseDAO:", daoAddress);
  } else {
    console.log("\n⚠️  No DAO deployment found. Using placeholder addresses.");
    console.log("   Run deploy-dao.js first for production deployment.");
    mirrorTokenAddress = deployer.address; // Placeholder
    daoAddress = deployer.address; // Placeholder
  }
  
  const deploymentRecord = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    contracts: {}
  };

  // ============================================
  // 1. Deploy MirrorStaking
  // ============================================
  console.log("\n" + "-".repeat(70));
  console.log("Step 1: Deploying MirrorStaking...");
  console.log("-".repeat(70));
  
  const MirrorStaking = await ethers.getContractFactory("MirrorStaking");
  const staking = await MirrorStaking.deploy(
    mirrorTokenAddress,  // staking token
    mirrorTokenAddress,  // reward token (same as staking)
    deployer.address     // owner
  );
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  
  console.log("✅ MirrorStaking deployed at:", stakingAddress);
  
  deploymentRecord.contracts.MirrorStaking = {
    address: stakingAddress,
    constructorArgs: [mirrorTokenAddress, mirrorTokenAddress, deployer.address],
    deployedAt: new Date().toISOString()
  };

  // ============================================
  // 2. Deploy PharaohConsciousnessFusion NFT
  // ============================================
  console.log("\n" + "-".repeat(70));
  console.log("Step 2: Deploying PharaohConsciousnessFusion NFT...");
  console.log("-".repeat(70));
  
  const baseURI = "ipfs://PLACEHOLDER_PCF_BASE_URI/";
  
  const PharaohConsciousnessFusion = await ethers.getContractFactory("PharaohConsciousnessFusion");
  const nft = await PharaohConsciousnessFusion.deploy(
    deployer.address,  // owner
    baseURI            // base URI
  );
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  
  console.log("✅ PharaohConsciousnessFusion deployed at:", nftAddress);
  console.log("   Base URI:", baseURI);
  
  deploymentRecord.contracts.PharaohConsciousnessFusion = {
    address: nftAddress,
    constructorArgs: [deployer.address, baseURI],
    deployedAt: new Date().toISOString()
  };

  // ============================================
  // 3. Configure NFT Contract
  // ============================================
  console.log("\n" + "-".repeat(70));
  console.log("Step 3: Configuring NFT contract...");
  console.log("-".repeat(70));
  
  // Set staking contract
  let tx = await nft.setStakingContract(stakingAddress);
  await tx.wait();
  console.log("✅ Set staking contract on NFT");
  
  // Set DAO contract
  tx = await nft.setDAOContract(daoAddress);
  await tx.wait();
  console.log("✅ Set DAO contract on NFT");

  // ============================================
  // 4. Configure Staking Contract
  // ============================================
  console.log("\n" + "-".repeat(70));
  console.log("Step 4: Configuring staking contract...");
  console.log("-".repeat(70));
  
  // Set NFT contract for boost
  tx = await staking.setNFTContract(nftAddress);
  await tx.wait();
  console.log("✅ Set NFT contract on staking for boost");

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
  • MirrorStaking:             ${stakingAddress}
  • PharaohConsciousnessFusion: ${nftAddress}

Staking Parameters:
  • Base APY:     8%
  • Lock Bonuses: 25% (30d), 50% (90d), 100% (180d), 200% (365d)
  • NFT Boost:    5% per NFT (max 50%)
  • Min Stake:    1 MIRROR

NFT Parameters:
  • Max Supply:   888
  • Tiers:        Pharaoh (8), Ascended (80), Guardian (200), Initiate (600)
  • Base URI:     ${baseURI}

Configuration:
  • NFT → Staking: ✅ Connected
  • NFT → DAO:     ✅ Connected
  • Staking → NFT: ✅ Connected (for boost)

Next Steps:
  1. Update NFT base URI to actual IPFS CID
  2. Add reward tokens to staking pool
  3. Mint initial NFTs
  4. Enable public minting (if desired)

Verification Commands:
  npx hardhat verify --network ${network.name} ${stakingAddress} ${mirrorTokenAddress} ${mirrorTokenAddress} ${deployer.address}
  npx hardhat verify --network ${network.name} ${nftAddress} ${deployer.address} "${baseURI}"
`);

  // Save deployment record
  const deploymentPath = `./deployments/${network.name}-${network.chainId}-defi.json`;
  
  if (!fs.existsSync("./deployments")) {
    fs.mkdirSync("./deployments", { recursive: true });
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentRecord, null, 2));
  console.log(`Deployment info saved to: ${deploymentPath}`);
  
  return deploymentRecord;
}

main()
  .then(() => {
    console.log("\nDeFi & NFT deployment completed successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nDeployment failed:", error);
    process.exit(1);
  });
