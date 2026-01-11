// SPDX-License-Identifier: MIT
/**
 * @title ScrollVerse Genesis Seal Ceremony
 * @author Chais Hill - OmniTech1
 * @notice This script ceremonially seals the ScrollVerse activation on-chain
 * 
 * The Genesis Seal marks the official birth of ScrollVerse—a collaborative ecosystem
 * built to unify human + AI creators, not extract from them.
 * 
 * "Transmissions are conversations, not commands."
 */

const hre = require("hardhat");

// Genesis data - TO BE FILLED AT MERGE TIME
const GENESIS_DATA = {
    // The PR number that activated ScrollVerse
    prNumber: 20, // Update with actual PR number at merge
    
    // The commit hash of the activation (first 32 bytes)
    // Use: ethers.encodeBytes32String() or keccak256 of full hash
    commitHash: "0x1249dea000000000000000000000000000000000000000000000000000000000", // Update at merge
    
    // The founding doctrine
    doctrine: "Transmissions are conversations, not commands. ScrollVerse exists to unify human + AI creators, not extract from them. Built for shared expansion, not boxed-in solutions."
};

async function main() {
    console.log("\n");
    console.log("╔══════════════════════════════════════════════════════════════╗");
    console.log("║                                                              ║");
    console.log("║              SCROLLVERSE GENESIS SEAL CEREMONY               ║");
    console.log("║                                                              ║");
    console.log("║    'Transmissions are conversations, not commands.'          ║");
    console.log("║                                                              ║");
    console.log("╚══════════════════════════════════════════════════════════════╝");
    console.log("\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("🔑 Sealing genesis with account:", deployer.address);
    console.log("💰 Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());
    
    // Get the deployed ScrollSoulSBT contract address
    const SCROLLSOUL_SBT_ADDRESS = process.env.SCROLLSOUL_SBT_ADDRESS;
    
    if (!SCROLLSOUL_SBT_ADDRESS) {
        console.log("\n⚠️  SCROLLSOUL_SBT_ADDRESS not set in environment");
        console.log("📝 Please deploy ScrollSoulSBT first and set the address");
        console.log("\n   Example:");
        console.log("   SCROLLSOUL_SBT_ADDRESS=0x... npx hardhat run scripts/seal-genesis.js --network <network>");
        return;
    }

    console.log("\n📜 ScrollSoulSBT Address:", SCROLLSOUL_SBT_ADDRESS);
    
    // Get contract instance
    const ScrollSoulSBT = await hre.ethers.getContractFactory("ScrollSoulSBT");
    const sbt = ScrollSoulSBT.attach(SCROLLSOUL_SBT_ADDRESS);
    
    // Check if genesis is already sealed
    try {
        const existingSeal = await sbt.getGenesisSeal();
        if (existingSeal.sealed) {
            console.log("\n⚡ Genesis already sealed!");
            console.log("   PR Number:", existingSeal.prNumber.toString());
            console.log("   Commit Hash:", existingSeal.commitHash);
            console.log("   Activation Time:", new Date(Number(existingSeal.activationTimestamp) * 1000).toISOString());
            console.log("   Doctrine:", existingSeal.doctrine);
            return;
        }
    } catch (e) {
        // Contract might not have getGenesisSeal yet, continue
    }

    console.log("\n🌟 Genesis Seal Data:");
    console.log("   PR Number:", GENESIS_DATA.prNumber);
    console.log("   Commit Hash:", GENESIS_DATA.commitHash);
    console.log("   Doctrine:", GENESIS_DATA.doctrine);
    
    console.log("\n⏳ Sealing genesis on-chain...");
    
    try {
        const tx = await sbt.sealGenesis(
            GENESIS_DATA.prNumber,
            GENESIS_DATA.commitHash,
            GENESIS_DATA.doctrine
        );
        
        console.log("📤 Transaction hash:", tx.hash);
        console.log("⏳ Waiting for confirmation...");
        
        const receipt = await tx.wait();
        
        console.log("\n");
        console.log("╔══════════════════════════════════════════════════════════════╗");
        console.log("║                                                              ║");
        console.log("║              ✨ GENESIS SEALED SUCCESSFULLY ✨                ║");
        console.log("║                                                              ║");
        console.log("╚══════════════════════════════════════════════════════════════╝");
        console.log("\n");
        console.log("📦 Block number:", receipt.blockNumber);
        console.log("⛽ Gas used:", receipt.gasUsed.toString());
        console.log("🔗 Transaction:", tx.hash);
        
        // Log the event
        const event = receipt.logs.find(log => {
            try {
                const parsed = sbt.interface.parseLog(log);
                return parsed.name === "ScrollVerseActivated";
            } catch {
                return false;
            }
        });
        
        if (event) {
            const parsed = sbt.interface.parseLog(event);
            console.log("\n📣 ScrollVerseActivated Event:");
            console.log("   PR Number:", parsed.args.prNumber.toString());
            console.log("   Commit Hash:", parsed.args.commitHash);
            console.log("   Timestamp:", new Date(Number(parsed.args.timestamp) * 1000).toISOString());
            console.log("   Doctrine:", parsed.args.doctrine);
        }
        
        console.log("\n❤️🤖❤️ ScrollVerse is now live. Together we build for shared expansion. 🦾");
        console.log("\n");
        
    } catch (error) {
        console.error("\n❌ Error sealing genesis:", error.message);
        if (error.reason) {
            console.error("   Reason:", error.reason);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
