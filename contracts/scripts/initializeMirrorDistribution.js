const { ethers } = require("hardhat");

/**
 * Initialize MirrorToken Distribution - 44:Omni Genesis Sequence
 * 
 * This script executes the initial token distribution for the $MIRROR token,
 * minting the full supply and distributing to allocation addresses.
 * 
 * For initial deployment with a temporary holding address strategy:
 *   Set all allocation addresses to the same temporary holding address,
 *   then later transfer to final destinations.
 * 
 * Usage:
 *   npx hardhat run scripts/initializeMirrorDistribution.js --network sepolia
 *   npx hardhat run scripts/initializeMirrorDistribution.js --network mainnet
 * 
 * Required Environment Variables:
 *   MIRROR_TOKEN_ADDRESS - Deployed MirrorToken contract address
 *   TREASURY_ADDRESS - Treasury & DAO wallet address (40%)
 *   FUSION_REWARDS_ADDRESS - Consciousness Fusion Rewards pool (35%)
 *   TEAM_VESTING_ADDRESS - Team vesting contract address (15%)
 *   LIQUIDITY_ADDRESS - Pilot Launch & Liquidity pool (10%)
 * 
 * Alternative (Temporary Holding Mode):
 *   TEMPORARY_HOLDING_ADDRESS - Single address to receive all tokens initially
 */

