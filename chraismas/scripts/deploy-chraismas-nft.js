const hre = require("hardhat");

/**
 * Deploy ChRaismas NFT Collection
 */
async function main() {
  console.log("🎄 Deploying ChRaismas NFT Collection...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Deploy ChRaismas NFT
  const ChRaismasNFT = await hre.ethers.getContractFactory("ChRaismasNFT");
  const chRaismasNFT = await ChRaismasNFT.deploy(deployer.address);
  
  await chRaismasNFT.waitForDeployment();
  const nftAddress = await chRaismasNFT.getAddress();
  
  console.log("✅ ChRaismas NFT deployed to:", nftAddress);
  console.log("📊 NFT Details:");
  console.log("   - Name:", await chRaismasNFT.name());
  console.log("   - Symbol:", await chRaismasNFT.symbol());
  console.log("   - Max Supply:", await chRaismasNFT.MAX_SUPPLY());
  console.log("   - Minting Enabled:", await chRaismasNFT.mintingEnabled());
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chRaismasNFT: nftAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };
  
  console.log("\n📝 Deployment Info:", JSON.stringify(deploymentInfo, null, 2));
  
  return nftAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
