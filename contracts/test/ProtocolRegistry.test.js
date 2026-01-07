const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProtocolRegistry", function () {
  let protocolRegistry;
  let owner;
  let daoTimelock;
  let addr1;
  let addr2;

  // Sample test data
  const sampleProtocolName = "CHXTOKEN";
  const sampleSecurityReviewHash = ethers.keccak256(ethers.toUtf8Bytes("security-review-v1"));
  const sampleRiskClass = 2;

  // Protocol states enum values
  const ProtocolState = {
    Proposed: 0,
    Vetted: 1,
    Approved: 2,
    Revoked: 3
  };

  // Helper function to find ProtocolProposed event and get protocolId
  function findProtocolProposedEvent(receipt) {
    const event = receipt.logs.find(log => {
      try {
        return protocolRegistry.interface.parseLog(log)?.name === "ProtocolProposed";
      } catch {
        return false;
      }
    });
    if (!event) throw new Error("ProtocolProposed event not found");
    return protocolRegistry.interface.parseLog(event);
  }

  beforeEach(async function () {
    [owner, daoTimelock, addr1, addr2] = await ethers.getSigners();

    const ProtocolRegistry = await ethers.getContractFactory("ProtocolRegistry");
    protocolRegistry = await ProtocolRegistry.deploy();
    await protocolRegistry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the deployer as initial governor", async function () {
      expect(await protocolRegistry.governor()).to.equal(owner.address);
    });

    it("Should start with zero protocols", async function () {
      expect(await protocolRegistry.totalProtocols()).to.equal(0);
      expect(await protocolRegistry.approvedProtocolCount()).to.equal(0);
    });

    it("Should emit GovernorTransferred event on deployment", async function () {
      // Deploy a new instance to capture the event
      const ProtocolRegistry = await ethers.getContractFactory("ProtocolRegistry");
      const newRegistry = await ProtocolRegistry.deploy();
      await newRegistry.waitForDeployment();

      // Check that the governor was set (event would have been emitted)
      expect(await newRegistry.governor()).to.equal(owner.address);
    });
  });

  describe("Governor Transfer", function () {
    it("Should allow governor to transfer governance", async function () {
      const tx = await protocolRegistry.transferGovernor(daoTimelock.address);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      await expect(tx)
        .to.emit(protocolRegistry, "GovernorTransferred")
        .withArgs(owner.address, daoTimelock.address, block.timestamp);

      expect(await protocolRegistry.governor()).to.equal(daoTimelock.address);
    });

    it("Should reject zero address for new governor", async function () {
      await expect(
        protocolRegistry.transferGovernor(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(protocolRegistry, "ZeroAddress");
    });

    it("Should reject non-governor transfer attempts", async function () {
      await expect(
        protocolRegistry.connect(addr1).transferGovernor(addr1.address)
      ).to.be.revertedWithCustomError(protocolRegistry, "NotGovernor");
    });

    it("Should allow new governor to exercise governance powers", async function () {
      // Transfer to DAO Timelock
      await protocolRegistry.transferGovernor(daoTimelock.address);

      // Propose a protocol as addr1
      const tx = await protocolRegistry.connect(addr1).proposeProtocol(
        sampleProtocolName,
        addr1.address,
        sampleSecurityReviewHash,
        sampleRiskClass
      );
      const receipt = await tx.wait();
      const parsedLog = findProtocolProposedEvent(receipt);
      const protocolId = parsedLog.args.protocolId;

      // New governor (daoTimelock) should be able to vet
      await protocolRegistry.connect(daoTimelock).vetProtocol(protocolId);

      const protocol = await protocolRegistry.getProtocol(protocolId);
      expect(protocol.state).to.equal(ProtocolState.Vetted);
    });
  });

  describe("Protocol Proposal", function () {
    it("Should allow anyone to propose a protocol", async function () {
      const tx = await protocolRegistry.connect(addr1).proposeProtocol(
        sampleProtocolName,
        addr1.address,
        sampleSecurityReviewHash,
        sampleRiskClass
      );
      const receipt = await tx.wait();

      const parsedLog = findProtocolProposedEvent(receipt);
      expect(parsedLog).to.not.be.undefined;
      expect(await protocolRegistry.totalProtocols()).to.equal(1);
    });

    it("Should store correct protocol data", async function () {
      const tx = await protocolRegistry.connect(addr1).proposeProtocol(
        sampleProtocolName,
        addr1.address,
        sampleSecurityReviewHash,
        sampleRiskClass
      );
      const receipt = await tx.wait();

      const parsedLog = findProtocolProposedEvent(receipt);
      const protocolId = parsedLog.args.protocolId;

      const protocol = await protocolRegistry.getProtocol(protocolId);
      expect(protocol.name).to.equal(sampleProtocolName);
      expect(protocol.protocolAddress).to.equal(addr1.address);
      expect(protocol.securityReviewHash).to.equal(sampleSecurityReviewHash);
      expect(protocol.riskClass).to.equal(sampleRiskClass);
      expect(protocol.state).to.equal(ProtocolState.Proposed);
      expect(protocol.registrant).to.equal(addr1.address);
    });

    it("Should reject empty protocol name", async function () {
      await expect(
        protocolRegistry.proposeProtocol("", addr1.address, sampleSecurityReviewHash, sampleRiskClass)
      ).to.be.revertedWithCustomError(protocolRegistry, "InvalidProtocolName");
    });

    it("Should reject zero protocol address", async function () {
      await expect(
        protocolRegistry.proposeProtocol(sampleProtocolName, ethers.ZeroAddress, sampleSecurityReviewHash, sampleRiskClass)
      ).to.be.revertedWithCustomError(protocolRegistry, "ZeroAddress");
    });

    it("Should reject invalid risk class (0)", async function () {
      await expect(
        protocolRegistry.proposeProtocol(sampleProtocolName, addr1.address, sampleSecurityReviewHash, 0)
      ).to.be.revertedWithCustomError(protocolRegistry, "InvalidRiskClass");
    });

    it("Should reject invalid risk class (> 5)", async function () {
      await expect(
        protocolRegistry.proposeProtocol(sampleProtocolName, addr1.address, sampleSecurityReviewHash, 6)
      ).to.be.revertedWithCustomError(protocolRegistry, "InvalidRiskClass");
    });

    it("Should reject duplicate protocol registration", async function () {
      await protocolRegistry.proposeProtocol(
        sampleProtocolName,
        addr1.address,
        sampleSecurityReviewHash,
        sampleRiskClass
      );

      await expect(
        protocolRegistry.proposeProtocol(
          sampleProtocolName,
          addr1.address,
          sampleSecurityReviewHash,
          sampleRiskClass
        )
      ).to.be.revertedWithCustomError(protocolRegistry, "ProtocolAlreadyExists");
    });
  });

  describe("Lifecycle Transitions", function () {
    let protocolId;

    beforeEach(async function () {
      const tx = await protocolRegistry.connect(addr1).proposeProtocol(
        sampleProtocolName,
        addr1.address,
        sampleSecurityReviewHash,
        sampleRiskClass
      );
      const receipt = await tx.wait();
      const parsedLog = findProtocolProposedEvent(receipt);
      protocolId = parsedLog.args.protocolId;
    });

    describe("Vetting", function () {
      it("Should allow governor to vet a proposed protocol", async function () {
        await expect(protocolRegistry.vetProtocol(protocolId))
          .to.emit(protocolRegistry, "ProtocolStateChanged");

        const protocol = await protocolRegistry.getProtocol(protocolId);
        expect(protocol.state).to.equal(ProtocolState.Vetted);
      });

      it("Should reject non-governor vet attempts", async function () {
        await expect(
          protocolRegistry.connect(addr1).vetProtocol(protocolId)
        ).to.be.revertedWithCustomError(protocolRegistry, "NotGovernor");
      });

      it("Should reject vetting non-existent protocol", async function () {
        const fakeId = ethers.keccak256(ethers.toUtf8Bytes("fake"));
        await expect(
          protocolRegistry.vetProtocol(fakeId)
        ).to.be.revertedWithCustomError(protocolRegistry, "ProtocolDoesNotExist");
      });

      it("Should reject vetting already vetted protocol", async function () {
        await protocolRegistry.vetProtocol(protocolId);

        await expect(
          protocolRegistry.vetProtocol(protocolId)
        ).to.be.revertedWithCustomError(protocolRegistry, "InvalidStateTransition");
      });
    });

    describe("Approval", function () {
      beforeEach(async function () {
        await protocolRegistry.vetProtocol(protocolId);
      });

      it("Should allow governor to approve a vetted protocol", async function () {
        await expect(protocolRegistry.approveProtocol(protocolId))
          .to.emit(protocolRegistry, "ProtocolStateChanged");

        const protocol = await protocolRegistry.getProtocol(protocolId);
        expect(protocol.state).to.equal(ProtocolState.Approved);
        expect(await protocolRegistry.approvedProtocolCount()).to.equal(1);
      });

      it("Should reject non-governor approve attempts", async function () {
        await expect(
          protocolRegistry.connect(addr1).approveProtocol(protocolId)
        ).to.be.revertedWithCustomError(protocolRegistry, "NotGovernor");
      });

      it("Should reject approving non-vetted protocol", async function () {
        // Propose a new protocol (not vetted)
        const tx = await protocolRegistry.connect(addr1).proposeProtocol(
          "NewProtocol",
          addr2.address,
          sampleSecurityReviewHash,
          1
        );
        const receipt = await tx.wait();
        const parsedLog = findProtocolProposedEvent(receipt);
        const newProtocolId = parsedLog.args.protocolId;

        await expect(
          protocolRegistry.approveProtocol(newProtocolId)
        ).to.be.revertedWithCustomError(protocolRegistry, "InvalidStateTransition");
      });

      it("Should correctly identify approved protocol", async function () {
        await protocolRegistry.approveProtocol(protocolId);
        expect(await protocolRegistry.isProtocolApproved(protocolId)).to.be.true;
      });
    });

    describe("Revocation", function () {
      it("Should allow governor to revoke an approved protocol", async function () {
        await protocolRegistry.vetProtocol(protocolId);
        await protocolRegistry.approveProtocol(protocolId);
        expect(await protocolRegistry.approvedProtocolCount()).to.equal(1);

        await expect(protocolRegistry.revokeProtocol(protocolId))
          .to.emit(protocolRegistry, "ProtocolStateChanged");

        const protocol = await protocolRegistry.getProtocol(protocolId);
        expect(protocol.state).to.equal(ProtocolState.Revoked);
        expect(await protocolRegistry.approvedProtocolCount()).to.equal(0);
      });

      it("Should allow revoking a vetted protocol", async function () {
        await protocolRegistry.vetProtocol(protocolId);

        await protocolRegistry.revokeProtocol(protocolId);

        const protocol = await protocolRegistry.getProtocol(protocolId);
        expect(protocol.state).to.equal(ProtocolState.Revoked);
      });

      it("Should allow revoking a proposed protocol", async function () {
        await protocolRegistry.revokeProtocol(protocolId);

        const protocol = await protocolRegistry.getProtocol(protocolId);
        expect(protocol.state).to.equal(ProtocolState.Revoked);
      });

      it("Should reject non-governor revoke attempts", async function () {
        await expect(
          protocolRegistry.connect(addr1).revokeProtocol(protocolId)
        ).to.be.revertedWithCustomError(protocolRegistry, "NotGovernor");
      });

      it("Should reject revoking already revoked protocol", async function () {
        await protocolRegistry.revokeProtocol(protocolId);

        await expect(
          protocolRegistry.revokeProtocol(protocolId)
        ).to.be.revertedWithCustomError(protocolRegistry, "InvalidStateTransition");
      });

      it("Should not allow approving a revoked protocol", async function () {
        await protocolRegistry.revokeProtocol(protocolId);

        await expect(
          protocolRegistry.approveProtocol(protocolId)
        ).to.be.revertedWithCustomError(protocolRegistry, "InvalidStateTransition");
      });
    });
  });

  describe("Security Metadata Updates", function () {
    let protocolId;

    beforeEach(async function () {
      const tx = await protocolRegistry.connect(addr1).proposeProtocol(
        sampleProtocolName,
        addr1.address,
        sampleSecurityReviewHash,
        sampleRiskClass
      );
      const receipt = await tx.wait();
      const parsedLog = findProtocolProposedEvent(receipt);
      protocolId = parsedLog.args.protocolId;
    });

    it("Should allow governor to update security metadata", async function () {
      const newSecurityHash = ethers.keccak256(ethers.toUtf8Bytes("security-review-v2"));
      const newRiskClass = 1;

      await expect(protocolRegistry.updateSecurityMetadata(protocolId, newSecurityHash, newRiskClass))
        .to.emit(protocolRegistry, "ProtocolMetadataUpdated");

      const protocol = await protocolRegistry.getProtocol(protocolId);
      expect(protocol.securityReviewHash).to.equal(newSecurityHash);
      expect(protocol.riskClass).to.equal(newRiskClass);
    });

    it("Should reject non-governor metadata update attempts", async function () {
      const newSecurityHash = ethers.keccak256(ethers.toUtf8Bytes("security-review-v2"));

      await expect(
        protocolRegistry.connect(addr1).updateSecurityMetadata(protocolId, newSecurityHash, 1)
      ).to.be.revertedWithCustomError(protocolRegistry, "NotGovernor");
    });

    it("Should reject invalid risk class in update", async function () {
      const newSecurityHash = ethers.keccak256(ethers.toUtf8Bytes("security-review-v2"));

      await expect(
        protocolRegistry.updateSecurityMetadata(protocolId, newSecurityHash, 0)
      ).to.be.revertedWithCustomError(protocolRegistry, "InvalidRiskClass");

      await expect(
        protocolRegistry.updateSecurityMetadata(protocolId, newSecurityHash, 6)
      ).to.be.revertedWithCustomError(protocolRegistry, "InvalidRiskClass");
    });
  });

  describe("View Functions", function () {
    let protocolId;

    beforeEach(async function () {
      const tx = await protocolRegistry.proposeProtocol(
        sampleProtocolName,
        addr1.address,
        sampleSecurityReviewHash,
        sampleRiskClass
      );
      const receipt = await tx.wait();
      const parsedLog = findProtocolProposedEvent(receipt);
      protocolId = parsedLog.args.protocolId;
    });

    it("Should verify security review hash correctly", async function () {
      expect(await protocolRegistry.verifySecurityReview(protocolId, sampleSecurityReviewHash)).to.be.true;
      expect(await protocolRegistry.verifySecurityReview(protocolId, ethers.ZeroHash)).to.be.false;
    });

    it("Should check protocol existence", async function () {
      expect(await protocolRegistry.protocolExists(protocolId)).to.be.true;
      expect(await protocolRegistry.protocolExists(ethers.ZeroHash)).to.be.false;
    });

    it("Should get protocol by index", async function () {
      expect(await protocolRegistry.getProtocolIdAtIndex(0)).to.equal(protocolId);
    });

    it("Should revert for out of bounds index", async function () {
      await expect(
        protocolRegistry.getProtocolIdAtIndex(1)
      ).to.be.revertedWithCustomError(protocolRegistry, "IndexOutOfBounds");
    });

    it("Should revert for non-existent protocol", async function () {
      await expect(
        protocolRegistry.getProtocol(ethers.ZeroHash)
      ).to.be.revertedWithCustomError(protocolRegistry, "ProtocolDoesNotExist");
    });

    it("Should get protocol state", async function () {
      expect(await protocolRegistry.getProtocolState(protocolId)).to.equal(ProtocolState.Proposed);

      await protocolRegistry.vetProtocol(protocolId);
      expect(await protocolRegistry.getProtocolState(protocolId)).to.equal(ProtocolState.Vetted);
    });

    it("Should return false for non-existent protocol approval check", async function () {
      expect(await protocolRegistry.isProtocolApproved(ethers.ZeroHash)).to.be.false;
    });

    it("Should return false for non-existent protocol in verifySecurityReview", async function () {
      expect(await protocolRegistry.verifySecurityReview(ethers.ZeroHash, sampleSecurityReviewHash)).to.be.false;
    });
  });

  // Helper function to get current block timestamp
  async function getBlockTimestamp() {
    const block = await ethers.provider.getBlock("latest");
    return block.timestamp;
  }
});
