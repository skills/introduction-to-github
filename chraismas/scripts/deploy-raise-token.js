const hre = require("hardhat");

/**
 * Deploy RAISE Token for ChRaismas Blueprint
 */
async function main() {
  console.log("🎄 Deploying RAISE Token...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Deploy RAISE Token
  const RAISEToken = await hre.ethers.getContractFactory("RAISEToken");
  const raiseToken = await RAISEToken.deploy(deployer.address);
  
  await raiseToken.waitForDeployment();
  const raiseAddress = await raiseToken.getAddress();
  
  console.log("✅ RAISE Token deployed to:", raiseAddress);
  console.log("📊 Token Details:");
  console.log("   - Name:", await raiseToken.name());
  console.log("   - Symbol:", await raiseToken.symbol());
  console.log("   - Total Supply:", hre.ethers.formatEther(await raiseToken.totalSupply()), "RAISE");
  console.log("   - Charitable Pool:", await raiseToken.charitablePool());
  console.log("   - Reward Rate:", hre.ethers.formatEther(await raiseToken.rewardRate()), "RAISE per kindness point");
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    raiseToken: raiseAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };
  
  console.log("\n📝 Deployment Info:", JSON.stringify(deploymentInfo, null, 2));
  
  return raiseAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
