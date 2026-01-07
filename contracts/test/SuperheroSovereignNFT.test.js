const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SuperheroSovereignNFT", function () {
  let nft;
  let owner;
  let addr1;
  let addr2;
  const baseURI = "ipfs://QmTest/";

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const SuperheroSovereignNFT = await ethers.getContractFactory("SuperheroSovereignNFT");
    nft = await SuperheroSovereignNFT.deploy(baseURI);
    await nft.deployed();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await nft.name()).to.equal("Superhero Sovereign NFT");
      expect(await nft.symbol()).to.equal("SSNFT");
    });

    it("Should set the correct max supply", async function () {
      expect(await nft.MAX_SUPPLY()).to.equal(50000);
    });

    it("Should have correct tier boundaries", async function () {
      expect(await nft.FOUNDING_SOVEREIGN_MAX()).to.equal(1000);
      expect(await nft.SOVEREIGN_GUARDIAN_MAX()).to.equal(6000);
      expect(await nft.SOVEREIGN_CITIZEN_MAX()).to.equal(21000);
      expect(await nft.FREQUENCY_KEEPER_MAX()).to.equal(50000);
    });
  });

  describe("Minting", function () {
    it("Should mint NFT with correct tier (Founding Sovereign)", async function () {
      const price = await nft.foundingSovereignPrice();
      await nft.connect(addr1).mint(addr1.address, { value: price });

      expect(await nft.ownerOf(1)).to.equal(addr1.address);
      expect(await nft.getTier(1)).to.equal("Founding Sovereign");
    });

    it("Should charge correct price for tier", async function () {
      const price = await nft.getCurrentMintPrice();
      expect(price).to.equal(await nft.foundingSovereignPrice());
    });

    it("Should revert if insufficient payment", async function () {
      const price = await nft.foundingSovereignPrice();
      const insufficientPrice = price.div(2);

      await expect(
        nft.connect(addr1).mint(addr1.address, { value: insufficientPrice })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should refund excess payment", async function () {
      const price = await nft.foundingSovereignPrice();
      const excessPrice = price.mul(2);

      const balanceBefore = await addr1.getBalance();
      const tx = await nft.connect(addr1).mint(addr1.address, { value: excessPrice });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);
      const balanceAfter = await addr1.getBalance();

      const expectedBalance = balanceBefore.sub(price).sub(gasUsed);
      expect(balanceAfter).to.be.closeTo(expectedBalance, ethers.utils.parseEther("0.001"));
    });
  });

  describe("Tier System", function () {
    it("Should return correct voting power for each tier", async function () {
      expect(await nft.getVotingPower(1)).to.equal(5); // Founding Sovereign
      expect(await nft.getVotingPower(1001)).to.equal(3); // Sovereign Guardian
      expect(await nft.getVotingPower(6001)).to.equal(2); // Sovereign Citizen
      expect(await nft.getVotingPower(21001)).to.equal(1); // Frequency Keeper
    });

    it("Should transition to next tier price after max reached", async function () {
      // Mint all Founding Sovereign NFTs (using batch mint for efficiency in test)
      await nft.connect(owner).batchMint(addr1.address, 1000);

      const newPrice = await nft.getCurrentMintPrice();
      expect(newPrice).to.equal(await nft.sovereignGuardianPrice());
    });
  });

  describe("Evolution", function () {
    beforeEach(async function () {
      const price = await nft.foundingSovereignPrice();
      await nft.connect(addr1).mint(addr1.address, { value: price });
    });

    it("Should evolve NFT and increase level", async function () {
      const tokenId = 1;
      expect(await nft.evolutionLevel(tokenId)).to.equal(1);

      await nft.evolveNFT(tokenId);

      expect(await nft.evolutionLevel(tokenId)).to.equal(2);
    });

    it("Should increase voting power on evolution", async function () {
      const tokenId = 1;
      const initialVotingPower = await nft.votingPowerMultiplier(tokenId);

      await nft.evolveNFT(tokenId);

      const newVotingPower = await nft.votingPowerMultiplier(tokenId);
      expect(newVotingPower).to.be.gt(initialVotingPower);
    });
  });

  describe("Achievements", function () {
    beforeEach(async function () {
      const price = await nft.foundingSovereignPrice();
      await nft.connect(addr1).mint(addr1.address, { value: price });
    });

    it("Should add achievements to NFT", async function () {
      const tokenId = 1;
      await nft.addAchievement(tokenId, "First Mint");
      await nft.addAchievement(tokenId, "Community Hero");

      const achievements = await nft.getAchievements(tokenId);
      expect(achievements.length).to.equal(2);
      expect(achievements[0]).to.equal("First Mint");
      expect(achievements[1]).to.equal("Community Hero");
    });
  });

  describe("Batch Minting", function () {
    it("Should batch mint multiple NFTs", async function () {
      await nft.batchMint(addr1.address, 10);

      expect(await nft.balanceOf(addr1.address)).to.equal(10);
      expect(await nft.ownerOf(1)).to.equal(addr1.address);
      expect(await nft.ownerOf(10)).to.equal(addr1.address);
    });

    it("Should not exceed max supply", async function () {
      await expect(
        nft.batchMint(addr1.address, 50001)
      ).to.be.revertedWith("Would exceed max supply");
    });

    it("Should only allow minter role to batch mint", async function () {
      await expect(
        nft.connect(addr1).batchMint(addr2.address, 10)
      ).to.be.reverted;
    });
  });

  describe("Price Updates", function () {
    it("Should allow admin to update mint prices", async function () {
      const newPrice = ethers.utils.parseEther("1");
      await nft.updateMintPrices(newPrice, newPrice, newPrice, newPrice);

      expect(await nft.foundingSovereignPrice()).to.equal(newPrice);
    });

    it("Should only allow admin to update prices", async function () {
      const newPrice = ethers.utils.parseEther("1");
      await expect(
        nft.connect(addr1).updateMintPrices(newPrice, newPrice, newPrice, newPrice)
      ).to.be.reverted;
    });
  });

  describe("Pausability", function () {
    it("Should pause and unpause minting", async function () {
      await nft.pause();

      const price = await nft.foundingSovereignPrice();
      await expect(
        nft.connect(addr1).mint(addr1.address, { value: price })
      ).to.be.revertedWith("Pausable: paused");

      await nft.unpause();

      await expect(
        nft.connect(addr1).mint(addr1.address, { value: price })
      ).to.not.be.reverted;
    });
  });

  describe("Withdrawal", function () {
    it("Should allow admin to withdraw balance", async function () {
      const price = await nft.foundingSovereignPrice();
      await nft.connect(addr1).mint(addr1.address, { value: price });

      const balanceBefore = await owner.getBalance();
      const contractBalance = await ethers.provider.getBalance(nft.address);

      const tx = await nft.withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

      const balanceAfter = await owner.getBalance();
      const expectedBalance = balanceBefore.add(contractBalance).sub(gasUsed);

      expect(balanceAfter).to.be.closeTo(expectedBalance, ethers.utils.parseEther("0.001"));
    });
  });
});
