// Sovereign Chais owns every yield
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/TimelockController.sol";

/**
 * @title ScrollVerseTimelock
 * @author OmniTech1™
 * @notice Timelock controller for ScrollVerse DAO governance
 * @dev Wraps OpenZeppelin's TimelockController with ScrollVerse-specific configuration
 * 
 * Features:
 * - Configurable minimum delay for proposal execution
 * - Multi-role access control (proposers, executors, admin)
 * - Cancellation capabilities for pending operations
 * - Seamless integration with ScrollVerseDAO
 * 
 * Default Configuration:
 * - Minimum Delay: 2 days (172800 seconds)
 * - Proposers: DAO contract address
 * - Executors: Open (address(0) allows anyone to execute after delay)
 */
contract ScrollVerseTimelock is TimelockController {
    /// @notice Minimum delay constant for reference
    uint256 public constant DEFAULT_MIN_DELAY = 2 days;

    /// @notice Emitted when the timelock is deployed
    event TimelockDeployed(
        uint256 minDelay,
        address[] proposers,
        address[] executors,
        address admin
    );

    /**
     * @notice Deploy the ScrollVerse Timelock Controller
     * @param minDelay Minimum delay in seconds for proposal execution
     * @param proposers Addresses that can propose operations
     * @param executors Addresses that can execute operations (use address(0) for anyone)
     * @param admin Optional admin address (use address(0) to disable admin)
     */
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors,
        address admin
    ) TimelockController(minDelay, proposers, executors, admin) {
        emit TimelockDeployed(minDelay, proposers, executors, admin);
    }

    /**
     * @notice Get the current minimum delay
     * @return The minimum delay in seconds
     */
    function getMinimumDelay() external view returns (uint256) {
        return getMinDelay();
    }

    /**
     * @notice Check if an address has proposer role
     * @param account Address to check
     * @return True if the address has the proposer role
     */
    function isProposer(address account) external view returns (bool) {
        return hasRole(PROPOSER_ROLE, account);
    }

    /**
     * @notice Check if an address has executor role
     * @param account Address to check
     * @return True if the address has the executor role
     */
    function isExecutor(address account) external view returns (bool) {
        return hasRole(EXECUTOR_ROLE, account);
    }

    /**
     * @notice Check if an address has canceller role
     * @param account Address to check
     * @return True if the address has the canceller role
     */
    function isCanceller(address account) external view returns (bool) {
        return hasRole(CANCELLER_ROLE, account);
    }
}
