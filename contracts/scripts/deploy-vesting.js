const { ethers } = require("hardhat");

/**
 * Deployment script for MirrorTokenVesting contract
 * Part A: Deploy the vesting contract and configure beneficiaries
 * 
 * OmniTech1™ - ScrollVerse Ecosystem
 * 
 * Usage:
 *   npx hardhat run scripts/deploy-vesting.js --network sepolia
 */

// =============================================================================
// CONFIGURATION - Update these values before deployment
// =============================================================================

// Example team beneficiary wallet addresses and allocations
// IMPORTANT: Update these addresses with actual team wallet addresses before mainnet deployment
const TEAM_BENEFICIARIES = [
  {
    name: "Team Member 1",
    address: "0x0000000000000000000000000000000000000001", // Replace with actual address
    allocation: ethers.parseEther("50000000"), // 50M tokens
  },
  {
    name: "Team Member 2",
    address: "0x0000000000000000000000000000000000000002", // Replace with actual address
    allocation: ethers.parseEther("40000000"), // 40M tokens
  },
  {
    name: "Team Member 3",
    address: "0x0000000000000000000000000000000000000003", // Replace with actual address
    allocation: ethers.parseEther("30000000"), // 30M tokens
  },
  {
    name: "Team Member 4",
    address: "0x0000000000000000000000000000000000000004", // Replace with actual address
    allocation: ethers.parseEther("20000000"), // 20M tokens
  },
  {
    name: "Team Member 5",
    address: "0x0000000000000000000000000000000000000005", // Replace with actual address
    allocation: ethers.parseEther("10000000"), // 10M tokens
  },
];

// Total should equal 150,000,000 tokens
const TOTAL_TEAM_ALLOCATION = ethers.parseEther("150000000");

// =============================================================================
// DEPLOYMENT FUNCTIONS
// =============================================================================

async function validateConfiguration() {
  console.log("Validating configuration...\n");
  
  // Calculate total from beneficiaries
  let totalFromBeneficiaries = 0n;
  for (const beneficiary of TEAM_BENEFICIARIES) {
    totalFromBeneficiaries += beneficiary.allocation;
  }
  
  console.log("Team Beneficiaries:");
  for (const beneficiary of TEAM_BENEFICIARIES) {
    console.log(`  ${beneficiary.name}: ${ethers.formatEther(beneficiary.allocation)} MIRROR`);
  }
  console.log(`\nTotal Allocation: ${ethers.formatEther(totalFromBeneficiaries)} MIRROR`);
  console.log(`Expected Total:   ${ethers.formatEther(TOTAL_TEAM_ALLOCATION)} MIRROR`);
  
  if (totalFromBeneficiaries !== TOTAL_TEAM_ALLOCATION) {
    throw new Error(
      `Allocation mismatch! Sum of beneficiary allocations (${ethers.formatEther(totalFromBeneficiaries)}) ` +
      `does not equal expected total (${ethers.formatEther(TOTAL_TEAM_ALLOCATION)})`
    );
  }
  
  console.log("✅ Configuration validated successfully\n");
}

async function deployVestingContract(mirrorTokenAddress, deployer) {
  console.log("Deploying MirrorTokenVesting contract...");
  
  const MirrorTokenVesting = await ethers.getContractFactory("MirrorTokenVesting");
  const vestingContract = await MirrorTokenVesting.deploy(
    mirrorTokenAddress,
    deployer.address
  );
  
  await vestingContract.waitForDeployment();
  const vestingAddress = await vestingContract.getAddress();
  
  console.log(`✅ MirrorTokenVesting deployed at: ${vestingAddress}\n`);
  
  return vestingContract;
}

async function addBeneficiaries(vestingContract) {
  console.log("Adding beneficiaries to vesting contract...\n");
  
  for (const beneficiary of TEAM_BENEFICIARIES) {
    console.log(`  Adding ${beneficiary.name} (${beneficiary.address})...`);
    console.log(`    Allocation: ${ethers.formatEther(beneficiary.allocation)} MIRROR`);
    
    const tx = await vestingContract.addBeneficiary(
      beneficiary.address,
      beneficiary.allocation
    );
    await tx.wait();
    
    console.log(`    ✅ Added successfully\n`);
  }
  
  // Verify total allocated
  const totalAllocated = await vestingContract.totalAllocated();
  console.log(`Total Allocated: ${ethers.formatEther(totalAllocated)} MIRROR`);
  console.log(`Beneficiary Count: ${await vestingContract.getBeneficiaryCount()}\n`);
}

async function finalizeAllocations(vestingContract) {
  console.log("Finalizing beneficiary allocations...");
  
  const tx = await vestingContract.finalize();
  await tx.wait();
  
  const isFinalized = await vestingContract.isFinalized();
  console.log(`✅ Allocations finalized: ${isFinalized}\n`);
}

