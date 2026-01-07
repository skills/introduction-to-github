const hre = require("hardhat");

/**
 * Deploy Hollywood DAO
 * Requires ChRaismas NFT to be deployed first
 */
async function main() {
  console.log("🎬 Deploying Hollywood DAO...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Get ChRaismas NFT address (replace with actual address or pass as argument)
  const chRaismasNFTAddress = process.env.CHRAISMAS_NFT_ADDRESS;
  
  if (!chRaismasNFTAddress) {
    console.error("❌ Error: CHRAISMAS_NFT_ADDRESS environment variable not set");
    console.log("Please deploy ChRaismas NFT first and set the address:");
    console.log("export CHRAISMAS_NFT_ADDRESS=<address>");
    throw new Error("CHRAISMAS_NFT_ADDRESS not set");
  }
  
  console.log("Using ChRaismas NFT at:", chRaismasNFTAddress);
  
  // Deploy Hollywood DAO
  const HollywoodDAO = await hre.ethers.getContractFactory("HollywoodDAO");
  const hollywoodDAO = await HollywoodDAO.deploy(deployer.address, chRaismasNFTAddress);
  
  await hollywoodDAO.waitForDeployment();
  const daoAddress = await hollywoodDAO.getAddress();
  
  console.log("✅ Hollywood DAO deployed to:", daoAddress);
  console.log("📊 DAO Details:");
  console.log("   - ChRaismas NFT:", await hollywoodDAO.chRaismasNFT());
  console.log("   - Voting Period:", await hollywoodDAO.votingPeriod(), "seconds");
  console.log("   - Quorum Percentage:", await hollywoodDAO.quorumPercentage(), "%");
  console.log("   - Royalty Pool:", hre.ethers.formatEther(await hollywoodDAO.royaltyPool()), "ETH");
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    hollywoodDAO: daoAddress,
    chRaismasNFT: chRaismasNFTAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };
  
  console.log("\n📝 Deployment Info:", JSON.stringify(deploymentInfo, null, 2));
  
  return daoAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
