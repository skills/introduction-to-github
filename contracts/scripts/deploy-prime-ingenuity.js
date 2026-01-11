const hre = require("hardhat");

async function main() {
  console.log("Deploying Scroll of Prime Ingenuity NFT System...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy PrimeIngenuityNFT
  console.log("\n1. Deploying PrimeIngenuityNFT...");
  const PrimeIngenuityNFT = await hre.ethers.getContractFactory("PrimeIngenuityNFT");
  const primeIngenuityNFT = await PrimeIngenuityNFT.deploy(
    "Scroll of Prime Ingenuity",
    "PRIME",
    deployer.address
  );
  await primeIngenuityNFT.waitForDeployment();
  const nftAddress = await primeIngenuityNFT.getAddress();
  console.log("PrimeIngenuityNFT deployed to:", nftAddress);

  // Deploy or get reward token (using existing ScrollCoin or deploying mock)
  console.log("\n2. Setting up reward token...");
  let rewardTokenAddress;
  
  // Check if ScrollCoin exists, otherwise deploy mock
  try {
    // Try to get existing token address from deployments
    const deployments = require("../deployments/deployments.json");
    rewardTokenAddress = deployments.scrollCoin || null;
  } catch (error) {
    rewardTokenAddress = null;
  }

  if (!rewardTokenAddress) {
    console.log("Deploying MockERC20 as reward token...");
    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    const rewardToken = await MockERC20.deploy(
      "ScrollCoin",
      "SCROLL",
      hre.ethers.parseEther("1000000000") // 1B tokens
    );
    await rewardToken.waitForDeployment();
    rewardTokenAddress = await rewardToken.getAddress();
    console.log("MockERC20 (Reward Token) deployed to:", rewardTokenAddress);
  } else {
    console.log("Using existing reward token at:", rewardTokenAddress);
  }

  // Deploy PrimeIngenuityStaking
  console.log("\n3. Deploying PrimeIngenuityStaking...");
  const rewardRatePerDay = hre.ethers.parseEther("10"); // 10 tokens per day per NFT
  
  const PrimeIngenuityStaking = await hre.ethers.getContractFactory("PrimeIngenuityStaking");
  const primeIngenuityStaking = await PrimeIngenuityStaking.deploy(
    nftAddress,
    rewardTokenAddress,
    rewardRatePerDay,
    deployer.address
  );
  await primeIngenuityStaking.waitForDeployment();
  const stakingAddress = await primeIngenuityStaking.getAddress();
  console.log("PrimeIngenuityStaking deployed to:", stakingAddress);

  // Register sample innovations
  console.log("\n4. Registering sample innovations...");
  
  const innovations = [
    {
      id: 0,
      name: "Triton Flying Submarine",
      type: "Transportation/Marine Technology",
      creator: "Pierre Paulo Latzarini",
      useCase: "Personal transportation, Marine exploration, Emergency rescue, Scientific research",
      impact: "Democratizes access to both underwater and aerial domains"
    },
    {
      id: 1,
      name: "LIFT Aircraft HEXA",
      type: "Electric Aviation/Personal Transport",
      creator: "LIFT Aircraft Team",
      useCase: "Personal recreational flight, Urban air mobility, Pilot training",
      impact: "Makes personal flight accessible without pilot license requirements"
    },
    {
      id: 2,
      name: "Self-Healing Concrete",
      type: "Construction Materials/Biotechnology",
      creator: "Biomimicry Engineering Consortium",
      useCase: "Infrastructure longevity, Bridge construction, Building foundations",
      impact: "Transforms construction industry sustainability, reduces carbon footprint"
    }
  ];

  for (const innovation of innovations) {
    const tx = await primeIngenuityNFT.registerInnovation(
      innovation.id,
      innovation.name,
      innovation.type,
      innovation.creator,
      innovation.useCase,
      innovation.impact
    );
    await tx.wait();
    console.log(`Registered Innovation ${innovation.id}: ${innovation.name}`);
  }

  // Save deployment addresses
  console.log("\n5. Saving deployment information...");
  const fs = require("fs");
  const path = require("path");
  
  const deploymentInfo = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    contracts: {
      primeIngenuityNFT: nftAddress,
      primeIngenuityStaking: stakingAddress,
      rewardToken: rewardTokenAddress
    },
    configuration: {
      maxSupply: 86,
      maxInnovations: 43,
      unitsPerInnovation: 2,
      defaultRoyalty: "5%",
      rewardRatePerDay: hre.ethers.formatEther(rewardRatePerDay)
    }
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filePath = path.join(deploymentsDir, "prime-ingenuity-deployment.json");
  fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info saved to:", filePath);

  console.log("\n✅ Deployment Complete!");
  console.log("\nContract Addresses:");
  console.log("-------------------");
  console.log("PrimeIngenuityNFT:", nftAddress);
  console.log("PrimeIngenuityStaking:", stakingAddress);
  console.log("Reward Token:", rewardTokenAddress);
  
  console.log("\n📝 Next Steps:");
  console.log("1. Verify contracts on block explorer");
  console.log("2. Update metadata URIs with IPFS CIDs");
  console.log("3. Configure royalty recipients");
  console.log("4. Fund staking contract with reward tokens");
  console.log("5. Grant MINTER_ROLE to authorized addresses");
  console.log("6. Begin minting innovation pairs");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
