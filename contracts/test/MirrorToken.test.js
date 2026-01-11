const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MirrorToken", function () {
    let mirrorToken;
    let owner;
    let treasury;
    let fusionRewards;
    let teamVesting;
    let liquidity;
    let addr1;
    let addr2;

    // Constants matching the contract
    const MAX_SUPPLY = ethers.parseEther("1000000000"); // 1 billion tokens
    const TREASURY_DAO_ALLOCATION = ethers.parseEther("400000000"); // 400 million (40%)
    const FUSION_REWARDS_ALLOCATION = ethers.parseEther("350000000"); // 350 million (35%)
    const TEAM_ALLOCATION = ethers.parseEther("150000000"); // 150 million (15%)
    const LIQUIDITY_ALLOCATION = ethers.parseEther("100000000"); // 100 million (10%)

    beforeEach(async function () {
        [owner, treasury, fusionRewards, teamVesting, liquidity, addr1, addr2] = await ethers.getSigners();

        const MirrorToken = await ethers.getContractFactory("MirrorToken");
        mirrorToken = await MirrorToken.deploy(owner.address);
        await mirrorToken.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the correct name and symbol", async function () {
            expect(await mirrorToken.name()).to.equal("Mirror Token");
            expect(await mirrorToken.symbol()).to.equal("MIRROR");
        });

        it("Should set the correct owner", async function () {
            expect(await mirrorToken.owner()).to.equal(owner.address);
        });

        it("Should have zero total supply before distribution", async function () {
            expect(await mirrorToken.totalSupply()).to.equal(0);
        });

        it("Should have the correct cap set", async function () {
            expect(await mirrorToken.cap()).to.equal(MAX_SUPPLY);
        });

        it("Should have initial distribution flag set to false", async function () {
            expect(await mirrorToken.initialDistributionDone()).to.be.false;
        });

        it("Should revert deployment with zero address owner", async function () {
            const MirrorToken = await ethers.getContractFactory("MirrorToken");
            await expect(
                MirrorToken.deploy(ethers.ZeroAddress)
            ).to.be.revertedWithCustomError(mirrorToken, "ZeroAddress");
        });
    });

    describe("Initial Distribution", function () {
        it("Should execute initial distribution correctly", async function () {
            await mirrorToken.executeInitialDistribution(
                treasury.address,
                fusionRewards.address,
                teamVesting.address,
                liquidity.address
            );

            // Check balances
            expect(await mirrorToken.balanceOf(treasury.address)).to.equal(TREASURY_DAO_ALLOCATION);
            expect(await mirrorToken.balanceOf(fusionRewards.address)).to.equal(FUSION_REWARDS_ALLOCATION);
            expect(await mirrorToken.balanceOf(teamVesting.address)).to.equal(TEAM_ALLOCATION);
            expect(await mirrorToken.balanceOf(liquidity.address)).to.equal(LIQUIDITY_ALLOCATION);

            // Check total supply equals max supply
            expect(await mirrorToken.totalSupply()).to.equal(MAX_SUPPLY);
        });

        it("Should emit InitialDistributionCompleted event", async function () {
            await expect(
                mirrorToken.executeInitialDistribution(
                    treasury.address,
                    fusionRewards.address,
                    teamVesting.address,
                    liquidity.address
                )
            ).to.emit(mirrorToken, "InitialDistributionCompleted")
             .withArgs(
                treasury.address,
                fusionRewards.address,
                teamVesting.address,
                liquidity.address,
                await ethers.provider.getBlock('latest').then(b => b.timestamp + 1) // approximate
             );
        });

        it("Should store allocation addresses correctly", async function () {
            await mirrorToken.executeInitialDistribution(
                treasury.address,
                fusionRewards.address,
                teamVesting.address,
                liquidity.address
            );

            const [treasuryAddr, fusionAddr, vestingAddr, liquidityAddr] = await mirrorToken.getAllocationAddresses();
            expect(treasuryAddr).to.equal(treasury.address);
            expect(fusionAddr).to.equal(fusionRewards.address);
            expect(vestingAddr).to.equal(teamVesting.address);
            expect(liquidityAddr).to.equal(liquidity.address);
        });

        it("Should set initialDistributionDone flag to true", async function () {
            await mirrorToken.executeInitialDistribution(
                treasury.address,
                fusionRewards.address,
                teamVesting.address,
                liquidity.address
            );

            expect(await mirrorToken.initialDistributionDone()).to.be.true;
        });

        it("Should revert if distribution is called twice", async function () {
            await mirrorToken.executeInitialDistribution(
                treasury.address,
                fusionRewards.address,
                teamVesting.address,
                liquidity.address
            );

            await expect(
                mirrorToken.executeInitialDistribution(
                    treasury.address,
                    fusionRewards.address,
                    teamVesting.address,
                    liquidity.address
                )
            ).to.be.revertedWithCustomError(mirrorToken, "DistributionAlreadyDone");
        });

        it("Should revert with zero treasury address", async function () {
            await expect(
                mirrorToken.executeInitialDistribution(
                    ethers.ZeroAddress,
                    fusionRewards.address,
                    teamVesting.address,
                    liquidity.address
                )
            ).to.be.revertedWithCustomError(mirrorToken, "ZeroAddress");
        });

        it("Should revert with zero fusion rewards address", async function () {
            await expect(
                mirrorToken.executeInitialDistribution(
                    treasury.address,
                    ethers.ZeroAddress,
                    teamVesting.address,
                    liquidity.address
                )
            ).to.be.revertedWithCustomError(mirrorToken, "ZeroAddress");
        });

        it("Should revert with zero team vesting address", async function () {
            await expect(
                mirrorToken.executeInitialDistribution(
                    treasury.address,
                    fusionRewards.address,
                    ethers.ZeroAddress,
                    liquidity.address
                )
            ).to.be.revertedWithCustomError(mirrorToken, "ZeroAddress");
        });

        it("Should revert with zero liquidity address", async function () {
            await expect(
                mirrorToken.executeInitialDistribution(
                    treasury.address,
                    fusionRewards.address,
                    teamVesting.address,
                    ethers.ZeroAddress
                )
            ).to.be.revertedWithCustomError(mirrorToken, "ZeroAddress");
        });

        it("Should revert if non-owner tries to execute distribution", async function () {
            await expect(
                mirrorToken.connect(addr1).executeInitialDistribution(
                    treasury.address,
                    fusionRewards.address,
                    teamVesting.address,
                    liquidity.address
                )
            ).to.be.revertedWithCustomError(mirrorToken, "OwnableUnauthorizedAccount");
        });
    });

    describe("Capped Supply", function () {
        it("Should confirm supply is capped after distribution", async function () {
            await mirrorToken.executeInitialDistribution(
                treasury.address,
                fusionRewards.address,
                teamVesting.address,
                liquidity.address
            );

            expect(await mirrorToken.isSupplyCapped()).to.be.true;
        });

        it("Should return correct allocation amounts", async function () {
            const [treasuryAmount, fusionAmount, teamAmount, liquidityAmount] = await mirrorToken.getAllocationAmounts();
            
            expect(treasuryAmount).to.equal(TREASURY_DAO_ALLOCATION);
            expect(fusionAmount).to.equal(FUSION_REWARDS_ALLOCATION);
            expect(teamAmount).to.equal(TEAM_ALLOCATION);
            expect(liquidityAmount).to.equal(LIQUIDITY_ALLOCATION);
        });
    });

    describe("ERC20Votes - Governance", function () {
        beforeEach(async function () {
            // Execute initial distribution first
            await mirrorToken.executeInitialDistribution(
                treasury.address,
                fusionRewards.address,
                teamVesting.address,
                liquidity.address
            );
        });

        it("Should have zero voting power before delegation", async function () {
            expect(await mirrorToken.getVotes(treasury.address)).to.equal(0);
        });

        it("Should allow self-delegation to activate voting power", async function () {
            await mirrorToken.connect(treasury).delegate(treasury.address);
            expect(await mirrorToken.getVotes(treasury.address)).to.equal(TREASURY_DAO_ALLOCATION);
        });

        it("Should allow delegation to another address", async function () {
            await mirrorToken.connect(treasury).delegate(addr1.address);
            expect(await mirrorToken.getVotes(addr1.address)).to.equal(TREASURY_DAO_ALLOCATION);
            expect(await mirrorToken.getVotes(treasury.address)).to.equal(0);
        });

        it("Should emit VotingPowerDelegated event via delegateVotingPower", async function () {
            await expect(
                mirrorToken.connect(treasury).delegateVotingPower(addr1.address)
            ).to.emit(mirrorToken, "VotingPowerDelegated")
             .withArgs(treasury.address, ethers.ZeroAddress, addr1.address);
        });

        it("Should return correct voting power through getVotingPower", async function () {
            await mirrorToken.connect(treasury).delegate(treasury.address);
            expect(await mirrorToken.getVotingPower(treasury.address)).to.equal(TREASURY_DAO_ALLOCATION);
        });

        it("Should track voting power changes after transfers", async function () {
            // Treasury delegates to itself
            await mirrorToken.connect(treasury).delegate(treasury.address);
            expect(await mirrorToken.getVotes(treasury.address)).to.equal(TREASURY_DAO_ALLOCATION);

            // Transfer some tokens to addr1
            const transferAmount = ethers.parseEther("1000000");
            await mirrorToken.connect(treasury).transfer(addr1.address, transferAmount);

            // Treasury voting power should decrease
            expect(await mirrorToken.getVotes(treasury.address)).to.equal(TREASURY_DAO_ALLOCATION - transferAmount);

            // addr1 needs to delegate to activate voting power
            await mirrorToken.connect(addr1).delegate(addr1.address);
            expect(await mirrorToken.getVotes(addr1.address)).to.equal(transferAmount);
        });

        it("Should support getPastVotingPower for historical queries", async function () {
            // Delegate
            await mirrorToken.connect(treasury).delegate(treasury.address);
            
            // Mine a block
            await ethers.provider.send("evm_mine", []);
            
            // Get past block number
            const currentBlock = await ethers.provider.getBlockNumber();
            
            // Query historical voting power
            const pastVotes = await mirrorToken.getPastVotingPower(treasury.address, currentBlock - 1);
            expect(pastVotes).to.equal(TREASURY_DAO_ALLOCATION);
        });
    });

    describe("ERC20Permit - Gasless Approvals", function () {
        beforeEach(async function () {
            await mirrorToken.executeInitialDistribution(
                treasury.address,
                fusionRewards.address,
                teamVesting.address,
                liquidity.address
            );
        });

        it("Should return correct DOMAIN_SEPARATOR", async function () {
            const domainSeparator = await mirrorToken.DOMAIN_SEPARATOR();
            expect(domainSeparator).to.not.equal(ethers.ZeroHash);
        });

        it("Should track nonces correctly", async function () {
            expect(await mirrorToken.nonces(treasury.address)).to.equal(0);
        });
    });

    describe("Standard ERC20 Functions", function () {
        beforeEach(async function () {
            await mirrorToken.executeInitialDistribution(
                treasury.address,
                fusionRewards.address,
                teamVesting.address,
                liquidity.address
            );
        });

        it("Should transfer tokens correctly", async function () {
            const amount = ethers.parseEther("1000");
            await mirrorToken.connect(treasury).transfer(addr1.address, amount);
            expect(await mirrorToken.balanceOf(addr1.address)).to.equal(amount);
        });

        it("Should approve and transferFrom correctly", async function () {
            const amount = ethers.parseEther("1000");
            await mirrorToken.connect(treasury).approve(addr1.address, amount);
            
            expect(await mirrorToken.allowance(treasury.address, addr1.address)).to.equal(amount);
            
            await mirrorToken.connect(addr1).transferFrom(treasury.address, addr2.address, amount);
            expect(await mirrorToken.balanceOf(addr2.address)).to.equal(amount);
        });

        it("Should return 18 decimals", async function () {
            expect(await mirrorToken.decimals()).to.equal(18);
        });
    });
});
