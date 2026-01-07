const { ethers } = require("hardhat");

/**
 * Deployment script for MirrorToken ($MIRROR) - ERC-20 Votes Contract
 * 44:Omni Genesis Sequence Execution
 * Target: Ethereum Sepolia Testnet / Mainnet
 * 
 * This script deploys the MirrorToken contract as part of the ScrollVerse
 * digital ecosystem foundation, establishing the governance, staking, and
 * financial infrastructure.
 * 
 * Token Specifications:
 *   - Total Supply: 1,000,000,000 tokens (1 Billion)
 *   - ERC20Votes: Governance-ready functionality
 *   - ERC20Permit: Gasless approvals support
 *   - ERC20Capped: Fixed supply ceiling
 * 
 * Usage:
 *   npx hardhat run scripts/deployMirrorToken.js --network sepolia
 *   npx hardhat run scripts/deployMirrorToken.js --network mainnet
 */

async function main() {
  console.log("=".repeat(70));
  console.log("  $MIRROR Token Deployment - 44:Omni Genesis Sequence");
  console.log("  ScrollVerse Digital Ecosystem Foundation");
  console.log("=".repeat(70));

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("\n📋 Deployment Configuration:");
  console.log("-".repeat(70));
  console.log("Deployer address:", deployer.address);
  
  // Get balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH");
  
  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "(Chain ID:", network.chainId.toString() + ")");
  
  console.log("\n" + "-".repeat(70));
  console.log("🚀 Deploying MirrorToken ($MIRROR) contract...");
  console.log("-".repeat(70));
  
  // Deploy MirrorToken
  const MirrorToken = await ethers.getContractFactory("MirrorToken");
  const mirrorToken = await MirrorToken.deploy(deployer.address);
  
  await mirrorToken.waitForDeployment();
  const contractAddress = await mirrorToken.getAddress();
  
  console.log("\n✅ MirrorToken deployed successfully!");
  console.log("Contract address:", contractAddress);
  
  // Verify deployment by querying contract state
  console.log("\n" + "-".repeat(70));
  console.log("🔍 Verifying deployment...");
  console.log("-".repeat(70));
  
  const name = await mirrorToken.name();
  const symbol = await mirrorToken.symbol();
  const decimals = await mirrorToken.decimals();
  const cap = await mirrorToken.cap();
  const owner = await mirrorToken.owner();
  const totalSupply = await mirrorToken.totalSupply();
  const initialDistributionDone = await mirrorToken.initialDistributionDone();
  
  console.log("Token name:", name);
  console.log("Token symbol:", symbol);
  console.log("Decimals:", decimals.toString());
  console.log("Maximum supply cap:", ethers.formatEther(cap), symbol);
  console.log("Current total supply:", ethers.formatEther(totalSupply), symbol);
  console.log("Contract owner:", owner);
  console.log("Initial distribution executed:", initialDistributionDone);
  
  // Get allocation amounts
  const [treasuryAmount, fusionAmount, teamAmount, liquidityAmount] = await mirrorToken.getAllocationAmounts();
  
  console.log("\n📊 Token Distribution Allocations:");
  console.log("-".repeat(70));
  console.log("Treasury & DAO (40%):", ethers.formatEther(treasuryAmount), symbol);
  console.log("Consciousness Fusion Rewards (35%):", ethers.formatEther(fusionAmount), symbol);
  console.log("Foundational Team (15%):", ethers.formatEther(teamAmount), symbol);
  console.log("Pilot Launch & Liquidity (10%):", ethers.formatEther(liquidityAmount), symbol);
  
  // Output deployment summary
  console.log("\n" + "=".repeat(70));
  console.log("  DEPLOYMENT SUMMARY - 44:Omni Genesis Sequence");
  console.log("=".repeat(70));
  console.log(`
Network: ${network.name} (Chain ID: ${network.chainId})
Contract: MirrorToken ($MIRROR)
Address: ${contractAddress}
Owner: ${owner}
Block: ${await ethers.provider.getBlockNumber()}
Timestamp: ${new Date().toISOString()}

Token Specifications:
  - Name: ${name}
  - Symbol: ${symbol}
  - Decimals: ${decimals}
  - Max Supply: ${ethers.formatEther(cap)} ${symbol} (1 Billion)
  - Current Supply: ${ethers.formatEther(totalSupply)} ${symbol}
  - Distribution Ready: ${!initialDistributionDone ? "Yes" : "Already Executed"}

Features:
  ✓ ERC20Votes - Governance voting power
  ✓ ERC20Permit - Gasless approvals
  ✓ ERC20Capped - Fixed supply ceiling
  ✓ Ownable - Access control

Next Steps:
  1. Execute initial distribution via executeInitialDistribution()
  2. Verify contract on Etherscan
  3. Configure allocation addresses for distribution

Verify on Etherscan:
  npx hardhat verify --network ${network.name} ${contractAddress} ${deployer.address}

View on Etherscan:
  https://${network.chainId === 11155111n ? "sepolia." : ""}etherscan.io/address/${contractAddress}
`);

  // Save deployment info to file
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    contract: "MirrorToken",
    symbol: "MIRROR",
    address: contractAddress,
    owner: owner,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    constructorArgs: [deployer.address],
    specifications: {
      name: name,
      symbol: symbol,
      decimals: Number(decimals),
      maxSupply: ethers.formatEther(cap),
      features: [
        "ERC20Votes",
        "ERC20Permit", 
        "ERC20Capped",
        "Ownable"
      ]
    },
    allocations: {
      treasuryDAO: {
        percentage: "40%",
        amount: ethers.formatEther(treasuryAmount)
      },
      consciousnessFusionRewards: {
        percentage: "35%",
        amount: ethers.formatEther(fusionAmount)
      },
      foundationalTeam: {
        percentage: "15%",
        amount: ethers.formatEther(teamAmount)
      },
      pilotLaunchLiquidity: {
        percentage: "10%",
        amount: ethers.formatEther(liquidityAmount)
      }
    },
    genesis: {
      sequence: "44:Omni Genesis Sequence",
      ecosystem: "ScrollVerse",
      purpose: "Currency for ScrollVerse digital ecosystem - governance, staking, and financial flows"
    }
  };
  
  const fs = require("fs");
  // Sanitize network name for safe file path usage
  const safeNetworkName = network.name.replace(/[^a-zA-Z0-9-_]/g, '_');
  const deploymentPath = `./deployments/MirrorToken-${safeNetworkName}-${network.chainId}.json`;
  
  // Ensure deployments directory exists
  if (!fs.existsSync("./deployments")) {
    fs.mkdirSync("./deployments", { recursive: true });
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📁 Deployment info saved to: ${deploymentPath}`);
  
  console.log("\n" + "=".repeat(70));
  console.log("  🎉 44:Omni Genesis Sequence - MirrorToken Deployment Complete!");
  console.log("=".repeat(70));
  
  return contractAddress;
}

main()
  .then((address) => {
    console.log("\n✅ Deployment completed successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
