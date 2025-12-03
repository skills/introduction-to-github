const { ethers } = require("hardhat");

/**
 * Script to submit the Genesis Proposal to ScrollVerseDAO
 * 
 * The Genesis Proposal: Incentivizing NFT Fusion and Community Engagement
 * 
 * This proposal officially recognizes the strategic importance of the 
 * Omnisovereign VIII and TECHANGEL Sigil NFT sets and allocates $MIRROR 
 * from the DAO Treasury for:
 * - Initial rewards for early NFT holders and participants in fusion events
 * - Community engagement and adoption activities aligned with the ScrollVerse ethos
 * 
 * Usage:
 *   npx hardhat run scripts/submitGenesisProposal.js --network <network>
 */

async function main() {
    console.log("=".repeat(70));
    console.log("ScrollVerseDAO - Genesis Proposal Submission");
    console.log("=".repeat(70));

    // Get deployer account
    const [proposer] = await ethers.getSigners();
    console.log("\nProposer address:", proposer.address);

    // Get balance
    const balance = await ethers.provider.getBalance(proposer.address);
    console.log("Proposer ETH balance:", ethers.formatEther(balance), "ETH");

    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name, "(Chain ID:", network.chainId.toString() + ")");

    // Contract addresses - these should be configured for your deployment
    const config = {
        // Replace with actual deployed contract addresses
        mirrorTokenAddress: process.env.MIRROR_TOKEN_ADDRESS || "",
        daoAddress: process.env.DAO_ADDRESS || "",
        distributionFundAddress: process.env.DISTRIBUTION_FUND_ADDRESS || "",
        treasuryTransferAmount: process.env.TREASURY_TRANSFER_AMOUNT || ethers.parseEther("10000000") // 10 million MIRROR default
    };

    // Validate configuration
    if (!config.mirrorTokenAddress || !config.daoAddress || !config.distributionFundAddress) {
        console.log("\n" + "-".repeat(70));
        console.log("CONFIGURATION REQUIRED");
        console.log("-".repeat(70));
        console.log(`
Please set the following environment variables before running this script:

MIRROR_TOKEN_ADDRESS    - Address of the deployed MirrorToken contract
DAO_ADDRESS             - Address of the deployed ScrollVerseDAO contract
DISTRIBUTION_FUND_ADDRESS - Address of the distribution fund to receive MIRROR
TREASURY_TRANSFER_AMOUNT  - Amount of MIRROR to transfer (in wei, default: 10M)

Example:
export MIRROR_TOKEN_ADDRESS=0x...
export DAO_ADDRESS=0x...
export DISTRIBUTION_FUND_ADDRESS=0x...
npx hardhat run scripts/submitGenesisProposal.js --network sepolia
        `);
        process.exit(1);
    }

    console.log("\n" + "-".repeat(70));
    console.log("Configuration");
    console.log("-".repeat(70));
    console.log("MirrorToken Address:", config.mirrorTokenAddress);
    console.log("ScrollVerseDAO Address:", config.daoAddress);
    console.log("Distribution Fund Address:", config.distributionFundAddress);
    console.log("Treasury Transfer Amount:", ethers.formatEther(config.treasuryTransferAmount), "MIRROR");

    // Get contract instances
    const dao = await ethers.getContractAt("ScrollVerseDAO", config.daoAddress);
    const mirrorToken = await ethers.getContractAt("MirrorToken", config.mirrorTokenAddress);

    // Check proposer's voting power
    const votingPower = await mirrorToken.getVotingPower(proposer.address);
    const proposalThreshold = await dao.proposalThreshold();

    console.log("\n" + "-".repeat(70));
    console.log("Voting Power Check");
    console.log("-".repeat(70));
    console.log("Your Voting Power:", ethers.formatEther(votingPower), "MIRROR");
    console.log("Proposal Threshold:", ethers.formatEther(proposalThreshold), "MIRROR");

    if (votingPower < proposalThreshold) {
        console.log("\n❌ ERROR: Insufficient voting power to create proposal");
        console.log("Please delegate more MIRROR tokens to your address.");
        process.exit(1);
    }

    console.log("✅ Sufficient voting power to create proposal");

    // Prepare proposal data
    const targets = [config.mirrorTokenAddress];
    const values = [0];
    const calldatas = [
        mirrorToken.interface.encodeFunctionData("transfer", [
            config.distributionFundAddress,
            config.treasuryTransferAmount
        ])
    ];

    console.log("\n" + "-".repeat(70));
    console.log("Submitting Genesis Proposal...");
    console.log("-".repeat(70));

    // Submit the Genesis Proposal
    const tx = await dao.submitGenesisProposal(
        targets,
        values,
        calldatas,
        config.treasuryTransferAmount,
        config.distributionFundAddress
    );

    console.log("Transaction hash:", tx.hash);
    console.log("Waiting for confirmation...");

    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);

    // Extract proposal ID from events
    const proposalCreatedEvent = receipt.logs.find(
        log => {
            try {
                const parsed = dao.interface.parseLog(log);
                return parsed && parsed.name === "ProposalCreated";
            } catch {
                return false;
            }
        }
    );

    let proposalId;
    if (proposalCreatedEvent) {
        const parsed = dao.interface.parseLog(proposalCreatedEvent);
        proposalId = parsed.args[0];
    }

    // Output summary
    console.log("\n" + "=".repeat(70));
    console.log("GENESIS PROPOSAL SUBMITTED SUCCESSFULLY!");
    console.log("=".repeat(70));
    console.log(`
📜 Proposal Details:
   Title: The Genesis Proposal: Incentivizing NFT Fusion and Community Engagement
   
   Description:
   This proposal officially recognizes the strategic importance of the 
   Omnisovereign VIII and TECHANGEL Sigil NFT sets.
   
   It allocates $MIRROR from the DAO Treasury to fund:
   - Initial rewards for early NFT holders and participants in fusion events
   - Community engagement and adoption activities aligned with the ScrollVerse ethos
   
   Execution Payload:
   Upon successful proposal approval, the DAO Treasury will transfer
   ${ethers.formatEther(config.treasuryTransferAmount)} MIRROR to the distribution fund.
   
   This action validates the core functions of the DAO:
   ✓ Propose
   ✓ Vote
   ✓ Queue
   ✓ Execute

📋 Proposal Information:
   Proposal ID: ${proposalId ? proposalId.toString() : "N/A"}
   Transaction Hash: ${tx.hash}
   Block Number: ${receipt.blockNumber}
   Proposer: ${proposer.address}
   Distribution Fund: ${config.distributionFundAddress}
   Transfer Amount: ${ethers.formatEther(config.treasuryTransferAmount)} MIRROR

🗳️ Next Steps:
   1. Wait for voting delay (${await dao.votingDelay()} blocks)
   2. Cast your vote using: dao.castVote(proposalId, 1) // 1 = For
   3. After voting period ends (${await dao.votingPeriod()} blocks), queue the proposal
   4. After timelock delay, execute the proposal

🔗 View on Block Explorer:
   https://sepolia.etherscan.io/tx/${tx.hash}
`);

    // Get proposal state
    if (proposalId) {
        const state = await dao.state(proposalId);
        const stateNames = ["Pending", "Active", "Canceled", "Defeated", "Succeeded", "Queued", "Expired", "Executed"];
        console.log("Current Proposal State:", stateNames[state]);
    }

    return proposalId;
}

main()
    .then((proposalId) => {
        console.log("\n✅ Genesis Proposal submission completed successfully.");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Genesis Proposal submission failed:", error);
        process.exit(1);
    });
