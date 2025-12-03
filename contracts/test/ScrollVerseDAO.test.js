const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("ScrollVerseDAO", function () {
    let mirrorToken;
    let timelock;
    let dao;
    let owner;
    let treasury;
    let fusionRewards;
    let teamVesting;
    let liquidity;
    let distributionFund;
    let voter1;
    let voter2;

    // Constants
    const TREASURY_DAO_ALLOCATION = ethers.parseEther("400000000"); // 400 million (40%)
    const PROPOSAL_THRESHOLD = ethers.parseEther("100000"); // 100k tokens to propose
    const VOTING_DELAY = 1; // 1 block
    const VOTING_PERIOD = 50400; // ~1 week
    const MIN_DELAY = 3600; // 1 hour timelock delay

    beforeEach(async function () {
        [owner, treasury, fusionRewards, teamVesting, liquidity, distributionFund, voter1, voter2] = await ethers.getSigners();

        // Deploy MirrorToken
        const MirrorToken = await ethers.getContractFactory("MirrorToken");
        mirrorToken = await MirrorToken.deploy(owner.address);
        await mirrorToken.waitForDeployment();

        // Execute initial distribution
        await mirrorToken.executeInitialDistribution(
            treasury.address,
            fusionRewards.address,
            teamVesting.address,
            liquidity.address
        );

        // Deploy TimelockController
        const TimelockController = await ethers.getContractFactory("TimelockController");
        timelock = await TimelockController.deploy(
            MIN_DELAY,
            [], // proposers (will be set to DAO)
            [], // executors (will be set to DAO)
            owner.address // admin
        );
        await timelock.waitForDeployment();

        // Deploy ScrollVerseDAO
        const ScrollVerseDAO = await ethers.getContractFactory("ScrollVerseDAO");
        dao = await ScrollVerseDAO.deploy(
            await mirrorToken.getAddress(),
            await timelock.getAddress(),
            VOTING_DELAY,
            VOTING_PERIOD
        );
        await dao.waitForDeployment();

        // Setup roles for timelock
        const proposerRole = await timelock.PROPOSER_ROLE();
        const executorRole = await timelock.EXECUTOR_ROLE();
        const daoAddress = await dao.getAddress();

        await timelock.grantRole(proposerRole, daoAddress);
        await timelock.grantRole(executorRole, daoAddress);

        // Treasury delegates voting power to itself
        await mirrorToken.connect(treasury).delegate(treasury.address);
    });

    describe("Deployment", function () {
        it("Should set the correct name", async function () {
            expect(await dao.name()).to.equal("ScrollVerseDAO");
        });

        it("Should set the correct voting delay", async function () {
            expect(await dao.votingDelay()).to.equal(VOTING_DELAY);
        });

        it("Should set the correct voting period", async function () {
            expect(await dao.votingPeriod()).to.equal(VOTING_PERIOD);
        });

        it("Should set the correct proposal threshold", async function () {
            expect(await dao.proposalThreshold()).to.equal(PROPOSAL_THRESHOLD);
        });

        it("Should have zero proposals initially", async function () {
            expect(await dao.proposalCount()).to.equal(0);
        });
    });

    describe("Genesis Proposal Submission", function () {
        const transferAmount = ethers.parseEther("10000000"); // 10 million MIRROR

        it("Should submit the Genesis Proposal successfully", async function () {
            const targets = [await mirrorToken.getAddress()];
            const values = [0];
            const calldatas = [
                mirrorToken.interface.encodeFunctionData("transfer", [
                    distributionFund.address,
                    transferAmount
                ])
            ];

            const tx = await dao.connect(treasury).submitGenesisProposal(
                targets,
                values,
                calldatas,
                transferAmount,
                distributionFund.address
            );

            const receipt = await tx.wait();
            
            // Check events
            const genesisEvent = receipt.logs.find(
                log => log.fragment && log.fragment.name === "GenesisProposalSubmitted"
            );
            expect(genesisEvent).to.not.be.undefined;
            
            // Verify proposal count increased
            expect(await dao.proposalCount()).to.equal(1);
        });

        it("Should store proposal title correctly", async function () {
            const targets = [await mirrorToken.getAddress()];
            const values = [0];
            const calldatas = [
                mirrorToken.interface.encodeFunctionData("transfer", [
                    distributionFund.address,
                    transferAmount
                ])
            ];

            const tx = await dao.connect(treasury).submitGenesisProposal(
                targets,
                values,
                calldatas,
                transferAmount,
                distributionFund.address
            );

            const receipt = await tx.wait();
            const proposalCreatedEvent = receipt.logs.find(
                log => log.fragment && log.fragment.name === "ProposalCreated"
            );
            const proposalId = proposalCreatedEvent.args[0];

            const title = await dao.getProposalTitle(proposalId);
            expect(title).to.equal("The Genesis Proposal: Incentivizing NFT Fusion and Community Engagement");
        });

        it("Should emit ProposalCreatedWithMetadata event", async function () {
            const targets = [await mirrorToken.getAddress()];
            const values = [0];
            const calldatas = [
                mirrorToken.interface.encodeFunctionData("transfer", [
                    distributionFund.address,
                    transferAmount
                ])
            ];

            await expect(
                dao.connect(treasury).submitGenesisProposal(
                    targets,
                    values,
                    calldatas,
                    transferAmount,
                    distributionFund.address
                )
            ).to.emit(dao, "ProposalCreatedWithMetadata");
        });

        it("Should generate correct Genesis Proposal description", async function () {
            const description = await dao.getGenesisProposalDescription(
                transferAmount,
                distributionFund.address
            );

            expect(description).to.include("The Genesis Proposal");
            expect(description).to.include("Omnisovereign VIII");
            expect(description).to.include("TECHANGEL Sigil");
            expect(description).to.include("Propose, Vote, Queue, and Execute");
        });

        it("Should revert if proposer has insufficient voting power", async function () {
            // voter1 has no tokens
            const targets = [await mirrorToken.getAddress()];
            const values = [0];
            const calldatas = [
                mirrorToken.interface.encodeFunctionData("transfer", [
                    distributionFund.address,
                    transferAmount
                ])
            ];

            await expect(
                dao.connect(voter1).submitGenesisProposal(
                    targets,
                    values,
                    calldatas,
                    transferAmount,
                    distributionFund.address
                )
            ).to.be.revertedWithCustomError(dao, "GovernorInsufficientProposerVotes");
        });
    });

    describe("Proposal Lifecycle", function () {
        const transferAmount = ethers.parseEther("1000000"); // 1 million MIRROR

        it("Should complete the full proposal lifecycle: Propose -> Vote -> Queue -> Execute", async function () {
            // Transfer tokens to the timelock (simulating treasury)
            const timelockAddress = await timelock.getAddress();
            await mirrorToken.connect(treasury).transfer(timelockAddress, transferAmount);

            // Create proposal
            const targets = [await mirrorToken.getAddress()];
            const values = [0];
            const calldatas = [
                mirrorToken.interface.encodeFunctionData("transfer", [
                    distributionFund.address,
                    transferAmount
                ])
            ];
            const description = "Transfer MIRROR to distribution fund";

            const proposeTx = await dao.connect(treasury).proposeWithTitle(
                targets,
                values,
                calldatas,
                "Test Proposal",
                description
            );

            const proposeReceipt = await proposeTx.wait();
            const proposalCreatedEvent = proposeReceipt.logs.find(
                log => log.fragment && log.fragment.name === "ProposalCreated"
            );
            const proposalId = proposalCreatedEvent.args[0];

            // State: Pending
            expect(await dao.state(proposalId)).to.equal(0); // Pending

            // Mine a block to pass voting delay
            await ethers.provider.send("evm_mine", []);

            // State: Active
            expect(await dao.state(proposalId)).to.equal(1); // Active

            // Vote
            await dao.connect(treasury).castVote(proposalId, 1); // Vote For

            // Fast forward past voting period
            for (let i = 0; i < VOTING_PERIOD; i++) {
                await ethers.provider.send("evm_mine", []);
            }

            // State: Succeeded
            expect(await dao.state(proposalId)).to.equal(4); // Succeeded

            // Queue
            const descriptionHash = ethers.keccak256(ethers.toUtf8Bytes(description));
            await dao.queue(targets, values, calldatas, descriptionHash);

            // State: Queued
            expect(await dao.state(proposalId)).to.equal(5); // Queued

            // Fast forward past timelock delay
            await time.increase(MIN_DELAY + 1);

            // Execute
            await dao.execute(targets, values, calldatas, descriptionHash);

            // State: Executed
            expect(await dao.state(proposalId)).to.equal(7); // Executed

            // Verify the transfer happened
            expect(await mirrorToken.balanceOf(distributionFund.address)).to.equal(transferAmount);
        });

        it("Should allow voting on proposals", async function () {
            // Create a proposal
            const targets = [await mirrorToken.getAddress()];
            const values = [0];
            const calldatas = [
                mirrorToken.interface.encodeFunctionData("transfer", [
                    distributionFund.address,
                    transferAmount
                ])
            ];

            const tx = await dao.connect(treasury).submitGenesisProposal(
                targets,
                values,
                calldatas,
                transferAmount,
                distributionFund.address
            );

            const receipt = await tx.wait();
            const proposalCreatedEvent = receipt.logs.find(
                log => log.fragment && log.fragment.name === "ProposalCreated"
            );
            const proposalId = proposalCreatedEvent.args[0];

            // Mine a block to pass voting delay
            await ethers.provider.send("evm_mine", []);

            // Cast vote
            await expect(
                dao.connect(treasury).castVote(proposalId, 1) // 1 = For
            ).to.emit(dao, "VoteCast");

            // Check vote was recorded
            expect(await dao.hasVoted(proposalId, treasury.address)).to.be.true;
        });
    });

    describe("proposeWithTitle", function () {
        it("Should create proposal with custom title", async function () {
            const targets = [await mirrorToken.getAddress()];
            const values = [0];
            const calldatas = [
                mirrorToken.interface.encodeFunctionData("transfer", [
                    distributionFund.address,
                    ethers.parseEther("1000")
                ])
            ];
            const title = "Custom Proposal Title";
            const description = "Custom proposal description";

            const tx = await dao.connect(treasury).proposeWithTitle(
                targets,
                values,
                calldatas,
                title,
                description
            );

            const receipt = await tx.wait();
            const proposalCreatedEvent = receipt.logs.find(
                log => log.fragment && log.fragment.name === "ProposalCreated"
            );
            const proposalId = proposalCreatedEvent.args[0];

            expect(await dao.getProposalTitle(proposalId)).to.equal(title);
            expect(await dao.proposalCount()).to.equal(1);
        });

        it("Should emit ProposalCreatedWithMetadata event", async function () {
            const targets = [await mirrorToken.getAddress()];
            const values = [0];
            const calldatas = [
                mirrorToken.interface.encodeFunctionData("transfer", [
                    distributionFund.address,
                    ethers.parseEther("1000")
                ])
            ];
            const title = "Test Proposal";
            const description = "Test description";

            await expect(
                dao.connect(treasury).proposeWithTitle(
                    targets,
                    values,
                    calldatas,
                    title,
                    description
                )
            ).to.emit(dao, "ProposalCreatedWithMetadata");
        });
    });

    describe("View Functions", function () {
        it("Should return quorum correctly", async function () {
            const currentBlock = await ethers.provider.getBlockNumber();
            // Need to query a past block
            await ethers.provider.send("evm_mine", []);
            
            const quorum = await dao.quorum(currentBlock);
            // 4% of total voting power
            const expectedQuorum = TREASURY_DAO_ALLOCATION * 4n / 100n;
            expect(quorum).to.equal(expectedQuorum);
        });

        it("Should return empty title for non-existent proposal", async function () {
            const title = await dao.getProposalTitle(12345);
            expect(title).to.equal("");
        });

        it("Should return zero hash for non-existent proposal description", async function () {
            const hash = await dao.getProposalDescriptionHash(12345);
            expect(hash).to.equal(ethers.ZeroHash);
        });
    });
});
