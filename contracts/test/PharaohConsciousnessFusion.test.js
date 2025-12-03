const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("PharaohConsciousnessFusion", function () {
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
