// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title HollywoodDAO
 * @dev DAO for tokenizing creative roles and royalties with NFT-backed quadratic voting
 * Part of the ChRaismas Blueprint - rewarding industry creators equitably
 */
contract HollywoodDAO is Ownable {
    using Counters for Counters.Counter;
    
    // NFT Tiers for incentivized engagement
    enum CreativeTier {
        NONE,
        DIRECTORS_EQUITY,
        BEHIND_THE_SCENES,
        PRODUCERS_CIRCLE,
        WRITERS_GUILD,
        CAST_COLLECTIVE
    }
    
    // Creative Role structure
    struct CreativeRole {
        address creator;
        CreativeTier tier;
        uint256 royaltyShare; // Basis points (100 = 1%)
        bool isActive;
        string roleDescription;
    }
    
    // Proposal structure
    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        mapping(address => bool) hasVoted;
        mapping(address => uint256) voteWeight;
    }
    
    Counters.Counter private _proposalIdCounter;
    Counters.Counter private _roleIdCounter;
    
    // ChRaismas NFT contract for voting power
    IERC721 public chRaismasNFT;
    
    // Mapping from role ID to CreativeRole
    mapping(uint256 => CreativeRole) public creativeRoles;
    
    // Mapping from address to role IDs
    mapping(address => uint256[]) public creatorRoles;
    
    // Mapping from proposal ID to Proposal
    mapping(uint256 => Proposal) public proposals;
    
    // Array of all proposal IDs
    uint256[] public proposalIds;
    
    // Voting period duration (7 days)
    uint256 public votingPeriod = 7 days;
    
    // Quorum percentage (20%)
    uint256 public quorumPercentage = 20;
    
    // Total royalty pool
    uint256 public royaltyPool;
    
    // Events
    event RoleCreated(uint256 indexed roleId, address indexed creator, CreativeTier tier);
    event RoleUpdated(uint256 indexed roleId, uint256 newRoyaltyShare);
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string description);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId);
    event RoyaltyDistributed(address indexed recipient, uint256 amount);
    
    constructor(address initialOwner, address _chRaismasNFT) Ownable(initialOwner) {
        chRaismasNFT = IERC721(_chRaismasNFT);
    }
    
    /**
     * @dev Create a new creative role
     * @param creator Address of the creator
     * @param tier Creative tier
     * @param royaltyShare Royalty share in basis points
     * @param roleDescription Description of the role
     */
    function createRole(
        address creator,
        CreativeTier tier,
        uint256 royaltyShare,
        string calldata roleDescription
    ) external onlyOwner returns (uint256) {
        require(creator != address(0), "Invalid creator");
        require(tier != CreativeTier.NONE, "Invalid tier");
        require(royaltyShare <= 10000, "Invalid royalty share");
        
        uint256 roleId = _roleIdCounter.current();
        _roleIdCounter.increment();
        
        creativeRoles[roleId] = CreativeRole({
            creator: creator,
            tier: tier,
            royaltyShare: royaltyShare,
            isActive: true,
            roleDescription: roleDescription
        });
        
        creatorRoles[creator].push(roleId);
        
        emit RoleCreated(roleId, creator, tier);
        
        return roleId;
    }
    
    /**
     * @dev Update royalty share for a role
     * @param roleId Role ID to update
     * @param newRoyaltyShare New royalty share in basis points
     */
    function updateRoyaltyShare(uint256 roleId, uint256 newRoyaltyShare) external onlyOwner {
        require(creativeRoles[roleId].creator != address(0), "Role does not exist");
        require(newRoyaltyShare <= 10000, "Invalid royalty share");
        
        creativeRoles[roleId].royaltyShare = newRoyaltyShare;
        
        emit RoleUpdated(roleId, newRoyaltyShare);
    }
    
    /**
     * @dev Create a new proposal
     * @param description Proposal description
     */
    function createProposal(string calldata description) external returns (uint256) {
        require(chRaismasNFT.balanceOf(msg.sender) > 0, "Must hold ChRaismas NFT to propose");
        
        uint256 proposalId = _proposalIdCounter.current();
        _proposalIdCounter.increment();
        
        Proposal storage newProposal = proposals[proposalId];
        newProposal.id = proposalId;
        newProposal.proposer = msg.sender;
        newProposal.description = description;
        newProposal.startTime = block.timestamp;
        newProposal.endTime = block.timestamp + votingPeriod;
        newProposal.executed = false;
        
        proposalIds.push(proposalId);
        
        emit ProposalCreated(proposalId, msg.sender, description);
        
        return proposalId;
    }
    
    /**
     * @dev Cast a vote on a proposal with quadratic voting
     * @param proposalId Proposal ID
     * @param support True for yes, false for no
     */
    function castVote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        uint256 nftBalance = chRaismasNFT.balanceOf(msg.sender);
        require(nftBalance > 0, "Must hold ChRaismas NFT to vote");
        
        // Quadratic voting: sqrt of NFT balance
        uint256 voteWeight = sqrt(nftBalance);
        
        proposal.hasVoted[msg.sender] = true;
        proposal.voteWeight[msg.sender] = voteWeight;
        
        if (support) {
            proposal.forVotes += voteWeight;
        } else {
            proposal.againstVotes += voteWeight;
        }
        
        emit VoteCast(proposalId, msg.sender, support, voteWeight);
    }
    
    /**
     * @dev Execute a proposal if it has passed
     * @param proposalId Proposal ID
     */
    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp > proposal.endTime, "Voting period not ended");
        require(!proposal.executed, "Proposal already executed");
        
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        require(totalVotes > 0, "No votes cast");
        
        // Check quorum
        uint256 quorum = (totalVotes * 100) / quorumPercentage;
        require(totalVotes >= quorum, "Quorum not reached");
        
        // Check if proposal passed
        require(proposal.forVotes > proposal.againstVotes, "Proposal did not pass");
        
        proposal.executed = true;
        
        emit ProposalExecuted(proposalId);
    }
    
    /**
     * @dev Distribute royalties to creators
     */
    function distributeRoyalties() external onlyOwner {
        require(royaltyPool > 0, "No royalties to distribute");
        
        uint256 totalShares = 0;
        uint256 roleCount = _roleIdCounter.current();
        
        // Calculate total active shares
        for (uint256 i = 0; i < roleCount; i++) {
            if (creativeRoles[i].isActive) {
                totalShares += creativeRoles[i].royaltyShare;
            }
        }
        
        require(totalShares > 0, "No active roles");
        
        // Distribute proportionally
        for (uint256 i = 0; i < roleCount; i++) {
            CreativeRole storage role = creativeRoles[i];
            if (role.isActive && role.royaltyShare > 0) {
                uint256 amount = (royaltyPool * role.royaltyShare) / totalShares;
                
                (bool success, ) = role.creator.call{value: amount}("");
                require(success, "Transfer failed");
                
                emit RoyaltyDistributed(role.creator, amount);
            }
        }
        
        royaltyPool = 0;
    }
    
    /**
     * @dev Deposit royalties to the pool
     */
    function depositRoyalties() external payable {
        require(msg.value > 0, "Must deposit positive amount");
        royaltyPool += msg.value;
    }
    
    /**
     * @dev Update voting period
     * @param newPeriod New voting period in seconds
     */
    function updateVotingPeriod(uint256 newPeriod) external onlyOwner {
        require(newPeriod > 0, "Invalid period");
        votingPeriod = newPeriod;
    }
    
    /**
     * @dev Get all proposals
     * @return Array of proposal IDs
     */
    function getAllProposals() external view returns (uint256[] memory) {
        return proposalIds;
    }
    
    /**
     * @dev Get roles for a creator
     * @param creator Address of creator
     * @return Array of role IDs
     */
    function getCreatorRoles(address creator) external view returns (uint256[] memory) {
        return creatorRoles[creator];
    }
    
    /**
     * @dev Square root function for quadratic voting
     * @param x Input number
     * @return Square root
     */
    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }
    
    receive() external payable {
        royaltyPool += msg.value;
    }
}
