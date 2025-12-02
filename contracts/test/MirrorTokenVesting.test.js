const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("MirrorTokenVesting", function () {
    let mirrorToken;
    let vestingContract;
    let owner;
    let beneficiary;
    let treasury;
    let fusionRewards;
    let liquidity;
    let addr1;

    // Constants
    const TEAM_ALLOCATION = ethers.parseEther("150000000"); // 150 million tokens
    const ONE_YEAR = 365 * 24 * 60 * 60; // 1 year in seconds
    const TWO_YEARS = 2 * ONE_YEAR;
    const THREE_YEARS = 3 * ONE_YEAR;

    beforeEach(async function () {
        [owner, beneficiary, treasury, fusionRewards, liquidity, addr1] = await ethers.getSigners();

        // Deploy MirrorToken
        const MirrorToken = await ethers.getContractFactory("MirrorToken");
        mirrorToken = await MirrorToken.deploy(owner.address);
        await mirrorToken.waitForDeployment();

        // Deploy MirrorTokenVesting
        const MirrorTokenVesting = await ethers.getContractFactory("MirrorTokenVesting");
        vestingContract = await MirrorTokenVesting.deploy(
            await mirrorToken.getAddress(),
            owner.address
        );
        await vestingContract.waitForDeployment();

        // Execute initial distribution (team tokens go to vesting contract)
        await mirrorToken.executeInitialDistribution(
            treasury.address,
            fusionRewards.address,
            await vestingContract.getAddress(),
            liquidity.address
        );

        // Initialize vesting
        await vestingContract.initializeVesting(beneficiary.address, TEAM_ALLOCATION);
    });

    describe("Deployment", function () {
        it("Should set the correct token address", async function () {
            expect(await vestingContract.token()).to.equal(await mirrorToken.getAddress());
        });

        it("Should set the correct owner", async function () {
            expect(await vestingContract.owner()).to.equal(owner.address);
        });

        it("Should revert deployment with zero token address", async function () {
            const MirrorTokenVesting = await ethers.getContractFactory("MirrorTokenVesting");
            await expect(
                MirrorTokenVesting.deploy(ethers.ZeroAddress, owner.address)
            ).to.be.revertedWithCustomError(vestingContract, "ZeroAddress");
        });
    });

    describe("Vesting Initialization", function () {
        it("Should initialize vesting correctly", async function () {
            expect(await vestingContract.vestingInitialized()).to.be.true;
            expect(await vestingContract.beneficiary()).to.equal(beneficiary.address);
            expect(await vestingContract.totalAllocation()).to.equal(TEAM_ALLOCATION);
        });

        it("Should emit VestingInitialized event", async function () {
            // Deploy new vesting contract for this test
            const MirrorTokenVesting = await ethers.getContractFactory("MirrorTokenVesting");
            const newVestingContract = await MirrorTokenVesting.deploy(
                await mirrorToken.getAddress(),
                owner.address
            );

            await expect(
                newVestingContract.initializeVesting(beneficiary.address, TEAM_ALLOCATION)
            ).to.emit(newVestingContract, "VestingInitialized");
        });

        it("Should set correct cliff and vesting end timestamps", async function () {
            const vestingStart = await vestingContract.vestingStart();
            const cliffEnd = await vestingContract.cliffEnd();
            const vestingEnd = await vestingContract.vestingEnd();

            expect(cliffEnd).to.equal(vestingStart + BigInt(ONE_YEAR));
            expect(vestingEnd).to.equal(vestingStart + BigInt(THREE_YEARS));
        });

        it("Should revert if already initialized", async function () {
            await expect(
                vestingContract.initializeVesting(beneficiary.address, TEAM_ALLOCATION)
            ).to.be.revertedWithCustomError(vestingContract, "VestingAlreadyInitialized");
        });

        it("Should revert with zero beneficiary address", async function () {
            const MirrorTokenVesting = await ethers.getContractFactory("MirrorTokenVesting");
            const newVestingContract = await MirrorTokenVesting.deploy(
                await mirrorToken.getAddress(),
                owner.address
            );

            await expect(
                newVestingContract.initializeVesting(ethers.ZeroAddress, TEAM_ALLOCATION)
            ).to.be.revertedWithCustomError(newVestingContract, "ZeroAddress");
        });

        it("Should revert with zero allocation", async function () {
            const MirrorTokenVesting = await ethers.getContractFactory("MirrorTokenVesting");
            const newVestingContract = await MirrorTokenVesting.deploy(
                await mirrorToken.getAddress(),
                owner.address
            );

            await expect(
                newVestingContract.initializeVesting(beneficiary.address, 0)
            ).to.be.revertedWithCustomError(newVestingContract, "ZeroAmount");
        });

        it("Should revert if non-owner tries to initialize", async function () {
            const MirrorTokenVesting = await ethers.getContractFactory("MirrorTokenVesting");
            const newVestingContract = await MirrorTokenVesting.deploy(
                await mirrorToken.getAddress(),
                owner.address
            );

            await expect(
                newVestingContract.connect(addr1).initializeVesting(beneficiary.address, TEAM_ALLOCATION)
            ).to.be.revertedWithCustomError(newVestingContract, "OwnableUnauthorizedAccount");
        });
    });

    describe("Cliff Period", function () {
        it("Should not allow release before cliff", async function () {
            // Try to release immediately (before cliff)
            await expect(
                vestingContract.release()
            ).to.be.revertedWithCustomError(vestingContract, "CliffNotReached");
        });

        it("Should return correct time until cliff", async function () {
            const timeUntilCliff = await vestingContract.getTimeUntilCliff();
            // Should be close to ONE_YEAR (minus a few seconds for block time)
            expect(timeUntilCliff).to.be.closeTo(BigInt(ONE_YEAR), BigInt(10));
        });

        it("Should show cliff not passed initially", async function () {
            expect(await vestingContract.isCliffPassed()).to.be.false;
        });

        it("Should show zero vested amount before cliff", async function () {
            expect(await vestingContract.getVestedAmount()).to.equal(0);
        });

        it("Should show full allocation as locked before cliff", async function () {
            expect(await vestingContract.getLockedAmount()).to.equal(TEAM_ALLOCATION);
        });

        it("Should show zero releasable before cliff", async function () {
            expect(await vestingContract.getReleasableAmount()).to.equal(0);
        });
    });

    describe("After Cliff - Linear Vesting", function () {
        beforeEach(async function () {
            // Fast forward past cliff (1 year + 1 second)
            await time.increase(ONE_YEAR + 1);
        });

        it("Should show cliff passed after 1 year", async function () {
            expect(await vestingContract.isCliffPassed()).to.be.true;
        });

        it("Should return 0 for time until cliff after cliff passes", async function () {
            expect(await vestingContract.getTimeUntilCliff()).to.equal(0);
        });

        it("Should have small vested amount right after cliff", async function () {
            const vestedAmount = await vestingContract.getVestedAmount();
            // Right after cliff, only 1 second worth of vesting
            expect(vestedAmount).to.be.lt(TEAM_ALLOCATION);
            expect(vestedAmount).to.be.gt(0);
        });

        it("Should allow partial release after cliff", async function () {
            const releasableAmount = await vestingContract.getReleasableAmount();
            expect(releasableAmount).to.be.gt(0);

            await vestingContract.release();
            expect(await vestingContract.totalReleased()).to.equal(releasableAmount);
        });

        it("Should emit TokensReleased event", async function () {
            await expect(vestingContract.release())
                .to.emit(vestingContract, "TokensReleased");
        });

        it("Should transfer tokens to beneficiary on release", async function () {
            const balanceBefore = await mirrorToken.balanceOf(beneficiary.address);
            const releasable = await vestingContract.getReleasableAmount();
            
            await vestingContract.release();
            
            const balanceAfter = await mirrorToken.balanceOf(beneficiary.address);
            expect(balanceAfter - balanceBefore).to.equal(releasable);
        });

        it("Should vest 50% at halfway point (1 year after cliff)", async function () {
            // Fast forward 1 more year (50% of linear vesting period)
            await time.increase(ONE_YEAR);
            
            const vestedAmount = await vestingContract.getVestedAmount();
            // Should be approximately 50% of total (allowing for small time discrepancies)
            const expectedVested = TEAM_ALLOCATION / BigInt(2);
            expect(vestedAmount).to.be.closeTo(expectedVested, ethers.parseEther("1000"));
        });

        it("Should vest 100% at end of vesting period", async function () {
            // Fast forward 2 more years (to complete the 3-year total vesting)
            await time.increase(TWO_YEARS);
            
            const vestedAmount = await vestingContract.getVestedAmount();
            expect(vestedAmount).to.equal(TEAM_ALLOCATION);
        });

        it("Should allow anyone to trigger release", async function () {
            // Any address can call release, tokens go to beneficiary
            await vestingContract.connect(addr1).release();
            expect(await vestingContract.totalReleased()).to.be.gt(0);
        });
    });

    describe("Full Vesting Complete", function () {
        beforeEach(async function () {
            // Fast forward past full vesting period (3 years + 1 second)
            await time.increase(THREE_YEARS + 1);
        });

        it("Should show vesting complete", async function () {
            expect(await vestingContract.isVestingComplete()).to.be.true;
        });

        it("Should return 0 for time until vesting end", async function () {
            expect(await vestingContract.getTimeUntilVestingEnd()).to.equal(0);
        });

        it("Should have full allocation vested", async function () {
            expect(await vestingContract.getVestedAmount()).to.equal(TEAM_ALLOCATION);
        });

        it("Should have zero locked tokens", async function () {
            expect(await vestingContract.getLockedAmount()).to.equal(0);
        });

        it("Should release all remaining tokens", async function () {
            await vestingContract.release();
            
            expect(await vestingContract.totalReleased()).to.equal(TEAM_ALLOCATION);
            expect(await vestingContract.getReleasableAmount()).to.equal(0);
            expect(await mirrorToken.balanceOf(beneficiary.address)).to.equal(TEAM_ALLOCATION);
        });

        it("Should revert if trying to release with nothing available", async function () {
            await vestingContract.release();
            
            await expect(vestingContract.release())
                .to.be.revertedWithCustomError(vestingContract, "NoTokensAvailable");
        });
    });

    describe("Beneficiary Management", function () {
        it("Should allow owner to change beneficiary", async function () {
            await vestingContract.changeBeneficiary(addr1.address);
            expect(await vestingContract.beneficiary()).to.equal(addr1.address);
        });

        it("Should emit BeneficiaryChanged event", async function () {
            await expect(vestingContract.changeBeneficiary(addr1.address))
                .to.emit(vestingContract, "BeneficiaryChanged")
                .withArgs(beneficiary.address, addr1.address);
        });

        it("Should revert if non-owner tries to change beneficiary", async function () {
            await expect(
                vestingContract.connect(addr1).changeBeneficiary(addr1.address)
            ).to.be.revertedWithCustomError(vestingContract, "OwnableUnauthorizedAccount");
        });

        it("Should revert with zero address", async function () {
            await expect(
                vestingContract.changeBeneficiary(ethers.ZeroAddress)
            ).to.be.revertedWithCustomError(vestingContract, "ZeroAddress");
        });

        it("Should send released tokens to new beneficiary", async function () {
            // Fast forward past cliff
            await time.increase(ONE_YEAR + 1);
            
            // Change beneficiary
            await vestingContract.changeBeneficiary(addr1.address);
            
            // Release should go to new beneficiary
            await vestingContract.release();
            
            expect(await mirrorToken.balanceOf(addr1.address)).to.be.gt(0);
            expect(await mirrorToken.balanceOf(beneficiary.address)).to.equal(0);
        });
    });

    describe("Revocation", function () {
        it("Should allow owner to revoke vesting", async function () {
            await vestingContract.revoke();
            expect(await vestingContract.revoked()).to.be.true;
        });

        it("Should emit VestingRevoked event", async function () {
            await expect(vestingContract.revoke())
                .to.emit(vestingContract, "VestingRevoked");
        });

        it("Should return unvested tokens to owner on revoke before cliff", async function () {
            const ownerBalanceBefore = await mirrorToken.balanceOf(owner.address);
            
            await vestingContract.revoke();
            
            const ownerBalanceAfter = await mirrorToken.balanceOf(owner.address);
            // All tokens should return to owner (nothing vested before cliff)
            expect(ownerBalanceAfter - ownerBalanceBefore).to.equal(TEAM_ALLOCATION);
        });

        it("Should release vested tokens to beneficiary on revoke after cliff", async function () {
            // Fast forward past cliff
            await time.increase(ONE_YEAR + ONE_YEAR); // 2 years total
            
            const vestedBefore = await vestingContract.getVestedAmount();
            
            await vestingContract.revoke();
            
            // Beneficiary should receive vested tokens
            expect(await mirrorToken.balanceOf(beneficiary.address)).to.equal(vestedBefore);
        });

        it("Should prevent release after revocation", async function () {
            await vestingContract.revoke();
            
            await expect(vestingContract.release())
                .to.be.revertedWithCustomError(vestingContract, "VestingRevoked");
        });

        it("Should prevent double revocation", async function () {
            await vestingContract.revoke();
            
            await expect(vestingContract.revoke())
                .to.be.revertedWithCustomError(vestingContract, "VestingRevoked");
        });

        it("Should revert if non-owner tries to revoke", async function () {
            await expect(
                vestingContract.connect(addr1).revoke()
            ).to.be.revertedWithCustomError(vestingContract, "OwnableUnauthorizedAccount");
        });
    });

    describe("View Functions", function () {
        it("Should return correct vesting schedule", async function () {
            const schedule = await vestingContract.getVestingSchedule();
            
            expect(schedule._beneficiary).to.equal(beneficiary.address);
            expect(schedule._totalAllocation).to.equal(TEAM_ALLOCATION);
            expect(schedule._totalReleased).to.equal(0);
            expect(schedule._cliffEnd).to.equal(schedule._vestingStart + BigInt(ONE_YEAR));
            expect(schedule._vestingEnd).to.equal(schedule._vestingStart + BigInt(THREE_YEARS));
        });

        it("Should return correct vesting status", async function () {
            const status = await vestingContract.getVestingStatus();
            
            expect(status.vestedAmount).to.equal(0);
            expect(status.releasableAmount).to.equal(0);
            expect(status.lockedAmount).to.equal(TEAM_ALLOCATION);
            expect(status.releasedAmount).to.equal(0);
        });

        it("Should return correct CLIFF_DURATION constant", async function () {
            expect(await vestingContract.CLIFF_DURATION()).to.equal(ONE_YEAR);
        });

        it("Should return correct VESTING_DURATION constant", async function () {
            expect(await vestingContract.VESTING_DURATION()).to.equal(THREE_YEARS);
        });

        it("Should return correct LINEAR_VESTING_DURATION constant", async function () {
            expect(await vestingContract.LINEAR_VESTING_DURATION()).to.equal(TWO_YEARS);
        });
    });

    describe("Edge Cases", function () {
        it("Should handle release at exact cliff end", async function () {
            await time.increase(ONE_YEAR);
            
            // Should not revert
            await vestingContract.release();
            expect(await vestingContract.totalReleased()).to.be.gte(0);
        });

        it("Should handle multiple partial releases", async function () {
            // Release after 1.5 years
            await time.increase(ONE_YEAR + ONE_YEAR / 2);
            await vestingContract.release();
            const firstRelease = await vestingContract.totalReleased();

            // Release after 2 years
            await time.increase(ONE_YEAR / 2);
            await vestingContract.release();
            const secondRelease = await vestingContract.totalReleased();

            // Release after 3 years
            await time.increase(ONE_YEAR);
            await vestingContract.release();
            const finalRelease = await vestingContract.totalReleased();

            expect(secondRelease).to.be.gt(firstRelease);
            expect(finalRelease).to.equal(TEAM_ALLOCATION);
        });

        it("Should return 0 vested amount for uninitialized vesting", async function () {
            const MirrorTokenVesting = await ethers.getContractFactory("MirrorTokenVesting");
            const newVestingContract = await MirrorTokenVesting.deploy(
                await mirrorToken.getAddress(),
                owner.address
            );

            expect(await newVestingContract.getVestedAmount()).to.equal(0);
        });

        it("Should revert release if vesting not initialized", async function () {
            const MirrorTokenVesting = await ethers.getContractFactory("MirrorTokenVesting");
            const newVestingContract = await MirrorTokenVesting.deploy(
                await mirrorToken.getAddress(),
                owner.address
            );

            await expect(newVestingContract.release())
                .to.be.revertedWithCustomError(newVestingContract, "VestingNotInitialized");
        });
    });
});
