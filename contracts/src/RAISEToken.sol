// Sovereign Chais owns every yield
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RAISEToken
 * @dev $RAISE ERC-20 token with kindness-based rewards and charitable pool mechanics
 * Part of the ChRaismas Blueprint activation
 */
contract RAISEToken is ERC20, ERC20Burnable, Ownable {
    // Charitable pool address
    address public charitablePool;
    
    // Kindness rewards mapping: user address => kindness score
    mapping(address => uint256) public kindnessScores;
    
    // Reward rate: tokens per kindness point
    uint256 public rewardRate = 100 * 10**decimals(); // 100 RAISE per kindness point
    
    // Total charitable pool allocation (10% of total supply)
    uint256 public constant CHARITABLE_POOL_ALLOCATION = 10_000_000 * 10**18; // 10M tokens
    
    // Events
    event KindnessRewarded(address indexed recipient, uint256 kindnessPoints, uint256 tokensAwarded);
    event CharitablePoolUpdated(address indexed newPool);
    event CharitableDistribution(address indexed recipient, uint256 amount, string reason);
    
    constructor(address initialOwner) ERC20("RAISE Token", "RAISE") Ownable(initialOwner) {
        // Mint 100M total supply
        _mint(initialOwner, 90_000_000 * 10**decimals()); // 90M to owner
        
        // Set initial charitable pool to owner (can be updated)
        charitablePool = initialOwner;
        _mint(charitablePool, CHARITABLE_POOL_ALLOCATION); // 10M to charitable pool
    }
    
    /**
     * @dev Award kindness points to a user and mint corresponding rewards
     * @param recipient The address receiving kindness rewards
     * @param kindnessPoints Number of kindness points earned
     */
    function awardKindness(address recipient, uint256 kindnessPoints) external onlyOwner {
        require(recipient != address(0), "Invalid recipient");
        require(kindnessPoints > 0, "Kindness points must be positive");
        
        kindnessScores[recipient] += kindnessPoints;
        uint256 rewardAmount = kindnessPoints * rewardRate;
        
        // Only mint if it doesn't exceed a reasonable cap (e.g., 10x initial supply)
        require(totalSupply() + rewardAmount <= 1_000_000_000 * 10**decimals(), "Exceeds maximum supply cap");
        
        _mint(recipient, rewardAmount);
        
        emit KindnessRewarded(recipient, kindnessPoints, rewardAmount);
    }
    
    /**
     * @dev Distribute charitable pool funds
     * @param recipient The address receiving charitable funds
     * @param amount Amount of tokens to distribute
     * @param reason Description of the charitable distribution
     */
    function distributeCharitableFunds(
        address recipient,
        uint256 amount,
        string calldata reason
    ) external onlyOwner {
        require(recipient != address(0), "Invalid recipient");
        require(balanceOf(charitablePool) >= amount, "Insufficient charitable pool balance");
        
        _transfer(charitablePool, recipient, amount);
        
        emit CharitableDistribution(recipient, amount, reason);
    }
    
    /**
     * @dev Update the charitable pool address
     * @param newPool New charitable pool address
     */
    function updateCharitablePool(address newPool) external onlyOwner {
        require(newPool != address(0), "Invalid pool address");
        
        // Transfer remaining balance to new pool
        uint256 balance = balanceOf(charitablePool);
        if (balance > 0) {
            _transfer(charitablePool, newPool, balance);
        }
        
        charitablePool = newPool;
        emit CharitablePoolUpdated(newPool);
    }
    
    /**
     * @dev Update the reward rate for kindness points
     * @param newRate New reward rate (tokens per kindness point)
     */
    function updateRewardRate(uint256 newRate) external onlyOwner {
        require(newRate > 0, "Reward rate must be positive");
        rewardRate = newRate;
    }
    
    /**
     * @dev Get kindness score for an address
     * @param account Address to query
     * @return Kindness score
     */
    function getKindnessScore(address account) external view returns (uint256) {
        return kindnessScores[account];
    }
}
