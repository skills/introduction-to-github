/**
 * Alliance Node Scaling Blueprint Script
 * 
 * Provides automated scaling capabilities for alliance infrastructure:
 * - Deploy alliance contracts to new networks/nodes
 * - Register new asset types and bridges
 * - Onboard new partners programmatically
 * - Scale governance to multi-chain
 * 
 * Usage:
 *   Scale to new network: node scripts/scale-alliance-nodes.js --network <network> --action deploy
 *   Add new assets: node scripts/scale-alliance-nodes.js --network <network> --action assets
 *   Onboard partners: node scripts/scale-alliance-nodes.js --network <network> --action partners
 * 
 * OmniTech1™ - Alliance Scaling Infrastructure
 */

const { ethers, upgrades } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Deploy alliance infrastructure to a new network node
 */
async function scaleToNewNetwork() {
    console.log("🚀 Scaling Alliance Infrastructure to New Network...\n");

    const [deployer] = await ethers.getSigners();
    const network = await ethers.provider.getNetwork();

    console.log("📍 Target Network:", network.name, `(Chain ID: ${network.chainId})`);
    console.log("📝 Deploying from:", deployer.address);
    console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

    // Deploy full alliance stack
    const deployScript = require("./deploy-alliance-contracts.js");
    const addresses = await deployScript();

    console.log("\n✅ Successfully scaled to new network!");
    console.log("📋 Next steps:");
    console.log("  1. Initialize registry with: npm run initialize:alliance");
    console.log("  2. Configure cross-chain bridges if needed");
    console.log("  3. Update frontend configuration with new addresses\n");

    return addresses;
}

/**
 * Add new asset types to existing alliance
 */
async function addNewAssets(allianceId, assets) {
    console.log("🌉 Adding New Assets to Alliance...\n");

    const [deployer] = await ethers.getSigners();
    const network = await ethers.provider.getNetwork();

    // Load latest deployment
    const deploymentsDir = path.join(__dirname, "..", "deployments", "alliances");
    const files = fs.readdirSync(deploymentsDir)
        .filter(f => f.startsWith(`alliance-deployment-${network.name}`))
        .sort()
        .reverse();

    if (files.length === 0) {
        throw new Error("No deployment found. Deploy contracts first.");
    }

    const deploymentData = JSON.parse(
        fs.readFileSync(path.join(deploymentsDir, files[0]), "utf8")
    );

    const assetBridge = await ethers.getContractAt(
        "AllianceAssetBridge",
        deploymentData.contracts.AllianceAssetBridge.proxy
    );

    console.log("🔗 Connected to AllianceAssetBridge:", await assetBridge.getAddress());
    console.log("📊 Adding", assets.length, "new assets...\n");

    const results = [];

    for (const asset of assets) {
        try {
            const tx = await assetBridge.tokenizeAsset(
                allianceId,
                asset.assetType,
                asset.tokenContract,
                asset.tokenId || 0,
                asset.realWorldId,
                asset.legalDocHash,
                asset.custodian,
                asset.valuationUSD,
                asset.metadataURI
            );

            const receipt = await tx.wait();
            const assetId = await assetBridge.getTotalAssets();

            console.log(`  ✅ Asset added: ${asset.realWorldId} (ID: ${assetId})`);
            results.push({ success: true, assetId: assetId.toString(), realWorldId: asset.realWorldId });

        } catch (error) {
            console.error(`  ❌ Failed to add ${asset.realWorldId}:`, error.message);
            results.push({ success: false, realWorldId: asset.realWorldId, error: error.message });
        }
    }

    console.log("\n📊 Asset Addition Summary:");
    console.log("  Total Attempted:", assets.length);
    console.log("  Successful:", results.filter(r => r.success).length);
    console.log("  Failed:", results.filter(r => !r.success).length);
    console.log();

    return results;
}

/**
 * Onboard new partners to existing alliance
 */
