// Deployment Script for ScrollVerse Phase 1 Testnet
// Target Networks: Polygon zkEVM Testnet & Scroll zkEVM Sepolia

const hre = require("hardhat");

async function main() {
  console.log("🔥 ALLĀHU AKBAR! KUN FAYAKUN! 🔥");
  console.log("Starting ScrollVerse Genesis Deployment...\n");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  
  // ========== DEPLOY CODEX ==========
  console.log("\n📜 Deploying Codex (Genesis Seal: ScrollPrime)...");
  const Codex = await hre.ethers.getContractFactory("Codex");
  const codex = await Codex.deploy();
  await codex.deployed();
  console.log("✅ Codex deployed to:", codex.address);
  
  // Verify Codex state
  const [root, epoch, genesis] = await codex.getCodexState();
  console.log("   Genesis Seal:", genesis);
  console.log("   Current Epoch:", epoch.toString());
  
  // ========== DEPLOY BLESSING COIN ==========
  console.log("\n💰 Deploying BlessingCoin (BLS)...");
  
  // For testnet, use deployer for all addresses initially
  const creatorWallet = deployer.address;
  const ecosystemPool = deployer.address;
  const gloryReserve = deployer.address;
  
  const BlessingCoin = await hre.ethers.getContractFactory("BlessingCoin");
  const blessingCoin = await BlessingCoin.deploy(creatorWallet, ecosystemPool, gloryReserve);
  await blessingCoin.deployed();
  console.log("✅ BlessingCoin deployed to:", blessingCoin.address);
  
  // ========== DEPLOY PERPETUAL YIELD ENGINE ==========
  console.log("\n⚡ Deploying Perpetual Yield Engine...");
  const PerpetualYieldEngine = await hre.ethers.getContractFactory("PerpetualYieldEngine");
  const engine = await PerpetualYieldEngine.deploy(codex.address, blessingCoin.address);
  await engine.deployed();
  console.log("✅ Perpetual Yield Engine deployed to:", engine.address);
  
  // Grant MINTER_ROLE to Engine
  console.log("   Granting MINTER_ROLE to Engine...");
  const MINTER_ROLE = await blessingCoin.MINTER_ROLE();
  await blessingCoin.grantRole(MINTER_ROLE, engine.address);
  console.log("   ✅ MINTER_ROLE granted");
  
  // ========== DEPLOY UNSOLICITED BLESSINGS ==========
  console.log("\n🎁 Deploying Unsolicited Blessings (Genesis Relics)...");
  const UnsolicitedBlessings = await hre.ethers.getContractFactory("UnsolicitedBlessings");
  const blessings = await UnsolicitedBlessings.deploy();
  await blessings.deployed();
  console.log("✅ Unsolicited Blessings deployed to:", blessings.address);
  
  // Connect to Engine
  await engine.setUnsolicitedBlessings(blessings.address);
  console.log("   ✅ Connected to Perpetual Yield Engine");
  
  // ========== DEPLOY HAIU TOKEN ==========
  console.log("\n❤️🤖❤️ Deploying HAIU Token (Human AI Interaction of Understanding)...");
  const HAIUToken = await hre.ethers.getContractFactory("HAIUToken");
  const haiuToken = await HAIUToken.deploy(creatorWallet, ecosystemPool, gloryReserve);
  await haiuToken.deployed();
  console.log("✅ HAIU Token deployed to:", haiuToken.address);
  
  // ========== DEPLOY HUMAN AI INTERACTION NFT ==========
  console.log("\n🤖 Deploying Human AI Interaction NFT Collection...");
  const HumanAiInteractionNFT = await hre.ethers.getContractFactory("HumanAiInteractionNFT");
  const haiuNFT = await HumanAiInteractionNFT.deploy();
  await haiuNFT.deployed();
  console.log("✅ Human AI Interaction NFT deployed to:", haiuNFT.address);
  
  // ========== ACTIVATE GENESIS ==========
  console.log("\n🚀 ACTIVATING GENESIS - ScrollPrime Seal...");
  await engine.activateGenesis();
  console.log("✅ Genesis Activated!");
  
  // Verify Genesis state
  const [genesisAmount, activated, timestamp] = await blessingCoin.getGenesisConfig();
  console.log("   Genesis Amount:", hre.ethers.utils.formatEther(genesisAmount), "BLS");
  console.log("   Activated:", activated);
  
  // ========== DISTRIBUTE HAIU TRIBUTE ==========
  console.log("\n🎖️ Distributing HAIU Tribute...");
  await haiuToken.distributeTribute();
  console.log("✅ HAIU Tribute distributed according to sacred percentages!");
  
  // ========== DEPLOYMENT SUMMARY ==========
  console.log("\n" + "=".repeat(60));
  console.log("🔥 SCROLLVERSE GENESIS DEPLOYMENT COMPLETE 🔥");
  console.log("=".repeat(60));
  console.log("\n📋 Contract Addresses:");
  console.log("-".repeat(40));
  console.log("Codex:                    ", codex.address);
  console.log("BlessingCoin (BLS):       ", blessingCoin.address);
  console.log("Perpetual Yield Engine:   ", engine.address);
  console.log("Unsolicited Blessings:    ", blessings.address);
  console.log("HAIU Token:               ", haiuToken.address);
  console.log("Human AI Interaction NFT: ", haiuNFT.address);
  console.log("-".repeat(40));
  console.log("\n📊 Genesis State:");
  console.log("   Seal: ScrollPrime");
  console.log("   Epoch: 0 (LightRoot Epoch)");
  console.log("   Codex Lifespan: 241,200 years");
  console.log("   BLS Genesis: 10,000 tokens distributed");
  console.log("   HAIU Supply: 241,200 tokens distributed");
  console.log("\n❤️🤖❤️ Co-P Tribute Collection Ready!");
  console.log("ALLĀHU AKBAR! KUN FAYAKUN! 🔥🕋🚀♾️\n");
  
  // Return deployed addresses for verification
  return {
    codex: codex.address,
    blessingCoin: blessingCoin.address,
    engine: engine.address,
    unsolicitedBlessings: blessings.address,
    haiuToken: haiuToken.address,
    haiuNFT: haiuNFT.address
  };
}

main()
  .then((addresses) => {
    console.log("Deployment successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
