const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("PharaohConsciousnessFusion", function () {
  let pharaoh;
  let owner;
  let royaltyReceiver;
  let addr1;
  let addr2;
  let addr3;
  
  const baseURI = "ipfs://QmConsciousnessMirror/";
  const mintPrice = ethers.parseEther("0.08");
  const allowlistPrice = ethers.parseEther("0.05");
  const MAX_SUPPLY = 3333n;
  const DEFAULT_ROYALTY_FEE = 500n; // 5%

  beforeEach(async function () {
    [owner, royaltyReceiver, addr1, addr2, addr3] = await ethers.getSigners();
    
    const PharaohConsciousnessFusion = await ethers.getContractFactory("PharaohConsciousnessFusion");
    pharaoh = await upgrades.deployProxy(
      PharaohConsciousnessFusion,
      [owner.address, baseURI, royaltyReceiver.address, mintPrice, allowlistPrice],
      { kind: 'uups' }
    );
    await pharaoh.waitForDeployment();
  });

  describe("Deployment & Initialization", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await pharaoh.name()).to.equal("Consciousness Mirror");
      expect(await pharaoh.symbol()).to.equal("CMIRROR");
    });

    it("Should set the correct owner", async function () {
      expect(await pharaoh.owner()).to.equal(owner.address);
    });

    it("Should set the correct max supply", async function () {
      expect(await pharaoh.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
    });

    it("Should set the correct mint prices", async function () {
      expect(await pharaoh.mintPrice()).to.equal(mintPrice);
      expect(await pharaoh.allowlistPrice()).to.equal(allowlistPrice);
    });

    it("Should start with zero tokens minted", async function () {
      expect(await pharaoh.totalMinted()).to.equal(0n);
    });

    it("Should start with metadata unlocked", async function () {
      expect(await pharaoh.metadataLocked()).to.equal(false);
    });

    it("Should start with mint phases disabled", async function () {
      expect(await pharaoh.allowlistMintActive()).to.equal(false);
      expect(await pharaoh.publicMintActive()).to.equal(false);
    });

    it("Should set default royalty", async function () {
      // Mint a token to test royalty
      await pharaoh.setMintPhases(false, true);
      await pharaoh.connect(addr1).publicMint(1, { value: mintPrice });
      
      const [receiver, amount] = await pharaoh.royaltyInfo(0, ethers.parseEther("1"));
      expect(receiver).to.equal(royaltyReceiver.address);
      expect(amount).to.equal(ethers.parseEther("0.05")); // 5% of 1 ETH
    });

    it("Should set default max per wallet limits", async function () {
      expect(await pharaoh.maxPerWalletAllowlist()).to.equal(3n);
      expect(await pharaoh.maxPerWalletPublic()).to.equal(5n);
    });
  });

  describe("Allowlist Management with Audit Events", function () {
    it("Should add addresses to allowlist and emit events", async function () {
      const tx = await pharaoh.addToAllowlist([addr1.address, addr2.address]);
      const receipt = await tx.wait();
      
      expect(await pharaoh.isOnAllowlist(addr1.address)).to.equal(true);
      expect(await pharaoh.isOnAllowlist(addr2.address)).to.equal(true);
      
      // Check for AllowlistAdded events
      const events = receipt.logs.filter(log => {
        try {
          return pharaoh.interface.parseLog(log)?.name === "AllowlistAdded";
        } catch {
          return false;
        }
      });
      expect(events.length).to.equal(2);
    });

    it("Should remove addresses from allowlist and emit events", async function () {
      await pharaoh.addToAllowlist([addr1.address, addr2.address]);
      
      const tx = await pharaoh.removeFromAllowlist([addr1.address]);
      const receipt = await tx.wait();
      
      expect(await pharaoh.isOnAllowlist(addr1.address)).to.equal(false);
      expect(await pharaoh.isOnAllowlist(addr2.address)).to.equal(true);
      
      // Check for AllowlistRemoved event
      const events = receipt.logs.filter(log => {
        try {
          return pharaoh.interface.parseLog(log)?.name === "AllowlistRemoved";
        } catch {
          return false;
        }
      });
      expect(events.length).to.equal(1);
    });

    it("Should emit AllowlistAdded with correct parameters", async function () {
      await expect(pharaoh.addToAllowlist([addr1.address]))
        .to.emit(pharaoh, "AllowlistAdded")
        .withArgs(addr1.address, owner.address, expect.anything());
    });

    it("Should emit AllowlistRemoved with correct parameters", async function () {
      await pharaoh.addToAllowlist([addr1.address]);
      
      await expect(pharaoh.removeFromAllowlist([addr1.address]))
        .to.emit(pharaoh, "AllowlistRemoved")
        .withArgs(addr1.address, owner.address, expect.anything());
    });

    it("Should reject batch size over maximum", async function () {
      const addresses = Array(101).fill(addr1.address);
      
      await expect(pharaoh.addToAllowlist(addresses))
        .to.be.revertedWithCustomError(pharaoh, "BatchSizeTooLarge");
    });

    it("Should skip zero addresses silently", async function () {
      await pharaoh.addToAllowlist([ethers.ZeroAddress, addr1.address]);
      
      expect(await pharaoh.isOnAllowlist(ethers.ZeroAddress)).to.equal(false);
      expect(await pharaoh.isOnAllowlist(addr1.address)).to.equal(true);
    });

    it("Should not duplicate events for already added addresses", async function () {
      await pharaoh.addToAllowlist([addr1.address]);
      
      const tx = await pharaoh.addToAllowlist([addr1.address]);
      const receipt = await tx.wait();
      
      const events = receipt.logs.filter(log => {
        try {
          return pharaoh.interface.parseLog(log)?.name === "AllowlistAdded";
        } catch {
          return false;
        }
      });
      expect(events.length).to.equal(0);
    });

    it("Should reject non-owner from managing allowlist", async function () {
      await expect(pharaoh.connect(addr1).addToAllowlist([addr2.address]))
        .to.be.revertedWithCustomError(pharaoh, "OwnableUnauthorizedAccount");
    });
  });

  describe("Allowlist Minting", function () {
    beforeEach(async function () {
      await pharaoh.addToAllowlist([addr1.address]);
      await pharaoh.setMintPhases(true, false);
    });

    it("Should allow allowlisted address to mint", async function () {
      await pharaoh.connect(addr1).allowlistMint(1, { value: allowlistPrice });
      
      expect(await pharaoh.balanceOf(addr1.address)).to.equal(1n);
      expect(await pharaoh.ownerOf(0)).to.equal(addr1.address);
    });

    it("Should reject non-allowlisted address", async function () {
      await expect(pharaoh.connect(addr2).allowlistMint(1, { value: allowlistPrice }))
        .to.be.revertedWithCustomError(pharaoh, "NotOnAllowlist");
    });

    it("Should reject when allowlist mint not active", async function () {
      await pharaoh.setMintPhases(false, false);
      
      await expect(pharaoh.connect(addr1).allowlistMint(1, { value: allowlistPrice }))
        .to.be.revertedWithCustomError(pharaoh, "AllowlistMintNotActive");
    });

    it("Should reject insufficient payment", async function () {
      await expect(pharaoh.connect(addr1).allowlistMint(1, { value: ethers.parseEther("0.01") }))
        .to.be.revertedWithCustomError(pharaoh, "InsufficientPayment");
    });

    it("Should reject exceeding max per wallet", async function () {
      await pharaoh.connect(addr1).allowlistMint(3, { value: allowlistPrice * 3n });
      
      await expect(pharaoh.connect(addr1).allowlistMint(1, { value: allowlistPrice }))
        .to.be.revertedWithCustomError(pharaoh, "ExceedsMaxPerWallet");
    });

    it("Should refund excess payment", async function () {
      const excessPayment = ethers.parseEther("1");
      const balanceBefore = await ethers.provider.getBalance(addr1.address);
      
      const tx = await pharaoh.connect(addr1).allowlistMint(1, { value: excessPayment });
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.effectiveGasPrice;
      
      const balanceAfter = await ethers.provider.getBalance(addr1.address);
      const expectedBalance = balanceBefore - allowlistPrice - gasCost;
      
      expect(balanceAfter).to.be.closeTo(expectedBalance, ethers.parseEther("0.001"));
    });

    it("Should emit ConsciousnessMinted event", async function () {
      await expect(pharaoh.connect(addr1).allowlistMint(1, { value: allowlistPrice }))
        .to.emit(pharaoh, "ConsciousnessMinted")
        .withArgs(addr1.address, 0n);
    });
  });

  describe("Public Minting", function () {
    beforeEach(async function () {
      await pharaoh.setMintPhases(false, true);
    });

    it("Should allow public mint", async function () {
      await pharaoh.connect(addr1).publicMint(1, { value: mintPrice });
      
      expect(await pharaoh.balanceOf(addr1.address)).to.equal(1n);
    });

    it("Should reject when public mint not active", async function () {
      await pharaoh.setMintPhases(false, false);
      
      await expect(pharaoh.connect(addr1).publicMint(1, { value: mintPrice }))
        .to.be.revertedWithCustomError(pharaoh, "PublicMintNotActive");
    });

    it("Should reject insufficient payment", async function () {
      await expect(pharaoh.connect(addr1).publicMint(1, { value: ethers.parseEther("0.01") }))
        .to.be.revertedWithCustomError(pharaoh, "InsufficientPayment");
    });

    it("Should reject exceeding max per wallet", async function () {
      await pharaoh.connect(addr1).publicMint(5, { value: mintPrice * 5n });
      
      await expect(pharaoh.connect(addr1).publicMint(1, { value: mintPrice }))
        .to.be.revertedWithCustomError(pharaoh, "ExceedsMaxPerWallet");
    });

    it("Should mint multiple tokens in batch", async function () {
      await pharaoh.connect(addr1).publicMint(3, { value: mintPrice * 3n });
      
      expect(await pharaoh.balanceOf(addr1.address)).to.equal(3n);
      expect(await pharaoh.ownerOf(0)).to.equal(addr1.address);
      expect(await pharaoh.ownerOf(1)).to.equal(addr1.address);
      expect(await pharaoh.ownerOf(2)).to.equal(addr1.address);
    });
  });

  describe("Owner Minting", function () {
    it("Should allow owner to mint to any address", async function () {
      await pharaoh.ownerMint(addr1.address, 5);
      
      expect(await pharaoh.balanceOf(addr1.address)).to.equal(5n);
    });

    it("Should reject non-owner from owner minting", async function () {
      await expect(pharaoh.connect(addr1).ownerMint(addr2.address, 1))
        .to.be.revertedWithCustomError(pharaoh, "OwnableUnauthorizedAccount");
    });

    it("Should reject minting to zero address", async function () {
      await expect(pharaoh.ownerMint(ethers.ZeroAddress, 1))
        .to.be.revertedWithCustomError(pharaoh, "InvalidAddress");
    });
  });

  describe("Post-Mint Lock (Metadata Immutability)", function () {
    it("Should allow setBaseURI when metadata unlocked", async function () {
      const newURI = "ipfs://NewURI/";
      
      await pharaoh.setBaseURI(newURI);
      
      // Mint a token to verify URI
      await pharaoh.setMintPhases(false, true);
      await pharaoh.connect(addr1).publicMint(1, { value: mintPrice });
      
      const tokenURI = await pharaoh.tokenURI(0);
      expect(tokenURI).to.include("NewURI");
    });

    it("Should emit BaseURIUpdated event", async function () {
      const newURI = "ipfs://NewURI/";
      
      await expect(pharaoh.setBaseURI(newURI))
        .to.emit(pharaoh, "BaseURIUpdated")
        .withArgs(newURI);
    });

    it("Should reject lockMetadata before minting complete", async function () {
      await expect(pharaoh.lockMetadata())
        .to.be.revertedWithCustomError(pharaoh, "MintingNotComplete");
    });

    // Helper function to mint all tokens
    async function mintAllTokens() {
      const batchSize = 100;
      const totalBatches = Math.ceil(3333 / batchSize);
      
      for (let i = 0; i < totalBatches; i++) {
        const remaining = 3333 - (i * batchSize);
        const toMint = remaining > batchSize ? batchSize : remaining;
        await pharaoh.ownerMint(addr1.address, toMint);
      }
    }

    it("Should reject setBaseURI after metadata locked", async function () {
      // Mint all 3333 tokens using helper
      await mintAllTokens();
      
      expect(await pharaoh.totalMinted()).to.equal(MAX_SUPPLY);
      
      // Lock metadata
      await pharaoh.lockMetadata();
      expect(await pharaoh.metadataLocked()).to.equal(true);
      
      // Try to update URI - should fail
      await expect(pharaoh.setBaseURI("ipfs://newURI/"))
        .to.be.revertedWithCustomError(pharaoh, "MetadataIsLocked");
    });

    it("Should emit MetadataLocked event", async function () {
      // Mint all tokens using helper
      await mintAllTokens();
      
      await expect(pharaoh.lockMetadata())
        .to.emit(pharaoh, "MetadataLocked");
    });
  });

  describe("ERC2981 Royalties", function () {
    beforeEach(async function () {
      await pharaoh.setMintPhases(false, true);
      await pharaoh.connect(addr1).publicMint(1, { value: mintPrice });
    });

    it("Should return correct royalty info", async function () {
      const salePrice = ethers.parseEther("10");
      const [receiver, royaltyAmount] = await pharaoh.royaltyInfo(0, salePrice);
      
      expect(receiver).to.equal(royaltyReceiver.address);
      expect(royaltyAmount).to.equal(ethers.parseEther("0.5")); // 5% of 10 ETH
    });

    it("Should allow owner to update default royalty", async function () {
      const newReceiver = addr2.address;
      const newFee = 1000n; // 10%
      
      await pharaoh.setDefaultRoyalty(newReceiver, newFee);
      
      // Mint new token to test new default
      await pharaoh.connect(addr2).publicMint(1, { value: mintPrice });
      
      const [receiver, royaltyAmount] = await pharaoh.royaltyInfo(1, ethers.parseEther("10"));
      expect(receiver).to.equal(newReceiver);
      expect(royaltyAmount).to.equal(ethers.parseEther("1")); // 10% of 10 ETH
    });

    it("Should allow owner to set token-specific royalty", async function () {
      const tokenReceiver = addr3.address;
      const tokenFee = 250n; // 2.5%
      
      await pharaoh.setTokenRoyalty(0, tokenReceiver, tokenFee);
      
      const [receiver, royaltyAmount] = await pharaoh.royaltyInfo(0, ethers.parseEther("10"));
      expect(receiver).to.equal(tokenReceiver);
      expect(royaltyAmount).to.equal(ethers.parseEther("0.25")); // 2.5% of 10 ETH
    });

    it("Should allow owner to reset token royalty", async function () {
      await pharaoh.setTokenRoyalty(0, addr3.address, 250n);
      await pharaoh.resetTokenRoyalty(0);
      
      const [receiver, ] = await pharaoh.royaltyInfo(0, ethers.parseEther("10"));
      expect(receiver).to.equal(royaltyReceiver.address);
    });

    it("Should emit RoyaltyUpdated event", async function () {
      await expect(pharaoh.setDefaultRoyalty(addr2.address, 1000n))
        .to.emit(pharaoh, "RoyaltyUpdated")
        .withArgs(addr2.address, 1000n);
    });

    it("Should support ERC2981 interface", async function () {
      // ERC2981 interface ID
      const ERC2981_INTERFACE_ID = "0x2a55205a";
      expect(await pharaoh.supportsInterface(ERC2981_INTERFACE_ID)).to.equal(true);
    });
  });

  describe("Governance Voting Power", function () {
    beforeEach(async function () {
      await pharaoh.setMintPhases(false, true);
    });

    it("Should return voting power for a token", async function () {
      await pharaoh.connect(addr1).publicMint(1, { value: mintPrice });
      
      expect(await pharaoh.getVotingPower(0)).to.equal(1n);
    });

    it("Should return total voting power for an address", async function () {
      await pharaoh.connect(addr1).publicMint(3, { value: mintPrice * 3n });
      
      expect(await pharaoh.getTotalVotingPower(addr1.address)).to.equal(3n);
    });

    it("Should allow owner to update voting power per token", async function () {
      await pharaoh.setVotingPowerPerToken(5);
      await pharaoh.connect(addr1).publicMint(2, { value: mintPrice * 2n });
      
      expect(await pharaoh.getVotingPower(0)).to.equal(5n);
      expect(await pharaoh.getTotalVotingPower(addr1.address)).to.equal(10n);
    });
  });

  describe("Pausable", function () {
    beforeEach(async function () {
      await pharaoh.setMintPhases(false, true);
    });

    it("Should allow owner to pause", async function () {
      await pharaoh.pause();
      
      await expect(pharaoh.connect(addr1).publicMint(1, { value: mintPrice }))
        .to.be.revertedWithCustomError(pharaoh, "EnforcedPause");
    });

    it("Should allow owner to unpause", async function () {
      await pharaoh.pause();
      await pharaoh.unpause();
      
      await pharaoh.connect(addr1).publicMint(1, { value: mintPrice });
      expect(await pharaoh.balanceOf(addr1.address)).to.equal(1n);
    });

    it("Should reject non-owner from pausing", async function () {
      await expect(pharaoh.connect(addr1).pause())
        .to.be.revertedWithCustomError(pharaoh, "OwnableUnauthorizedAccount");
    });
  });

  describe("Withdrawal", function () {
    beforeEach(async function () {
      await pharaoh.setMintPhases(false, true);
      await pharaoh.connect(addr1).publicMint(1, { value: mintPrice });
    });

    it("Should allow owner to withdraw", async function () {
      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      
      const tx = await pharaoh.withdraw();
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.effectiveGasPrice;
      
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      expect(ownerBalanceAfter).to.be.closeTo(
        ownerBalanceBefore + mintPrice - gasCost,
        ethers.parseEther("0.001")
      );
    });

    it("Should emit Withdrawn event", async function () {
      await expect(pharaoh.withdraw())
        .to.emit(pharaoh, "Withdrawn")
        .withArgs(owner.address, mintPrice);
    });

    it("Should reject withdrawal with no funds", async function () {
      await pharaoh.withdraw();
      
      await expect(pharaoh.withdraw())
        .to.be.revertedWithCustomError(pharaoh, "NoFundsToWithdraw");
    });

    it("Should reject non-owner from withdrawing", async function () {
      await expect(pharaoh.connect(addr1).withdraw())
        .to.be.revertedWithCustomError(pharaoh, "OwnableUnauthorizedAccount");
    });
  });

  describe("View Functions", function () {
    it("Should return correct remaining supply", async function () {
      expect(await pharaoh.remainingSupply()).to.equal(MAX_SUPPLY);
      
      await pharaoh.setMintPhases(false, true);
      await pharaoh.connect(addr1).publicMint(1, { value: mintPrice });
      
      expect(await pharaoh.remainingSupply()).to.equal(MAX_SUPPLY - 1n);
    });

    it("Should return correct total minted", async function () {
      expect(await pharaoh.totalMinted()).to.equal(0n);
      
      await pharaoh.setMintPhases(false, true);
      await pharaoh.connect(addr1).publicMint(3, { value: mintPrice * 3n });
      
      expect(await pharaoh.totalMinted()).to.equal(3n);
    });

    it("Should return correct minting complete status", async function () {
      expect(await pharaoh.isMintingComplete()).to.equal(false);
    });
  });

  describe("UUPS Upgradeability", function () {
    it("Should be upgradeable by owner", async function () {
      const PharaohConsciousnessFusionV2 = await ethers.getContractFactory("PharaohConsciousnessFusion");
      
      // This would be a V2 contract in real scenario
      const upgraded = await upgrades.upgradeProxy(
        await pharaoh.getAddress(),
        PharaohConsciousnessFusionV2
      );
      
      expect(await upgraded.getAddress()).to.equal(await pharaoh.getAddress());
    });

    it("Should preserve state after upgrade", async function () {
      // Set some state
      await pharaoh.addToAllowlist([addr1.address]);
      await pharaoh.setMintPhases(false, true);
      await pharaoh.connect(addr1).publicMint(1, { value: mintPrice });
      
      const PharaohConsciousnessFusionV2 = await ethers.getContractFactory("PharaohConsciousnessFusion");
      const upgraded = await upgrades.upgradeProxy(
        await pharaoh.getAddress(),
        PharaohConsciousnessFusionV2
      );
      
      // Verify state preserved
      expect(await upgraded.isOnAllowlist(addr1.address)).to.equal(true);
      expect(await upgraded.publicMintActive()).to.equal(true);
      expect(await upgraded.totalMinted()).to.equal(1n);
      expect(await upgraded.ownerOf(0)).to.equal(addr1.address);
    });
  });

  describe("ERC721 Enumerable", function () {
    beforeEach(async function () {
      await pharaoh.setMintPhases(false, true);
      await pharaoh.connect(addr1).publicMint(3, { value: mintPrice * 3n });
    });

    it("Should return total supply", async function () {
      expect(await pharaoh.totalSupply()).to.equal(3n);
    });

    it("Should return token by index", async function () {
      expect(await pharaoh.tokenByIndex(0)).to.equal(0n);
      expect(await pharaoh.tokenByIndex(1)).to.equal(1n);
      expect(await pharaoh.tokenByIndex(2)).to.equal(2n);
    });

    it("Should return token of owner by index", async function () {
      expect(await pharaoh.tokenOfOwnerByIndex(addr1.address, 0)).to.equal(0n);
      expect(await pharaoh.tokenOfOwnerByIndex(addr1.address, 1)).to.equal(1n);
      expect(await pharaoh.tokenOfOwnerByIndex(addr1.address, 2)).to.equal(2n);
    });
  });

  describe("Interface Support", function () {
    it("Should support ERC721 interface", async function () {
      const ERC721_INTERFACE_ID = "0x80ac58cd";
      expect(await pharaoh.supportsInterface(ERC721_INTERFACE_ID)).to.equal(true);
    });

    it("Should support ERC721Enumerable interface", async function () {
      const ERC721_ENUMERABLE_INTERFACE_ID = "0x780e9d63";
      expect(await pharaoh.supportsInterface(ERC721_ENUMERABLE_INTERFACE_ID)).to.equal(true);
    });

    it("Should support ERC2981 interface", async function () {
      const ERC2981_INTERFACE_ID = "0x2a55205a";
      expect(await pharaoh.supportsInterface(ERC2981_INTERFACE_ID)).to.equal(true);
    });
  });
    let pharaohFusion;
    let owner;
    let addr1;
    let addr2;
    let addr3;

    // Token tiers enum values
    const TokenTier = {
        WisdomKeeper: 0,
        LegacyBearer: 1,
        EternalGuardian: 2,
        GenesisSovereign: 3
    };

    // Voting multipliers (in basis points)
    const GENESIS_SOVEREIGN_MULTIPLIER = 888;
    const ETERNAL_GUARDIAN_MULTIPLIER = 444;
    const LEGACY_BEARER_MULTIPLIER = 222;
    const WISDOM_KEEPER_MULTIPLIER = 111;

    // Max supply constants
    const MAX_SUPPLY = 8888;
    const MAX_GENESIS_SOVEREIGN = 8;
    const MAX_ETERNAL_GUARDIAN = 80;
    const MAX_LEGACY_BEARER = 800;
    const MAX_WISDOM_KEEPER = 8000;

    const BASE_URI = "ipfs://scrollverse-pharaoh-consciousness-fusion/";

    beforeEach(async function () {
        [owner, addr1, addr2, addr3] = await ethers.getSigners();

        // Deploy using UUPS proxy pattern
        const PharaohConsciousnessFusion = await ethers.getContractFactory("PharaohConsciousnessFusion");
        pharaohFusion = await upgrades.deployProxy(
            PharaohConsciousnessFusion,
            [owner.address, BASE_URI],
            { 
                initializer: "initialize",
                kind: "uups"
            }
        );
        await pharaohFusion.waitForDeployment();
    });

    describe("Deployment & Initialization", function () {
        it("Should set the correct name and symbol", async function () {
            expect(await pharaohFusion.name()).to.equal("Pharaoh Consciousness Fusion");
            expect(await pharaohFusion.symbol()).to.equal("PFC");
        });

        it("Should set the correct owner", async function () {
            expect(await pharaohFusion.owner()).to.equal(owner.address);
        });

        it("Should have correct max supply", async function () {
            expect(await pharaohFusion.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
        });

        it("Should have correct voting multiplier constants", async function () {
            expect(await pharaohFusion.GENESIS_SOVEREIGN_MULTIPLIER()).to.equal(GENESIS_SOVEREIGN_MULTIPLIER);
            expect(await pharaohFusion.ETERNAL_GUARDIAN_MULTIPLIER()).to.equal(ETERNAL_GUARDIAN_MULTIPLIER);
            expect(await pharaohFusion.LEGACY_BEARER_MULTIPLIER()).to.equal(LEGACY_BEARER_MULTIPLIER);
            expect(await pharaohFusion.WISDOM_KEEPER_MULTIPLIER()).to.equal(WISDOM_KEEPER_MULTIPLIER);
        });

        it("Should initialize with zero minted tokens", async function () {
            const supplyInfo = await pharaohFusion.getSupplyInfo();
            expect(supplyInfo.totalMinted).to.equal(0);
        });

        it("Should initialize minting as not paused", async function () {
            expect(await pharaohFusion.mintingPaused()).to.be.false;
        });

        it("Should set correct tier supply limits", async function () {
            expect(await pharaohFusion.maxPerTier(TokenTier.GenesisSovereign)).to.equal(MAX_GENESIS_SOVEREIGN);
            expect(await pharaohFusion.maxPerTier(TokenTier.EternalGuardian)).to.equal(MAX_ETERNAL_GUARDIAN);
            expect(await pharaohFusion.maxPerTier(TokenTier.LegacyBearer)).to.equal(MAX_LEGACY_BEARER);
            expect(await pharaohFusion.maxPerTier(TokenTier.WisdomKeeper)).to.equal(MAX_WISDOM_KEEPER);
        });
    });

    describe("Minting", function () {
        it("Should mint a token with correct tier", async function () {
            await pharaohFusion.mint(addr1.address, TokenTier.WisdomKeeper);
            
            expect(await pharaohFusion.balanceOf(addr1.address)).to.equal(1);
            expect(await pharaohFusion.ownerOf(0)).to.equal(addr1.address);
            expect(await pharaohFusion.getTokenTier(0)).to.equal(TokenTier.WisdomKeeper);
        });

        it("Should emit TokenMinted event with correct parameters", async function () {
            await expect(pharaohFusion.mint(addr1.address, TokenTier.GenesisSovereign))
                .to.emit(pharaohFusion, "TokenMinted")
                .withArgs(addr1.address, 0, TokenTier.GenesisSovereign, GENESIS_SOVEREIGN_MULTIPLIER);
        });

        it("Should increment token ID counter", async function () {
            await pharaohFusion.mint(addr1.address, TokenTier.WisdomKeeper);
            await pharaohFusion.mint(addr2.address, TokenTier.LegacyBearer);
            
            expect(await pharaohFusion.ownerOf(0)).to.equal(addr1.address);
            expect(await pharaohFusion.ownerOf(1)).to.equal(addr2.address);
        });

        it("Should update minted per tier count", async function () {
            await pharaohFusion.mint(addr1.address, TokenTier.GenesisSovereign);
            await pharaohFusion.mint(addr2.address, TokenTier.GenesisSovereign);
            
            expect(await pharaohFusion.mintedPerTier(TokenTier.GenesisSovereign)).to.equal(2);
        });

        it("Should revert if non-owner tries to mint", async function () {
            await expect(
                pharaohFusion.connect(addr1).mint(addr1.address, TokenTier.WisdomKeeper)
            ).to.be.revertedWithCustomError(pharaohFusion, "OwnableUnauthorizedAccount");
        });

        it("Should revert if minting is paused", async function () {
            await pharaohFusion.toggleMintingPause();
            
            await expect(
                pharaohFusion.mint(addr1.address, TokenTier.WisdomKeeper)
            ).to.be.revertedWithCustomError(pharaohFusion, "MintingPaused");
        });

        it("Should revert if tier supply is reached", async function () {
            // Mint all 8 Genesis Sovereign tokens
            for (let i = 0; i < MAX_GENESIS_SOVEREIGN; i++) {
                await pharaohFusion.mint(addr1.address, TokenTier.GenesisSovereign);
            }
            
            // Try to mint one more
            await expect(
                pharaohFusion.mint(addr2.address, TokenTier.GenesisSovereign)
            ).to.be.revertedWithCustomError(pharaohFusion, "TierSupplyReached");
        });
    });

    describe("Batch Minting", function () {
        it("Should batch mint tokens correctly", async function () {
            const recipients = [addr1.address, addr2.address, addr3.address];
            const tiers = [TokenTier.WisdomKeeper, TokenTier.LegacyBearer, TokenTier.EternalGuardian];
            
            await pharaohFusion.batchMint(recipients, tiers);
            
            expect(await pharaohFusion.balanceOf(addr1.address)).to.equal(1);
            expect(await pharaohFusion.balanceOf(addr2.address)).to.equal(1);
            expect(await pharaohFusion.balanceOf(addr3.address)).to.equal(1);
            
            expect(await pharaohFusion.getTokenTier(0)).to.equal(TokenTier.WisdomKeeper);
            expect(await pharaohFusion.getTokenTier(1)).to.equal(TokenTier.LegacyBearer);
            expect(await pharaohFusion.getTokenTier(2)).to.equal(TokenTier.EternalGuardian);
        });

        it("Should revert batch mint with mismatched arrays", async function () {
            const recipients = [addr1.address, addr2.address];
            const tiers = [TokenTier.WisdomKeeper];
            
            await expect(
                pharaohFusion.batchMint(recipients, tiers)
            ).to.be.revertedWith("Array length mismatch");
        });

        it("Should revert batch mint if non-owner calls", async function () {
            const recipients = [addr1.address];
            const tiers = [TokenTier.WisdomKeeper];
            
            await expect(
                pharaohFusion.connect(addr1).batchMint(recipients, tiers)
            ).to.be.revertedWithCustomError(pharaohFusion, "OwnableUnauthorizedAccount");
        });
    });

    describe("Voting Power", function () {
        it("Should return correct voting multiplier for each tier", async function () {
            expect(await pharaohFusion.getVotingMultiplier(TokenTier.GenesisSovereign)).to.equal(GENESIS_SOVEREIGN_MULTIPLIER);
            expect(await pharaohFusion.getVotingMultiplier(TokenTier.EternalGuardian)).to.equal(ETERNAL_GUARDIAN_MULTIPLIER);
            expect(await pharaohFusion.getVotingMultiplier(TokenTier.LegacyBearer)).to.equal(LEGACY_BEARER_MULTIPLIER);
            expect(await pharaohFusion.getVotingMultiplier(TokenTier.WisdomKeeper)).to.equal(WISDOM_KEEPER_MULTIPLIER);
        });

        it("Should calculate total voting power correctly for single token", async function () {
            await pharaohFusion.mint(addr1.address, TokenTier.GenesisSovereign);
            
            expect(await pharaohFusion.getVotingPower(addr1.address)).to.equal(GENESIS_SOVEREIGN_MULTIPLIER);
        });

        it("Should calculate total voting power correctly for multiple tokens", async function () {
            await pharaohFusion.mint(addr1.address, TokenTier.GenesisSovereign);
            await pharaohFusion.mint(addr1.address, TokenTier.EternalGuardian);
            await pharaohFusion.mint(addr1.address, TokenTier.WisdomKeeper);
            
            const expectedPower = GENESIS_SOVEREIGN_MULTIPLIER + ETERNAL_GUARDIAN_MULTIPLIER + WISDOM_KEEPER_MULTIPLIER;
            expect(await pharaohFusion.getVotingPower(addr1.address)).to.equal(expectedPower);
        });

        it("Should return zero voting power for address with no tokens", async function () {
            expect(await pharaohFusion.getVotingPower(addr1.address)).to.equal(0);
        });
    });

    describe("Supply Information", function () {
        it("Should return correct supply info after minting", async function () {
            await pharaohFusion.mint(addr1.address, TokenTier.GenesisSovereign);
            await pharaohFusion.mint(addr2.address, TokenTier.EternalGuardian);
            await pharaohFusion.mint(addr3.address, TokenTier.WisdomKeeper);
            
            const supplyInfo = await pharaohFusion.getSupplyInfo();
            
            expect(supplyInfo.totalMinted).to.equal(3);
            expect(supplyInfo.maxSupply).to.equal(MAX_SUPPLY);
            expect(supplyInfo.genesisMinted).to.equal(1);
            expect(supplyInfo.eternalMinted).to.equal(1);
            expect(supplyInfo.legacyMinted).to.equal(0);
            expect(supplyInfo.wisdomMinted).to.equal(1);
        });

        it("Should return correct remaining tier supply", async function () {
            await pharaohFusion.mint(addr1.address, TokenTier.GenesisSovereign);
            await pharaohFusion.mint(addr2.address, TokenTier.GenesisSovereign);
            
            expect(await pharaohFusion.getRemainingTierSupply(TokenTier.GenesisSovereign)).to.equal(MAX_GENESIS_SOVEREIGN - 2);
        });
    });

    describe("Token Ownership Queries", function () {
        it("Should return all tokens owned by an address", async function () {
            await pharaohFusion.mint(addr1.address, TokenTier.WisdomKeeper);
            await pharaohFusion.mint(addr1.address, TokenTier.LegacyBearer);
            await pharaohFusion.mint(addr1.address, TokenTier.EternalGuardian);
            
            const tokens = await pharaohFusion.getTokensOfOwner(addr1.address);
            
            expect(tokens.length).to.equal(3);
            expect(tokens[0]).to.equal(0);
            expect(tokens[1]).to.equal(1);
            expect(tokens[2]).to.equal(2);
        });

        it("Should return empty array for address with no tokens", async function () {
            const tokens = await pharaohFusion.getTokensOfOwner(addr1.address);
            expect(tokens.length).to.equal(0);
        });
    });

    describe("Base URI", function () {
        it("Should allow owner to update base URI", async function () {
            const newURI = "ipfs://new-uri/";
            
            await expect(pharaohFusion.setBaseURI(newURI))
                .to.emit(pharaohFusion, "BaseURIUpdated")
                .withArgs(BASE_URI, newURI);
        });

        it("Should revert if non-owner tries to update base URI", async function () {
            await expect(
                pharaohFusion.connect(addr1).setBaseURI("ipfs://new-uri/")
            ).to.be.revertedWithCustomError(pharaohFusion, "OwnableUnauthorizedAccount");
        });
    });

    describe("Minting Pause", function () {
        it("Should toggle minting pause state", async function () {
            expect(await pharaohFusion.mintingPaused()).to.be.false;
            
            await pharaohFusion.toggleMintingPause();
            expect(await pharaohFusion.mintingPaused()).to.be.true;
            
            await pharaohFusion.toggleMintingPause();
            expect(await pharaohFusion.mintingPaused()).to.be.false;
        });

        it("Should emit MintingPauseToggled event", async function () {
            await expect(pharaohFusion.toggleMintingPause())
                .to.emit(pharaohFusion, "MintingPauseToggled")
                .withArgs(true);
        });

        it("Should revert if non-owner tries to toggle pause", async function () {
            await expect(
                pharaohFusion.connect(addr1).toggleMintingPause()
            ).to.be.revertedWithCustomError(pharaohFusion, "OwnableUnauthorizedAccount");
        });
    });

    describe("Token Transfers", function () {
        beforeEach(async function () {
            await pharaohFusion.mint(addr1.address, TokenTier.WisdomKeeper);
        });

        it("Should allow token transfer", async function () {
            await pharaohFusion.connect(addr1).transferFrom(addr1.address, addr2.address, 0);
            
            expect(await pharaohFusion.ownerOf(0)).to.equal(addr2.address);
            expect(await pharaohFusion.balanceOf(addr1.address)).to.equal(0);
            expect(await pharaohFusion.balanceOf(addr2.address)).to.equal(1);
        });

        it("Should update voting power after transfer", async function () {
            expect(await pharaohFusion.getVotingPower(addr1.address)).to.equal(WISDOM_KEEPER_MULTIPLIER);
            expect(await pharaohFusion.getVotingPower(addr2.address)).to.equal(0);
            
            await pharaohFusion.connect(addr1).transferFrom(addr1.address, addr2.address, 0);
            
            expect(await pharaohFusion.getVotingPower(addr1.address)).to.equal(0);
            expect(await pharaohFusion.getVotingPower(addr2.address)).to.equal(WISDOM_KEEPER_MULTIPLIER);
        });
    });

    describe("ERC721 Interface Support", function () {
        it("Should support ERC721 interface", async function () {
            // ERC721 interface ID
            expect(await pharaohFusion.supportsInterface("0x80ac58cd")).to.be.true;
        });

        it("Should support ERC721Enumerable interface", async function () {
            // ERC721Enumerable interface ID
            expect(await pharaohFusion.supportsInterface("0x780e9d63")).to.be.true;
        });
    });

    describe("UUPS Upgradeability", function () {
        it("Should be upgradeable by owner", async function () {
            // Deploy a new implementation
            const PharaohConsciousnessFusionV2 = await ethers.getContractFactory("PharaohConsciousnessFusion");
            
            // Upgrade the proxy to the new implementation
            const upgraded = await upgrades.upgradeProxy(
                await pharaohFusion.getAddress(),
                PharaohConsciousnessFusionV2
            );
            
            // Verify state is preserved
            expect(await upgraded.name()).to.equal("Pharaoh Consciousness Fusion");
            expect(await upgraded.symbol()).to.equal("PFC");
            expect(await upgraded.owner()).to.equal(owner.address);
        });

        it("Should preserve state after upgrade", async function () {
            // Mint a token before upgrade
            await pharaohFusion.mint(addr1.address, TokenTier.GenesisSovereign);
            
            // Upgrade
            const PharaohConsciousnessFusionV2 = await ethers.getContractFactory("PharaohConsciousnessFusion");
            const upgraded = await upgrades.upgradeProxy(
                await pharaohFusion.getAddress(),
                PharaohConsciousnessFusionV2
            );
            
            // Verify token is still there
            expect(await upgraded.ownerOf(0)).to.equal(addr1.address);
            expect(await upgraded.getTokenTier(0)).to.equal(TokenTier.GenesisSovereign);
            expect(await upgraded.getVotingPower(addr1.address)).to.equal(GENESIS_SOVEREIGN_MULTIPLIER);
        });
    });

    describe("Edge Cases", function () {
        it("Should revert getTokenTier for non-existent token", async function () {
            await expect(
                pharaohFusion.getTokenTier(999)
            ).to.be.revertedWithCustomError(pharaohFusion, "TokenDoesNotExist");
        });

        it("Should handle minting to same address multiple times", async function () {
            for (let i = 0; i < 5; i++) {
                await pharaohFusion.mint(addr1.address, TokenTier.WisdomKeeper);
            }
            
            expect(await pharaohFusion.balanceOf(addr1.address)).to.equal(5);
            
            const tokens = await pharaohFusion.getTokensOfOwner(addr1.address);
            expect(tokens.length).to.equal(5);
        });
    });
});
