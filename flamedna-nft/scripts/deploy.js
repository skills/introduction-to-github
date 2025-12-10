const hre = require("hardhat");

async function main() {
  console.log("🔥 Deploying FlameDNA NFT Contract...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Contract parameters
  const baseURI = process.env.BASE_URI || "ipfs://QmScrollVerseFlameDNA/";

  // Deploy contract
  const FlameDNA = await hre.ethers.getContractFactory("FlameDNA");
  const flameDNA = await FlameDNA.deploy(deployer.address, baseURI);

  await flameDNA.waitForDeployment();

  const contractAddress = await flameDNA.getAddress();

  console.log("✅ FlameDNA deployed successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Base URI:", baseURI);
  console.log("Max Supply:", (await flameDNA.MAX_SUPPLY()).toString());
  console.log("Mint Price:", hre.ethers.formatEther(await flameDNA.mintPrice()), "ETH");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Verification instructions
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("📋 To verify on Etherscan, run:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${contractAddress} "${deployer.address}" "${baseURI}"`);
  }

  // Return deployment info for integration
  return {
    address: contractAddress,
    deployer: deployer.address,
    network: hre.network.name,
    baseURI: baseURI
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
