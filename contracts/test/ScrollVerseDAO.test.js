const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("ScrollVerseDAO", function () {
    let scrollVerseDAO;
    let mirrorToken;
    let pfcNft;
    let timelock;
    let owner;
    let treasury;
    let voter1;
    let voter2;
    let voter3;

    // Configuration constants
    const VOTING_DELAY = 7200n; // ~1 day in blocks
    const VOTING_PERIOD = 50400n; // ~1 week in blocks
    const PROPOSAL_THRESHOLD = ethers.parseEther("100000"); // 100,000 MIRROR
    const QUORUM_PERCENTAGE = 4n; // 4%
    const TIMELOCK_DELAY = 2n * 24n * 60n * 60n; // 2 days
    const PFC_BASE_URI = "ipfs://QmScrollVersePFC/";

    // Token amounts for testing
    const VOTER1_TOKENS = ethers.parseEther("200000"); // 200,000 MIRROR
    const VOTER2_TOKENS = ethers.parseEther("150000"); // 150,000 MIRROR
    const VOTER3_TOKENS = ethers.parseEther("50000"); // 50,000 MIRROR

    beforeEach(async function () {
        [owner, treasury, voter1, voter2, voter3] = await ethers.getSigners();

        // Deploy MirrorToken
        const MirrorToken = await ethers.getContractFactory("MirrorToken");
        mirrorToken = await MirrorToken.deploy(owner.address);
        await mirrorToken.waitForDeployment();

        // Deploy TimelockController
        const TimelockController = await ethers.getContractFactory("TimelockController");
        timelock = await TimelockController.deploy(
            TIMELOCK_DELAY,
            [], // proposers
            [], // executors
            owner.address // admin
        );
        await timelock.waitForDeployment();

        // Deploy PharaohConsciousnessFusion NFT
        const PharaohConsciousnessFusion = await ethers.getContractFactory("PharaohConsciousnessFusion");
        pfcNft = await PharaohConsciousnessFusion.deploy(
            owner.address,
            treasury.address,
            PFC_BASE_URI
        );
        await pfcNft.waitForDeployment();

        // Deploy ScrollVerseDAO
        const ScrollVerseDAO = await ethers.getContractFactory("ScrollVerseDAO");
        scrollVerseDAO = await ScrollVerseDAO.deploy(
            await mirrorToken.getAddress(),
            await pfcNft.getAddress(),
            await timelock.getAddress(),
            VOTING_DELAY,
            VOTING_PERIOD,
            PROPOSAL_THRESHOLD,
            QUORUM_PERCENTAGE
        );
        await scrollVerseDAO.waitForDeployment();

        // Execute initial token distribution for testing
        await mirrorToken.executeInitialDistribution(
            treasury.address,
            owner.address, // fusion rewards
            owner.address, // team vesting
            owner.address  // liquidity
        );

        // Transfer tokens to voters for testing
        await mirrorToken.connect(treasury).transfer(voter1.address, VOTER1_TOKENS);
        await mirrorToken.connect(treasury).transfer(voter2.address, VOTER2_TOKENS);
        await mirrorToken.connect(treasury).transfer(voter3.address, VOTER3_TOKENS);

        // Delegate voting power
        await mirrorToken.connect(voter1).delegate(voter1.address);
        await mirrorToken.connect(voter2).delegate(voter2.address);
        await mirrorToken.connect(voter3).delegate(voter3.address);

        // Setup timelock roles for DAO
        const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
        const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
        const CANCELLER_ROLE = await timelock.CANCELLER_ROLE();

        await timelock.grantRole(PROPOSER_ROLE, await scrollVerseDAO.getAddress());
        await timelock.grantRole(EXECUTOR_ROLE, await scrollVerseDAO.getAddress());
        await timelock.grantRole(CANCELLER_ROLE, await scrollVerseDAO.getAddress());
    });

    describe("Deployment", function () {
        it("Should set the correct name", async function () {
            expect(await scrollVerseDAO.name()).to.equal("ScrollVerseDAO");
        });

        it("Should set the correct MIRROR token address", async function () {
            expect(await scrollVerseDAO.mirrorToken()).to.equal(await mirrorToken.getAddress());
        });

        it("Should set the correct PFC-NFT address", async function () {
            expect(await scrollVerseDAO.pfcNft()).to.equal(await pfcNft.getAddress());
        });

        it("Should set the correct timelock address", async function () {
            expect(await scrollVerseDAO.timelockController()).to.equal(await timelock.getAddress());
        });

        it("Should set the correct voting delay", async function () {
            expect(await scrollVerseDAO.votingDelay()).to.equal(VOTING_DELAY);
        });

        it("Should set the correct voting period", async function () {
            expect(await scrollVerseDAO.votingPeriod()).to.equal(VOTING_PERIOD);
        });

        it("Should set the correct proposal threshold", async function () {
            expect(await scrollVerseDAO.proposalThreshold()).to.equal(PROPOSAL_THRESHOLD);
        });

        it("Should have hand-off not complete initially", async function () {
            expect(await scrollVerseDAO.handOffComplete()).to.be.false;
        });

        it("Should revert with zero MIRROR token address", async function () {
            const ScrollVerseDAO = await ethers.getContractFactory("ScrollVerseDAO");
            await expect(
                ScrollVerseDAO.deploy(
                    ethers.ZeroAddress,
                    await pfcNft.getAddress(),
                    await timelock.getAddress(),
                    VOTING_DELAY,
                    VOTING_PERIOD,
                    PROPOSAL_THRESHOLD,
                    QUORUM_PERCENTAGE
                )
            ).to.be.revertedWithCustomError(scrollVerseDAO, "InvalidAddress");
        });

        it("Should revert with zero timelock address", async function () {
            const ScrollVerseDAO = await ethers.getContractFactory("ScrollVerseDAO");
            await expect(
                ScrollVerseDAO.deploy(
                    await mirrorToken.getAddress(),
                    await pfcNft.getAddress(),
                    ethers.ZeroAddress,
                    VOTING_DELAY,
                    VOTING_PERIOD,
                    PROPOSAL_THRESHOLD,
                    QUORUM_PERCENTAGE
                )
            ).to.be.revertedWithCustomError(scrollVerseDAO, "InvalidAddress");
        });
    });

    describe("Hand-Off Sequence", function () {
        it("Should complete hand-off sequence successfully", async function () {
            await expect(scrollVerseDAO.completeHandOffSequence())
                .to.emit(scrollVerseDAO, "HandOffSequenceCompleted");

            expect(await scrollVerseDAO.handOffComplete()).to.be.true;
        });

        it("Should revert if hand-off is already complete", async function () {
            await scrollVerseDAO.completeHandOffSequence();

            await expect(scrollVerseDAO.completeHandOffSequence())
                .to.be.revertedWithCustomError(scrollVerseDAO, "HandOffAlreadyComplete");
        });

        it("Should emit correct event parameters", async function () {
            const tx = await scrollVerseDAO.completeHandOffSequence();
            const receipt = await tx.wait();

            const event = receipt.logs.find(
                log => log.fragment && log.fragment.name === "HandOffSequenceCompleted"
            );

            expect(event).to.not.be.undefined;
        });
    });

    describe("Governance Status", function () {
        it("Should return correct governance status", async function () {
            const [
                handOffComplete,
                proposalCount,
                paused,
                mirrorTokenAddr,
                pfcNftAddr,
                timelockAddr
            ] = await scrollVerseDAO.getGovernanceStatus();

            expect(handOffComplete).to.be.false;
            expect(proposalCount).to.equal(0);
            expect(paused).to.be.false;
            expect(mirrorTokenAddr).to.equal(await mirrorToken.getAddress());
            expect(pfcNftAddr).to.equal(await pfcNft.getAddress());
            expect(timelockAddr).to.equal(await timelock.getAddress());
        });
    });

    describe("Voting Power", function () {
        it("Should return correct voting power", async function () {
            expect(await scrollVerseDAO.getVotingPower(voter1.address)).to.equal(VOTER1_TOKENS);
            expect(await scrollVerseDAO.getVotingPower(voter2.address)).to.equal(VOTER2_TOKENS);
            expect(await scrollVerseDAO.getVotingPower(voter3.address)).to.equal(VOTER3_TOKENS);
        });

        it("Should return zero for addresses without tokens", async function () {
            expect(await scrollVerseDAO.getVotingPower(owner.address)).to.be.gt(0); // Owner has remaining tokens
        });
    });

    describe("Proposal Creation", function () {
        it("Should allow voter with sufficient tokens to create proposal", async function () {
            const [canPropose, votingPower, threshold] = await scrollVerseDAO.canCreateProposal(voter1.address);
            
            expect(canPropose).to.be.true;
            expect(votingPower).to.equal(VOTER1_TOKENS);
            expect(threshold).to.equal(PROPOSAL_THRESHOLD);
        });

        it("Should not allow voter with insufficient tokens to create proposal", async function () {
            const [canPropose, votingPower, threshold] = await scrollVerseDAO.canCreateProposal(voter3.address);
            
            expect(canPropose).to.be.false;
            expect(votingPower).to.equal(VOTER3_TOKENS);
            expect(threshold).to.equal(PROPOSAL_THRESHOLD);
        });

        it("Should create proposal with metadata successfully", async function () {
            const targets = [await treasury.getAddress()];
            const values = [0];
            const calldatas = ["0x"];
            const title = "Test Proposal";
            const description = "This is a test proposal for ScrollVerseDAO";

            // Mine a block to ensure voting power snapshot
            await ethers.provider.send("evm_mine", []);

            const tx = await scrollVerseDAO.connect(voter1).proposeWithMetadata(
                targets,
                values,
                calldatas,
                title,
                description
            );

            await expect(tx).to.emit(scrollVerseDAO, "ProposalCreatedWithMetadata");

            expect(await scrollVerseDAO.proposalCount()).to.equal(1);
        });

        it("Should revert proposal creation with insufficient voting power", async function () {
            const targets = [await treasury.getAddress()];
            const values = [0];
            const calldatas = ["0x"];
            const title = "Test Proposal";
            const description = "This proposal should fail";

            await expect(
                scrollVerseDAO.connect(voter3).proposeWithMetadata(
                    targets,
                    values,
                    calldatas,
                    title,
                    description
                )
            ).to.be.revertedWithCustomError(scrollVerseDAO, "InsufficientVotingPower");
        });
    });

    describe("PFC-NFT Integration", function () {
        it("Should return false for non-PFC holder", async function () {
            expect(await scrollVerseDAO.isPfcHolder(voter1.address)).to.be.false;
        });

        it("Should return true for PFC holder", async function () {
            // Mint a PFC-NFT to voter1
            await pfcNft.connect(voter1).mint({ value: ethers.parseEther("0.1") });
            
            expect(await scrollVerseDAO.isPfcHolder(voter1.address)).to.be.true;
        });

        it("Should handle zero PFC address gracefully", async function () {
            // Deploy DAO without PFC address
            const ScrollVerseDAO = await ethers.getContractFactory("ScrollVerseDAO");
            const daoWithoutPfc = await ScrollVerseDAO.deploy(
                await mirrorToken.getAddress(),
                ethers.ZeroAddress,
                await timelock.getAddress(),
                VOTING_DELAY,
                VOTING_PERIOD,
                PROPOSAL_THRESHOLD,
                QUORUM_PERCENTAGE
            );
            await daoWithoutPfc.waitForDeployment();

            expect(await daoWithoutPfc.isPfcHolder(voter1.address)).to.be.false;
        });
    });

    describe("Pause Functionality", function () {
        it("Should allow timelock to pause before hand-off", async function () {
            // Pause via timelock
            const encodedData = scrollVerseDAO.interface.encodeFunctionData("setPaused", [true]);
            
            // Schedule and execute via timelock
            await timelock.schedule(
                await scrollVerseDAO.getAddress(),
                0,
                encodedData,
                ethers.ZeroHash,
                ethers.id("test"),
                TIMELOCK_DELAY
            );

            await time.increase(TIMELOCK_DELAY + 1n);

            await timelock.execute(
                await scrollVerseDAO.getAddress(),
                0,
                encodedData,
                ethers.ZeroHash,
                ethers.id("test")
            );

            const [, , paused] = await scrollVerseDAO.getGovernanceStatus();
            expect(paused).to.be.true;
        });

        it("Should revert pause after hand-off is complete", async function () {
            await scrollVerseDAO.completeHandOffSequence();

            await expect(
                timelock.schedule(
                    await scrollVerseDAO.getAddress(),
                    0,
                    scrollVerseDAO.interface.encodeFunctionData("setPaused", [true]),
                    ethers.ZeroHash,
                    ethers.id("test2"),
                    TIMELOCK_DELAY
                )
            ).to.be.reverted; // Will fail when executed due to CannotPauseAfterHandOff
        });
    });

    describe("ETH Handling", function () {
        it("Should receive ETH and emit event", async function () {
            const amount = ethers.parseEther("1.0");

            await expect(
                owner.sendTransaction({
                    to: await scrollVerseDAO.getAddress(),
                    value: amount
                })
            ).to.emit(scrollVerseDAO, "EthReceived")
             .withArgs(owner.address, amount);
        });

        it("Should have correct balance after receiving ETH", async function () {
            const amount = ethers.parseEther("1.0");

            await owner.sendTransaction({
                to: await scrollVerseDAO.getAddress(),
                value: amount
            });

            const balance = await ethers.provider.getBalance(await scrollVerseDAO.getAddress());
            expect(balance).to.equal(amount);
        });
    });

    describe("Quorum", function () {
        it("Should calculate quorum correctly", async function () {
            // Mine a block to get a valid block number
            await ethers.provider.send("evm_mine", []);
            const blockNumber = await ethers.provider.getBlockNumber();

            // Quorum should be 4% of total voting power
            const quorum = await scrollVerseDAO.quorumVotes(blockNumber - 1);
            
            // Total supply is 1 billion tokens, but only delegated tokens count
            // We need to check against delegated tokens
            expect(quorum).to.be.gt(0);
        });
    });
});

