const hre = require("hardhat");

async function main() {
  console.log("🦸 Deploying Superhero Sovereign Ecosystem Contracts...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  console.log();

  // Define distribution addresses (replace with actual addresses in production)
  const addresses = {
    communityTreasury: "0x1234567890123456789012345678901234567890", // Replace
    teamAddress: "0x2345678901234567890123456789012345678901", // Replace
    talentPool: "0x3456789012345678901234567890123456789012", // Replace
    publicSaleAddress: "0x4567890123456789012345678901234567890123", // Replace
    industryPartners: "0x5678901234567890123456789012345678901234", // Replace
    liquidityPool: "0x6789012345678901234567890123456789012345", // Replace
    reserveFund: "0x7890123456789012345678901234567890123456" // Replace
  };

  // ============================================
  // 1. Deploy SuperSovereignToken (ERC-20)
  // ============================================
  console.log("1️⃣  Deploying SuperSovereignToken...");
  const SuperSovereignToken = await ethers.getContractFactory("SuperSovereignToken");
  const token = await SuperSovereignToken.deploy(
    addresses.communityTreasury,
    addresses.teamAddress,
    addresses.talentPool,
    addresses.publicSaleAddress,
    addresses.industryPartners,
    addresses.liquidityPool,
    addresses.reserveFund
  );
  await token.deployed();
  console.log("✅ SuperSovereignToken deployed to:", token.address);
  console.log("   Total Supply:", ethers.utils.formatEther(await token.totalSupply()), "$SUPER_SOVEREIGN");
  console.log();

  // ============================================
  // 2. Deploy SuperheroSovereignNFT (ERC-721)
  // ============================================
  console.log("2️⃣  Deploying SuperheroSovereignNFT...");
  const baseURI = "ipfs://QmSuperHeroSovereignNFT/"; // Replace with actual IPFS URI
  const SuperheroSovereignNFT = await ethers.getContractFactory("SuperheroSovereignNFT");
  const nft = await SuperheroSovereignNFT.deploy(baseURI);
  await nft.deployed();
  console.log("✅ SuperheroSovereignNFT deployed to:", nft.address);
  console.log("   Max Supply:", (await nft.MAX_SUPPLY()).toString(), "NFTs");
  console.log("   Current Mint Price:", ethers.utils.formatEther(await nft.getCurrentMintPrice()), "ETH");
  console.log();

  // ============================================
  // 3. Deploy CreatorInvitationNFT (ERC-721)
  // ============================================
  console.log("3️⃣  Deploying CreatorInvitationNFT...");
  const creatorBaseURI = "ipfs://QmCreatorInvitationNFT/"; // Replace with actual IPFS URI
  const CreatorInvitationNFT = await ethers.getContractFactory("CreatorInvitationNFT");
  const creatorNFT = await CreatorInvitationNFT.deploy(creatorBaseURI);
  await creatorNFT.deployed();
  console.log("✅ CreatorInvitationNFT deployed to:", creatorNFT.address);
  console.log("   Max Directors:", (await creatorNFT.MAX_DIRECTORS()).toString());
  console.log("   Max Actors:", (await creatorNFT.MAX_ACTORS()).toString());
  console.log("   Max Writers:", (await creatorNFT.MAX_WRITERS()).toString());
  console.log();

  // ============================================
  // Deployment Summary
  // ============================================
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log();
  console.log("📋 Contract Addresses:");
  console.log("   SuperSovereignToken:", token.address);
  console.log("   SuperheroSovereignNFT:", nft.address);
  console.log("   CreatorInvitationNFT:", creatorNFT.address);
  console.log();
  console.log("🔗 Next Steps:");
  console.log("   1. Verify contracts on Etherscan");
  console.log("   2. Update frontend with contract addresses");
  console.log("   3. Configure IPFS metadata");
  console.log("   4. Set up liquidity pools");
  console.log("   5. Begin token distribution");
  console.log();
  console.log("📝 Verification Commands:");
  console.log(`   npx hardhat verify --network ${network.name} ${token.address} "${addresses.communityTreasury}" "${addresses.teamAddress}" "${addresses.talentPool}" "${addresses.publicSaleAddress}" "${addresses.industryPartners}" "${addresses.liquidityPool}" "${addresses.reserveFund}"`);
  console.log(`   npx hardhat verify --network ${network.name} ${nft.address} "${baseURI}"`);
  console.log(`   npx hardhat verify --network ${network.name} ${creatorNFT.address} "${creatorBaseURI}"`);
  console.log();

  // Save deployment info to file
  const fs = require('fs');
  const deploymentInfo = {
    network: network.name,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      SuperSovereignToken: token.address,
      SuperheroSovereignNFT: nft.address,
      CreatorInvitationNFT: creatorNFT.address
    },
    addresses: addresses,
    baseURIs: {
      nft: baseURI,
      creatorNFT: creatorBaseURI
    }
  };

  const deploymentPath = `./deployments/superhero-sovereign-${network.name}-${Date.now()}.json`;
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`💾 Deployment info saved to: ${deploymentPath}`);
  console.log();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
