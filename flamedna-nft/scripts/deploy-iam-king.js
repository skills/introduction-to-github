// Deploy script for IamKingNFT contract on Polygon zkEVM
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying IamKingNFT with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Base URI for metadata (update for production)
  const baseURI = "https://api.scrollverse.io/iam-king/metadata/";

  // Deploy IamKingNFT
  const IamKingNFT = await hre.ethers.getContractFactory("IamKingNFT");
  const iamKingNFT = await IamKingNFT.deploy(deployer.address, baseURI);

  await iamKingNFT.waitForDeployment();

  const contractAddress = await iamKingNFT.getAddress();
  console.log("IamKingNFT deployed to:", contractAddress);

  // Verify contract on block explorer (if not localhost)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await iamKingNFT.deploymentTransaction().wait(5);

    console.log("Verifying contract on block explorer...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [deployer.address, baseURI],
      });
      console.log("Contract verified!");
    } catch (error) {
      console.log("Verification error:", error.message);
    }
  }

  // Log contract details
  console.log("\n=== IamKingNFT Deployment Summary ===");
  console.log("Contract Address:", contractAddress);
  console.log("Owner:", deployer.address);
  console.log("Network:", hre.network.name);
  console.log("Base URI:", baseURI);
  console.log("\nTier Pricing:");
  console.log("  Baron:   50 POL (2000 max)");
  console.log("  Duke:    100 POL (1500 max)");
  console.log("  Prince:  250 POL (1000 max)");
  console.log("  King:    500 POL (400 max)");
  console.log("  Emperor: 1000 POL (100 max)");
  console.log("Total Supply: 5000");
  console.log("=======================================\n");

  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

module.exports = { main };
