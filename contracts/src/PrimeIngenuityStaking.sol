// Sovereign Chais owns every yield
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title PrimeIngenuityStaking
 * @dev Staking contract for Prime Ingenuity NFTs with royalty distribution and voting
 * 
 * Features:
 * - Stake NFTs to earn royalty rewards
 * - Vote on future inventor inclusions
 * - Transparent on-chain tracking
 * - Integration with ScrollVerse token economy
 */
contract PrimeIngenuityStaking is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    
    IERC721 public primeIngenuityNFT;
    IERC20 public rewardToken; // ScrollCoin or other reward token
    
    // Staking data
    struct StakeInfo {
        address owner;
        uint256 stakedAt;
        uint256 lastRewardClaim;
        uint256 totalRewardsClaimed;
    }
    
    // Voting data
    struct InventorProposal {
        string name;
        string innovation;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        mapping(address => bool) hasVoted;
    }
    
    mapping(uint256 => StakeInfo) public stakedTokens; // tokenId => StakeInfo
    mapping(address => uint256[]) public userStakedTokens; // user => tokenIds[]
    mapping(uint256 => InventorProposal) public proposals; // proposalId => InventorProposal
    
    uint256 public totalStaked;
    uint256 public rewardRatePerDay; // Reward rate per NFT per day
    uint256 public proposalCount;
    uint256 public votingPeriod = 7 days;
    uint256 public minimumVotingPower = 1; // Minimum staked NFTs to vote
    
    // Events
    event NFTStaked(address indexed user, uint256 indexed tokenId, uint256 timestamp);
    event NFTUnstaked(address indexed user, uint256 indexed tokenId, uint256 timestamp);
    event RewardsClaimed(address indexed user, uint256 amount);
    event ProposalCreated(uint256 indexed proposalId, string inventorName);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 votingPower);
    event ProposalExecuted(uint256 indexed proposalId, bool passed);
    event RoyaltyDistributed(uint256 amount, uint256 timestamp);
    
    constructor(
        address _nftContract,
        address _rewardToken,
        uint256 _rewardRatePerDay,
        address _admin
    ) {
        primeIngenuityNFT = IERC721(_nftContract);
        rewardToken = IERC20(_rewardToken);
        rewardRatePerDay = _rewardRatePerDay;
        
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(DISTRIBUTOR_ROLE, _admin);
    }
    
    /**
     * @dev Stake NFT to earn rewards and voting power
     */
    function stakeNFT(uint256 tokenId) external nonReentrant whenNotPaused {
        require(primeIngenuityNFT.ownerOf(tokenId) == msg.sender, "Not token owner");
        require(stakedTokens[tokenId].owner == address(0), "Already staked");
        
        // Transfer NFT to contract
        primeIngenuityNFT.transferFrom(msg.sender, address(this), tokenId);
        
        // Record stake
        stakedTokens[tokenId] = StakeInfo({
            owner: msg.sender,
            stakedAt: block.timestamp,
            lastRewardClaim: block.timestamp,
            totalRewardsClaimed: 0
        });
        
        userStakedTokens[msg.sender].push(tokenId);
        totalStaked++;
        
        emit NFTStaked(msg.sender, tokenId, block.timestamp);
    }
    
    /**
     * @dev Unstake NFT and claim pending rewards
     */
    function unstakeNFT(uint256 tokenId) external nonReentrant {
        require(stakedTokens[tokenId].owner == msg.sender, "Not token owner");
        
        // Claim pending rewards
        _claimRewards(tokenId);
        
        // Remove from user's staked tokens
        _removeTokenFromUserList(msg.sender, tokenId);
        
        // Transfer NFT back to owner
        primeIngenuityNFT.transferFrom(address(this), msg.sender, tokenId);
        
        // Clear stake info
        delete stakedTokens[tokenId];
        totalStaked--;
        
        emit NFTUnstaked(msg.sender, tokenId, block.timestamp);
    }
    
    /**
     * @dev Claim accumulated rewards for staked NFT
     */
    function claimRewards(uint256 tokenId) external nonReentrant {
        require(stakedTokens[tokenId].owner == msg.sender, "Not token owner");
        _claimRewards(tokenId);
    }
    
    /**
     * @dev Internal function to claim rewards
     */
    function _claimRewards(uint256 tokenId) internal {
        StakeInfo storage stakeInfo = stakedTokens[tokenId];
        uint256 pendingRewards = calculatePendingRewards(tokenId);
        
        if (pendingRewards > 0) {
            stakeInfo.lastRewardClaim = block.timestamp;
            stakeInfo.totalRewardsClaimed += pendingRewards;
            
            require(rewardToken.transfer(stakeInfo.owner, pendingRewards), "Transfer failed");
            emit RewardsClaimed(stakeInfo.owner, pendingRewards);
        }
    }
    
    /**
     * @dev Calculate pending rewards for a staked NFT
     */
    function calculatePendingRewards(uint256 tokenId) public view returns (uint256) {
        StakeInfo memory stakeInfo = stakedTokens[tokenId];
        if (stakeInfo.owner == address(0)) return 0;
        
        uint256 timeStaked = block.timestamp - stakeInfo.lastRewardClaim;
        uint256 daysStaked = timeStaked / 1 days;
        
        return daysStaked * rewardRatePerDay;
    }
    
    /**
     * @dev Get user's staked tokens
     */
    function getUserStakedTokens(address user) external view returns (uint256[] memory) {
        return userStakedTokens[user];
    }
    
    /**
     * @dev Get user's voting power (number of staked NFTs)
     */
    function getVotingPower(address user) public view returns (uint256) {
        return userStakedTokens[user].length;
    }
    
    /**
     * @dev Create proposal for new inventor inclusion
     */
    function createProposal(
        string memory inventorName,
        string memory innovation,
        string memory description
    ) external returns (uint256) {
        require(getVotingPower(msg.sender) >= minimumVotingPower, "Insufficient voting power");
        
        uint256 proposalId = proposalCount++;
        InventorProposal storage proposal = proposals[proposalId];
        
        proposal.name = inventorName;
        proposal.innovation = innovation;
        proposal.description = description;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + votingPeriod;
        proposal.executed = false;
        
        emit ProposalCreated(proposalId, inventorName);
        return proposalId;
    }
    
    /**
     * @dev Vote on inventor proposal
     */
    function vote(uint256 proposalId, bool support) external {
        InventorProposal storage proposal = proposals[proposalId];
        
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(!proposal.executed, "Proposal already executed");
        
        uint256 votingPower = getVotingPower(msg.sender);
        require(votingPower >= minimumVotingPower, "Insufficient voting power");
        
        proposal.hasVoted[msg.sender] = true;
        
        if (support) {
            proposal.votesFor += votingPower;
        } else {
            proposal.votesAgainst += votingPower;
        }
        
        emit VoteCast(proposalId, msg.sender, support, votingPower);
    }
    
    /**
     * @dev Execute proposal if voting period ended and quorum reached
     */
    function executeProposal(uint256 proposalId) external onlyRole(ADMIN_ROLE) {
        InventorProposal storage proposal = proposals[proposalId];
        
        require(block.timestamp > proposal.endTime, "Voting not ended");
        require(!proposal.executed, "Already executed");
        
        proposal.executed = true;
        bool passed = proposal.votesFor > proposal.votesAgainst;
        
        emit ProposalExecuted(proposalId, passed);
    }
    
    /**
     * @dev Get proposal details
     */
    function getProposal(uint256 proposalId) external view returns (
        string memory name,
        string memory innovation,
        string memory description,
        uint256 votesFor,
        uint256 votesAgainst,
        uint256 startTime,
        uint256 endTime,
        bool executed
    ) {
        InventorProposal storage proposal = proposals[proposalId];
        return (
            proposal.name,
            proposal.innovation,
            proposal.description,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.startTime,
            proposal.endTime,
            proposal.executed
        );
    }
    
    /**
     * @dev Check if user has voted on proposal
     */
    function hasVoted(uint256 proposalId, address user) external view returns (bool) {
        return proposals[proposalId].hasVoted[user];
    }
    
    /**
     * @dev Distribute royalties to stakers (only by distributor role)
     */
    function distributeRoyalties(uint256 amount) external onlyRole(DISTRIBUTOR_ROLE) {
        require(amount > 0, "Amount must be positive");
        require(totalStaked > 0, "No NFTs staked");
        
        // Transfer tokens to contract for distribution
        require(rewardToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        emit RoyaltyDistributed(amount, block.timestamp);
    }
    
    /**
     * @dev Update reward rate
     */
    function setRewardRate(uint256 newRate) external onlyRole(ADMIN_ROLE) {
        rewardRatePerDay = newRate;
    }
    
    /**
     * @dev Update voting period
     */
    function setVotingPeriod(uint256 newPeriod) external onlyRole(ADMIN_ROLE) {
        votingPeriod = newPeriod;
    }
    
    /**
     * @dev Update minimum voting power
     */
    function setMinimumVotingPower(uint256 newMinimum) external onlyRole(ADMIN_ROLE) {
        minimumVotingPower = newMinimum;
    }
    
    /**
     * @dev Pause staking
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause staking
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Remove token from user's list
     */
    function _removeTokenFromUserList(address user, uint256 tokenId) internal {
        uint256[] storage tokens = userStakedTokens[user];
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == tokenId) {
                tokens[i] = tokens[tokens.length - 1];
                tokens.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Emergency withdraw (only admin)
     */
    function emergencyWithdraw(uint256 tokenId) external onlyRole(ADMIN_ROLE) {
        StakeInfo memory stakeInfo = stakedTokens[tokenId];
        require(stakeInfo.owner != address(0), "Token not staked");
        
        address owner = stakeInfo.owner;
        _removeTokenFromUserList(owner, tokenId);
        primeIngenuityNFT.transferFrom(address(this), owner, tokenId);
        delete stakedTokens[tokenId];
        totalStaked--;
    }
}
