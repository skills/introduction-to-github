/**
 * Alliance Registry Initialization Script
 * 
 * Initializes the AllianceRegistry with sample data:
 * - Creates a sample alliance
 * - Adds verified partners
 * - Registers asset bridges
 * 
 * Usage:
 *   Local:   npm run initialize:alliance:local
 *   Sepolia: npm run initialize:alliance:sepolia
 * 
 * OmniTech1™ - Alliance Registry Bootstrap
 */

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🔧 Starting Alliance Registry Initialization...\n");

    // Get signer
    const [deployer] = await ethers.getSigners();
    console.log("📝 Initializing with account:", deployer.address);

    // Load deployment addresses
    const network = await ethers.provider.getNetwork();
    const deploymentsDir = path.join(__dirname, "..", "deployments", "alliances");
    
    if (!fs.existsSync(deploymentsDir)) {
        throw new Error("Deployments directory not found. Please deploy contracts first.");
    }

    const files = fs.readdirSync(deploymentsDir)
        .filter(f => f.startsWith(`alliance-deployment-${network.name}`))
        .sort()
        .reverse();

    if (files.length === 0) {
        throw new Error(`No deployment found for network: ${network.name}`);
    }

    const deploymentData = JSON.parse(
        fs.readFileSync(path.join(deploymentsDir, files[0]), "utf8")
    );

    console.log("📋 Using deployment:", files[0], "\n");

    // Get contract instances
    const registry = await ethers.getContractAt(
        "AllianceRegistry",
        deploymentData.contracts.AllianceRegistry.proxy
    );

    const assetBridge = await ethers.getContractAt(
        "AllianceAssetBridge",
        deploymentData.contracts.AllianceAssetBridge.proxy
    );

    // Create sample alliance
    console.log("🤝 Creating sample alliance...");
    const allianceName = "ScrollVerse Real-World Alliance";
    const allianceDescription = "First real-world partnership alliance for ScrollVerse ecosystem integration";
    const metadataURI = "ipfs://QmExampleAllianceMetadata123456789";
    const governanceHash = ethers.keccak256(ethers.toUtf8Bytes("Alliance Governance Agreement v1.0"));

    const createTx = await registry.createAlliance(
        allianceName,
        allianceDescription,
        metadataURI,
        governanceHash
    );
    await createTx.wait();
    
    const allianceId = 1; // First alliance
    console.log("✅ Alliance created with ID:", allianceId);

    // Update alliance status to Active
    console.log("🔄 Activating alliance...");
    const activateTx = await registry.updateAllianceStatus(allianceId, 1); // 1 = Active
    await activateTx.wait();
    console.log("✅ Alliance activated\n");

    // Add sample partners
    console.log("👥 Adding sample partners...");
    const partners = [
        {
            address: "0x1234567890123456789012345678901234567890",
            name: "Real Estate Partner LLC",
            orgType: "Real Estate Development",
            kycHash: ethers.keccak256(ethers.toUtf8Bytes("KYC_DOC_001"))
        },
        {
            address: "0x2345678901234567890123456789012345678901",
            name: "Asset Management Corp",
            orgType: "Asset Management",
            kycHash: ethers.keccak256(ethers.toUtf8Bytes("KYC_DOC_002"))
        }
    ];

    for (const partner of partners) {
        const addPartnerTx = await registry.addPartner(
            allianceId,
            partner.address,
            partner.name,
            partner.orgType,
            partner.kycHash
        );
        await addPartnerTx.wait();
        console.log(`  ✅ Added partner: ${partner.name}`);

        // Verify partner
        const verifyTx = await registry.verifyPartner(partner.address);
        await verifyTx.wait();
        console.log(`  ✅ Verified partner: ${partner.name}`);
    }
    console.log();

    // Register sample asset bridges
    console.log("🌉 Registering sample asset bridges...");
    const sampleAssets = [
        {
            tokenContract: "0x3456789012345678901234567890123456789012",
            assetType: 0, // RealEstate
            realWorldId: "DEED-NYC-2024-001",
            legalDocHash: ethers.keccak256(ethers.toUtf8Bytes("LEGAL_DOC_RE_001")),
            custodian: deployer.address,
            valuation: 5000000000000, // $5M with 1e6 decimals
            metadataURI: "ipfs://QmRealEstateAsset001"
        },
        {
            tokenContract: "0x4567890123456789012345678901234567890123",
            assetType: 1, // Commodity
            realWorldId: "COMMODITY-GOLD-2024-001",
            legalDocHash: ethers.keccak256(ethers.toUtf8Bytes("LEGAL_DOC_COMMODITY_001")),
            custodian: deployer.address,
            valuation: 1000000000000, // $1M with 1e6 decimals
            metadataURI: "ipfs://QmCommodityAsset001"
        }
    ];

    for (const asset of sampleAssets) {
        const tokenizeTx = await assetBridge.tokenizeAsset(
            allianceId,
            asset.assetType,
            asset.tokenContract,
            0, // tokenId (0 for ERC20)
            asset.realWorldId,
            asset.legalDocHash,
            asset.custodian,
            asset.valuation,
            asset.metadataURI
        );
        await tokenizeTx.wait();
        console.log(`  ✅ Tokenized asset: ${asset.realWorldId}`);
    }
    console.log();

    // Verify assets
    console.log("✓  Verifying assets...");
    for (let i = 1; i <= sampleAssets.length; i++) {
        const verifyTx = await assetBridge.verifyAsset(
            i,
            1, // Verified status
            ethers.keccak256(ethers.toUtf8Bytes(`VERIFICATION_REPORT_${i}`)),
            "Initial verification completed"
        );
        await verifyTx.wait();
        console.log(`  ✅ Verified asset ID: ${i}`);
    }
    console.log();

    // Display summary
    const alliance = await registry.getAlliance(allianceId);
    const totalAssets = await assetBridge.getTotalAssets();
    const totalValuation = await assetBridge.getAllianceTotalValuation(allianceId);

    console.log("\n📊 Initialization Summary");
    console.log("=".repeat(60));
    console.log("Alliance ID:", allianceId);
    console.log("Alliance Name:", alliance.name);
    console.log("Status:", ["Pending", "Active", "Suspended", "Dissolved"][alliance.status]);
    console.log("Total Partners:", alliance.partners.length);
    console.log("Total Assets:", totalAssets.toString());
    console.log("Total Valuation:", `$${(Number(totalValuation) / 1e6).toLocaleString()}`);
    console.log("=".repeat(60));
    console.log("\n✨ Alliance Registry Initialization Complete! ✨\n");
}

// Execute initialization
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Initialization failed:");
            console.error(error);
            process.exit(1);
        });
}

module.exports = main;
