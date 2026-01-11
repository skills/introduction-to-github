const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AnchorManifest", function () {
  let anchorManifest;
  let owner;
  let addr1;
  let addr2;
  
  // Sample test data
  const sampleMerkleRoot = ethers.keccak256(ethers.toUtf8Bytes("test-manifest-data"));
  const sampleIpfsCid = "QmYwAPJzv5CZsnAzt8auVZRn7qWPjSXVEWpRJMuAxFpqhT";
  
  // Helper function to find ManifestAnchored event and get manifestId
  function findManifestAnchoredEvent(receipt) {
    const event = receipt.logs.find(log => {
      try {
        return anchorManifest.interface.parseLog(log)?.name === "ManifestAnchored";
      } catch {
        return false;
      }
    });
    if (!event) throw new Error("ManifestAnchored event not found");
    return anchorManifest.interface.parseLog(event);
  }
  
  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const AnchorManifest = await ethers.getContractFactory("AnchorManifest");
    anchorManifest = await AnchorManifest.deploy(owner.address);
    await anchorManifest.waitForDeployment();
  });
  
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await anchorManifest.owner()).to.equal(owner.address);
    });
    
    it("Should start with zero manifests", async function () {
      expect(await anchorManifest.totalManifests()).to.equal(0);
    });
  });
  
  describe("Anchoring Manifests", function () {
    it("Should anchor a manifest and emit event", async function () {
      const tx = await anchorManifest.connect(addr1).anchorManifest(sampleMerkleRoot, sampleIpfsCid);
      const receipt = await tx.wait();
      
      // Check event was emitted
      const parsedLog = findManifestAnchoredEvent(receipt);
      expect(parsedLog).to.not.be.undefined;
      expect(await anchorManifest.totalManifests()).to.equal(1);
    });
    
    it("Should store correct manifest data", async function () {
      const tx = await anchorManifest.connect(addr1).anchorManifest(sampleMerkleRoot, sampleIpfsCid);
      const receipt = await tx.wait();
      
      // Get manifest ID from event using safe parsing
      const parsedLog = findManifestAnchoredEvent(receipt);
      const manifestId = parsedLog.args.manifestId;
      
      const manifest = await anchorManifest.getManifest(manifestId);
      expect(manifest.merkleRoot).to.equal(sampleMerkleRoot);
      expect(manifest.ipfsCid).to.equal(sampleIpfsCid);
      expect(manifest.anchor).to.equal(addr1.address);
    });
    
    it("Should reject zero merkle root", async function () {
      await expect(
        anchorManifest.anchorManifest(ethers.ZeroHash, sampleIpfsCid)
      ).to.be.revertedWithCustomError(anchorManifest, "InvalidMerkleRoot");
    });
    
    it("Should reject empty IPFS CID", async function () {
      await expect(
        anchorManifest.anchorManifest(sampleMerkleRoot, "")
      ).to.be.revertedWithCustomError(anchorManifest, "InvalidIpfsCid");
    });
  });
  
  describe("Owner Functions", function () {
    it("Should allow owner to anchor with specific ID", async function () {
      const specificId = ethers.keccak256(ethers.toUtf8Bytes("specific-id"));
      
      await anchorManifest.anchorManifestWithId(specificId, sampleMerkleRoot, sampleIpfsCid);
      
      const manifest = await anchorManifest.getManifest(specificId);
      expect(manifest.merkleRoot).to.equal(sampleMerkleRoot);
    });
    
    it("Should reject non-owner anchor with specific ID", async function () {
      const specificId = ethers.keccak256(ethers.toUtf8Bytes("specific-id"));
      
      await expect(
        anchorManifest.connect(addr1).anchorManifestWithId(specificId, sampleMerkleRoot, sampleIpfsCid)
      ).to.be.revertedWithCustomError(anchorManifest, "OwnableUnauthorizedAccount");
    });
    
    it("Should allow owner to update manifest", async function () {
      const specificId = ethers.keccak256(ethers.toUtf8Bytes("specific-id"));
      await anchorManifest.anchorManifestWithId(specificId, sampleMerkleRoot, sampleIpfsCid);
      
      const newMerkleRoot = ethers.keccak256(ethers.toUtf8Bytes("new-data"));
      const newIpfsCid = "QmNewCidValue123456789abcdef";
      
      await anchorManifest.updateManifest(specificId, newMerkleRoot, newIpfsCid);
      
      const manifest = await anchorManifest.getManifest(specificId);
      expect(manifest.merkleRoot).to.equal(newMerkleRoot);
      expect(manifest.ipfsCid).to.equal(newIpfsCid);
    });
  });
  
  describe("View Functions", function () {
    it("Should verify merkle root correctly", async function () {
      const tx = await anchorManifest.anchorManifest(sampleMerkleRoot, sampleIpfsCid);
      const receipt = await tx.wait();
      const parsedLog = findManifestAnchoredEvent(receipt);
      const manifestId = parsedLog.args.manifestId;
      
      expect(await anchorManifest.verifyMerkleRoot(manifestId, sampleMerkleRoot)).to.be.true;
      expect(await anchorManifest.verifyMerkleRoot(manifestId, ethers.ZeroHash)).to.be.false;
    });
    
    it("Should check manifest existence", async function () {
      const tx = await anchorManifest.anchorManifest(sampleMerkleRoot, sampleIpfsCid);
      const receipt = await tx.wait();
      const parsedLog = findManifestAnchoredEvent(receipt);
      const manifestId = parsedLog.args.manifestId;
      
      expect(await anchorManifest.manifestExists(manifestId)).to.be.true;
      expect(await anchorManifest.manifestExists(ethers.ZeroHash)).to.be.false;
    });
    
    it("Should get manifest by index", async function () {
      const tx = await anchorManifest.anchorManifest(sampleMerkleRoot, sampleIpfsCid);
      const receipt = await tx.wait();
      const parsedLog = findManifestAnchoredEvent(receipt);
      const manifestId = parsedLog.args.manifestId;
      
      expect(await anchorManifest.getManifestIdAtIndex(0)).to.equal(manifestId);
    });
    
    it("Should revert for non-existent manifest", async function () {
      await expect(
        anchorManifest.getManifest(ethers.ZeroHash)
      ).to.be.revertedWithCustomError(anchorManifest, "ManifestDoesNotExist");
    });
  });
});
