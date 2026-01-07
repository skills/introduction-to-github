const { ethers, upgrades } = require("hardhat");

/**
 * PharaohConsciousnessFusion Deployment Script
 * 
 * Deploys the Consciousness Mirror NFT collection with UUPS proxy
 * 
 * Usage:
 *   npx hardhat run scripts/deploy-pharaoh.js --network <network>
 * 
 * Environment Variables:
 *   - DEPLOYER_PRIVATE_KEY: Private key of deployer wallet
 *   - ROYALTY_RECEIVER: Address to receive royalties (defaults to deployer)
 *   - BASE_URI: IPFS base URI for metadata
 * 
 * @author OmniTech1™
 */

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("=".repeat(60));
  console.log("PharaohConsciousnessFusion Deployment");
  console.log("Consciousness Mirror NFT Collection");
  console.log("=".repeat(60));
  console.log("");
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("");

  // Configuration
  const config = {
    owner: deployer.address,
    baseURI: process.env.BASE_URI || "ipfs://QmConsciousnessMirrorPlaceholder/",
    royaltyReceiver: process.env.ROYALTY_RECEIVER || deployer.address,
    mintPrice: ethers.parseEther("0.08"),      // 0.08 ETH public mint
    allowlistPrice: ethers.parseEther("0.05")  // 0.05 ETH allowlist mint
  };

  console.log("Configuration:");
  console.log("  Owner:", config.owner);
  console.log("  Base URI:", config.baseURI);
  console.log("  Royalty Receiver:", config.royaltyReceiver);
  console.log("  Mint Price:", ethers.formatEther(config.mintPrice), "ETH");
  console.log("  Allowlist Price:", ethers.formatEther(config.allowlistPrice), "ETH");
  console.log("");

  // Deploy with UUPS proxy
  console.log("Deploying PharaohConsciousnessFusion with UUPS proxy...");
  
  const PharaohConsciousnessFusion = await ethers.getContractFactory("PharaohConsciousnessFusion");
  
  const pharaoh = await upgrades.deployProxy(
    PharaohConsciousnessFusion,
    [
      config.owner,
      config.baseURI,
      config.royaltyReceiver,
      config.mintPrice,
      config.allowlistPrice
    ],
    { 
      kind: 'uups',
      initializer: 'initialize'
    }
  );

  await pharaoh.waitForDeployment();
  
  const proxyAddress = await pharaoh.getAddress();
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  const adminAddress = await upgrades.erc1967.getAdminAddress(proxyAddress);

  console.log("");
  console.log("✓ Deployment Successful!");
  console.log("");
  console.log("Contract Addresses:");
  console.log("  Proxy:", proxyAddress);
  console.log("  Implementation:", implementationAddress);
  console.log("  Admin:", adminAddress);
  console.log("");

  // Verify deployment
  console.log("Verifying deployment...");
  
  const name = await pharaoh.name();
  const symbol = await pharaoh.symbol();
  const maxSupply = await pharaoh.MAX_SUPPLY();
  const royaltyFee = await pharaoh.DEFAULT_ROYALTY_FEE();
  
  console.log("  Name:", name);
  console.log("  Symbol:", symbol);
  console.log("  Max Supply:", maxSupply.toString());
  console.log("  Default Royalty:", Number(royaltyFee) / 100, "%");
  console.log("");

  // Output deployment info for verification
  console.log("=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("");
  console.log(`Network: ${(await ethers.provider.getNetwork()).name}`);
  console.log(`Chain ID: ${(await ethers.provider.getNetwork()).chainId}`);
  console.log("");
  console.log("Save these addresses for contract verification:");
  console.log(`  PROXY_ADDRESS=${proxyAddress}`);
  console.log(`  IMPLEMENTATION_ADDRESS=${implementationAddress}`);
  console.log("");
  console.log("Next Steps:");
  console.log("  1. Verify contract on Etherscan:");
  console.log(`     npx hardhat verify --network <network> ${implementationAddress}`);
  console.log("  2. Add addresses to allowlist:");
  console.log("     await pharaoh.addToAllowlist([addresses])");
  console.log("  3. Enable mint phases:");
  console.log("     await pharaoh.setMintPhases(true, false) // Allowlist only");
  console.log("     await pharaoh.setMintPhases(false, true) // Public only");
  console.log("     await pharaoh.setMintPhases(true, true)  // Both active");
  console.log("");
  console.log("=".repeat(60));
  
  return {
    proxy: proxyAddress,
    implementation: implementationAddress,
    admin: adminAddress
  };
}

main()
  .then((addresses) => {
    console.log("Deployment complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