async function main() {
  console.log("=".repeat(70));
  console.log("MirrorTokenVesting Deployment Script");
  console.log("Part A: Vesting Contract Deployment");
  console.log("=".repeat(70));
  console.log();
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  
  // Get balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH");
  
  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "(Chain ID:", network.chainId.toString() + ")");
  console.log();
  
  // ==========================================================================
  // CONFIGURATION CHECK
  // ==========================================================================
  
  // Check if MIRROR_TOKEN_ADDRESS is set in environment
  const mirrorTokenAddress = process.env.MIRROR_TOKEN_ADDRESS;
  if (!mirrorTokenAddress) {
    console.log("⚠️  MIRROR_TOKEN_ADDRESS not set in environment variables.");
    console.log("Please set it before running this script:");
    console.log("  export MIRROR_TOKEN_ADDRESS=0x...");
    console.log();
    console.log("For local testing, deploying a mock token...\n");
    
    // Deploy mock token for testing
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockToken = await MockERC20.deploy("Mirror Token", "MIRROR", TOTAL_TEAM_ALLOCATION);
    await mockToken.waitForDeployment();
    console.log(`Mock MIRROR token deployed at: ${await mockToken.getAddress()}\n`);
    
    process.env.MIRROR_TOKEN_ADDRESS = await mockToken.getAddress();
  }
  
  const tokenAddress = process.env.MIRROR_TOKEN_ADDRESS;
  console.log("MIRROR Token Address:", tokenAddress);
  console.log();
  
  // ==========================================================================
  // STEP 1: Validate Configuration
  // ==========================================================================
  
  console.log("-".repeat(70));
  console.log("STEP 1: Validate Configuration");
  console.log("-".repeat(70));
  await validateConfiguration();
  
  // ==========================================================================
  // STEP 2: Deploy Vesting Contract
  // ==========================================================================
  
  console.log("-".repeat(70));
  console.log("STEP 2: Deploy Vesting Contract");
  console.log("-".repeat(70));
  const vestingContract = await deployVestingContract(tokenAddress, deployer);
  
  // ==========================================================================
  // STEP 3: Add Beneficiaries
  // ==========================================================================
  
  console.log("-".repeat(70));
  console.log("STEP 3: Add Team Beneficiaries");
  console.log("-".repeat(70));
  await addBeneficiaries(vestingContract);
  
  // ==========================================================================
  // STEP 4: Finalize Allocations
  // ==========================================================================
  
  console.log("-".repeat(70));
  console.log("STEP 4: Finalize Allocations");
  console.log("-".repeat(70));
  await finalizeAllocations(vestingContract);
  
  // ==========================================================================
  // DEPLOYMENT SUMMARY
  // ==========================================================================
  
  const vestingAddress = await vestingContract.getAddress();
  const cliffEnd = await vestingContract.getCliffEnd();
  const vestingEnd = await vestingContract.getVestingEnd();
  
  console.log("=".repeat(70));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(70));
  console.log(`
Network: ${network.name} (Chain ID: ${network.chainId})
Contract: MirrorTokenVesting
Address: ${vestingAddress}
Owner: ${deployer.address}
MIRROR Token: ${tokenAddress}

Vesting Schedule:
- Cliff End: ${new Date(Number(cliffEnd) * 1000).toISOString()}
- Vesting End: ${new Date(Number(vestingEnd) * 1000).toISOString()}
- Total Duration: 3 years

Beneficiaries: ${TEAM_BENEFICIARIES.length}
Total Allocated: ${ethers.formatEther(await vestingContract.totalAllocated())} MIRROR
Is Finalized: ${await vestingContract.isFinalized()}

NEXT STEP:
Run the token transfer script to complete Part B:
  export VESTING_CONTRACT_ADDRESS=${vestingAddress}
  npx hardhat run scripts/transfer-to-vesting.js --network ${network.name}

Verify on Etherscan:
  npx hardhat verify --network ${network.name} ${vestingAddress} ${tokenAddress} ${deployer.address}
`);
  
  // Save deployment info to file
  const fs = require("fs");
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    contract: "MirrorTokenVesting",
    address: vestingAddress,
    owner: deployer.address,
    mirrorToken: tokenAddress,
    cliffEnd: cliffEnd.toString(),
    vestingEnd: vestingEnd.toString(),
    beneficiaries: TEAM_BENEFICIARIES.map(b => ({
      name: b.name,
      address: b.address,
      allocation: ethers.formatEther(b.allocation)
    })),
    totalAllocated: ethers.formatEther(await vestingContract.totalAllocated()),
    isFinalized: await vestingContract.isFinalized(),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    constructorArgs: [tokenAddress, deployer.address]
  };
  
  const deploymentPath = `./deployments/vesting-${network.name}-${network.chainId}.json`;
  
  // Ensure deployments directory exists
  if (!fs.existsSync("./deployments")) {
    fs.mkdirSync("./deployments", { recursive: true });
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Deployment info saved to: ${deploymentPath}`);
  
  return vestingAddress;
}

main()
  .then((address) => {
    console.log("\n✅ Vesting contract deployment completed successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
