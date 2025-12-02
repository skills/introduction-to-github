// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MirrorTokenVesting
 * @author OmniTech1™
 * @notice Time-locked vesting contract for $MIRROR team tokens
 * @dev Implements linear vesting over 3 years with a 1-year cliff
 * 
 * Vesting Schedule:
 * - Total locked: 150,000,000 MIRROR tokens (15% of total supply)
 * - Cliff period: 1 year (no tokens accessible)
 * - Vesting period: 3 years total (linear release over remaining 2 years after cliff)
 * 
 * After the 1-year cliff, tokens are released linearly over the next 2 years.
 * Beneficiary can claim vested tokens at any time after they become available.
 */
contract MirrorTokenVesting is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ========== CONSTANTS ==========

    /// @notice Duration of the cliff period (1 year in seconds)
    uint256 public constant CLIFF_DURATION = 365 days;

    /// @notice Total vesting duration (3 years in seconds)
    uint256 public constant VESTING_DURATION = 3 * 365 days;

    /// @notice Duration of the linear vesting period after cliff (2 years)
    uint256 public constant LINEAR_VESTING_DURATION = 2 * 365 days;

    // ========== STATE VARIABLES ==========

    /// @notice The ERC20 token being vested
    IERC20 public immutable token;

    /// @notice Address of the beneficiary who receives vested tokens
    address public beneficiary;

    /// @notice Timestamp when vesting starts
    uint256 public vestingStart;

    /// @notice Timestamp when cliff ends
    uint256 public cliffEnd;

    /// @notice Timestamp when vesting ends
    uint256 public vestingEnd;

    /// @notice Total amount of tokens allocated for vesting
    uint256 public totalAllocation;

    /// @notice Total amount of tokens already released
    uint256 public totalReleased;

    /// @notice Flag to track if vesting has been initialized
    bool public vestingInitialized;

    /// @notice Flag to track if vesting has been revoked
    bool public revoked;

    // ========== EVENTS ==========

    /// @notice Emitted when vesting is initialized
    event VestingInitialized(
        address indexed beneficiary,
        uint256 totalAllocation,
        uint256 vestingStart,
        uint256 cliffEnd,
        uint256 vestingEnd
    );

    /// @notice Emitted when tokens are released to the beneficiary
    event TokensReleased(
        address indexed beneficiary,
        uint256 amount,
        uint256 timestamp
    );

    /// @notice Emitted when the beneficiary is changed
    event BeneficiaryChanged(
        address indexed oldBeneficiary,
        address indexed newBeneficiary
    );

    /// @notice Emitted when vesting is revoked
    event VestingRevoked(
        address indexed beneficiary,
        uint256 unvestedAmount,
        uint256 timestamp
    );

    // ========== ERRORS ==========

    error VestingAlreadyInitialized();
    error VestingNotInitialized();
    error ZeroAddress();
    error ZeroAmount();
    error CliffNotReached();
    error NoTokensAvailable();
    error VestingRevoked();
    error InsufficientBalance();
    error TransferFailed();

    // ========== CONSTRUCTOR ==========

    /**
     * @notice Deploys the vesting contract
     * @param _token Address of the MIRROR token contract
     * @param _owner Address of the contract owner
     */
    constructor(
        address _token,
        address _owner
    ) Ownable(_owner) {
        if (_token == address(0)) revert ZeroAddress();
        token = IERC20(_token);
    }

    // ========== EXTERNAL FUNCTIONS ==========

    /**
     * @notice Initialize the vesting schedule
     * @param _beneficiary Address that will receive vested tokens
     * @param _totalAllocation Total number of tokens to be vested
     * @dev Can only be called once by the owner
     * @dev Contract must have the tokens deposited before or after initialization
     */
    function initializeVesting(
        address _beneficiary,
        uint256 _totalAllocation
    ) external onlyOwner {
        if (vestingInitialized) revert VestingAlreadyInitialized();
        if (_beneficiary == address(0)) revert ZeroAddress();
        if (_totalAllocation == 0) revert ZeroAmount();

        beneficiary = _beneficiary;
        totalAllocation = _totalAllocation;
        
        // Set vesting timeline
        vestingStart = block.timestamp;
        cliffEnd = vestingStart + CLIFF_DURATION;
        vestingEnd = vestingStart + VESTING_DURATION;
        
        vestingInitialized = true;

        emit VestingInitialized(
            _beneficiary,
            _totalAllocation,
            vestingStart,
            cliffEnd,
            vestingEnd
        );
    }

    /**
     * @notice Release vested tokens to the beneficiary
     * @dev Anyone can call this to trigger release to beneficiary
     */
    function release() external nonReentrant {
        if (!vestingInitialized) revert VestingNotInitialized();
        if (revoked) revert VestingRevoked();
        if (block.timestamp < cliffEnd) revert CliffNotReached();

        uint256 releasable = getReleasableAmount();
        if (releasable == 0) revert NoTokensAvailable();

        uint256 contractBalance = token.balanceOf(address(this));
        if (contractBalance < releasable) revert InsufficientBalance();

        totalReleased += releasable;
        token.safeTransfer(beneficiary, releasable);

        emit TokensReleased(beneficiary, releasable, block.timestamp);
    }

    /**
     * @notice Change the beneficiary address
     * @param _newBeneficiary New beneficiary address
     * @dev Only owner can change beneficiary
     */
    function changeBeneficiary(address _newBeneficiary) external onlyOwner {
        if (_newBeneficiary == address(0)) revert ZeroAddress();
        
        address oldBeneficiary = beneficiary;
        beneficiary = _newBeneficiary;

        emit BeneficiaryChanged(oldBeneficiary, _newBeneficiary);
    }

    /**
     * @notice Revoke vesting and return unvested tokens to owner
     * @dev Only owner can revoke. Vested but unreleased tokens go to beneficiary.
     * @dev Unvested tokens are returned to the owner.
     */
    function revoke() external onlyOwner nonReentrant {
        if (!vestingInitialized) revert VestingNotInitialized();
        if (revoked) revert VestingRevoked();

        revoked = true;

        // Calculate and release any vested but unreleased tokens to beneficiary
        uint256 vestedAmount = getVestedAmount();
        uint256 releasable = vestedAmount - totalReleased;
        
        if (releasable > 0 && block.timestamp >= cliffEnd) {
            totalReleased += releasable;
            token.safeTransfer(beneficiary, releasable);
            emit TokensReleased(beneficiary, releasable, block.timestamp);
        }

        // Return unvested tokens to owner
        uint256 unvested = totalAllocation - vestedAmount;
        if (unvested > 0) {
            token.safeTransfer(owner(), unvested);
        }

        emit VestingRevoked(beneficiary, unvested, block.timestamp);
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @notice Calculate the total amount of tokens that have vested
     * @return The amount of tokens that have vested
     */
    function getVestedAmount() public view returns (uint256) {
        if (!vestingInitialized) return 0;
        if (block.timestamp < cliffEnd) return 0;
        
        if (block.timestamp >= vestingEnd) {
            return totalAllocation;
        }

        // Linear vesting after cliff
        // After cliff, tokens vest linearly over LINEAR_VESTING_DURATION
        uint256 timeAfterCliff = block.timestamp - cliffEnd;
        uint256 vestedAmount = (totalAllocation * timeAfterCliff) / LINEAR_VESTING_DURATION;
        
        return vestedAmount;
    }

    /**
     * @notice Calculate the amount of tokens available for release
     * @return The amount of tokens that can be released now
     */
    function getReleasableAmount() public view returns (uint256) {
        return getVestedAmount() - totalReleased;
    }

    /**
     * @notice Get the amount of tokens still locked (unvested)
     * @return The amount of tokens still locked
     */
    function getLockedAmount() public view returns (uint256) {
        return totalAllocation - getVestedAmount();
    }

    /**
     * @notice Get the remaining time until cliff ends
     * @return Seconds until cliff ends (0 if cliff has passed)
     */
    function getTimeUntilCliff() external view returns (uint256) {
        if (block.timestamp >= cliffEnd) return 0;
        return cliffEnd - block.timestamp;
    }

    /**
     * @notice Get the remaining time until vesting ends
     * @return Seconds until vesting ends (0 if vesting is complete)
     */
    function getTimeUntilVestingEnd() external view returns (uint256) {
        if (block.timestamp >= vestingEnd) return 0;
        return vestingEnd - block.timestamp;
    }

    /**
     * @notice Check if the cliff period has passed
     * @return True if cliff has passed
     */
    function isCliffPassed() external view returns (bool) {
        return block.timestamp >= cliffEnd;
    }

    /**
     * @notice Check if vesting is complete
     * @return True if all tokens have vested
     */
    function isVestingComplete() external view returns (bool) {
        return block.timestamp >= vestingEnd;
    }

    /**
     * @notice Get the vesting schedule details
     * @return _beneficiary Beneficiary address
     * @return _totalAllocation Total tokens allocated
     * @return _totalReleased Total tokens released
     * @return _vestingStart Vesting start timestamp
     * @return _cliffEnd Cliff end timestamp
     * @return _vestingEnd Vesting end timestamp
     */
    function getVestingSchedule() external view returns (
        address _beneficiary,
        uint256 _totalAllocation,
        uint256 _totalReleased,
        uint256 _vestingStart,
        uint256 _cliffEnd,
        uint256 _vestingEnd
    ) {
        return (
            beneficiary,
            totalAllocation,
            totalReleased,
            vestingStart,
            cliffEnd,
            vestingEnd
        );
    }

    /**
     * @notice Get the current vesting status
     * @return vestedAmount Total vested tokens
     * @return releasableAmount Tokens available for release
     * @return lockedAmount Tokens still locked
     * @return releasedAmount Tokens already released
     */
    function getVestingStatus() external view returns (
        uint256 vestedAmount,
        uint256 releasableAmount,
        uint256 lockedAmount,
        uint256 releasedAmount
    ) {
        return (
            getVestedAmount(),
            getReleasableAmount(),
            getLockedAmount(),
            totalReleased
        );
    }
}
