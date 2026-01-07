const { ethers, upgrades } = require("hardhat");

/**
 * Deployment script for PharaohConsciousnessFusion contract (UUPS Proxy)
 * Target: Ethereum Sepolia Testnet
 * 
 * Usage:
 *   npx hardhat run scripts/deploy-pharaoh-consciousness-fusion.js --network sepolia
 * 
 * This script deploys the PharaohConsciousnessFusion NFT contract using the UUPS
 * upgradeable proxy pattern for future enhancement capabilities.
 */

async function main() {
  console.log("=".repeat(70));
  console.log("PharaohConsciousnessFusion Deployment Script (UUPS Proxy)");
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
  
  console.log("\n" + "-".repeat(70));
  console.log("Deployment Configuration");
  console.log("-".repeat(70));

  // Initialization parameters as per specification
  const contractName = "Pharaoh Consciousness Fusion";
  const contractSymbol = "PFC";
  
  // Base Metadata URI - utilizing ScrollVerse ecosystem metadata framework
  // This points to the merged artistic and metadata frameworks
  const baseMetadataURI = "ipfs://scrollverse-pharaoh-consciousness-fusion/";
  
  console.log("Contract Name:", contractName);
  console.log("Contract Symbol:", contractSymbol);
  console.log("Base Metadata URI:", baseMetadataURI);
  console.log("Deployment Pattern: UUPS Proxy (Upgradeability enabled)");
  
  console.log("\n" + "-".repeat(70));
  console.log("Deploying PharaohConsciousnessFusion with UUPS Proxy...");
  console.log("-".repeat(70));
  
  // Get contract factory
  const PharaohConsciousnessFusion = await ethers.getContractFactory("PharaohConsciousnessFusion");
  
  // Deploy with UUPS proxy
  const proxy = await upgrades.deployProxy(
    PharaohConsciousnessFusion,
    [deployer.address, baseMetadataURI],
    { 
      initializer: "initialize",
      kind: "uups"
    }
  );
  
  await proxy.waitForDeployment();
  const proxyAddress = await proxy.getAddress();
  
  // Get implementation address
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  
  console.log("\n✅ PharaohConsciousnessFusion deployed successfully!");
  console.log("Proxy Address:", proxyAddress);
  console.log("Implementation Address:", implementationAddress);
  
  // Verify deployment
  console.log("\n" + "-".repeat(70));
  console.log("Verifying deployment...");
  console.log("-".repeat(70));
  
  const name = await proxy.name();
  const symbol = await proxy.symbol();
  const owner = await proxy.owner();
  const maxSupply = await proxy.MAX_SUPPLY();
  
  console.log("Contract Name:", name);
  console.log("Contract Symbol:", symbol);
  console.log("Contract Owner:", owner);
  console.log("Max Supply:", maxSupply.toString());
  
  // Get supply info
  const supplyInfo = await proxy.getSupplyInfo();
  console.log("\nSupply Information:");
  console.log("  Total Minted:", supplyInfo.totalMinted.toString());
  console.log("  Max Supply:", supplyInfo.maxSupply.toString());
  console.log("  Genesis Sovereign Minted:", supplyInfo.genesisMinted.toString());
  console.log("  Eternal Guardian Minted:", supplyInfo.eternalMinted.toString());
  console.log("  Legacy Bearer Minted:", supplyInfo.legacyMinted.toString());
  console.log("  Wisdom Keeper Minted:", supplyInfo.wisdomMinted.toString());
  
  // Get voting multipliers
  console.log("\nVoting Power Multipliers:");
  console.log("  Genesis Sovereign (Tier 3):", (await proxy.getVotingMultiplier(3)).toString(), "basis points (8.88x)");
  console.log("  Eternal Guardian (Tier 2):", (await proxy.getVotingMultiplier(2)).toString(), "basis points (4.44x)");
  console.log("  Legacy Bearer (Tier 1):", (await proxy.getVotingMultiplier(1)).toString(), "basis points (2.22x)");
  console.log("  Wisdom Keeper (Tier 0):", (await proxy.getVotingMultiplier(0)).toString(), "basis points (1.11x)");
  
  // Output deployment summary
  console.log("\n" + "=".repeat(70));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(70));
  console.log(`
Network: ${network.name} (Chain ID: ${network.chainId})
Contract: PharaohConsciousnessFusion (UUPS Upgradeable)
Proxy Address: ${proxyAddress}
Implementation Address: ${implementationAddress}
Owner: ${owner}
Block: ${await ethers.provider.getBlockNumber()}
Timestamp: ${new Date().toISOString()}

Initialization Parameters:
  - Name: ${name}
  - Symbol: ${symbol}
  - Base Metadata URI: ${baseMetadataURI}

Tier Structure:
  - Genesis Sovereign: 8 max (8.88x voting power)
  - Eternal Guardian: 80 max (4.44x voting power)
  - Legacy Bearer: 800 max (2.22x voting power)
  - Wisdom Keeper: 8000 max (1.11x voting power)
  - Total Max Supply: 8888

Verify Implementation on Etherscan:
npx hardhat verify --network ${network.name} ${implementationAddress}

View on Etherscan:
https://${network.name === 'sepolia' ? 'sepolia.' : ''}etherscan.io/address/${proxyAddress}
`);

  // Save deployment info to file
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    contract: "PharaohConsciousnessFusion",
    proxyAddress: proxyAddress,
    implementationAddress: implementationAddress,
    owner: owner,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    initializationParams: {
      name: name,
      symbol: symbol,
      baseURI: baseMetadataURI
    },
    tierStructure: {
      genesisSovereign: { max: 8, votingMultiplier: "8.88x" },
      eternalGuardian: { max: 80, votingMultiplier: "4.44x" },
      legacyBearer: { max: 800, votingMultiplier: "2.22x" },
      wisdomKeeper: { max: 8000, votingMultiplier: "1.11x" }
    },
    maxSupply: maxSupply.toString(),
    deploymentPattern: "UUPS Proxy"
  };
  
  const fs = require("fs");
  const deploymentPath = `./deployments/pharaoh-consciousness-fusion-${network.name}-${network.chainId}.json`;
  
  // Ensure deployments directory exists
  if (!fs.existsSync("./deployments")) {
    fs.mkdirSync("./deployments", { recursive: true });
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Deployment info saved to: ${deploymentPath}`);
  
  return { proxyAddress, implementationAddress };
}

main()
  .then(({ proxyAddress, implementationAddress }) => {
    console.log("\nDeployment completed successfully.");
    console.log("Proxy:", proxyAddress);
    console.log("Implementation:", implementationAddress);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nDeployment failed:", error);
    process.exit(1);
  });
