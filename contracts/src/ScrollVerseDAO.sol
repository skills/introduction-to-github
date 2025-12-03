// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ScrollVerseDAO
 * @author OmniTech1™
 * @notice Core DAO contract for the ScrollVerse ecosystem governance
 * @dev This contract serves as the proposer and executor for the TimelockController,
 *      enabling decentralized governance for the ScrollVerse Genesis Sequence.
 * 
 * Phase 1, Step 1.1: Foundation contract for DAO-based governance
 * 
 * The ScrollVerseDAO contract acts as:
 * - Sole proposer: Only this contract can propose governance actions
 * - Sole executor: Only this contract can execute approved proposals
 * 
 * This creates a secure, single-point-of-governance that prevents
 * unauthorized actions while maintaining full decentralization.
 */
contract ScrollVerseDAO is Ownable, ReentrancyGuard {
    // ========== STATE VARIABLES ==========
    
    /// @notice Address of the TimelockController this DAO interacts with
    address public timelockController;
    
    /// @notice Counter for proposal IDs
    uint256 public proposalCount;
    
    /// @notice Mapping of proposal IDs to their status
    mapping(uint256 => bool) public proposalExecuted;
    
    // ========== EVENTS ==========
    
    /// @notice Emitted when a new proposal is created
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string description,
        uint256 timestamp
    );
    
    /// @notice Emitted when a proposal is executed
    event ProposalExecuted(
        uint256 indexed proposalId,
        address indexed executor,
        uint256 timestamp
    );
    
    /// @notice Emitted when the TimelockController is set or updated
    event TimelockControllerUpdated(
        address indexed oldController,
        address indexed newController
    );
    
    // ========== ERRORS ==========
    
    error InvalidTimelockAddress();
    error ProposalAlreadyExecuted(uint256 proposalId);
    error ProposalDoesNotExist(uint256 proposalId);
    
    // ========== CONSTRUCTOR ==========
    
    /**
     * @notice Initializes the ScrollVerseDAO contract
     * @param initialOwner Address of the initial contract owner
     */
    constructor(address initialOwner) Ownable(initialOwner) {}
    
    // ========== EXTERNAL FUNCTIONS ==========
    
    /**
     * @notice Sets the TimelockController address
     * @param _timelockController Address of the TimelockController
     */
    function setTimelockController(address _timelockController) external onlyOwner {
        if (_timelockController == address(0)) revert InvalidTimelockAddress();
        
        address oldController = timelockController;
        timelockController = _timelockController;
        
        emit TimelockControllerUpdated(oldController, _timelockController);
    }
    
    /**
     * @notice Creates a new governance proposal
     * @param description Description of the proposal
     * @return proposalId The ID of the newly created proposal
     */
    function createProposal(string calldata description) 
        external 
        onlyOwner 
        nonReentrant 
        returns (uint256 proposalId) 
    {
        proposalId = proposalCount;
        proposalCount++;
        
        emit ProposalCreated(proposalId, msg.sender, description, block.timestamp);
        
        return proposalId;
    }
    
    /**
     * @notice Marks a proposal as executed
     * @param proposalId The ID of the proposal to mark as executed
     */
    function markProposalExecuted(uint256 proposalId) 
        external 
        onlyOwner 
        nonReentrant 
    {
        if (proposalId >= proposalCount) revert ProposalDoesNotExist(proposalId);
        if (proposalExecuted[proposalId]) revert ProposalAlreadyExecuted(proposalId);
        
        proposalExecuted[proposalId] = true;
        
        emit ProposalExecuted(proposalId, msg.sender, block.timestamp);
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @notice Returns the TimelockController address
     * @return The address of the TimelockController
     */
    function getTimelockController() external view returns (address) {
        return timelockController;
    }
    
    /**
     * @notice Returns the total number of proposals
     * @return The total proposal count
     */
    function getProposalCount() external view returns (uint256) {
        return proposalCount;
    }
    
    /**
     * @notice Checks if a proposal has been executed
     * @param proposalId The ID of the proposal to check
     * @return True if the proposal has been executed
     */
    function isProposalExecuted(uint256 proposalId) external view returns (bool) {
        if (proposalId >= proposalCount) revert ProposalDoesNotExist(proposalId);
        return proposalExecuted[proposalId];
    }
}
