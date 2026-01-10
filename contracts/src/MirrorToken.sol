// Sovereign Chais owns every yield
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Nonces.sol";

/**
 * @title MirrorToken ($MIRROR)
 * @author OmniTech1™
 * @notice ERC-20 governance token for the ScrollVerse ecosystem
 * @dev Implements ERC20Capped for fixed supply, ERC20Votes for governance, and ERC20Permit for gasless approvals
 * 
 * Token Distribution:
 * - Treasury & DAO: 40% (400,000,000 tokens)
 * - Consciousness Fusion Rewards: 35% (350,000,000 tokens)
 * - Foundational Team: 15% (150,000,000 tokens) - locked in vesting contract
 * - Pilot Launch & Liquidity: 10% (100,000,000 tokens)
 * 
 * Total Supply: 1,000,000,000 MIRROR (fixed, capped)
 */
contract MirrorToken is ERC20, ERC20Capped, ERC20Permit, ERC20Votes, Ownable {
    // ========== CONSTANTS ==========

    /// @notice Maximum token supply (1 billion tokens with 18 decimals)
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;

    /// @notice Treasury & DAO allocation (40%)
    uint256 public constant TREASURY_DAO_ALLOCATION = 400_000_000 * 10**18;

    /// @notice Consciousness Fusion Rewards allocation (35%)
    uint256 public constant FUSION_REWARDS_ALLOCATION = 350_000_000 * 10**18;

    /// @notice Team allocation (15%) - to be locked in vesting
    uint256 public constant TEAM_ALLOCATION = 150_000_000 * 10**18;

    /// @notice Pilot Launch & Liquidity allocation (10%)
    uint256 public constant LIQUIDITY_ALLOCATION = 100_000_000 * 10**18;

    // ========== STATE VARIABLES ==========

    /// @notice Address of the treasury/DAO wallet
    address public treasuryAddress;

    /// @notice Address of the consciousness fusion rewards pool
    address public fusionRewardsAddress;

    /// @notice Address of the team vesting contract
    address public teamVestingAddress;

    /// @notice Address for pilot launch & liquidity pool
    address public liquidityAddress;

    /// @notice Flag to track if initial distribution has been executed
    bool public initialDistributionDone;

    // ========== EVENTS ==========

    /// @notice Emitted when initial token distribution is executed
    event InitialDistributionCompleted(
        address indexed treasury,
        address indexed fusionRewards,
        address indexed teamVesting,
        address liquidity,
        uint256 timestamp
    );

    /// @notice Emitted when voting power is delegated
    event VotingPowerDelegated(
        address indexed delegator,
        address indexed fromDelegate,
        address indexed toDelegate
    );

    // ========== ERRORS ==========

    error DistributionAlreadyDone();
    error ZeroAddress();
    error InvalidAllocation();

    // ========== CONSTRUCTOR ==========

    /**
     * @notice Deploys the MirrorToken contract
     * @param initialOwner Address of the initial contract owner
     * @dev Does not mint tokens immediately; use executeInitialDistribution() after deployment
     */
    constructor(
        address initialOwner
    ) 
        ERC20("Mirror Token", "MIRROR") 
        ERC20Capped(MAX_SUPPLY)
        ERC20Permit("Mirror Token")
        Ownable(initialOwner)
    {
        if (initialOwner == address(0)) revert ZeroAddress();
    }

    // ========== EXTERNAL FUNCTIONS ==========

    /**
     * @notice Execute the initial token distribution to all allocation pools
     * @param _treasuryAddress Address for Treasury & DAO allocation
     * @param _fusionRewardsAddress Address for Consciousness Fusion Rewards
     * @param _teamVestingAddress Address of the team vesting contract
     * @param _liquidityAddress Address for Pilot Launch & Liquidity
     * @dev Can only be called once by the owner
     */
    function executeInitialDistribution(
        address _treasuryAddress,
        address _fusionRewardsAddress,
        address _teamVestingAddress,
        address _liquidityAddress
    ) external onlyOwner {
        if (initialDistributionDone) revert DistributionAlreadyDone();
        if (_treasuryAddress == address(0)) revert ZeroAddress();
        if (_fusionRewardsAddress == address(0)) revert ZeroAddress();
        if (_teamVestingAddress == address(0)) revert ZeroAddress();
        if (_liquidityAddress == address(0)) revert ZeroAddress();

        // Store addresses
        treasuryAddress = _treasuryAddress;
        fusionRewardsAddress = _fusionRewardsAddress;
        teamVestingAddress = _teamVestingAddress;
        liquidityAddress = _liquidityAddress;

        // Mark distribution as done before minting to prevent reentrancy
        initialDistributionDone = true;

        // Mint tokens to each allocation pool
        // Treasury & DAO: 40% (400,000,000 tokens)
        _mint(_treasuryAddress, TREASURY_DAO_ALLOCATION);

        // Consciousness Fusion Rewards: 35% (350,000,000 tokens)
        _mint(_fusionRewardsAddress, FUSION_REWARDS_ALLOCATION);

        // Foundational Team: 15% (150,000,000 tokens) - sent to vesting contract
        _mint(_teamVestingAddress, TEAM_ALLOCATION);

        // Pilot Launch & Liquidity: 10% (100,000,000 tokens)
        _mint(_liquidityAddress, LIQUIDITY_ALLOCATION);

        emit InitialDistributionCompleted(
            _treasuryAddress,
            _fusionRewardsAddress,
            _teamVestingAddress,
            _liquidityAddress,
            block.timestamp
        );
    }

    /**
     * @notice Delegate voting power to another address
     * @param delegatee The address to delegate voting power to
     * @dev Wrapper around ERC20Votes delegate function with event emission
     */
    function delegateVotingPower(address delegatee) external {
        address oldDelegate = delegates(msg.sender);
        delegate(delegatee);
        emit VotingPowerDelegated(msg.sender, oldDelegate, delegatee);
    }

    /**
     * @notice Get the current voting power of an account
     * @param account The address to check
     * @return The current voting power
     */
    function getVotingPower(address account) external view returns (uint256) {
        return getVotes(account);
    }

    /**
     * @notice Get the voting power of an account at a specific past block
     * @param account The address to check
     * @param blockNumber The block number to query
     * @return The voting power at the specified block
     */
    function getPastVotingPower(address account, uint256 blockNumber) external view returns (uint256) {
        return getPastVotes(account, blockNumber);
    }

    // ========== OVERRIDE FUNCTIONS ==========

    /**
     * @dev Override required by Solidity for ERC20Capped
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Capped, ERC20Votes) {
        super._update(from, to, value);
    }

    /**
     * @dev Override required by Solidity for ERC20Permit and ERC20Votes
     */
    function nonces(address owner) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @notice Check if the total supply has reached the cap
     * @return True if supply equals cap
     */
    function isSupplyCapped() external view returns (bool) {
        return totalSupply() == cap();
    }

    /**
     * @notice Get all allocation addresses
     * @return treasury Treasury & DAO address
     * @return fusionRewards Consciousness Fusion Rewards address
     * @return teamVesting Team vesting contract address
     * @return liquidity Pilot Launch & Liquidity address
     */
    function getAllocationAddresses() external view returns (
        address treasury,
        address fusionRewards,
        address teamVesting,
        address liquidity
    ) {
        return (treasuryAddress, fusionRewardsAddress, teamVestingAddress, liquidityAddress);
    }

    /**
     * @notice Get all allocation amounts
     * @return treasuryAmount Treasury & DAO allocation
     * @return fusionRewardsAmount Consciousness Fusion Rewards allocation
     * @return teamAmount Team allocation
     * @return liquidityAmount Pilot Launch & Liquidity allocation
     */
    function getAllocationAmounts() external pure returns (
        uint256 treasuryAmount,
        uint256 fusionRewardsAmount,
        uint256 teamAmount,
        uint256 liquidityAmount
    ) {
        return (
            TREASURY_DAO_ALLOCATION,
            FUSION_REWARDS_ALLOCATION,
            TEAM_ALLOCATION,
            LIQUIDITY_ALLOCATION
        );
    }
}