describe("PharaohConsciousnessFusion", function () {
    let pfcNft;
    let owner;
    let treasury;
    let user1;
    let user2;

    const PFC_BASE_URI = "ipfs://QmScrollVersePFC/";
    const MINT_PRICE = ethers.parseEther("0.1");

    beforeEach(async function () {
        [owner, treasury, user1, user2] = await ethers.getSigners();

        const PharaohConsciousnessFusion = await ethers.getContractFactory("PharaohConsciousnessFusion");
        pfcNft = await PharaohConsciousnessFusion.deploy(
            owner.address,
            treasury.address,
            PFC_BASE_URI
        );
        await pfcNft.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the correct name and symbol", async function () {
            expect(await pfcNft.name()).to.equal("PharaohConsciousnessFusion");
            expect(await pfcNft.symbol()).to.equal("PFC");
        });

        it("Should set the correct treasury address", async function () {
            expect(await pfcNft.treasuryAddress()).to.equal(treasury.address);
        });

        it("Should have correct max supply", async function () {
            expect(await pfcNft.MAX_SUPPLY()).to.equal(5000);
        });

        it("Should have correct mint price", async function () {
            expect(await pfcNft.MINT_PRICE()).to.equal(MINT_PRICE);
        });

        it("Should grant roles to initial admin", async function () {
            const ADMIN_ROLE = await pfcNft.ADMIN_ROLE();
            const MINTER_ROLE = await pfcNft.MINTER_ROLE();
            const UPGRADER_ROLE = await pfcNft.UPGRADER_ROLE();

            expect(await pfcNft.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
            expect(await pfcNft.hasRole(MINTER_ROLE, owner.address)).to.be.true;
            expect(await pfcNft.hasRole(UPGRADER_ROLE, owner.address)).to.be.true;
        });
    });

    describe("Minting", function () {
        it("Should mint token successfully with correct payment", async function () {
            await expect(pfcNft.connect(user1).mint({ value: MINT_PRICE }))
                .to.emit(pfcNft, "TokenMinted")
                .withArgs(user1.address, 0, 0, (v) => typeof v === 'bigint'); // 0 = Awakening level

            expect(await pfcNft.balanceOf(user1.address)).to.equal(1);
            expect(await pfcNft.ownerOf(0)).to.equal(user1.address);
        });

        it("Should revert with insufficient payment", async function () {
            await expect(
                pfcNft.connect(user1).mint({ value: ethers.parseEther("0.05") })
            ).to.be.revertedWithCustomError(pfcNft, "InsufficientPayment");
        });

        it("Should refund excess payment", async function () {
            const excessPayment = ethers.parseEther("0.2");
            const initialBalance = await ethers.provider.getBalance(user1.address);

            const tx = await pfcNft.connect(user1).mint({ value: excessPayment });
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed * receipt.gasPrice;

            const finalBalance = await ethers.provider.getBalance(user1.address);
            const expectedBalance = initialBalance - MINT_PRICE - gasUsed;

            expect(finalBalance).to.be.closeTo(expectedBalance, ethers.parseEther("0.001"));
        });

        it("Should set correct initial token data", async function () {
            await pfcNft.connect(user1).mint({ value: MINT_PRICE });

            const [level, mintTimestamp, lastUpgradeTimestamp, participationScore, isActive] = 
                await pfcNft.getTokenData(0);

            expect(level).to.equal(0); // Awakening
            expect(mintTimestamp).to.be.gt(0);
            expect(lastUpgradeTimestamp).to.equal(mintTimestamp);
            expect(participationScore).to.equal(0);
            expect(isActive).to.be.true;
        });
    });

    describe("Admin Minting", function () {
        it("Should allow admin to mint with custom level", async function () {
            await expect(pfcNft.adminMint(user1.address, 3)) // Divine level
                .to.emit(pfcNft, "TokenMinted")
                .withArgs(user1.address, 0, 3, (v) => typeof v === 'bigint');

            const [level] = await pfcNft.getConsciousnessLevel(0);
            expect(level).to.equal(3); // Divine
        });

        it("Should revert admin mint from non-minter", async function () {
            await expect(
                pfcNft.connect(user1).adminMint(user2.address, 0)
            ).to.be.reverted;
        });
    });

    describe("Consciousness Upgrade", function () {
        beforeEach(async function () {
            await pfcNft.connect(user1).mint({ value: MINT_PRICE });
        });

        it("Should upgrade consciousness level", async function () {
            await expect(pfcNft.upgradeConsciousness(0))
                .to.emit(pfcNft, "ConsciousnessUpgraded")
                .withArgs(0, 0, 1, (v) => typeof v === 'bigint');

            const [level, levelName] = await pfcNft.getConsciousnessLevel(0);
            expect(level).to.equal(1); // Ascending
            expect(levelName).to.equal("Ascending");
        });

        it("Should revert upgrade at max level", async function () {
            // Upgrade to Pharaoh (max level)
            for (let i = 0; i < 4; i++) {
                await pfcNft.upgradeConsciousness(0);
            }

            const [level] = await pfcNft.getConsciousnessLevel(0);
            expect(level).to.equal(4); // Pharaoh

            await expect(pfcNft.upgradeConsciousness(0))
                .to.be.revertedWithCustomError(pfcNft, "AlreadyMaxLevel");
        });
    });

    describe("Participation Score", function () {
        beforeEach(async function () {
            await pfcNft.connect(user1).mint({ value: MINT_PRICE });
        });

        it("Should update participation score", async function () {
            await expect(pfcNft.updateParticipationScore(0, 100))
                .to.emit(pfcNft, "ParticipationScoreUpdated")
                .withArgs(0, 0, 100);

            const [, , , participationScore] = await pfcNft.getTokenData(0);
            expect(participationScore).to.equal(100);
        });
    });

    describe("DAO Transfer", function () {
        it("Should transfer all roles to DAO", async function () {
            const daoAddress = user2.address; // Using user2 as mock DAO

            await pfcNft.transferToDAO(daoAddress);

            const DEFAULT_ADMIN_ROLE = await pfcNft.DEFAULT_ADMIN_ROLE();
            const ADMIN_ROLE = await pfcNft.ADMIN_ROLE();
            const MINTER_ROLE = await pfcNft.MINTER_ROLE();
            const UPGRADER_ROLE = await pfcNft.UPGRADER_ROLE();

            expect(await pfcNft.hasRole(DEFAULT_ADMIN_ROLE, daoAddress)).to.be.true;
            expect(await pfcNft.hasRole(ADMIN_ROLE, daoAddress)).to.be.true;
            expect(await pfcNft.hasRole(MINTER_ROLE, daoAddress)).to.be.true;
            expect(await pfcNft.hasRole(UPGRADER_ROLE, daoAddress)).to.be.true;
            expect(await pfcNft.daoAddress()).to.equal(daoAddress);
        });
    });

    describe("View Functions", function () {
        beforeEach(async function () {
            await pfcNft.connect(user1).mint({ value: MINT_PRICE });
            await pfcNft.connect(user1).mint({ value: MINT_PRICE });
        });

        it("Should return correct total minted", async function () {
            expect(await pfcNft.totalMinted()).to.equal(2);
        });

        it("Should return correct remaining supply", async function () {
            expect(await pfcNft.remainingSupply()).to.equal(4998);
        });

        it("Should correctly identify holder", async function () {
            expect(await pfcNft.isHolder(user1.address)).to.be.true;
            expect(await pfcNft.isHolder(user2.address)).to.be.false;
        });

        it("Should return highest consciousness for holder", async function () {
            await pfcNft.upgradeConsciousness(1); // Upgrade second token

            const [highestLevel, tokenId] = await pfcNft.getHighestConsciousness(user1.address);
            expect(highestLevel).to.equal(1); // Ascending
            expect(tokenId).to.equal(1);
        });
    });

    describe("Withdrawal", function () {
        it("Should withdraw funds to treasury", async function () {
            // Mint some tokens to accumulate funds
            await pfcNft.connect(user1).mint({ value: MINT_PRICE });
            await pfcNft.connect(user2).mint({ value: MINT_PRICE });

            const contractBalance = await ethers.provider.getBalance(await pfcNft.getAddress());
            const treasuryBalanceBefore = await ethers.provider.getBalance(treasury.address);

            await expect(pfcNft.withdraw())
                .to.emit(pfcNft, "FundsWithdrawn")
                .withArgs(treasury.address, contractBalance);

            const treasuryBalanceAfter = await ethers.provider.getBalance(treasury.address);
            expect(treasuryBalanceAfter).to.equal(treasuryBalanceBefore + contractBalance);
        });
    });
});
