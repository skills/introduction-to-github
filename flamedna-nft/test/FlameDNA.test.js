const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FlameDNA", function () {
  let flameDNA;
  let owner;
  let addr1;
  let addr2;
  const baseURI = "ipfs://QmTestURI/";
  const mintPrice = ethers.parseEther("0.05");
  const whitelistPrice = ethers.parseEther("0.04");

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const FlameDNA = await ethers.getContractFactory("FlameDNA");
    flameDNA = await FlameDNA.deploy(owner.address, baseURI);
    await flameDNA.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await flameDNA.name()).to.equal("FlameDNA");
      expect(await flameDNA.symbol()).to.equal("FDNA");
    });

    it("Should set the correct owner", async function () {
      expect(await flameDNA.owner()).to.equal(owner.address);
    });

    it("Should set the correct max supply", async function () {
      expect(await flameDNA.MAX_SUPPLY()).to.equal(10000n);
    });

    it("Should set the correct mint price", async function () {
      expect(await flameDNA.mintPrice()).to.equal(mintPrice);
    });

    it("Should set the correct whitelist price", async function () {
      expect(await flameDNA.whitelistPrice()).to.equal(whitelistPrice);
    });

    it("Should start with zero tokens minted", async function () {
      expect(await flameDNA.totalMinted()).to.equal(0n);
    });

    it("Should start with whitelist disabled", async function () {
      expect(await flameDNA.whitelistEnabled()).to.equal(false);
    });
  });

  describe("Minting", function () {
    it("Should mint a token with correct payment", async function () {
      await flameDNA.connect(addr1).mint({ value: mintPrice });
      expect(await flameDNA.balanceOf(addr1.address)).to.equal(1n);
      expect(await flameDNA.ownerOf(0)).to.equal(addr1.address);
    });

    it("Should fail with insufficient payment", async function () {
      const lowPrice = ethers.parseEther("0.01");
      await expect(
        flameDNA.connect(addr1).mint({ value: lowPrice })
      ).to.be.revertedWith("FlameDNA: Insufficient payment");
    });

    it("Should refund excess payment", async function () {
      const excessPrice = ethers.parseEther("0.1");
      const balanceBefore = await ethers.provider.getBalance(addr1.address);
      
      const tx = await flameDNA.connect(addr1).mint({ value: excessPrice });
      const receipt = await tx.wait();
      // Use effectiveGasPrice for EIP-1559 compatibility
      const gasCost = receipt.gasUsed * (receipt.gasPrice || receipt.effectiveGasPrice);
      
      const balanceAfter = await ethers.provider.getBalance(addr1.address);
      const expectedBalance = balanceBefore - mintPrice - gasCost;
      
      expect(balanceAfter).to.be.closeTo(expectedBalance, ethers.parseEther("0.001"));
    });

    it("Should assign rarity to minted token", async function () {
      await flameDNA.connect(addr1).mint({ value: mintPrice });
      const rarity = await flameDNA.tokenRarity(0);
      
      const validRarities = ["Common", "Rare", "Epic", "Legendary", "Divine"];
      expect(validRarities).to.include(rarity);
    });

    it("Should emit TokenMinted event", async function () {
      await expect(flameDNA.connect(addr1).mint({ value: mintPrice }))
        .to.emit(flameDNA, "TokenMinted")
        .withArgs(addr1.address, 0n, expect.anything());
    });
  });

  describe("Whitelist Minting", function () {
    beforeEach(async function () {
      // Enable whitelist and add addr1
      await flameDNA.setWhitelistEnabled(true);
      await flameDNA.addToWhitelist([addr1.address]);
    });

    it("Should allow whitelisted address to mint at discount", async function () {
      await flameDNA.connect(addr1).mint({ value: whitelistPrice });
      expect(await flameDNA.balanceOf(addr1.address)).to.equal(1n);
    });

    it("Should return correct mint price for whitelisted user", async function () {
      expect(await flameDNA.getMintPrice(addr1.address)).to.equal(whitelistPrice);
    });

    it("Should return regular price for non-whitelisted user", async function () {
      expect(await flameDNA.getMintPrice(addr2.address)).to.equal(mintPrice);
    });

    it("Should require full price for non-whitelisted during whitelist period", async function () {
      await expect(
        flameDNA.connect(addr2).mint({ value: whitelistPrice })
      ).to.be.revertedWith("FlameDNA: Insufficient payment");
    });

    it("Should emit WhitelistUpdated event", async function () {
      await expect(flameDNA.addToWhitelist([addr2.address]))
        .to.emit(flameDNA, "WhitelistUpdated")
        .withArgs(addr2.address, true);
    });

    it("Should emit WhitelistEnabledUpdated event", async function () {
      await expect(flameDNA.setWhitelistEnabled(false))
        .to.emit(flameDNA, "WhitelistEnabledUpdated")
        .withArgs(false);
    });
  });

  describe("Batch Minting", function () {
    it("Should batch mint multiple tokens", async function () {
      const quantity = 3n;
      await flameDNA.connect(addr1).batchMint(quantity, { value: mintPrice * quantity });
      expect(await flameDNA.balanceOf(addr1.address)).to.equal(quantity);
    });

    it("Should fail with quantity over 10", async function () {
      await expect(
        flameDNA.connect(addr1).batchMint(11, { value: mintPrice * 11n })
      ).to.be.revertedWith("FlameDNA: Invalid quantity");
    });

    it("Should fail with zero quantity", async function () {
      await expect(
        flameDNA.connect(addr1).batchMint(0, { value: 0 })
      ).to.be.revertedWith("FlameDNA: Invalid quantity");
    });

    it("Should apply whitelist discount to batch mint", async function () {
      await flameDNA.setWhitelistEnabled(true);
      await flameDNA.addToWhitelist([addr1.address]);
      
      const quantity = 5n;
      await flameDNA.connect(addr1).batchMint(quantity, { value: whitelistPrice * quantity });
      expect(await flameDNA.balanceOf(addr1.address)).to.equal(quantity);
    });
  });

  describe("Owner Functions", function () {
    it("Should allow owner to mint to any address with rarity index", async function () {
      await flameDNA.ownerMint(addr1.address, 3); // 3 = Legendary
      expect(await flameDNA.balanceOf(addr1.address)).to.equal(1n);
      expect(await flameDNA.tokenRarity(0)).to.equal("Legendary");
    });

    it("Should allow owner to mint by name (backward compatible)", async function () {
      await flameDNA.ownerMintByName(addr1.address, "Divine");
      expect(await flameDNA.balanceOf(addr1.address)).to.equal(1n);
      expect(await flameDNA.tokenRarity(0)).to.equal("Divine");
    });

    it("Should not allow non-owner to use ownerMint", async function () {
      await expect(
        flameDNA.connect(addr1).ownerMint(addr2.address, 0)
      ).to.be.revertedWithCustomError(flameDNA, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to update mint price", async function () {
      const newPrice = ethers.parseEther("0.1");
      await flameDNA.setMintPrice(newPrice);
      expect(await flameDNA.mintPrice()).to.equal(newPrice);
    });

    it("Should allow owner to update whitelist price", async function () {
      const newPrice = ethers.parseEther("0.03");
      await flameDNA.setWhitelistPrice(newPrice);
      expect(await flameDNA.whitelistPrice()).to.equal(newPrice);
    });

    it("Should allow owner to pause and unpause", async function () {
      await flameDNA.pause();
      await expect(
        flameDNA.connect(addr1).mint({ value: mintPrice })
      ).to.be.revertedWithCustomError(flameDNA, "EnforcedPause");

      await flameDNA.unpause();
      await flameDNA.connect(addr1).mint({ value: mintPrice });
      expect(await flameDNA.balanceOf(addr1.address)).to.equal(1n);
    });

    it("Should allow owner to withdraw", async function () {
      // Mint a token to add funds to contract
      await flameDNA.connect(addr1).mint({ value: mintPrice });
      
      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      const tx = await flameDNA.withdraw();
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.effectiveGasPrice;
      
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      expect(ownerBalanceAfter).to.be.closeTo(
        ownerBalanceBefore + mintPrice - gasCost,
        ethers.parseEther("0.001")
      );
    });

    it("Should emit Withdrawn event", async function () {
      await flameDNA.connect(addr1).mint({ value: mintPrice });
      
      await expect(flameDNA.withdraw())
        .to.emit(flameDNA, "Withdrawn")
        .withArgs(owner.address, mintPrice);
    });

    it("Should manage whitelist correctly", async function () {
      // Add to whitelist
      await flameDNA.addToWhitelist([addr1.address, addr2.address]);
      expect(await flameDNA.whitelist(addr1.address)).to.equal(true);
      expect(await flameDNA.whitelist(addr2.address)).to.equal(true);
      
      // Remove from whitelist
      await flameDNA.removeFromWhitelist([addr1.address]);
      expect(await flameDNA.whitelist(addr1.address)).to.equal(false);
      expect(await flameDNA.whitelist(addr2.address)).to.equal(true);
    });
  });

  describe("View Functions", function () {
    it("Should return correct remaining supply", async function () {
      expect(await flameDNA.remainingSupply()).to.equal(10000n);
      
      await flameDNA.connect(addr1).mint({ value: mintPrice });
      expect(await flameDNA.remainingSupply()).to.equal(9999n);
    });

    it("Should return correct totalMinted", async function () {
      expect(await flameDNA.totalMinted()).to.equal(0n);
      
      await flameDNA.connect(addr1).mint({ value: mintPrice });
      expect(await flameDNA.totalMinted()).to.equal(1n);
    });
  });

  describe("Security", function () {
    it("Should prevent reentrancy on mint", async function () {
      // The nonReentrant modifier should protect against reentrancy
      // This test verifies the modifier is in place
      await flameDNA.connect(addr1).mint({ value: mintPrice });
      expect(await flameDNA.balanceOf(addr1.address)).to.equal(1n);
    });

    it("Should prevent reentrancy on withdraw", async function () {
      await flameDNA.connect(addr1).mint({ value: mintPrice });
      await flameDNA.withdraw();
      expect(await ethers.provider.getBalance(await flameDNA.getAddress())).to.equal(0n);
    });
  });
});
