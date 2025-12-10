// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MirrorTokenVesting
 * @author OmniTech1™
 * @notice Vesting contract for the Foundational Team's $MIRROR token allocation
 * @dev Implements linear vesting with a 1-year cliff followed by 2-year linear release
 * 
 * Key Features:
 * - Immutable cliff (1 year) and vesting duration (2 years)
 * - Multi-beneficiary support with individual allocations
 * - Linear token release after cliff period
 * - Security features: ReentrancyGuard, SafeERC20
 * - Complete auditability through events
 * 
 * Vesting Schedule:
 * - Cliff Period: 1 year (no tokens released)
 * - Vesting Period: 2 years (linear release)
 * - Total Duration: 3 years from start
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

    /// @notice Total team allocation of $MIRROR tokens (150 million with 18 decimals)
    uint256 public constant TOTAL_TEAM_ALLOCATION = 150_000_000 * 10**18;
    
    /// @notice Cliff duration: 1 year in seconds
    uint256 public constant CLIFF_DURATION = 365 days;
    
    /// @notice Vesting duration after cliff: 2 years in seconds
    uint256 public constant VESTING_DURATION = 730 days;
    
    /// @notice Total vesting period (cliff + vesting): 3 years
    uint256 public constant TOTAL_DURATION = CLIFF_DURATION + VESTING_DURATION;

    // ========== STRUCTS ==========

    /// @notice Structure to store beneficiary vesting information
    struct BeneficiaryInfo {
        uint256 totalAllocation;    // Total tokens allocated to beneficiary
        uint256 releasedAmount;     // Tokens already released/claimed
        bool exists;                // Flag to check if beneficiary is registered
    }

    // ========== STATE VARIABLES ==========

    /// @notice The ERC20 token being vested ($MIRROR)
    IERC20 public immutable token;
    
    /// @notice Timestamp when vesting starts (set on initialization)
    uint256 public immutable vestingStart;
    
    /// @notice Total tokens allocated to all beneficiaries
    uint256 public totalAllocated;
    
    /// @notice Total tokens released to all beneficiaries
    uint256 public totalReleased;
    
    /// @notice Mapping of beneficiary addresses to their vesting info
    mapping(address => BeneficiaryInfo) public beneficiaries;
    
    /// @notice Array of all beneficiary addresses for enumeration
    address[] public beneficiaryList;
    
    /// @notice Flag to prevent adding beneficiaries after finalization
    bool public isFinalized;

    // ========== EVENTS ==========

    /// @notice Emitted when a beneficiary is added
    event BeneficiaryAdded(
        address indexed beneficiary,
        uint256 allocation,
        uint256 timestamp
    );

    /// @notice Emitted when tokens are deposited to the contract
    event TokensDeposited(
        address indexed depositor,
        uint256 amount,
        uint256 timestamp
    );

    /// @notice Emitted when a beneficiary claims vested tokens
    event TokensClaimed(
        address indexed beneficiary,
        uint256 amount,
        uint256 totalReleased,
        uint256 timestamp
    );

    /// @notice Emitted when beneficiary allocations are finalized
    event AllocationFinalized(
        uint256 totalAllocated,
        uint256 beneficiaryCount,
        uint256 timestamp
    );

    /// @notice Emitted when emergency withdrawal is triggered by owner
    event EmergencyWithdrawal(
        address indexed recipient,
        uint256 amount,
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

    error ZeroAddress();
    error ZeroAmount();
    error BeneficiaryAlreadyExists(address beneficiary);
    error BeneficiaryDoesNotExist(address beneficiary);
    error AllocationExceedsTotalTeamAllocation(uint256 requested, uint256 remaining);
    error AlreadyFinalized();
    error NotFinalized();
    error NoTokensAvailable();
    error InsufficientContractBalance(uint256 required, uint256 available);
    error CliffNotReached(uint256 cliffEnd, uint256 currentTime);
    error ArrayLengthMismatch(uint256 beneficiariesLength, uint256 allocationsLength);
    error IndexOutOfBounds(uint256 index, uint256 length);
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
     * @notice Initializes the vesting contract
     * @param _token Address of the $MIRROR ERC20 token
     * @param _owner Address of the contract owner
     * @dev Sets vesting start time to deployment timestamp
     * @notice Deploys the vesting contract
     * @param _token Address of the MIRROR token contract
     * @param _owner Address of the contract owner
     */
    constructor(
        address _token,
        address _owner
    ) Ownable(_owner) {
        if (_token == address(0)) revert ZeroAddress();
        if (_owner == address(0)) revert ZeroAddress();
        
        token = IERC20(_token);
        vestingStart = block.timestamp;
    }

    // ========== OWNER FUNCTIONS ==========

    /**
     * @notice Add a beneficiary with their token allocation
     * @param _beneficiary Address of the beneficiary
     * @param _allocation Amount of tokens allocated to this beneficiary
     * @dev Can only be called before finalization
     */
    function addBeneficiary(
        address _beneficiary,
        uint256 _allocation
    ) external onlyOwner {
        if (isFinalized) revert AlreadyFinalized();
        if (_beneficiary == address(0)) revert ZeroAddress();
        if (_allocation == 0) revert ZeroAmount();
        if (beneficiaries[_beneficiary].exists) revert BeneficiaryAlreadyExists(_beneficiary);
        
        uint256 newTotalAllocated = totalAllocated + _allocation;
        if (newTotalAllocated > TOTAL_TEAM_ALLOCATION) {
            revert AllocationExceedsTotalTeamAllocation(_allocation, TOTAL_TEAM_ALLOCATION - totalAllocated);
        }
        
        beneficiaries[_beneficiary] = BeneficiaryInfo({
            totalAllocation: _allocation,
            releasedAmount: 0,
            exists: true
        });
        
        beneficiaryList.push(_beneficiary);
        totalAllocated = newTotalAllocated;
        
        emit BeneficiaryAdded(_beneficiary, _allocation, block.timestamp);
    }

    /**
     * @notice Add multiple beneficiaries in a single transaction
     * @param _beneficiaries Array of beneficiary addresses
     * @param _allocations Array of corresponding allocations
     * @dev Gas-efficient batch operation for adding multiple beneficiaries
     */
    function addBeneficiariesBatch(
        address[] calldata _beneficiaries,
        uint256[] calldata _allocations
    ) external onlyOwner {
        if (isFinalized) revert AlreadyFinalized();
        if (_beneficiaries.length != _allocations.length) {
            revert ArrayLengthMismatch(_beneficiaries.length, _allocations.length);
        }
        
        uint256 batchTotal = 0;
        for (uint256 i = 0; i < _beneficiaries.length; i++) {
            batchTotal += _allocations[i];
        }
        
        if (totalAllocated + batchTotal > TOTAL_TEAM_ALLOCATION) {
            revert AllocationExceedsTotalTeamAllocation(batchTotal, TOTAL_TEAM_ALLOCATION - totalAllocated);
        }
        
        for (uint256 i = 0; i < _beneficiaries.length; i++) {
            address beneficiary = _beneficiaries[i];
            uint256 allocation = _allocations[i];
            
            if (beneficiary == address(0)) revert ZeroAddress();
            if (allocation == 0) revert ZeroAmount();
            if (beneficiaries[beneficiary].exists) revert BeneficiaryAlreadyExists(beneficiary);
            
            beneficiaries[beneficiary] = BeneficiaryInfo({
                totalAllocation: allocation,
                releasedAmount: 0,
                exists: true
            });
            
            beneficiaryList.push(beneficiary);
            
            emit BeneficiaryAdded(beneficiary, allocation, block.timestamp);
        }
        
        totalAllocated += batchTotal;
    }

    /**
     * @notice Finalize the beneficiary allocations
     * @dev Prevents further modifications to beneficiary list
     */
    function finalize() external onlyOwner {
        if (isFinalized) revert AlreadyFinalized();
        
        isFinalized = true;
        
        emit AllocationFinalized(totalAllocated, beneficiaryList.length, block.timestamp);
    }

    /**
     * @notice Emergency function to recover tokens in case of issues
     * @param _recipient Address to receive the tokens
     * @param _amount Amount of tokens to withdraw
     * @dev Should only be used in emergency situations
     */
    function emergencyWithdraw(
        address _recipient,
        uint256 _amount
    ) external onlyOwner nonReentrant {
        if (_recipient == address(0)) revert ZeroAddress();
        if (_amount == 0) revert ZeroAmount();
        
        uint256 balance = token.balanceOf(address(this));
        if (_amount > balance) revert InsufficientContractBalance(_amount, balance);
        
        token.safeTransfer(_recipient, _amount);
        
        emit EmergencyWithdrawal(_recipient, _amount, block.timestamp);
    }

    // ========== BENEFICIARY FUNCTIONS ==========

    /**
     * @notice Claim all available vested tokens for the caller
     * @dev Calculates vested amount and transfers available tokens
     */
    function claim() external nonReentrant {
        if (!isFinalized) revert NotFinalized();
        
        BeneficiaryInfo storage info = beneficiaries[msg.sender];
        if (!info.exists) revert BeneficiaryDoesNotExist(msg.sender);
        
        uint256 vestedAmount = _calculateVestedAmount(msg.sender);
        uint256 claimable = vestedAmount - info.releasedAmount;
        
        if (claimable == 0) revert NoTokensAvailable();
        
        uint256 balance = token.balanceOf(address(this));
        if (claimable > balance) revert InsufficientContractBalance(claimable, balance);
        
        info.releasedAmount += claimable;
        totalReleased += claimable;
        
        token.safeTransfer(msg.sender, claimable);
        
        emit TokensClaimed(msg.sender, claimable, info.releasedAmount, block.timestamp);
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @notice Get the cliff end timestamp
     * @return Timestamp when the cliff period ends
     */
    function getCliffEnd() external view returns (uint256) {
        return vestingStart + CLIFF_DURATION;
    }

    /**
     * @notice Get the vesting end timestamp
     * @return Timestamp when the vesting period ends
     */
    function getVestingEnd() external view returns (uint256) {
        return vestingStart + TOTAL_DURATION;
    }

    /**
     * @notice Get the total number of beneficiaries
     * @return Number of registered beneficiaries
     */
    function getBeneficiaryCount() external view returns (uint256) {
        return beneficiaryList.length;
    }

    /**
     * @notice Get beneficiary address at a specific index
     * @param _index Index in the beneficiary list
     * @return Beneficiary address
     */
    function getBeneficiaryAtIndex(uint256 _index) external view returns (address) {
        if (_index >= beneficiaryList.length) {
            revert IndexOutOfBounds(_index, beneficiaryList.length);
        }
        return beneficiaryList[_index];
    }

    /**
     * @notice Get detailed vesting information for a beneficiary
     * @param _beneficiary Address of the beneficiary
     * @return totalAllocation Total tokens allocated
     * @return vestedAmount Currently vested amount
     * @return releasedAmount Already released amount
     * @return claimableAmount Amount available to claim now
     * @return remainingAmount Tokens yet to vest
     */
    function getBeneficiaryVestingInfo(address _beneficiary) 
        external 
        view 
        returns (
            uint256 totalAllocation,
            uint256 vestedAmount,
            uint256 releasedAmount,
            uint256 claimableAmount,
            uint256 remainingAmount
        ) 
    {
        BeneficiaryInfo storage info = beneficiaries[_beneficiary];
        if (!info.exists) revert BeneficiaryDoesNotExist(_beneficiary);
        
        totalAllocation = info.totalAllocation;
        vestedAmount = _calculateVestedAmount(_beneficiary);
        releasedAmount = info.releasedAmount;
        claimableAmount = vestedAmount - releasedAmount;
        remainingAmount = totalAllocation - vestedAmount;
    }

    /**
     * @notice Calculate the total vested amount for a beneficiary
     * @param _beneficiary Address of the beneficiary
     * @return Amount of tokens vested (may include already released tokens)
     */
    function getVestedAmount(address _beneficiary) external view returns (uint256) {
        if (!beneficiaries[_beneficiary].exists) revert BeneficiaryDoesNotExist(_beneficiary);
        return _calculateVestedAmount(_beneficiary);
    }

    /**
     * @notice Get the amount of tokens available to claim for a beneficiary
     * @param _beneficiary Address of the beneficiary
     * @return Amount of tokens available to claim now
     */
    function getClaimableAmount(address _beneficiary) external view returns (uint256) {
        BeneficiaryInfo storage info = beneficiaries[_beneficiary];
        if (!info.exists) revert BeneficiaryDoesNotExist(_beneficiary);
        
        uint256 vestedAmount = _calculateVestedAmount(_beneficiary);
        return vestedAmount - info.releasedAmount;
    }

    /**
     * @notice Get the amount of tokens already released to a beneficiary
     * @param _beneficiary Address of the beneficiary
     * @return Amount of tokens already released
     */
    function getReleasedAmount(address _beneficiary) external view returns (uint256) {
        if (!beneficiaries[_beneficiary].exists) revert BeneficiaryDoesNotExist(_beneficiary);
        return beneficiaries[_beneficiary].releasedAmount;
    }

    /**
     * @notice Get the remaining unvested amount for a beneficiary
     * @param _beneficiary Address of the beneficiary
     * @return Amount of tokens not yet vested
     */
    function getRemainingAmount(address _beneficiary) external view returns (uint256) {
        BeneficiaryInfo storage info = beneficiaries[_beneficiary];
        if (!info.exists) revert BeneficiaryDoesNotExist(_beneficiary);
        
        uint256 vestedAmount = _calculateVestedAmount(_beneficiary);
        return info.totalAllocation - vestedAmount;
    }

    /**
     * @notice Check if a beneficiary exists
     * @param _beneficiary Address to check
     * @return True if the address is a registered beneficiary
     */
    function isBeneficiary(address _beneficiary) external view returns (bool) {
        return beneficiaries[_beneficiary].exists;
    }

    /**
     * @notice Get the current vesting schedule status
     * @return isCliffReached Whether the cliff period has passed
     * @return isVestingComplete Whether the vesting period is complete
     * @return timeUntilCliff Seconds until cliff (0 if passed)
     * @return timeUntilComplete Seconds until vesting complete (0 if complete)
     * @return percentageVested Current vesting percentage (0-100)
     */
    function getVestingScheduleStatus()
        external
        view
        returns (
            bool isCliffReached,
            bool isVestingComplete,
            uint256 timeUntilCliff,
            uint256 timeUntilComplete,
            uint256 percentageVested
        )
    {
        uint256 cliffEnd = vestingStart + CLIFF_DURATION;
        uint256 vestingEnd = vestingStart + TOTAL_DURATION;
        
        isCliffReached = block.timestamp >= cliffEnd;
        isVestingComplete = block.timestamp >= vestingEnd;
        
        timeUntilCliff = block.timestamp < cliffEnd ? cliffEnd - block.timestamp : 0;
        timeUntilComplete = block.timestamp < vestingEnd ? vestingEnd - block.timestamp : 0;
        
        if (!isCliffReached) {
            percentageVested = 0;
        } else if (isVestingComplete) {
            percentageVested = 100;
        } else {
            uint256 elapsedSinceCliff = block.timestamp - cliffEnd;
            percentageVested = (elapsedSinceCliff * 100) / VESTING_DURATION;
        }
    }

    /**
     * @notice Get the contract's current token balance
     * @return Current balance of vesting tokens held
     */
    function getContractBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }

    // ========== INTERNAL FUNCTIONS ==========

    /**
     * @notice Calculate the vested amount for a beneficiary based on time
     * @param _beneficiary Address of the beneficiary
     * @return The total amount of tokens vested so far
     * @dev Implements linear vesting: 
     *      - 0 tokens during cliff period
     *      - Linear release from 0% to 100% over vesting period
     */
    function _calculateVestedAmount(address _beneficiary) internal view returns (uint256) {
        BeneficiaryInfo storage info = beneficiaries[_beneficiary];
        uint256 allocation = info.totalAllocation;
        
        uint256 cliffEnd = vestingStart + CLIFF_DURATION;
        uint256 vestingEnd = vestingStart + TOTAL_DURATION;
        
        // During cliff period, no tokens are vested
        if (block.timestamp < cliffEnd) {
            return 0;
        }
        
        // After vesting period ends, all tokens are vested
        if (block.timestamp >= vestingEnd) {
            return allocation;
        }
        
        // During vesting period, calculate linear vesting
        // Formula: allocation * (time since cliff) / vesting duration
        uint256 elapsedSinceCliff = block.timestamp - cliffEnd;
        return (allocation * elapsedSinceCliff) / VESTING_DURATION;
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