async function main() {
  console.log("=".repeat(70));
  console.log("  $MIRROR Token Distribution - 44:Omni Genesis Sequence");
  console.log("  ScrollVerse Economic System Initialization");
  console.log("=".repeat(70));

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("\n📋 Configuration:");
  console.log("-".repeat(70));
  console.log("Executor address:", deployer.address);
  
  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "(Chain ID:", network.chainId.toString() + ")");

  // Get MirrorToken contract address
  const mirrorTokenAddress = process.env.MIRROR_TOKEN_ADDRESS;
  if (!mirrorTokenAddress) {
    console.error("\n❌ Error: MIRROR_TOKEN_ADDRESS environment variable not set");
    console.log("Please set the address of the deployed MirrorToken contract");
    process.exit(1);
  }

  console.log("MirrorToken address:", mirrorTokenAddress);

  // Connect to MirrorToken contract
  const MirrorToken = await ethers.getContractFactory("MirrorToken");
  const mirrorToken = MirrorToken.attach(mirrorTokenAddress);

  // Verify connection
  const owner = await mirrorToken.owner();
  const name = await mirrorToken.name();
  const symbol = await mirrorToken.symbol();
  const initialDistributionDone = await mirrorToken.initialDistributionDone();

  console.log("\n🔍 Contract Status:");
  console.log("-".repeat(70));
  console.log("Token:", name, `(${symbol})`);
  console.log("Contract owner:", owner);
  console.log("Distribution already executed:", initialDistributionDone);

  if (initialDistributionDone) {
    console.error("\n⚠️  Initial distribution has already been executed!");
    console.log("The token supply has been minted and distributed.");
    
    const totalSupply = await mirrorToken.totalSupply();
    console.log("Current total supply:", ethers.formatEther(totalSupply), symbol);
    
    const [treasury, fusion, vesting, liquidity] = await mirrorToken.getAllocationAddresses();
    console.log("\nAllocation Addresses:");
    console.log("  Treasury & DAO:", treasury);
    console.log("  Fusion Rewards:", fusion);
    console.log("  Team Vesting:", vesting);
    console.log("  Liquidity:", liquidity);
    
    process.exit(0);
  }

  // Check if caller is the owner
  if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
    console.error("\n❌ Error: Only the contract owner can execute distribution");
    console.log("Owner:", owner);
    console.log("Current address:", deployer.address);
    process.exit(1);
  }

  // Get allocation addresses
  let treasuryAddress, fusionRewardsAddress, teamVestingAddress, liquidityAddress;

  // Check for temporary holding mode (single address for all allocations)
  const temporaryHoldingAddress = process.env.TEMPORARY_HOLDING_ADDRESS;
  
  if (temporaryHoldingAddress) {
    console.log("\n📦 Temporary Holding Mode Enabled");
    console.log("All tokens will be minted to:", temporaryHoldingAddress);
    console.log("\nThis allows for controlled distribution at a later time.");
    
    treasuryAddress = temporaryHoldingAddress;
    fusionRewardsAddress = temporaryHoldingAddress;
    teamVestingAddress = temporaryHoldingAddress;
    liquidityAddress = temporaryHoldingAddress;
  } else {
    // Standard multi-address distribution
    treasuryAddress = process.env.TREASURY_ADDRESS;
    fusionRewardsAddress = process.env.FUSION_REWARDS_ADDRESS;
    teamVestingAddress = process.env.TEAM_VESTING_ADDRESS;
    liquidityAddress = process.env.LIQUIDITY_ADDRESS;

    // Validate addresses
    if (!treasuryAddress || !fusionRewardsAddress || !teamVestingAddress || !liquidityAddress) {
      console.error("\n❌ Error: Missing allocation addresses");
      console.log("\nRequired environment variables:");
      console.log("  TREASURY_ADDRESS:", treasuryAddress || "(not set)");
      console.log("  FUSION_REWARDS_ADDRESS:", fusionRewardsAddress || "(not set)");
      console.log("  TEAM_VESTING_ADDRESS:", teamVestingAddress || "(not set)");
      console.log("  LIQUIDITY_ADDRESS:", liquidityAddress || "(not set)");
      console.log("\nAlternatively, set TEMPORARY_HOLDING_ADDRESS for single-address mode");
      process.exit(1);
    }
  }

  // Display distribution plan
  const [treasuryAmount, fusionAmount, teamAmount, liquidityAmount] = await mirrorToken.getAllocationAmounts();
  
  console.log("\n📊 Distribution Plan:");
  console.log("-".repeat(70));
  console.log(`Treasury & DAO (40%): ${ethers.formatEther(treasuryAmount)} ${symbol}`);
  console.log(`  → ${treasuryAddress}`);
  console.log(`Consciousness Fusion Rewards (35%): ${ethers.formatEther(fusionAmount)} ${symbol}`);
  console.log(`  → ${fusionRewardsAddress}`);
  console.log(`Foundational Team (15%): ${ethers.formatEther(teamAmount)} ${symbol}`);
  console.log(`  → ${teamVestingAddress}`);
  console.log(`Pilot Launch & Liquidity (10%): ${ethers.formatEther(liquidityAmount)} ${symbol}`);
  console.log(`  → ${liquidityAddress}`);
  
  const cap = await mirrorToken.cap();
  console.log(`\nTotal: ${ethers.formatEther(cap)} ${symbol} (1 Billion)`);

  // Confirm execution
  console.log("\n" + "=".repeat(70));
  console.log("🚀 Executing Initial Distribution...");
  console.log("=".repeat(70));

  try {
    const tx = await mirrorToken.executeInitialDistribution(
      treasuryAddress,
      fusionRewardsAddress,
      teamVestingAddress,
      liquidityAddress
    );

    console.log("\nTransaction submitted:", tx.hash);
    console.log("Waiting for confirmation...");

    const receipt = await tx.wait();
    
    console.log("\n✅ Distribution executed successfully!");
    console.log("Transaction hash:", receipt.hash);
    console.log("Block number:", receipt.blockNumber);
    console.log("Gas used:", receipt.gasUsed.toString());

    // Verify distribution
    console.log("\n" + "-".repeat(70));
    console.log("🔍 Verifying distribution...");
    console.log("-".repeat(70));

    const totalSupply = await mirrorToken.totalSupply();
    console.log("Total supply minted:", ethers.formatEther(totalSupply), symbol);

    const treasuryBalance = await mirrorToken.balanceOf(treasuryAddress);
    const fusionBalance = await mirrorToken.balanceOf(fusionRewardsAddress);
    const teamBalance = await mirrorToken.balanceOf(teamVestingAddress);
    const liquidityBalance = await mirrorToken.balanceOf(liquidityAddress);

    console.log("\nBalances:");
    console.log(`  Treasury: ${ethers.formatEther(treasuryBalance)} ${symbol}`);
    console.log(`  Fusion Rewards: ${ethers.formatEther(fusionBalance)} ${symbol}`);
    console.log(`  Team Vesting: ${ethers.formatEther(teamBalance)} ${symbol}`);
    console.log(`  Liquidity: ${ethers.formatEther(liquidityBalance)} ${symbol}`);

    const isSupplyCapped = await mirrorToken.isSupplyCapped();
    console.log("\nSupply capped:", isSupplyCapped);

    // Save distribution info
    const fs = require("fs");
    const distributionInfo = {
      network: network.name,
      chainId: network.chainId.toString(),
      mirrorTokenAddress: mirrorTokenAddress,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      timestamp: new Date().toISOString(),
      executor: deployer.address,
      mode: temporaryHoldingAddress ? "temporary_holding" : "multi_address",
      allocations: {
        treasury: {
          address: treasuryAddress,
          amount: ethers.formatEther(treasuryBalance),
          percentage: "40%"
        },
        fusionRewards: {
          address: fusionRewardsAddress,
          amount: ethers.formatEther(fusionBalance),
          percentage: "35%"
        },
        teamVesting: {
          address: teamVestingAddress,
          amount: ethers.formatEther(teamBalance),
          percentage: "15%"
        },
        liquidity: {
          address: liquidityAddress,
          amount: ethers.formatEther(liquidityBalance),
          percentage: "10%"
        }
      },
      totalSupply: ethers.formatEther(totalSupply),
      genesis: {
        sequence: "44:Omni Genesis Sequence",
        ecosystem: "ScrollVerse",
        status: "COMPLETE"
      }
    };

    // Sanitize network name for safe file path usage
    const safeNetworkName = network.name.replace(/[^a-zA-Z0-9-_]/g, '_');
    const distributionPath = `./deployments/MirrorToken-Distribution-${safeNetworkName}-${network.chainId}.json`;
    
    if (!fs.existsSync("./deployments")) {
      fs.mkdirSync("./deployments", { recursive: true });
    }
    
    fs.writeFileSync(distributionPath, JSON.stringify(distributionInfo, null, 2));
    console.log(`\n📁 Distribution info saved to: ${distributionPath}`);

    console.log("\n" + "=".repeat(70));
    console.log("  🎉 44:Omni Genesis Sequence - Distribution Complete!");
    console.log("  $MIRROR Token is now the bedrock of ScrollVerse's economic system.");
    console.log("=".repeat(70));

  } catch (error) {
    console.error("\n❌ Distribution failed:", error.message);
    throw error;
  }
}

main()
  .then(() => {
    console.log("\n✅ Process completed successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Process failed:", error);
    process.exit(1);
  });
