/**
 * Alliance Contracts Deployment Script
 * 
 * Deploys the complete alliance infrastructure:
 * - AllianceRegistry: Core alliance management
 * - AllianceGovernance: Governance and voting
 * - AllianceAssetBridge: Real-world asset tokenization
 * 
 * Usage:
 *   Local:   npm run deploy:alliance:local
 *   Sepolia: npm run deploy:alliance:sepolia
 *   Mainnet: npm run deploy:alliance:mainnet
 * 
 * OmniTech1™ - Real-World Alliance Deployment
 */

const { ethers, upgrades } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Starting Alliance Infrastructure Deployment...\n");

    // Get deployer
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

    // Deploy AllianceRegistry
    console.log("📋 Deploying AllianceRegistry...");
    const AllianceRegistry = await ethers.getContractFactory("AllianceRegistry");
    const registry = await upgrades.deployProxy(
        AllianceRegistry,
        [deployer.address],
        { initializer: "initialize", kind: "uups" }
    );
    await registry.waitForDeployment();
    const registryAddress = await registry.getAddress();
    console.log("✅ AllianceRegistry deployed to:", registryAddress);

    // Grant ALLIANCE_CREATOR_ROLE to deployer
    const ALLIANCE_CREATOR_ROLE = await registry.ALLIANCE_CREATOR_ROLE();
    await registry.grantRole(ALLIANCE_CREATOR_ROLE, deployer.address);
    console.log("✅ Granted ALLIANCE_CREATOR_ROLE to deployer\n");

    // Deploy a governance token for voting (using MirrorToken as example)
    // In production, you would deploy a specific governance token
    console.log("🗳️  Deploying Governance Token (for voting)...");
    const MirrorToken = await ethers.getContractFactory("MirrorToken");
    const governanceToken = await upgrades.deployProxy(
        MirrorToken,
        [deployer.address],
        { initializer: "initialize", kind: "uups" }
    );
    await governanceToken.waitForDeployment();
    const governanceTokenAddress = await governanceToken.getAddress();
    console.log("✅ Governance Token deployed to:", governanceTokenAddress);

    // Mint some tokens to deployer for governance
    await governanceToken.mint(deployer.address, ethers.parseEther("1000000"));
    console.log("✅ Minted 1,000,000 governance tokens to deployer");

    // Delegate voting power to self
    await governanceToken.delegate(deployer.address);
    console.log("✅ Delegated voting power to deployer\n");

    // Deploy AllianceGovernance
    console.log("🏛️  Deploying AllianceGovernance...");
    const AllianceGovernance = await ethers.getContractFactory("AllianceGovernance");
    const governance = await upgrades.deployProxy(
        AllianceGovernance,
        [governanceTokenAddress, deployer.address],
        { initializer: "initialize", kind: "uups" }
    );
    await governance.waitForDeployment();
    const governanceAddress = await governance.getAddress();
    console.log("✅ AllianceGovernance deployed to:", governanceAddress);

    // Grant PROPOSAL_CREATOR_ROLE to deployer
    const PROPOSAL_CREATOR_ROLE = await governance.PROPOSAL_CREATOR_ROLE();
    await governance.grantRole(PROPOSAL_CREATOR_ROLE, deployer.address);
    console.log("✅ Granted PROPOSAL_CREATOR_ROLE to deployer\n");

    // Deploy AllianceAssetBridge
    console.log("🌉 Deploying AllianceAssetBridge...");
    const AllianceAssetBridge = await ethers.getContractFactory("AllianceAssetBridge");
    const assetBridge = await upgrades.deployProxy(
        AllianceAssetBridge,
        [deployer.address],
        { initializer: "initialize", kind: "uups" }
    );
    await assetBridge.waitForDeployment();
    const assetBridgeAddress = await assetBridge.getAddress();
    console.log("✅ AllianceAssetBridge deployed to:", assetBridgeAddress);

    // Grant roles for asset bridge integration
    const ASSET_MANAGER_ROLE = await registry.ASSET_MANAGER_ROLE();
    await registry.grantRole(ASSET_MANAGER_ROLE, assetBridgeAddress);
    console.log("✅ Granted ASSET_MANAGER_ROLE to AllianceAssetBridge\n");

    // Prepare deployment summary
    const network = await ethers.provider.getNetwork();
    const deploymentData = {
        network: {
            name: network.name,
            chainId: network.chainId.toString()
        },
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            AllianceRegistry: {
                proxy: registryAddress,
                implementation: await upgrades.erc1967.getImplementationAddress(registryAddress)
            },
            GovernanceToken: {
                proxy: governanceTokenAddress,
                implementation: await upgrades.erc1967.getImplementationAddress(governanceTokenAddress)
            },
            AllianceGovernance: {
                proxy: governanceAddress,
                implementation: await upgrades.erc1967.getImplementationAddress(governanceAddress)
            },
            AllianceAssetBridge: {
                proxy: assetBridgeAddress,
                implementation: await upgrades.erc1967.getImplementationAddress(assetBridgeAddress)
            }
        }
    };

    // Save deployment data
    const deploymentsDir = path.join(__dirname, "..", "deployments", "alliances");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const filename = `alliance-deployment-${network.name}-${Date.now()}.json`;
    const filepath = path.join(deploymentsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(deploymentData, null, 2));

    console.log("\n📄 Deployment Summary");
    console.log("=".repeat(60));
    console.log("Network:", network.name, `(Chain ID: ${network.chainId})`);
    console.log("Deployer:", deployer.address);
    console.log("\n📋 Contract Addresses:");
    console.log("  AllianceRegistry (Proxy):", registryAddress);
    console.log("  GovernanceToken (Proxy):", governanceTokenAddress);
    console.log("  AllianceGovernance (Proxy):", governanceAddress);
    console.log("  AllianceAssetBridge (Proxy):", assetBridgeAddress);
    console.log("\n📁 Deployment data saved to:", filepath);
    console.log("=".repeat(60));
    console.log("\n✨ Alliance Infrastructure Deployment Complete! ✨\n");

    // Return deployed contract addresses for testing/scripting
    return {
        registry: registryAddress,
        governance: governanceAddress,
        governanceToken: governanceTokenAddress,
        assetBridge: assetBridgeAddress
    };
}

// Execute deployment
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Deployment failed:");
            console.error(error);
            process.exit(1);
        });
}

module.exports = main;
