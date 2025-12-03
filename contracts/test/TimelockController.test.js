const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * Test suite for ScrollVerse Genesis Sequence - Phase 1, Step 1.1
 * Tests TimelockController deployment with ScrollVerseDAO as proposer/executor
 */
describe("ScrollVerse Genesis Sequence - TimelockController", function () {
  let timelockController;
  let scrollVerseDAO;
  let owner;
  let addr1;
  let addr2;
  
  // 48 hours in seconds
  const MIN_DELAY = 48 * 60 * 60; // 172800 seconds
  
  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // Deploy ScrollVerseDAO first
    const ScrollVerseDAO = await ethers.getContractFactory("ScrollVerseDAO");
    scrollVerseDAO = await ScrollVerseDAO.deploy(owner.address);
    await scrollVerseDAO.waitForDeployment();
    
    const daoAddress = await scrollVerseDAO.getAddress();
    
    // Deploy TimelockController with DAO as proposer and executor
    const TimelockController = await ethers.getContractFactory("TimelockController");
    timelockController = await TimelockController.deploy(
      MIN_DELAY,
      [daoAddress], // proposers
      [daoAddress], // executors
      owner.address  // admin
    );
    await timelockController.waitForDeployment();
    
    // Link DAO to TimelockController
    const timelockAddress = await timelockController.getAddress();
    await scrollVerseDAO.setTimelockController(timelockAddress);
  });
  
  describe("ScrollVerseDAO Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await scrollVerseDAO.owner()).to.equal(owner.address);
    });
    
    it("Should start with zero proposals", async function () {
      expect(await scrollVerseDAO.getProposalCount()).to.equal(0);
    });
    
    it("Should have TimelockController linked", async function () {
      const timelockAddress = await timelockController.getAddress();
      expect(await scrollVerseDAO.getTimelockController()).to.equal(timelockAddress);
    });
  });
  
  describe("TimelockController Deployment", function () {
    it("Should have correct minimum delay of 48 hours", async function () {
      const minDelay = await timelockController.getMinDelay();
      expect(minDelay).to.equal(MIN_DELAY);
      expect(minDelay).to.equal(172800); // 48 hours in seconds
    });
    
    it("Should grant PROPOSER_ROLE to ScrollVerseDAO", async function () {
      const daoAddress = await scrollVerseDAO.getAddress();
      const PROPOSER_ROLE = await timelockController.PROPOSER_ROLE();
      expect(await timelockController.hasRole(PROPOSER_ROLE, daoAddress)).to.be.true;
    });
    
    it("Should grant EXECUTOR_ROLE to ScrollVerseDAO", async function () {
      const daoAddress = await scrollVerseDAO.getAddress();
      const EXECUTOR_ROLE = await timelockController.EXECUTOR_ROLE();
      expect(await timelockController.hasRole(EXECUTOR_ROLE, daoAddress)).to.be.true;
    });
    
    it("Should grant CANCELLER_ROLE to ScrollVerseDAO", async function () {
      const daoAddress = await scrollVerseDAO.getAddress();
      const CANCELLER_ROLE = await timelockController.CANCELLER_ROLE();
      expect(await timelockController.hasRole(CANCELLER_ROLE, daoAddress)).to.be.true;
    });
    
    it("Should grant DEFAULT_ADMIN_ROLE to admin", async function () {
      const DEFAULT_ADMIN_ROLE = await timelockController.DEFAULT_ADMIN_ROLE();
      expect(await timelockController.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
    });
    
    it("Should grant DEFAULT_ADMIN_ROLE to itself for self-administration", async function () {
      const timelockAddress = await timelockController.getAddress();
      const DEFAULT_ADMIN_ROLE = await timelockController.DEFAULT_ADMIN_ROLE();
      expect(await timelockController.hasRole(DEFAULT_ADMIN_ROLE, timelockAddress)).to.be.true;
    });
  });
  
  describe("ScrollVerseDAO Functions", function () {
    it("Should reject setting zero address as TimelockController", async function () {
      await expect(
        scrollVerseDAO.setTimelockController(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(scrollVerseDAO, "InvalidTimelockAddress");
    });
    
    it("Should allow owner to create proposals", async function () {
      await expect(scrollVerseDAO.createProposal("Test proposal for ScrollVerse"))
        .to.emit(scrollVerseDAO, "ProposalCreated");
      
      expect(await scrollVerseDAO.getProposalCount()).to.equal(1);
    });
    
    it("Should reject non-owner creating proposals", async function () {
      await expect(
        scrollVerseDAO.connect(addr1).createProposal("Unauthorized proposal")
      ).to.be.revertedWithCustomError(scrollVerseDAO, "OwnableUnauthorizedAccount");
    });
    
    it("Should allow marking proposal as executed", async function () {
      await scrollVerseDAO.createProposal("Test proposal");
      await scrollVerseDAO.markProposalExecuted(0);
      
      expect(await scrollVerseDAO.isProposalExecuted(0)).to.be.true;
    });
    
    it("Should reject marking non-existent proposal as executed", async function () {
      await expect(
        scrollVerseDAO.markProposalExecuted(999)
      ).to.be.revertedWithCustomError(scrollVerseDAO, "ProposalDoesNotExist");
    });
    
    it("Should reject double execution of proposal", async function () {
      await scrollVerseDAO.createProposal("Test proposal");
      await scrollVerseDAO.markProposalExecuted(0);
      
      await expect(
        scrollVerseDAO.markProposalExecuted(0)
      ).to.be.revertedWithCustomError(scrollVerseDAO, "ProposalAlreadyExecuted");
    });
  });
  
  describe("Security Configuration", function () {
    it("Should NOT allow non-DAO address to have PROPOSER_ROLE", async function () {
      const PROPOSER_ROLE = await timelockController.PROPOSER_ROLE();
      expect(await timelockController.hasRole(PROPOSER_ROLE, addr1.address)).to.be.false;
    });
    
    it("Should NOT allow non-DAO address to have EXECUTOR_ROLE", async function () {
      const EXECUTOR_ROLE = await timelockController.EXECUTOR_ROLE();
      expect(await timelockController.hasRole(EXECUTOR_ROLE, addr1.address)).to.be.false;
    });
    
    it("Should enforce 48-hour minimum delay on proposals", async function () {
      const minDelay = await timelockController.getMinDelay();
      const expectedHours = 48;
      const expectedSeconds = expectedHours * 60 * 60;
      
      expect(minDelay).to.equal(expectedSeconds);
    });
    
    it("Should have ScrollVerseDAO as the sole proposer", async function () {
      const daoAddress = await scrollVerseDAO.getAddress();
      const PROPOSER_ROLE = await timelockController.PROPOSER_ROLE();
      
      // DAO should have proposer role
      expect(await timelockController.hasRole(PROPOSER_ROLE, daoAddress)).to.be.true;
      
      // Other addresses should not have proposer role
      expect(await timelockController.hasRole(PROPOSER_ROLE, owner.address)).to.be.false;
      expect(await timelockController.hasRole(PROPOSER_ROLE, addr1.address)).to.be.false;
    });
    
    it("Should have ScrollVerseDAO as the sole executor", async function () {
      const daoAddress = await scrollVerseDAO.getAddress();
      const EXECUTOR_ROLE = await timelockController.EXECUTOR_ROLE();
      
      // DAO should have executor role
      expect(await timelockController.hasRole(EXECUTOR_ROLE, daoAddress)).to.be.true;
      
      // Other addresses should not have executor role
      expect(await timelockController.hasRole(EXECUTOR_ROLE, owner.address)).to.be.false;
      expect(await timelockController.hasRole(EXECUTOR_ROLE, addr1.address)).to.be.false;
    });
  });
  
  describe("Genesis Sequence Requirements", function () {
    it("Should meet all Phase 1, Step 1.1 requirements", async function () {
      const daoAddress = await scrollVerseDAO.getAddress();
      
      // Requirement 1: 48-hour minimum delay
      const minDelay = await timelockController.getMinDelay();
      expect(minDelay).to.equal(48 * 60 * 60);
      
      // Requirement 2: ScrollVerseDAO as sole proposer
      const PROPOSER_ROLE = await timelockController.PROPOSER_ROLE();
      expect(await timelockController.hasRole(PROPOSER_ROLE, daoAddress)).to.be.true;
      
      // Requirement 3: ScrollVerseDAO as sole executor
      const EXECUTOR_ROLE = await timelockController.EXECUTOR_ROLE();
      expect(await timelockController.hasRole(EXECUTOR_ROLE, daoAddress)).to.be.true;
      
      // Requirement 4: DAO linked to TimelockController
      const timelockAddress = await timelockController.getAddress();
      expect(await scrollVerseDAO.getTimelockController()).to.equal(timelockAddress);
    });
  });
});

describe("ScrollVerseDAO Standalone Tests", function () {
  let scrollVerseDAO;
  let owner;
  let addr1;
  
  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    
    const ScrollVerseDAO = await ethers.getContractFactory("ScrollVerseDAO");
    scrollVerseDAO = await ScrollVerseDAO.deploy(owner.address);
    await scrollVerseDAO.waitForDeployment();
  });
  
  it("Should deploy with correct initial state", async function () {
    expect(await scrollVerseDAO.owner()).to.equal(owner.address);
    expect(await scrollVerseDAO.getProposalCount()).to.equal(0);
    expect(await scrollVerseDAO.getTimelockController()).to.equal(ethers.ZeroAddress);
  });
  
  it("Should emit TimelockControllerUpdated event", async function () {
    const mockAddress = addr1.address;
    
    await expect(scrollVerseDAO.setTimelockController(mockAddress))
      .to.emit(scrollVerseDAO, "TimelockControllerUpdated")
      .withArgs(ethers.ZeroAddress, mockAddress);
  });
  
  it("Should emit ProposalCreated event with correct data", async function () {
    const description = "Genesis Sequence Activation";
    
    await expect(scrollVerseDAO.createProposal(description))
      .to.emit(scrollVerseDAO, "ProposalCreated");
  });
  
  it("Should increment proposal count correctly", async function () {
    await scrollVerseDAO.createProposal("Proposal 1");
    expect(await scrollVerseDAO.getProposalCount()).to.equal(1);
    
    await scrollVerseDAO.createProposal("Proposal 2");
    expect(await scrollVerseDAO.getProposalCount()).to.equal(2);
    
    await scrollVerseDAO.createProposal("Proposal 3");
    expect(await scrollVerseDAO.getProposalCount()).to.equal(3);
  });
});
