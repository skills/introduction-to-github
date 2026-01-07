// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title MirrorStaking
 * @author OmniTech1™
 * @notice Staking contract for $MIRROR tokens with NFT boosting capabilities
 * @dev Implements flexible staking with configurable reward rates and NFT integration
 * 
 * Features:
 * - Flexible staking (no lock period)
 * - Time-locked staking with bonus rewards
 * - NFT boost integration (PharaohConsciousnessFusion)
 * - Configurable APY rates
 * - Emergency withdrawal capability
 * 
 * Lock Period Bonuses:
 * - No lock: Base APY (8%)
 * - 30 days: Base APY + 25% bonus (10%)
 * - 90 days: Base APY + 50% bonus (12%)
 * - 180 days: Base APY + 100% bonus (16%)
 * - 365 days: Base APY + 200% bonus (24%)
 * 
 * NFT Boost:
 * - Holding PharaohConsciousnessFusion NFTs adds governance weight
 * - NFT staking provides additional reward multiplier
 */
contract MirrorStaking is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // ========== STRUCTS ==========

    /// @notice Staking position data
    struct StakeInfo {
        uint256 amount;           // Amount of MIRROR tokens staked
        uint256 startTime;        // Timestamp when staking started
        uint256 lockEndTime;      // Timestamp when lock period ends (0 for flexible)
        uint256 lastClaimTime;    // Last time rewards were claimed
        uint256 accumulatedReward;// Accumulated but unclaimed rewards
        uint256 lockBonusBps;     // Lock period bonus in basis points
    }

    /// @notice Lock period configuration
    struct LockPeriod {
        uint256 duration;         // Lock duration in seconds
        uint256 bonusBps;         // Bonus reward in basis points
        bool active;              // Whether this lock period is active
    }

    // ========== CONSTANTS ==========

    /// @notice Base reward rate (8% APY in basis points)
    uint256 public constant BASE_REWARD_RATE = 800;

    /// @notice Basis points denominator
    uint256 public constant BPS_DENOMINATOR = 10000;

    /// @notice Seconds in a year (for APY calculation)
    uint256 public constant SECONDS_PER_YEAR = 365 days;

    /// @notice Minimum stake amount (1 MIRROR)
    uint256 public constant MIN_STAKE_AMOUNT = 1 * 10**18;

    // ========== STATE VARIABLES ==========

    /// @notice The staking token ($MIRROR)
    IERC20 public immutable stakingToken;

    /// @notice The reward token (can be same as staking token)
    IERC20 public immutable rewardToken;

    /// @notice Total amount of tokens staked
    uint256 public totalStaked;

    /// @notice Total rewards distributed
    uint256 public totalRewardsDistributed;

    /// @notice Available reward pool
    uint256 public rewardPool;

    /// @notice Mapping of user address to their stake info
    mapping(address => StakeInfo) public stakes;

    /// @notice Available lock periods
    LockPeriod[] public lockPeriods;

    /// @notice NFT contract for boost calculation (optional)
    address public nftContract;

    /// @notice NFT boost multiplier in basis points (e.g., 500 = 5% boost per NFT)
    uint256 public nftBoostBps;

    /// @notice Maximum NFT boost multiplier in basis points
    uint256 public maxNftBoostBps;

    // ========== EVENTS ==========

    /// @notice Emitted when tokens are staked
    event Staked(
        address indexed user,
        uint256 amount,
        uint256 lockPeriodIndex,
        uint256 lockEndTime
    );

    /// @notice Emitted when tokens are unstaked
    event Unstaked(
        address indexed user,
        uint256 amount,
        uint256 reward
    );

    /// @notice Emitted when rewards are claimed
    event RewardsClaimed(
        address indexed user,
        uint256 amount
    );

    /// @notice Emitted when rewards are added to the pool
    event RewardsAdded(uint256 amount);

    /// @notice Emitted when emergency withdrawal is performed
    event EmergencyWithdraw(address indexed user, uint256 amount);

    /// @notice Emitted when NFT contract is updated
    event NFTContractUpdated(address indexed oldContract, address indexed newContract);

    /// @notice Emitted when lock period is added
    event LockPeriodAdded(uint256 indexed index, uint256 duration, uint256 bonusBps);

    // ========== ERRORS ==========

    error ZeroAddress();
    error ZeroAmount();
    error BelowMinimumStake();
    error NoActiveStake();
    error StakeLocked(uint256 unlockTime);
    error InvalidLockPeriod();
    error InsufficientRewardPool();
    error TransferFailed();

    // ========== CONSTRUCTOR ==========

    /**
     * @notice Deploy the MirrorStaking contract
     * @param _stakingToken Address of the MIRROR token
     * @param _rewardToken Address of the reward token (can be same as staking)
     * @param _owner Address of the contract owner
     */
    constructor(
        address _stakingToken,
        address _rewardToken,
        address _owner
    ) Ownable(_owner) {
        if (_stakingToken == address(0)) revert ZeroAddress();
        if (_rewardToken == address(0)) revert ZeroAddress();
        if (_owner == address(0)) revert ZeroAddress();

        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);

        // Initialize default lock periods
        _initializeLockPeriods();

        // Set default NFT boost parameters
        nftBoostBps = 500;      // 5% boost per NFT
        maxNftBoostBps = 5000;  // 50% max boost
    }

    // ========== STAKING FUNCTIONS ==========

    /**
     * @notice Stake MIRROR tokens with optional lock period
     * @param amount Amount of tokens to stake
     * @param lockPeriodIndex Index of the lock period (0 for flexible)
     */
    function stake(uint256 amount, uint256 lockPeriodIndex) external nonReentrant whenNotPaused {
        if (amount < MIN_STAKE_AMOUNT) revert BelowMinimumStake();
        if (lockPeriodIndex > 0 && (lockPeriodIndex > lockPeriods.length || !lockPeriods[lockPeriodIndex - 1].active)) {
            revert InvalidLockPeriod();
        }

        StakeInfo storage userStake = stakes[msg.sender];

        // If user has existing stake, claim pending rewards first
        if (userStake.amount > 0) {
            _claimRewards(msg.sender);
        }

        // Calculate lock end time and bonus
        uint256 lockEndTime = 0;
        uint256 lockBonusBps = 0;
        
        if (lockPeriodIndex > 0) {
            LockPeriod storage period = lockPeriods[lockPeriodIndex - 1];
            lockEndTime = block.timestamp + period.duration;
            lockBonusBps = period.bonusBps;
        }

        // Update stake info
        userStake.amount += amount;
        userStake.startTime = block.timestamp;
        userStake.lockEndTime = lockEndTime;
        userStake.lastClaimTime = block.timestamp;
        userStake.lockBonusBps = lockBonusBps;

        totalStaked += amount;

        // Transfer tokens from user
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        emit Staked(msg.sender, amount, lockPeriodIndex, lockEndTime);
    }

    /**
     * @notice Unstake all tokens and claim rewards
     */
    function unstake() external nonReentrant {
        StakeInfo storage userStake = stakes[msg.sender];
        if (userStake.amount == 0) revert NoActiveStake();
        if (userStake.lockEndTime > 0 && block.timestamp < userStake.lockEndTime) {
            revert StakeLocked(userStake.lockEndTime);
        }

        uint256 amount = userStake.amount;
        uint256 reward = _calculateRewards(msg.sender);

        // Reset stake info
        totalStaked -= amount;
        delete stakes[msg.sender];

        // Transfer staked tokens back
        stakingToken.safeTransfer(msg.sender, amount);

        // Transfer rewards if available
        if (reward > 0 && reward <= rewardPool) {
            rewardPool -= reward;
            totalRewardsDistributed += reward;
            rewardToken.safeTransfer(msg.sender, reward);
        }

        emit Unstaked(msg.sender, amount, reward);
    }

    /**
     * @notice Claim pending rewards without unstaking
     */
    function claimRewards() external nonReentrant {
        if (stakes[msg.sender].amount == 0) revert NoActiveStake();
        _claimRewards(msg.sender);
    }

    /**
     * @notice Emergency withdrawal - forfeits rewards
     */
    function emergencyWithdraw() external nonReentrant {
        StakeInfo storage userStake = stakes[msg.sender];
        if (userStake.amount == 0) revert NoActiveStake();

        uint256 amount = userStake.amount;
        totalStaked -= amount;
        delete stakes[msg.sender];

        stakingToken.safeTransfer(msg.sender, amount);

        emit EmergencyWithdraw(msg.sender, amount);
    }

    // ========== INTERNAL FUNCTIONS ==========

    /**
     * @notice Internal function to claim rewards
     */
    function _claimRewards(address user) internal {
        uint256 reward = _calculateRewards(user);
        
        if (reward > 0 && reward <= rewardPool) {
            stakes[user].lastClaimTime = block.timestamp;
            stakes[user].accumulatedReward = 0;
            
            rewardPool -= reward;
            totalRewardsDistributed += reward;
            rewardToken.safeTransfer(user, reward);

            emit RewardsClaimed(user, reward);
        }
    }

    /**
     * @notice Calculate pending rewards for a user
     */
    function _calculateRewards(address user) internal view returns (uint256) {
        StakeInfo storage userStake = stakes[user];
        if (userStake.amount == 0) return 0;

        uint256 stakingDuration = block.timestamp - userStake.lastClaimTime;
        
        // Calculate base reward
        uint256 baseReward = (userStake.amount * BASE_REWARD_RATE * stakingDuration) / 
                            (SECONDS_PER_YEAR * BPS_DENOMINATOR);

        // Apply lock bonus
        uint256 lockBonus = (baseReward * userStake.lockBonusBps) / BPS_DENOMINATOR;

        // Apply NFT boost
        uint256 nftBoost = 0;
        if (nftContract != address(0)) {
            uint256 nftBoostMultiplier = _getNftBoostMultiplier(user);
            nftBoost = (baseReward * nftBoostMultiplier) / BPS_DENOMINATOR;
        }

        return userStake.accumulatedReward + baseReward + lockBonus + nftBoost;
    }

    /**
     * @notice Get NFT boost multiplier for a user
     */
    function _getNftBoostMultiplier(address user) internal view returns (uint256) {
        if (nftContract == address(0)) return 0;

        // Try to get NFT balance - this is a simple implementation
        // In production, you might want to use a more sophisticated method
        try IERC721Minimal(nftContract).balanceOf(user) returns (uint256 balance) {
            uint256 boost = balance * nftBoostBps;
            return boost > maxNftBoostBps ? maxNftBoostBps : boost;
        } catch {
            return 0;
        }
    }

    /**
     * @notice Initialize default lock periods
     */
    function _initializeLockPeriods() internal {
        // 30 days - 25% bonus
        lockPeriods.push(LockPeriod({
            duration: 30 days,
            bonusBps: 2500,
            active: true
        }));

        // 90 days - 50% bonus
        lockPeriods.push(LockPeriod({
            duration: 90 days,
            bonusBps: 5000,
            active: true
        }));

        // 180 days - 100% bonus
        lockPeriods.push(LockPeriod({
            duration: 180 days,
            bonusBps: 10000,
            active: true
        }));

        // 365 days - 200% bonus
        lockPeriods.push(LockPeriod({
            duration: 365 days,
            bonusBps: 20000,
            active: true
        }));
    }

    // ========== ADMIN FUNCTIONS ==========

    /**
     * @notice Add rewards to the pool
     * @param amount Amount of reward tokens to add
     */
    function addRewards(uint256 amount) external onlyOwner {
        if (amount == 0) revert ZeroAmount();
        rewardToken.safeTransferFrom(msg.sender, address(this), amount);
        rewardPool += amount;
        emit RewardsAdded(amount);
    }

    /**
     * @notice Set NFT contract address
     * @param _nftContract Address of the NFT contract
     */
    function setNFTContract(address _nftContract) external onlyOwner {
        address old = nftContract;
        nftContract = _nftContract;
        emit NFTContractUpdated(old, _nftContract);
    }

    /**
     * @notice Set NFT boost parameters
     * @param _nftBoostBps Boost per NFT in basis points
     * @param _maxNftBoostBps Maximum boost in basis points
     */
    function setNFTBoostParams(uint256 _nftBoostBps, uint256 _maxNftBoostBps) external onlyOwner {
        nftBoostBps = _nftBoostBps;
        maxNftBoostBps = _maxNftBoostBps;
    }

    /**
     * @notice Add a new lock period
     * @param duration Lock duration in seconds
     * @param bonusBps Bonus in basis points
     */
    function addLockPeriod(uint256 duration, uint256 bonusBps) external onlyOwner {
        lockPeriods.push(LockPeriod({
            duration: duration,
            bonusBps: bonusBps,
            active: true
        }));
        emit LockPeriodAdded(lockPeriods.length - 1, duration, bonusBps);
    }

    /**
     * @notice Toggle lock period active status
     * @param index Lock period index
     */
    function toggleLockPeriod(uint256 index) external onlyOwner {
        if (index >= lockPeriods.length) revert InvalidLockPeriod();
        lockPeriods[index].active = !lockPeriods[index].active;
    }

    /**
     * @notice Pause staking
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause staking
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Emergency withdraw stuck tokens (non-staking tokens only)
     * @param token Token address to withdraw
     * @param amount Amount to withdraw
     */
    function emergencyTokenWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(stakingToken)) {
            // Only allow withdrawing excess tokens beyond what's staked
            uint256 balance = stakingToken.balanceOf(address(this));
            uint256 excess = balance > totalStaked ? balance - totalStaked : 0;
            if (amount > excess) revert InsufficientRewardPool();
        }
        IERC20(token).safeTransfer(owner(), amount);
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @notice Get pending rewards for a user
     * @param user User address
     */
    function pendingRewards(address user) external view returns (uint256) {
        return _calculateRewards(user);
    }

    /**
     * @notice Get user stake info
     * @param user User address
     */
    function getStakeInfo(address user) external view returns (
        uint256 amount,
        uint256 startTime,
        uint256 lockEndTime,
        uint256 lastClaimTime,
        uint256 pendingReward,
        uint256 lockBonusBps
    ) {
        StakeInfo storage stake = stakes[user];
        return (
            stake.amount,
            stake.startTime,
            stake.lockEndTime,
            stake.lastClaimTime,
            _calculateRewards(user),
            stake.lockBonusBps
        );
    }

    /**
     * @notice Get lock period info
     * @param index Lock period index
     */
    function getLockPeriod(uint256 index) external view returns (
        uint256 duration,
        uint256 bonusBps,
        bool active
    ) {
        if (index >= lockPeriods.length) revert InvalidLockPeriod();
        LockPeriod storage period = lockPeriods[index];
        return (period.duration, period.bonusBps, period.active);
    }

    /**
     * @notice Get total number of lock periods
     */
    function getLockPeriodCount() external view returns (uint256) {
        return lockPeriods.length;
    }

    /**
     * @notice Calculate APY for a given lock period
     * @param lockPeriodIndex Lock period index (0 for flexible)
     * @param hasNft Whether the user holds any NFTs
     * @param nftCount Number of NFTs held
     */
    function calculateAPY(
        uint256 lockPeriodIndex,
        bool hasNft,
        uint256 nftCount
    ) external view returns (uint256) {
        uint256 baseApy = BASE_REWARD_RATE;
        
        // Add lock bonus
        if (lockPeriodIndex > 0 && lockPeriodIndex <= lockPeriods.length) {
            uint256 lockBonus = (baseApy * lockPeriods[lockPeriodIndex - 1].bonusBps) / BPS_DENOMINATOR;
            baseApy += lockBonus;
        }

        // Add NFT boost
        if (hasNft && nftContract != address(0)) {
            uint256 nftBoost = nftCount * nftBoostBps;
            if (nftBoost > maxNftBoostBps) nftBoost = maxNftBoostBps;
            uint256 nftBonusApy = (baseApy * nftBoost) / BPS_DENOMINATOR;
            baseApy += nftBonusApy;
        }

        return baseApy;
    }
}

/**
 * @notice Minimal interface for NFT balance checks
 */
interface IERC721Minimal {
    function balanceOf(address owner) external view returns (uint256);
}