async function onboardNewPartners(allianceId, partners) {
    console.log("👥 Onboarding New Partners to Alliance...\n");

    const [deployer] = await ethers.getSigners();
    const network = await ethers.provider.getNetwork();

    // Load latest deployment
    const deploymentsDir = path.join(__dirname, "..", "deployments", "alliances");
    const files = fs.readdirSync(deploymentsDir)
        .filter(f => f.startsWith(`alliance-deployment-${network.name}`))
        .sort()
        .reverse();

    if (files.length === 0) {
        throw new Error("No deployment found. Deploy contracts first.");
    }

    const deploymentData = JSON.parse(
        fs.readFileSync(path.join(deploymentsDir, files[0]), "utf8")
    );

    const registry = await ethers.getContractAt(
        "AllianceRegistry",
        deploymentData.contracts.AllianceRegistry.proxy
    );

    console.log("🔗 Connected to AllianceRegistry:", await registry.getAddress());
    console.log("📊 Onboarding", partners.length, "new partners...\n");

    const results = [];

    for (const partner of partners) {
        try {
            // Add partner
            const addTx = await registry.addPartner(
                allianceId,
                partner.address,
                partner.name,
                partner.organizationType,
                partner.kycHash
            );
            await addTx.wait();

            console.log(`  ✅ Partner added: ${partner.name}`);

            // Verify if requested
            if (partner.verify) {
                const verifyTx = await registry.verifyPartner(partner.address);
                await verifyTx.wait();
                console.log(`  ✅ Partner verified: ${partner.name}`);
            }

            results.push({ success: true, name: partner.name, address: partner.address });

        } catch (error) {
            console.error(`  ❌ Failed to onboard ${partner.name}:`, error.message);
            results.push({ success: false, name: partner.name, error: error.message });
        }
    }

    console.log("\n📊 Partner Onboarding Summary:");
    console.log("  Total Attempted:", partners.length);
    console.log("  Successful:", results.filter(r => r.success).length);
    console.log("  Failed:", results.filter(r => !r.success).length);
    console.log();

    return results;
}

/**
 * Generate cross-chain bridge configuration
 */
async function generateCrossChainConfig(networks) {
    console.log("🌐 Generating Cross-Chain Configuration...\n");

    const config = {
        version: "1.0.0",
        generatedAt: new Date().toISOString(),
        networks: {}
    };

    for (const networkName of networks) {
        const deploymentsDir = path.join(__dirname, "..", "deployments", "alliances");
        const files = fs.readdirSync(deploymentsDir)
            .filter(f => f.startsWith(`alliance-deployment-${networkName}`))
            .sort()
            .reverse();

        if (files.length > 0) {
            const deploymentData = JSON.parse(
                fs.readFileSync(path.join(deploymentsDir, files[0]), "utf8")
            );

            config.networks[networkName] = {
                chainId: deploymentData.network.chainId,
                contracts: deploymentData.contracts
            };
        }
    }

    const outputPath = path.join(__dirname, "..", "deployments", "alliance-cross-chain-config.json");
    fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));

    console.log("✅ Cross-chain configuration generated");
    console.log("📁 Saved to:", outputPath);
    console.log("\n📊 Networks configured:", Object.keys(config.networks).length);
    console.log();

    return config;
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const action = args.find(arg => arg.startsWith("--action="))?.split("=")[1] || "deploy";

    console.log("⚙️  Alliance Scaling Blueprint");
    console.log("Action:", action);
    console.log("=".repeat(60), "\n");

    switch (action) {
        case "deploy":
            await scaleToNewNetwork();
            break;

        case "assets":
            // Example: Add sample assets
            await addNewAssets(1, [
                {
                    assetType: 2, // Equity
                    tokenContract: "0x5678901234567890123456789012345678901234",
                    realWorldId: "EQUITY-STARTUP-2024-001",
                    legalDocHash: ethers.keccak256(ethers.toUtf8Bytes("EQUITY_DOC_001")),
                    custodian: (await ethers.getSigners())[0].address,
                    valuationUSD: 2000000000000, // $2M
                    metadataURI: "ipfs://QmEquityAsset001"
                }
            ]);
            break;

        case "partners":
            // Example: Onboard sample partners
            await onboardNewPartners(1, [
                {
                    address: "0x6789012345678901234567890123456789012345",
                    name: "Technology Partner Inc",
                    organizationType: "Technology Provider",
                    kycHash: ethers.keccak256(ethers.toUtf8Bytes("KYC_DOC_003")),
                    verify: true
                }
            ]);
            break;

        case "cross-chain":
            await generateCrossChainConfig(["sepolia", "mainnet", "hardhat"]);
            break;

        default:
            console.log("❌ Unknown action:", action);
            console.log("Available actions: deploy, assets, partners, cross-chain");
            process.exit(1);
    }

    console.log("\n✨ Scaling operation complete! ✨\n");
}

// Execute if called directly
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Scaling failed:");
            console.error(error);
            process.exit(1);
        });
}

module.exports = {
    scaleToNewNetwork,
    addNewAssets,
    onboardNewPartners,
    generateCrossChainConfig
};
