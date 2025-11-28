/**
 * FlameDNA NFT - Smart Contract Tests
 * 
 * @author Chais Hill - OmniTech1
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PromiseLandNFT", function () {
  let promiseLand;
  let owner;
  let addr1;
  let addr2;

  const NAME = "PromiseLand NFT";
  const SYMBOL = "PROMISE";
  const BASE_URI = "ipfs://QmTestBaseURI/";
  const CONTRACT_URI = "ipfs://QmTestContractURI";
  const ROYALTY_FEE = 500; // 5%

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const PromiseLandNFT = await ethers.getContractFactory("PromiseLandNFT");
    promiseLand = await PromiseLandNFT.deploy(
      NAME,
      SYMBOL,
      BASE_URI,
      CONTRACT_URI,
      owner.address,
      ROYALTY_FEE
    );
    await promiseLand.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set the correct name and symbol", async function () {
      expect(await promiseLand.name()).to.equal(NAME);
      expect(await promiseLand.symbol()).to.equal(SYMBOL);
    });

    it("should set the correct owner", async function () {
      expect(await promiseLand.owner()).to.equal(owner.address);
    });

    it("should set correct max supply values", async function () {
      expect(await promiseLand.MAX_SUPPLY()).to.equal(10000);
      expect(await promiseLand.GENESIS_SUPPLY()).to.equal(1000);
      expect(await promiseLand.FOUNDING_SUPPLY()).to.equal(3000);
    });

    it("should have minting disabled by default", async function () {
      expect(await promiseLand.genesisActive()).to.equal(false);
      expect(await promiseLand.foundingActive()).to.equal(false);
      expect(await promiseLand.publicMintActive()).to.equal(false);
    });
  });

  describe("Owner Minting", function () {
    it("should allow owner to mint tokens", async function () {
      await promiseLand.ownerMint(addr1.address, 1, 0); // Tier.Genesis = 0
      expect(await promiseLand.balanceOf(addr1.address)).to.equal(1);
      expect(await promiseLand.ownerOf(0)).to.equal(addr1.address);
    });

    it("should track token tier correctly", async function () {
      await promiseLand.ownerMint(addr1.address, 1, 0); // Genesis
      await promiseLand.ownerMint(addr2.address, 1, 1); // FoundingSupporter
      
      expect(await promiseLand.getTokenTier(0)).to.equal(0);
      expect(await promiseLand.getTokenTier(1)).to.equal(1);
    });

    it("should not allow non-owner to mint", async function () {
      await expect(
        promiseLand.connect(addr1).ownerMint(addr1.address, 1, 0)
      ).to.be.revertedWithCustomError(promiseLand, "OwnableUnauthorizedAccount");
    });
  });

  describe("Genesis Minting", function () {
    beforeEach(async function () {
      await promiseLand.setGenesisAllowlist([addr1.address], true);
      await promiseLand.setMintPhases(true, false, false);
    });

    it("should allow allowlisted address to mint Genesis", async function () {
      const mintPrice = await promiseLand.genesisMintPrice();
      await promiseLand.connect(addr1).mintGenesis(1, { value: mintPrice });
      
      expect(await promiseLand.balanceOf(addr1.address)).to.equal(1);
      expect(await promiseLand.getTokenTier(0)).to.equal(0); // Genesis
    });

    it("should not allow non-allowlisted address to mint Genesis", async function () {
      const mintPrice = await promiseLand.genesisMintPrice();
      await expect(
        promiseLand.connect(addr2).mintGenesis(1, { value: mintPrice })
      ).to.be.revertedWith("Not on Genesis allowlist");
    });

    it("should not allow minting without sufficient payment", async function () {
      await expect(
        promiseLand.connect(addr1).mintGenesis(1, { value: 0 })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("should respect max per wallet limit", async function () {
      const mintPrice = await promiseLand.genesisMintPrice();
      const maxPerWallet = await promiseLand.maxGenesisPerWallet();
      
      await promiseLand.connect(addr1).mintGenesis(maxPerWallet, { 
        value: mintPrice * maxPerWallet 
      });
      
      await expect(
        promiseLand.connect(addr1).mintGenesis(1, { value: mintPrice })
      ).to.be.revertedWith("Exceeds max per wallet");
    });
  });

  describe("Allowlist Management", function () {
    it("should add addresses to Genesis allowlist", async function () {
      await promiseLand.setGenesisAllowlist([addr1.address, addr2.address], true);
      
      expect(await promiseLand.genesisAllowlist(addr1.address)).to.equal(true);
      expect(await promiseLand.genesisAllowlist(addr2.address)).to.equal(true);
    });

    it("should remove addresses from allowlist", async function () {
      await promiseLand.setGenesisAllowlist([addr1.address], true);
      await promiseLand.setGenesisAllowlist([addr1.address], false);
      
      expect(await promiseLand.genesisAllowlist(addr1.address)).to.equal(false);
    });
  });

  describe("Phase Management", function () {
    it("should toggle mint phases correctly", async function () {
      await promiseLand.setMintPhases(true, true, true);
      
      expect(await promiseLand.genesisActive()).to.equal(true);
      expect(await promiseLand.foundingActive()).to.equal(true);
      expect(await promiseLand.publicMintActive()).to.equal(true);
    });
  });

  describe("Price Management", function () {
    it("should allow owner to update prices", async function () {
      const newGenesisPrice = ethers.parseEther("0.2");
      const newFoundingPrice = ethers.parseEther("0.1");
      const newPublicPrice = ethers.parseEther("0.05");
      
      await promiseLand.setPrices(newGenesisPrice, newFoundingPrice, newPublicPrice);
      
      expect(await promiseLand.genesisMintPrice()).to.equal(newGenesisPrice);
      expect(await promiseLand.foundingMintPrice()).to.equal(newFoundingPrice);
      expect(await promiseLand.publicMintPrice()).to.equal(newPublicPrice);
    });
  });

  describe("Withdrawal", function () {
    it("should allow owner to withdraw funds", async function () {
      // First, add some funds via minting
      await promiseLand.setGenesisAllowlist([addr1.address], true);
      await promiseLand.setMintPhases(true, false, false);
      
      const mintPrice = await promiseLand.genesisMintPrice();
      await promiseLand.connect(addr1).mintGenesis(1, { value: mintPrice });
      
      const initialBalance = await ethers.provider.getBalance(owner.address);
      
      const tx = await promiseLand.withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      
      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance).to.be.closeTo(
        initialBalance + mintPrice - gasUsed,
        ethers.parseEther("0.001")
      );
    });
  });

  describe("Royalty Info", function () {
    it("should return correct royalty info", async function () {
      await promiseLand.ownerMint(addr1.address, 1, 0);
      
      const salePrice = ethers.parseEther("1");
      const [receiver, royaltyAmount] = await promiseLand.royaltyInfo(0, salePrice);
      
      expect(receiver).to.equal(owner.address);
      expect(royaltyAmount).to.equal(ethers.parseEther("0.05")); // 5%
    });
  });
});

describe("FlameDNAGenesis", function () {
  let flameDNA;
  let owner;
  let addr1;

  const NAME = "FlameDNA Genesis";
  const SYMBOL = "FDNAG";
  const BASE_URI = "ipfs://QmTestBaseURI/";

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    const FlameDNAGenesis = await ethers.getContractFactory("FlameDNAGenesis");
    flameDNA = await FlameDNAGenesis.deploy(NAME, SYMBOL, BASE_URI);
    await flameDNA.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set the correct name and symbol", async function () {
      expect(await flameDNA.name()).to.equal(NAME);
      expect(await flameDNA.symbol()).to.equal(SYMBOL);
    });

    it("should have soulbound enabled by default", async function () {
      expect(await flameDNA.soulbound()).to.equal(true);
    });
  });

  describe("Genesis Minting", function () {
    beforeEach(async function () {
      await flameDNA.setMintActive(true);
    });

    it("should mint Genesis token with DNA data", async function () {
      await flameDNA.mintGenesis(addr1.address, 963, 0); // Fire element
      
      expect(await flameDNA.balanceOf(addr1.address)).to.equal(1);
      
      const dna = await flameDNA.getDNA(0);
      expect(dna.frequency).to.equal(963);
      expect(dna.element).to.equal(0);
    });

    it("should reject invalid frequency", async function () {
      await expect(
        flameDNA.mintGenesis(addr1.address, 500, 0)
      ).to.be.revertedWith("Invalid frequency");
    });

    it("should reject invalid element", async function () {
      await expect(
        flameDNA.mintGenesis(addr1.address, 963, 5)
      ).to.be.revertedWith("Invalid element");
    });
  });

  describe("Soulbound Transfers", function () {
    beforeEach(async function () {
      await flameDNA.setMintActive(true);
      await flameDNA.mintGenesis(addr1.address, 963, 0);
    });

    it("should prevent transfers when soulbound", async function () {
      await expect(
        flameDNA.connect(addr1).transferFrom(addr1.address, owner.address, 0)
      ).to.be.revertedWith("Soulbound: transfers disabled");
    });

    it("should allow transfers when soulbound is disabled", async function () {
      await flameDNA.setSoulbound(false);
      
      await flameDNA.connect(addr1).transferFrom(addr1.address, owner.address, 0);
      expect(await flameDNA.ownerOf(0)).to.equal(owner.address);
    });
  });

  describe("Element Names", function () {
    it("should return correct element names", async function () {
      expect(await flameDNA.getElementName(0)).to.equal("Fire");
      expect(await flameDNA.getElementName(1)).to.equal("Water");
      expect(await flameDNA.getElementName(2)).to.equal("Earth");
      expect(await flameDNA.getElementName(3)).to.equal("Air");
      expect(await flameDNA.getElementName(4)).to.equal("Ether");
    });
  });
});
