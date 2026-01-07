const { ethers } = require("hardhat");

/**
 * Token Transfer Script for MirrorTokenVesting
 * Part B: Transfer 150,000,000 $MIRROR tokens to the vesting contract
 * 
 * OmniTech1™ - ScrollVerse Ecosystem
 * 
 * Usage:
 *   export MIRROR_TOKEN_ADDRESS=0x...
 *   export VESTING_CONTRACT_ADDRESS=0x...
 *   npx hardhat run scripts/transfer-to-vesting.js --network sepolia
 */

// Total team allocation: 150,000,000 MIRROR tokens
const TOTAL_TEAM_ALLOCATION = ethers.parseEther("150000000");

async function main() {
  console.log("=".repeat(70));
  console.log("Token Transfer Script - Part B");
  console.log("Transfer 150M $MIRROR Tokens to Vesting Contract");
  console.log("=".repeat(70));
  console.log();
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Sender address:", deployer.address);
  
  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "(Chain ID:", network.chainId.toString() + ")");
  console.log();
  
  // ==========================================================================
  // CONFIGURATION CHECK
  // ==========================================================================
  
  const mirrorTokenAddress = process.env.MIRROR_TOKEN_ADDRESS;
  const vestingContractAddress = process.env.VESTING_CONTRACT_ADDRESS;
  
  if (!mirrorTokenAddress) {
    console.error("❌ MIRROR_TOKEN_ADDRESS not set in environment variables.");
    console.log("   Set it with: export MIRROR_TOKEN_ADDRESS=0x...");
    process.exit(1);
  }
  
  if (!vestingContractAddress) {
    console.error("❌ VESTING_CONTRACT_ADDRESS not set in environment variables.");
    console.log("   Set it with: export VESTING_CONTRACT_ADDRESS=0x...");
    console.log("   (This should be the address from deploy-vesting.js output)");
    process.exit(1);
  }
  
  console.log("MIRROR Token Address:", mirrorTokenAddress);
  console.log("Vesting Contract Address:", vestingContractAddress);
  console.log("Amount to Transfer:", ethers.formatEther(TOTAL_TEAM_ALLOCATION), "MIRROR");
  console.log();
  
  // ==========================================================================
  // CONNECT TO CONTRACTS
  // ==========================================================================
  
  console.log("-".repeat(70));
  console.log("Connecting to contracts...");
  console.log("-".repeat(70));
  
  // Connect to MIRROR token
  const mirrorToken = await ethers.getContractAt("MirrorToken", mirrorTokenAddress);
  console.log("✅ Connected to MIRROR token");
  
  // Connect to vesting contract
  const vestingContract = await ethers.getContractAt("MirrorTokenVesting", vestingContractAddress);
  console.log("✅ Connected to vesting contract");
  console.log();
  
  // ==========================================================================
  // PRE-TRANSFER CHECKS
  // ==========================================================================
  
  console.log("-".repeat(70));
  console.log("Pre-transfer checks...");
  console.log("-".repeat(70));
  
  // Check sender's token balance
  const senderBalance = await mirrorToken.balanceOf(deployer.address);
  console.log(`Sender MIRROR balance: ${ethers.formatEther(senderBalance)} MIRROR`);
  
  if (senderBalance < TOTAL_TEAM_ALLOCATION) {
    console.error(`❌ Insufficient balance! Need ${ethers.formatEther(TOTAL_TEAM_ALLOCATION)} MIRROR`);
    console.log("   Make sure you have the required tokens in your wallet");
    process.exit(1);
  }
  console.log("✅ Sufficient balance for transfer");
  
  // Check vesting contract is finalized
  const isFinalized = await vestingContract.isFinalized();
  console.log(`Vesting contract finalized: ${isFinalized}`);
  if (!isFinalized) {
    console.warn("⚠️  Warning: Vesting contract is not yet finalized");
    console.log("   Consider finalizing beneficiaries before transferring tokens");
  }
  
  // Check current vesting contract balance
  const vestingBalance = await vestingContract.getContractBalance();
  console.log(`Current vesting contract balance: ${ethers.formatEther(vestingBalance)} MIRROR`);
  
  // Check total allocated in vesting contract
  const totalAllocated = await vestingContract.totalAllocated();
  console.log(`Total allocated to beneficiaries: ${ethers.formatEther(totalAllocated)} MIRROR`);
  
  if (vestingBalance >= TOTAL_TEAM_ALLOCATION) {
    console.log("\n⚠️  Vesting contract already has sufficient tokens.");
    console.log("   Skipping transfer...");
    process.exit(0);
  }
  
  console.log();
  
  // ==========================================================================
  // EXECUTE TRANSFER
  // ==========================================================================
  
  console.log("-".repeat(70));
  console.log("Executing token transfer...");
  console.log("-".repeat(70));
  
  console.log(`Transferring ${ethers.formatEther(TOTAL_TEAM_ALLOCATION)} MIRROR tokens...`);
  console.log(`From: ${deployer.address}`);
  console.log(`To:   ${vestingContractAddress}`);
  console.log();
  
  // Execute the transfer
  const tx = await mirrorToken.transfer(vestingContractAddress, TOTAL_TEAM_ALLOCATION);
  console.log(`Transaction submitted: ${tx.hash}`);
  console.log("Waiting for confirmation...");
  
  const receipt = await tx.wait();
  console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
  console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
  console.log();
  
  // ==========================================================================
  // POST-TRANSFER VERIFICATION
  // ==========================================================================
  
  console.log("-".repeat(70));
  console.log("Post-transfer verification...");
  console.log("-".repeat(70));
  
  // Verify new balances
  const newSenderBalance = await mirrorToken.balanceOf(deployer.address);
  const newVestingBalance = await vestingContract.getContractBalance();
  
  console.log(`Sender new balance: ${ethers.formatEther(newSenderBalance)} MIRROR`);
  console.log(`Vesting contract balance: ${ethers.formatEther(newVestingBalance)} MIRROR`);
  
  if (newVestingBalance >= TOTAL_TEAM_ALLOCATION) {
    console.log("\n✅ Transfer verified successfully!");
  } else {
    console.log("\n⚠️  Warning: Vesting contract balance is less than expected");
  }
  
  // ==========================================================================
  // FINAL SUMMARY
  // ==========================================================================
  
  const cliffEnd = await vestingContract.getCliffEnd();
  const vestingEnd = await vestingContract.getVestingEnd();
  const status = await vestingContract.getVestingScheduleStatus();
  
  console.log();
  console.log("=".repeat(70));
  console.log("TRANSFER COMPLETE - VESTING SETUP FINALIZED");
  console.log("=".repeat(70));
  console.log(`
Network: ${network.name} (Chain ID: ${network.chainId})

Token Transfer Details:
- Token: MIRROR (${mirrorTokenAddress})
- Amount: ${ethers.formatEther(TOTAL_TEAM_ALLOCATION)} MIRROR
- From: ${deployer.address}
- To: ${vestingContractAddress}
- Transaction: ${tx.hash}

Vesting Contract Status:
- Contract Balance: ${ethers.formatEther(newVestingBalance)} MIRROR
- Total Allocated: ${ethers.formatEther(totalAllocated)} MIRROR
- Beneficiary Count: ${await vestingContract.getBeneficiaryCount()}
- Is Finalized: ${isFinalized}

Vesting Schedule:
- Cliff End: ${new Date(Number(cliffEnd) * 1000).toISOString()}
- Vesting End: ${new Date(Number(vestingEnd) * 1000).toISOString()}
- Is Cliff Reached: ${status.isCliffReached}
- Is Vesting Complete: ${status.isVestingComplete}
- Time Until Cliff: ${status.timeUntilCliff.toString()} seconds
- Percentage Vested: ${status.percentageVested.toString()}%

📋 The team token vesting is now ACTIVE!
   Tokens are locked for 1 year (cliff period).
   After the cliff, tokens vest linearly over 2 years.
   Beneficiaries can claim vested tokens at any time after the cliff.
`);
  
  // Save transfer info to file
  const fs = require("fs");
  const transferInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    mirrorToken: mirrorTokenAddress,
    vestingContract: vestingContractAddress,
    amount: ethers.formatEther(TOTAL_TEAM_ALLOCATION),
    from: deployer.address,
    transactionHash: tx.hash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed.toString(),
    vestingBalance: ethers.formatEther(newVestingBalance),
    totalAllocated: ethers.formatEther(totalAllocated),
    isFinalized: isFinalized,
    cliffEnd: cliffEnd.toString(),
    vestingEnd: vestingEnd.toString(),
    timestamp: new Date().toISOString()
  };
  
  const transferPath = `./deployments/transfer-${network.name}-${network.chainId}.json`;
  
  // Ensure deployments directory exists
  if (!fs.existsSync("./deployments")) {
    fs.mkdirSync("./deployments", { recursive: true });
  }
  
  fs.writeFileSync(transferPath, JSON.stringify(transferInfo, null, 2));
  console.log(`Transfer info saved to: ${transferPath}`);
  
  return tx.hash;
}

main()
  .then((txHash) => {
    console.log("\n✅ Token transfer completed successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Transfer failed:", error);
    process.exit(1);
  });
