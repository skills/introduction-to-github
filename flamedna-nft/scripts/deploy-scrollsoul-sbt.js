// Deploy script for ScrollSoulSBT contract
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying ScrollSoulSBT with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy ScrollSoulSBT
  const ScrollSoulSBT = await hre.ethers.getContractFactory("ScrollSoulSBT");
  const scrollSoulSBT = await ScrollSoulSBT.deploy(deployer.address);

  await scrollSoulSBT.waitForDeployment();

  const contractAddress = await scrollSoulSBT.getAddress();
  console.log("ScrollSoulSBT deployed to:", contractAddress);

  // Verify contract on Etherscan (if not localhost)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await scrollSoulSBT.deploymentTransaction().wait(5);

    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [deployer.address],
      });
      console.log("Contract verified on Etherscan!");
    } catch (error) {
      console.log("Verification error:", error.message);
    }
  }

  // Log contract details
  console.log("\n=== ScrollSoulSBT Deployment Summary ===");
  console.log("Contract Address:", contractAddress);
  console.log("Owner:", deployer.address);
  console.log("Network:", hre.network.name);
  console.log("=========================================\n");

  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

module.exports = { main };
