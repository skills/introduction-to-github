const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("MirrorTokenVesting", function () {
    let mirrorToken;
    let vestingContract;
    let owner;
    let beneficiary1;
    let beneficiary2;
    let beneficiary3;
    let nonBeneficiary;
    
    // Constants matching the contract
    const TOTAL_TEAM_ALLOCATION = ethers.parseEther("150000000"); // 150 million tokens
    const CLIFF_DURATION = 365 * 24 * 60 * 60; // 1 year in seconds
    const VESTING_DURATION = 730 * 24 * 60 * 60; // 2 years in seconds
    const TOTAL_DURATION = CLIFF_DURATION + VESTING_DURATION;
    
    // Sample allocations
    const ALLOCATION_1 = ethers.parseEther("50000000"); // 50 million
    const ALLOCATION_2 = ethers.parseEther("30000000"); // 30 million
    const ALLOCATION_3 = ethers.parseEther("20000000"); // 20 million
    
    beforeEach(async function () {
        [owner, beneficiary1, beneficiary2, beneficiary3, nonBeneficiary] = await ethers.getSigners();
        
        // Deploy a mock ERC20 token
        const MockToken = await ethers.getContractFactory("MockERC20");
        mirrorToken = await MockToken.deploy("Mirror Token", "MIRROR", TOTAL_TEAM_ALLOCATION);
        await mirrorToken.waitForDeployment();
        
        // Deploy the vesting contract
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
        
        // Transfer tokens to vesting contract
        await mirrorToken.transfer(await vestingContract.getAddress(), TOTAL_TEAM_ALLOCATION);
    });
    

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
        
        it("Should set the vesting start time to deployment time", async function () {
            const vestingStart = await vestingContract.vestingStart();
            const blockTimestamp = (await ethers.provider.getBlock("latest")).timestamp;
            expect(vestingStart).to.be.closeTo(blockTimestamp, 5);
        });
        
        it("Should have correct constants", async function () {
            expect(await vestingContract.TOTAL_TEAM_ALLOCATION()).to.equal(TOTAL_TEAM_ALLOCATION);
            expect(await vestingContract.CLIFF_DURATION()).to.equal(CLIFF_DURATION);
            expect(await vestingContract.VESTING_DURATION()).to.equal(VESTING_DURATION);
            expect(await vestingContract.TOTAL_DURATION()).to.equal(TOTAL_DURATION);
        });
        
        it("Should start with zero allocations", async function () {
            expect(await vestingContract.totalAllocated()).to.equal(0);
            expect(await vestingContract.totalReleased()).to.equal(0);
            expect(await vestingContract.isFinalized()).to.be.false;
        });
        
        it("Should hold the full token balance", async function () {
            expect(await vestingContract.getContractBalance()).to.equal(TOTAL_TEAM_ALLOCATION);
        });
        
        it("Should revert if token address is zero", async function () {

        it("Should set the correct owner", async function () {
            expect(await vestingContract.owner()).to.equal(owner.address);
        });

        it("Should revert deployment with zero token address", async function () {
            const MirrorTokenVesting = await ethers.getContractFactory("MirrorTokenVesting");
            await expect(
                MirrorTokenVesting.deploy(ethers.ZeroAddress, owner.address)
            ).to.be.revertedWithCustomError(vestingContract, "ZeroAddress");
        });
        
        it("Should revert if owner address is zero", async function () {
            const MirrorTokenVesting = await ethers.getContractFactory("MirrorTokenVesting");
            await expect(
                MirrorTokenVesting.deploy(await mirrorToken.getAddress(), ethers.ZeroAddress)
            ).to.be.revertedWithCustomError(vestingContract, "ZeroAddress");
        });
    });
    
    describe("Adding Beneficiaries", function () {
        it("Should add a beneficiary correctly", async function () {
            await vestingContract.addBeneficiary(beneficiary1.address, ALLOCATION_1);
            
            expect(await vestingContract.isBeneficiary(beneficiary1.address)).to.be.true;
            expect(await vestingContract.totalAllocated()).to.equal(ALLOCATION_1);
            expect(await vestingContract.getBeneficiaryCount()).to.equal(1);
        });
        
        it("Should emit BeneficiaryAdded event", async function () {
            await expect(vestingContract.addBeneficiary(beneficiary1.address, ALLOCATION_1))
                .to.emit(vestingContract, "BeneficiaryAdded")
                .withArgs(beneficiary1.address, ALLOCATION_1, await time.latest() + 1);
        });
        
        it("Should add multiple beneficiaries", async function () {
            await vestingContract.addBeneficiary(beneficiary1.address, ALLOCATION_1);
            await vestingContract.addBeneficiary(beneficiary2.address, ALLOCATION_2);
            await vestingContract.addBeneficiary(beneficiary3.address, ALLOCATION_3);
            
            expect(await vestingContract.getBeneficiaryCount()).to.equal(3);
            expect(await vestingContract.totalAllocated()).to.equal(
                ALLOCATION_1 + ALLOCATION_2 + ALLOCATION_3
            );
        });
        
        it("Should revert if not owner", async function () {
            await expect(
                vestingContract.connect(beneficiary1).addBeneficiary(beneficiary1.address, ALLOCATION_1)
            ).to.be.revertedWithCustomError(vestingContract, "OwnableUnauthorizedAccount");
        });
        
        it("Should revert if beneficiary address is zero", async function () {
            await expect(
                vestingContract.addBeneficiary(ethers.ZeroAddress, ALLOCATION_1)
            ).to.be.revertedWithCustomError(vestingContract, "ZeroAddress");
        });
        
        it("Should revert if allocation is zero", async function () {
            await expect(
                vestingContract.addBeneficiary(beneficiary1.address, 0)
            ).to.be.revertedWithCustomError(vestingContract, "ZeroAmount");
        });
        
        it("Should revert if beneficiary already exists", async function () {
            await vestingContract.addBeneficiary(beneficiary1.address, ALLOCATION_1);
            await expect(
                vestingContract.addBeneficiary(beneficiary1.address, ALLOCATION_2)
            ).to.be.revertedWithCustomError(vestingContract, "BeneficiaryAlreadyExists");
        });
        
        it("Should revert if allocation exceeds total team allocation", async function () {
            await expect(
                vestingContract.addBeneficiary(beneficiary1.address, TOTAL_TEAM_ALLOCATION + 1n)
            ).to.be.revertedWithCustomError(vestingContract, "AllocationExceedsTotalTeamAllocation");
        });
        
        it("Should revert if cumulative allocations exceed total team allocation", async function () {
            await vestingContract.addBeneficiary(beneficiary1.address, TOTAL_TEAM_ALLOCATION - 1n);
            await expect(
                vestingContract.addBeneficiary(beneficiary2.address, 2n)
            ).to.be.revertedWithCustomError(vestingContract, "AllocationExceedsTotalTeamAllocation");
        });
        
        it("Should revert if adding beneficiary after finalization", async function () {
            await vestingContract.addBeneficiary(beneficiary1.address, ALLOCATION_1);
            await vestingContract.finalize();
            
            await expect(
                vestingContract.addBeneficiary(beneficiary2.address, ALLOCATION_2)
            ).to.be.revertedWithCustomError(vestingContract, "AlreadyFinalized");
        });
    });
    
    describe("Batch Adding Beneficiaries", function () {
        it("Should add multiple beneficiaries in batch", async function () {
            const beneficiaries = [beneficiary1.address, beneficiary2.address, beneficiary3.address];
            const allocations = [ALLOCATION_1, ALLOCATION_2, ALLOCATION_3];
            
            await vestingContract.addBeneficiariesBatch(beneficiaries, allocations);
            
            expect(await vestingContract.getBeneficiaryCount()).to.equal(3);
            expect(await vestingContract.isBeneficiary(beneficiary1.address)).to.be.true;
            expect(await vestingContract.isBeneficiary(beneficiary2.address)).to.be.true;
            expect(await vestingContract.isBeneficiary(beneficiary3.address)).to.be.true;
            expect(await vestingContract.totalAllocated()).to.equal(
                ALLOCATION_1 + ALLOCATION_2 + ALLOCATION_3
            );
        });
        
        it("Should emit events for each beneficiary in batch", async function () {
            const beneficiaries = [beneficiary1.address, beneficiary2.address];
            const allocations = [ALLOCATION_1, ALLOCATION_2];
            
            const tx = await vestingContract.addBeneficiariesBatch(beneficiaries, allocations);
            
            await expect(tx).to.emit(vestingContract, "BeneficiaryAdded");
        });
        
        it("Should revert if arrays have different lengths", async function () {
            const beneficiaries = [beneficiary1.address, beneficiary2.address];
            const allocations = [ALLOCATION_1];
            
            await expect(
                vestingContract.addBeneficiariesBatch(beneficiaries, allocations)
            ).to.be.revertedWithCustomError(vestingContract, "ArrayLengthMismatch");
        });
        
        it("Should revert if batch total exceeds remaining allocation", async function () {
            const beneficiaries = [beneficiary1.address, beneficiary2.address];
            const allocations = [TOTAL_TEAM_ALLOCATION, 1n];
            
            await expect(
                vestingContract.addBeneficiariesBatch(beneficiaries, allocations)
            ).to.be.revertedWithCustomError(vestingContract, "AllocationExceedsTotalTeamAllocation");
        });
        
        it("Should revert if any beneficiary address is zero", async function () {
            const beneficiaries = [beneficiary1.address, ethers.ZeroAddress];
            const allocations = [ALLOCATION_1, ALLOCATION_2];
            
            await expect(
                vestingContract.addBeneficiariesBatch(beneficiaries, allocations)
            ).to.be.revertedWithCustomError(vestingContract, "ZeroAddress");
        });
        
        it("Should revert if any allocation is zero", async function () {
            const beneficiaries = [beneficiary1.address, beneficiary2.address];
            const allocations = [ALLOCATION_1, 0n];
            
            await expect(
                vestingContract.addBeneficiariesBatch(beneficiaries, allocations)
            ).to.be.revertedWithCustomError(vestingContract, "ZeroAmount");
        });
    });
    
    describe("Finalization", function () {
        it("Should finalize successfully", async function () {
            await vestingContract.addBeneficiary(beneficiary1.address, ALLOCATION_1);
            await vestingContract.finalize();
            
            expect(await vestingContract.isFinalized()).to.be.true;
        });
        
        it("Should emit AllocationFinalized event", async function () {
            await vestingContract.addBeneficiary(beneficiary1.address, ALLOCATION_1);
            
            await expect(vestingContract.finalize())
                .to.emit(vestingContract, "AllocationFinalized");
        });
        
        it("Should revert if already finalized", async function () {
            await vestingContract.addBeneficiary(beneficiary1.address, ALLOCATION_1);
            await vestingContract.finalize();
            
            await expect(vestingContract.finalize())
                .to.be.revertedWithCustomError(vestingContract, "AlreadyFinalized");
        });
        
        it("Should revert if not owner", async function () {
            await expect(
                vestingContract.connect(beneficiary1).finalize()
            ).to.be.revertedWithCustomError(vestingContract, "OwnableUnauthorizedAccount");
        });
    });
    
    describe("Vesting Schedule - Cliff Period", function () {
        beforeEach(async function () {
            await vestingContract.addBeneficiary(beneficiary1.address, ALLOCATION_1);
            await vestingContract.finalize();
        });
        
        it("Should have zero vested amount during cliff", async function () {
            expect(await vestingContract.getVestedAmount(beneficiary1.address)).to.equal(0);
        });
        
        it("Should have zero claimable amount during cliff", async function () {
            expect(await vestingContract.getClaimableAmount(beneficiary1.address)).to.equal(0);
        });
        
        it("Should revert claim during cliff period", async function () {
            await expect(
                vestingContract.connect(beneficiary1).claim()
            ).to.be.revertedWithCustomError(vestingContract, "NoTokensAvailable");
        });
        
        it("Should report cliff not reached in schedule status", async function () {
            const status = await vestingContract.getVestingScheduleStatus();
            expect(status.isCliffReached).to.be.false;
            expect(status.percentageVested).to.equal(0);
        });
        
        it("Should show correct time until cliff", async function () {
            const status = await vestingContract.getVestingScheduleStatus();
            expect(status.timeUntilCliff).to.be.closeTo(BigInt(CLIFF_DURATION), 10n);
        });
    });
    
    describe("Vesting Schedule - After Cliff", function () {
        beforeEach(async function () {
            await vestingContract.addBeneficiary(beneficiary1.address, ALLOCATION_1);
            await vestingContract.finalize();
        });
        
        it("Should vest tokens linearly after cliff", async function () {
            // Move to just after cliff (cliff + 1 day)
            await time.increase(CLIFF_DURATION + 86400);
            
            const vestedAmount = await vestingContract.getVestedAmount(beneficiary1.address);
            // After 1 day of vesting period (out of 730 days)
            const expectedVested = (ALLOCATION_1 * 86400n) / BigInt(VESTING_DURATION);
            expect(vestedAmount).to.be.closeTo(expectedVested, ethers.parseEther("1"));
        });
        
        it("Should vest 50% at midpoint of vesting period", async function () {
            // Move to cliff + half of vesting period
            await time.increase(CLIFF_DURATION + VESTING_DURATION / 2);
            
            const vestedAmount = await vestingContract.getVestedAmount(beneficiary1.address);
            const expectedVested = ALLOCATION_1 / 2n;
            expect(vestedAmount).to.be.closeTo(expectedVested, ethers.parseEther("100"));
        });
        
        it("Should vest 100% at end of vesting period", async function () {
            // Move to end of vesting period
            await time.increase(TOTAL_DURATION);
            
            const vestedAmount = await vestingContract.getVestedAmount(beneficiary1.address);
            expect(vestedAmount).to.equal(ALLOCATION_1);
        });
        
        it("Should not vest more than allocation even after vesting period", async function () {
            // Move way past vesting period
            await time.increase(TOTAL_DURATION + 365 * 24 * 60 * 60);
            
            const vestedAmount = await vestingContract.getVestedAmount(beneficiary1.address);
            expect(vestedAmount).to.equal(ALLOCATION_1);
        });
    });
    
    describe("Claiming Tokens", function () {
        beforeEach(async function () {
            await vestingContract.addBeneficiary(beneficiary1.address, ALLOCATION_1);
            await vestingContract.finalize();
        });
        
        it("Should revert if not finalized", async function () {
            // Deploy a new contract without finalizing
            const MirrorTokenVesting = await ethers.getContractFactory("MirrorTokenVesting");
            const newVesting = await MirrorTokenVesting.deploy(
                await mirrorToken.getAddress(),
                owner.address
            );
            await newVesting.addBeneficiary(beneficiary1.address, ALLOCATION_1);
            
            await expect(
                newVesting.connect(beneficiary1).claim()
            ).to.be.revertedWithCustomError(newVesting, "NotFinalized");
        });
        
        it("Should revert if not a beneficiary", async function () {
            await time.increase(CLIFF_DURATION + 86400);
            
            await expect(
                vestingContract.connect(nonBeneficiary).claim()
            ).to.be.revertedWithCustomError(vestingContract, "BeneficiaryDoesNotExist");
        });
        
        it("Should claim vested tokens successfully", async function () {
            // Move to after cliff
            await time.increase(CLIFF_DURATION + 86400);
            
            const claimableBefore = await vestingContract.getClaimableAmount(beneficiary1.address);
            const balanceBefore = await mirrorToken.balanceOf(beneficiary1.address);
            
            await vestingContract.connect(beneficiary1).claim();
            
            const balanceAfter = await mirrorToken.balanceOf(beneficiary1.address);
            expect(balanceAfter - balanceBefore).to.be.closeTo(claimableBefore, ethers.parseEther("1"));
        });
        
        it("Should emit TokensClaimed event", async function () {
            await time.increase(CLIFF_DURATION + 86400);
            
            await expect(vestingContract.connect(beneficiary1).claim())
                .to.emit(vestingContract, "TokensClaimed");
        });
        
        it("Should update released amount after claim", async function () {
            await time.increase(CLIFF_DURATION + 86400);
            
            await vestingContract.connect(beneficiary1).claim();
            
            const info = await vestingContract.getBeneficiaryVestingInfo(beneficiary1.address);
            expect(info.releasedAmount).to.be.gt(0);
        });
        
        it("Should update total released after claim", async function () {
            await time.increase(CLIFF_DURATION + 86400);
            
            const releasedBefore = await vestingContract.totalReleased();
            await vestingContract.connect(beneficiary1).claim();
            const releasedAfter = await vestingContract.totalReleased();
            
            expect(releasedAfter).to.be.gt(releasedBefore);
        });
        
        it("Should allow multiple claims over time", async function () {
            // First claim after cliff
            await time.increase(CLIFF_DURATION + 30 * 24 * 60 * 60); // Cliff + 30 days
            await vestingContract.connect(beneficiary1).claim();
            
            const firstRelease = await vestingContract.getReleasedAmount(beneficiary1.address);
            
            // Second claim 30 days later
            await time.increase(30 * 24 * 60 * 60);
            await vestingContract.connect(beneficiary1).claim();
            
            const secondRelease = await vestingContract.getReleasedAmount(beneficiary1.address);
            expect(secondRelease).to.be.gt(firstRelease);
        });
        
        it("Should claim all remaining tokens at end of vesting", async function () {
            await time.increase(TOTAL_DURATION);
            
            await vestingContract.connect(beneficiary1).claim();
            
            expect(await mirrorToken.balanceOf(beneficiary1.address)).to.equal(ALLOCATION_1);
            expect(await vestingContract.getReleasedAmount(beneficiary1.address)).to.equal(ALLOCATION_1);
            expect(await vestingContract.getClaimableAmount(beneficiary1.address)).to.equal(0);
        });
        
        it("Should revert if nothing to claim", async function () {
            await time.increase(TOTAL_DURATION);
            await vestingContract.connect(beneficiary1).claim();
            
            // Try to claim again with nothing left
            await expect(
                vestingContract.connect(beneficiary1).claim()
            ).to.be.revertedWithCustomError(vestingContract, "NoTokensAvailable");
        });
    });
    
    describe("View Functions", function () {
        beforeEach(async function () {
            await vestingContract.addBeneficiary(beneficiary1.address, ALLOCATION_1);
            await vestingContract.addBeneficiary(beneficiary2.address, ALLOCATION_2);
            await vestingContract.finalize();
        });
        
        it("Should return correct cliff end time", async function () {
            const vestingStart = await vestingContract.vestingStart();
            const cliffEnd = await vestingContract.getCliffEnd();
            expect(cliffEnd).to.equal(vestingStart + BigInt(CLIFF_DURATION));
        });
        
        it("Should return correct vesting end time", async function () {
            const vestingStart = await vestingContract.vestingStart();
            const vestingEnd = await vestingContract.getVestingEnd();
            expect(vestingEnd).to.equal(vestingStart + BigInt(TOTAL_DURATION));
        });
        
        it("Should return correct beneficiary count", async function () {
            expect(await vestingContract.getBeneficiaryCount()).to.equal(2);
        });
        
        it("Should return beneficiary at index", async function () {
            expect(await vestingContract.getBeneficiaryAtIndex(0)).to.equal(beneficiary1.address);
            expect(await vestingContract.getBeneficiaryAtIndex(1)).to.equal(beneficiary2.address);
        });
        
        it("Should revert if index out of bounds", async function () {
            await expect(
                vestingContract.getBeneficiaryAtIndex(5)
            ).to.be.revertedWithCustomError(vestingContract, "IndexOutOfBounds");
        });
        
        it("Should return correct beneficiary vesting info", async function () {
            await time.increase(CLIFF_DURATION + VESTING_DURATION / 2);
            
            const info = await vestingContract.getBeneficiaryVestingInfo(beneficiary1.address);
            
            expect(info.totalAllocation).to.equal(ALLOCATION_1);
            expect(info.vestedAmount).to.be.closeTo(ALLOCATION_1 / 2n, ethers.parseEther("100"));
            expect(info.releasedAmount).to.equal(0);
            expect(info.claimableAmount).to.be.closeTo(ALLOCATION_1 / 2n, ethers.parseEther("100"));
            expect(info.remainingAmount).to.be.closeTo(ALLOCATION_1 / 2n, ethers.parseEther("100"));
        });
        
        it("Should revert if beneficiary does not exist for view functions", async function () {
            await expect(
                vestingContract.getVestedAmount(nonBeneficiary.address)
            ).to.be.revertedWithCustomError(vestingContract, "BeneficiaryDoesNotExist");
            
            await expect(
                vestingContract.getClaimableAmount(nonBeneficiary.address)
            ).to.be.revertedWithCustomError(vestingContract, "BeneficiaryDoesNotExist");
            
            await expect(
                vestingContract.getReleasedAmount(nonBeneficiary.address)
            ).to.be.revertedWithCustomError(vestingContract, "BeneficiaryDoesNotExist");
            
            await expect(
                vestingContract.getRemainingAmount(nonBeneficiary.address)
            ).to.be.revertedWithCustomError(vestingContract, "BeneficiaryDoesNotExist");
        });
        
        it("Should return correct vesting schedule status at different times", async function () {
            // During cliff
            let status = await vestingContract.getVestingScheduleStatus();
            expect(status.isCliffReached).to.be.false;
            expect(status.isVestingComplete).to.be.false;
            expect(status.percentageVested).to.equal(0);
            
            // After cliff, during vesting
            await time.increase(CLIFF_DURATION + VESTING_DURATION / 2);
            status = await vestingContract.getVestingScheduleStatus();
            expect(status.isCliffReached).to.be.true;
            expect(status.isVestingComplete).to.be.false;
            expect(status.timeUntilCliff).to.equal(0);
            expect(status.percentageVested).to.be.closeTo(50n, 2n);
            
            // After vesting complete
            await time.increase(VESTING_DURATION / 2 + 1);
            status = await vestingContract.getVestingScheduleStatus();
            expect(status.isCliffReached).to.be.true;
            expect(status.isVestingComplete).to.be.true;
            expect(status.timeUntilComplete).to.equal(0);
            expect(status.percentageVested).to.equal(100);
        });
    });
    
    describe("Emergency Withdrawal", function () {
        beforeEach(async function () {
            await vestingContract.addBeneficiary(beneficiary1.address, ALLOCATION_1);
            await vestingContract.finalize();
        });
        
        it("Should allow owner to withdraw tokens", async function () {
            const withdrawAmount = ethers.parseEther("1000");
            const balanceBefore = await mirrorToken.balanceOf(owner.address);
            
            await vestingContract.emergencyWithdraw(owner.address, withdrawAmount);
            
            const balanceAfter = await mirrorToken.balanceOf(owner.address);
            expect(balanceAfter - balanceBefore).to.equal(withdrawAmount);
        });
        
        it("Should emit EmergencyWithdrawal event", async function () {
            const withdrawAmount = ethers.parseEther("1000");
            
            await expect(vestingContract.emergencyWithdraw(owner.address, withdrawAmount))
                .to.emit(vestingContract, "EmergencyWithdrawal");
        });
        
        it("Should revert if not owner", async function () {
            await expect(
                vestingContract.connect(beneficiary1).emergencyWithdraw(beneficiary1.address, 1000)
            ).to.be.revertedWithCustomError(vestingContract, "OwnableUnauthorizedAccount");
        });
        
        it("Should revert if recipient is zero address", async function () {
            await expect(
                vestingContract.emergencyWithdraw(ethers.ZeroAddress, 1000)
            ).to.be.revertedWithCustomError(vestingContract, "ZeroAddress");
        });
        
        it("Should revert if amount is zero", async function () {
            await expect(
                vestingContract.emergencyWithdraw(owner.address, 0)
            ).to.be.revertedWithCustomError(vestingContract, "ZeroAmount");
        });
        
        it("Should revert if amount exceeds balance", async function () {
            const balance = await vestingContract.getContractBalance();
            
            await expect(
                vestingContract.emergencyWithdraw(owner.address, balance + 1n)
            ).to.be.revertedWithCustomError(vestingContract, "InsufficientContractBalance");
        });
    });
    
    describe("Multi-Beneficiary Scenarios", function () {
        beforeEach(async function () {
            await vestingContract.addBeneficiary(beneficiary1.address, ALLOCATION_1);
            await vestingContract.addBeneficiary(beneficiary2.address, ALLOCATION_2);
            await vestingContract.addBeneficiary(beneficiary3.address, ALLOCATION_3);
            await vestingContract.finalize();
        });
        
        it("Should track total allocated correctly", async function () {
            expect(await vestingContract.totalAllocated()).to.equal(
                ALLOCATION_1 + ALLOCATION_2 + ALLOCATION_3
            );
        });
        
        it("Should track total released correctly with multiple claims", async function () {
            await time.increase(TOTAL_DURATION);
            
            await vestingContract.connect(beneficiary1).claim();
            await vestingContract.connect(beneficiary2).claim();
            await vestingContract.connect(beneficiary3).claim();
            
            expect(await vestingContract.totalReleased()).to.equal(
                ALLOCATION_1 + ALLOCATION_2 + ALLOCATION_3
            );
        });
        
        it("Should maintain separate vesting schedules per beneficiary", async function () {
            await time.increase(CLIFF_DURATION + VESTING_DURATION / 2);
            
            // Beneficiary 1 claims
            await vestingContract.connect(beneficiary1).claim();
            
            // Beneficiary 2 should still have full claimable amount
            const info2 = await vestingContract.getBeneficiaryVestingInfo(beneficiary2.address);
            expect(info2.releasedAmount).to.equal(0);
            expect(info2.claimableAmount).to.be.closeTo(ALLOCATION_2 / 2n, ethers.parseEther("100"));
        });
        
        it("Should allow beneficiaries to claim at different times", async function () {
            await time.increase(CLIFF_DURATION + 30 * 24 * 60 * 60);
            await vestingContract.connect(beneficiary1).claim();
            
            await time.increase(60 * 24 * 60 * 60);
            await vestingContract.connect(beneficiary2).claim();
            
            await time.increase(VESTING_DURATION);
            await vestingContract.connect(beneficiary3).claim();
            
            // All should have received their full allocation eventually
            expect(await mirrorToken.balanceOf(beneficiary3.address)).to.equal(ALLOCATION_3);
        });
    });
    
    describe("Edge Cases", function () {
        it("Should handle very small allocations", async function () {
            const smallAllocation = 1000n; // 1000 wei
            await vestingContract.addBeneficiary(beneficiary1.address, smallAllocation);
            await vestingContract.finalize();
            
            await time.increase(TOTAL_DURATION);
            await vestingContract.connect(beneficiary1).claim();
            
            expect(await mirrorToken.balanceOf(beneficiary1.address)).to.equal(smallAllocation);
        });
        
        it("Should handle maximum allocation (full 150M)", async function () {
            await vestingContract.addBeneficiary(beneficiary1.address, TOTAL_TEAM_ALLOCATION);
            await vestingContract.finalize();
            
            await time.increase(TOTAL_DURATION);
            await vestingContract.connect(beneficiary1).claim();
            
            expect(await mirrorToken.balanceOf(beneficiary1.address)).to.equal(TOTAL_TEAM_ALLOCATION);
        });
        
        it("Should handle exact cliff boundary", async function () {
            await vestingContract.addBeneficiary(beneficiary1.address, ALLOCATION_1);
            await vestingContract.finalize();
            
            // Just before cliff
            await time.increase(CLIFF_DURATION - 10);
            expect(await vestingContract.getVestedAmount(beneficiary1.address)).to.equal(0);
            
            // Exactly at cliff
            await time.increase(10);
            expect(await vestingContract.getVestedAmount(beneficiary1.address)).to.equal(0);
            
            // Just after cliff
            await time.increase(1);
            expect(await vestingContract.getVestedAmount(beneficiary1.address)).to.be.gt(0);
        });
        
        it("Should handle claims at exact vesting end", async function () {
            await vestingContract.addBeneficiary(beneficiary1.address, ALLOCATION_1);
            await vestingContract.finalize();
            
            await time.increase(TOTAL_DURATION);
            
            const vestedAmount = await vestingContract.getVestedAmount(beneficiary1.address);
            expect(vestedAmount).to.equal(ALLOCATION_1);
        });
    });
    
    describe("Gas Optimization Tests", function () {
        it("Should efficiently add batch of 10 beneficiaries", async function () {
            const signers = await ethers.getSigners();
            const beneficiaries = signers.slice(1, 11).map(s => s.address);
            const allocations = beneficiaries.map(() => ethers.parseEther("10000000")); // 10M each
            
            const tx = await vestingContract.addBeneficiariesBatch(beneficiaries, allocations);
            const receipt = await tx.wait();
            
            // Log gas used for analysis
            console.log(`Gas used for batch add of 10 beneficiaries: ${receipt.gasUsed}`);
            
            expect(await vestingContract.getBeneficiaryCount()).to.equal(10);
        });
    });
});

// Mock ERC20 token for testing
// This would typically be in a separate file, but included here for completeness
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
