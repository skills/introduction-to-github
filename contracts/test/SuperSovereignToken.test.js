const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SuperSovereignToken", function () {
  let token;
  let owner;
  let addr1;
  let addr2;
  let communityTreasury;
  let teamAddress;
  let talentPool;
  let publicSaleAddress;
  let industryPartners;
  let liquidityPool;
  let reserveFund;

  beforeEach(async function () {
    [owner, addr1, addr2, communityTreasury, teamAddress, talentPool, publicSaleAddress, industryPartners, liquidityPool, reserveFund] = await ethers.getSigners();

    const SuperSovereignToken = await ethers.getContractFactory("SuperSovereignToken");
    token = await SuperSovereignToken.deploy(
      communityTreasury.address,
      teamAddress.address,
      talentPool.address,
      publicSaleAddress.address,
      industryPartners.address,
      liquidityPool.address,
      reserveFund.address
    );
    await token.deployed();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await token.name()).to.equal("Super Sovereign");
      expect(await token.symbol()).to.equal("SUPER_SOVEREIGN");
    });

    it("Should mint correct initial supply", async function () {
      const totalSupply = await token.totalSupply();
      expect(totalSupply).to.equal(ethers.utils.parseEther("1000000000")); // 1 Billion
    });

    it("Should distribute tokens correctly", async function () {
      expect(await token.balanceOf(communityTreasury.address)).to.equal(ethers.utils.parseEther("200000000"));
      expect(await token.balanceOf(teamAddress.address)).to.equal(ethers.utils.parseEther("150000000"));
      expect(await token.balanceOf(talentPool.address)).to.equal(ethers.utils.parseEther("250000000"));
      expect(await token.balanceOf(publicSaleAddress.address)).to.equal(ethers.utils.parseEther("200000000"));
      expect(await token.balanceOf(industryPartners.address)).to.equal(ethers.utils.parseEther("100000000"));
      expect(await token.balanceOf(liquidityPool.address)).to.equal(ethers.utils.parseEther("50000000"));
      expect(await token.balanceOf(reserveFund.address)).to.equal(ethers.utils.parseEther("50000000"));
    });

    it("Should grant admin role to deployer", async function () {
      const DEFAULT_ADMIN_ROLE = await token.DEFAULT_ADMIN_ROLE();
      expect(await token.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
    });
  });

  describe("Transfers with Burn", function () {
    it("Should burn 1% on transfers", async function () {
      const transferAmount = ethers.utils.parseEther("1000");
      const expectedBurn = ethers.utils.parseEther("10"); // 1%
      const expectedReceive = ethers.utils.parseEther("990");

      // Transfer from communityTreasury to addr1
      await token.connect(communityTreasury).transfer(addr1.address, transferAmount);

      expect(await token.balanceOf(addr1.address)).to.equal(expectedReceive);
    });

    it("Should reduce total supply on burn", async function () {
      const initialSupply = await token.totalSupply();
      const transferAmount = ethers.utils.parseEther("1000");

      await token.connect(communityTreasury).transfer(addr1.address, transferAmount);

      const newSupply = await token.totalSupply();
      expect(newSupply).to.be.lt(initialSupply);
    });
  });

  describe("Governance", function () {
    it("Should allow delegation of votes", async function () {
      await token.connect(communityTreasury).delegate(addr1.address);
      const votes = await token.getVotes(addr1.address);
      expect(votes).to.be.gt(0);
    });
  });

  describe("Revenue Tracking", function () {
    it("Should record revenue streams", async function () {
      const revenueAmount = ethers.utils.parseEther("1000000");
      await token.recordRevenue("BoxOffice", revenueAmount);

      expect(await token.revenueStreams("BoxOffice")).to.equal(revenueAmount);
    });

    it("Should only allow admin to record revenue", async function () {
      const revenueAmount = ethers.utils.parseEther("1000000");
      await expect(
        token.connect(addr1).recordRevenue("BoxOffice", revenueAmount)
      ).to.be.reverted;
    });
  });

  describe("Pausability", function () {
    it("Should pause and unpause transfers", async function () {
      await token.pause();
      
      await expect(
        token.connect(communityTreasury).transfer(addr1.address, ethers.utils.parseEther("100"))
      ).to.be.revertedWith("Pausable: paused");

      await token.unpause();
      
      await expect(
        token.connect(communityTreasury).transfer(addr1.address, ethers.utils.parseEther("100"))
      ).to.not.be.reverted;
    });
  });

  describe("Transaction Fee", function () {
    it("Should allow admin to update transaction fee", async function () {
      await token.setTransactionFee(200); // 2%
      expect(await token.transactionFeeBps()).to.equal(200);
    });

    it("Should not allow fee above maximum", async function () {
      await expect(
        token.setTransactionFee(600) // 6%, above max of 5%
      ).to.be.revertedWith("Fee too high");
    });
  });
});
