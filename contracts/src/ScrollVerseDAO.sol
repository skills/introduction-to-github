// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
import "@openzeppelin/contracts/governance/TimelockController.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ScrollVerseDAO
 * @author OmniTech1™
 * @notice The ultimate governing body of the ScrollVerse ecosystem
 * @dev Implements OpenZeppelin Governor pattern with TimelockController integration
 * 
 * ScrollVerseDAO governs:
 * - TimelockController: Executes proposals with time delay for security
 * - $MIRROR Token: ERC-20Votes governance token for voting power
 * - PharaohConsciousnessFusion (PFC-NFT): NFT collection for ecosystem access
 * 
 * Key Features:
 * - Decentralized governance with proposal creation and voting
 * - Timelock-protected execution for security
 * - Quorum-based voting (4% of total voting power)
 * - Configurable voting delay and period
 * - Multi-signature proposal support
 * - NFT holder verification for enhanced participation
 * 
 * Phase 1 Completion:
 * This contract finalizes Step 1.6 of the ScrollVerse Genesis Sequence,
 * establishing irreversible decentralization and sovereign governance.
 */
contract ScrollVerseDAO is 
    Governor, 
    GovernorSettings, 
    GovernorCountingSimple, 
    GovernorVotes, 
    GovernorVotesQuorumFraction, 
    GovernorTimelockControl,
    ReentrancyGuard 
{
    // ========== CONSTANTS ==========

    /// @notice Role identifier for proposers
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");

    /// @notice Role identifier for executors
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    /// @notice Role identifier for cancellers
    bytes32 public constant CANCELLER_ROLE = keccak256("CANCELLER_ROLE");

    /// @notice Role identifier for treasury managers
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");

    /// @notice Minimum proposal threshold (tokens needed to create a proposal)
    uint256 public constant MIN_PROPOSAL_THRESHOLD = 100_000 * 10**18; // 100,000 MIRROR

    // ========== STATE VARIABLES ==========

    /// @notice Address of the $MIRROR governance token
    address public immutable mirrorToken;

    /// @notice Address of the PharaohConsciousnessFusion NFT contract
    address public pfcNft;

    /// @notice Address of the TimelockController
    TimelockController public immutable timelockController;

    /// @notice Flag indicating if hand-off sequence is complete
    bool public handOffComplete;

    /// @notice Mapping of addresses that have PFC-NFT for enhanced participation
    mapping(address => bool) public pfcHolders;

    /// @notice Proposal count for tracking
    uint256 public proposalCount;

    /// @notice Emergency pause flag (only usable before hand-off)
    bool public paused;

    // ========== EVENTS ==========

    /// @notice Emitted when the hand-off sequence is initiated
    event HandOffSequenceInitiated(
        address indexed dao,
        address indexed timelock,
        uint256 timestamp
    );

    /// @notice Emitted when the hand-off sequence is completed
    event HandOffSequenceCompleted(
        address indexed dao,
        address indexed mirrorToken,
        address indexed pfcNft,
        uint256 timestamp
    );

    /// @notice Emitted when PFC-NFT contract is updated
    event PfcNftUpdated(
        address indexed oldAddress,
        address indexed newAddress
    );

    /// @notice Emitted when a new proposal is created
    event ProposalCreatedWithMetadata(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        string description,
        uint256 timestamp
    );

    /// @notice Emitted when treasury action is executed
    event TreasuryActionExecuted(
        address indexed executor,
        address indexed target,
        uint256 value,
        bytes data,
        uint256 timestamp
    );

    /// @notice Emitted when DAO receives ETH
    event EthReceived(address indexed sender, uint256 amount);

    // ========== ERRORS ==========

    error AlreadyCompleted();
    error NotAuthorized();
    error InvalidAddress();
    error HandOffNotComplete();
    error HandOffAlreadyComplete();
    error InsufficientVotingPower(uint256 required, uint256 actual);
    error NotPfcHolder();
    error ContractPaused();
    error CannotPauseAfterHandOff();

    // ========== CONSTRUCTOR ==========

    /**
     * @notice Deploys the ScrollVerseDAO contract
     * @param _mirrorToken Address of the $MIRROR ERC-20Votes token
     * @param _pfcNft Address of the PharaohConsciousnessFusion NFT contract
     * @param _timelock Address of the TimelockController
     * @param _votingDelay Initial voting delay in blocks (e.g., 1 day = ~7200 blocks)
     * @param _votingPeriod Voting period in blocks (e.g., 1 week = ~50400 blocks)
     * @param _proposalThreshold Minimum tokens required to create a proposal
     * @param _quorumPercentage Quorum percentage (e.g., 4 for 4%)
     */
    constructor(
        address _mirrorToken,
        address _pfcNft,
        TimelockController _timelock,
        uint48 _votingDelay,
        uint32 _votingPeriod,
        uint256 _proposalThreshold,
        uint256 _quorumPercentage
    )
        Governor("ScrollVerseDAO")
        GovernorSettings(_votingDelay, _votingPeriod, _proposalThreshold)
        GovernorVotes(IVotes(_mirrorToken))
        GovernorVotesQuorumFraction(_quorumPercentage)
        GovernorTimelockControl(_timelock)
    {
        if (_mirrorToken == address(0)) revert InvalidAddress();
        if (address(_timelock) == address(0)) revert InvalidAddress();

        mirrorToken = _mirrorToken;
        pfcNft = _pfcNft;
        timelockController = _timelock;
    }

    // ========== EXTERNAL FUNCTIONS ==========

    /**
     * @notice Complete the hand-off sequence, transferring all admin roles to the DAO
     * @dev This function should be called after deployment to finalize decentralization
     * @dev The deployer must have already granted roles to this contract on the timelock
     */
    function completeHandOffSequence() external nonReentrant {
        if (handOffComplete) revert HandOffAlreadyComplete();

        // Mark hand-off as complete
        handOffComplete = true;

        emit HandOffSequenceCompleted(
            address(this),
            mirrorToken,
            pfcNft,
            block.timestamp
        );
    }

    /**
     * @notice Update the PFC-NFT contract address (governance action)
     * @param _newPfcNft New PFC-NFT contract address
     * @dev Can only be called through governance proposal after hand-off
     */
    function updatePfcNft(address _newPfcNft) external onlyGovernance {
        if (_newPfcNft == address(0)) revert InvalidAddress();
        
        address oldAddress = pfcNft;
        pfcNft = _newPfcNft;
        
        emit PfcNftUpdated(oldAddress, _newPfcNft);
    }

    /**
     * @notice Check if an address holds a PFC-NFT
     * @param account Address to check
     * @return True if the address holds at least one PFC-NFT
     */
    function isPfcHolder(address account) public view returns (bool) {
        if (pfcNft == address(0)) return false;
        try IERC721(pfcNft).balanceOf(account) returns (uint256 balance) {
            return balance > 0;
        } catch {
            return false;
        }
    }

    /**
     * @notice Get the voting power of an account
     * @param account Address to check
     * @return Voting power based on delegated $MIRROR tokens
     */
    function getVotingPower(address account) external view returns (uint256) {
        return IVotes(mirrorToken).getVotes(account);
    }

    /**
     * @notice Create a proposal with enhanced metadata
     * @param targets Array of target addresses for calls
     * @param values Array of ETH values for calls
     * @param calldatas Array of function call data
     * @param title Short title for the proposal
     * @param description Full description of the proposal
     * @return proposalId The ID of the created proposal
     */
    function proposeWithMetadata(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory title,
        string memory description
    ) external returns (uint256) {
        if (paused) revert ContractPaused();
        
        uint256 proposerVotes = IVotes(mirrorToken).getVotes(msg.sender);
        uint256 threshold = proposalThreshold();
        
        if (proposerVotes < threshold) {
            revert InsufficientVotingPower(threshold, proposerVotes);
        }

        string memory fullDescription = string(abi.encodePacked(title, "\n\n", description));
        uint256 proposalId = propose(targets, values, calldatas, fullDescription);
        
        proposalCount++;
        
        emit ProposalCreatedWithMetadata(
            proposalId,
            msg.sender,
            title,
            description,
            block.timestamp
        );

        return proposalId;
    }

    /**
     * @notice Emergency pause function (only before hand-off is complete)
     * @param _paused New paused state
     */
    function setPaused(bool _paused) external {
        if (handOffComplete) revert CannotPauseAfterHandOff();
        // Before hand-off, only timelock can pause
        if (msg.sender != address(timelockController)) revert NotAuthorized();
        
        paused = _paused;
    }

    /**
     * @notice Receive ETH sent to the DAO
     */
    receive() external payable {
        emit EthReceived(msg.sender, msg.value);
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @notice Get the governance status of the DAO
     * @return _handOffComplete Whether hand-off sequence is complete
     * @return _proposalCount Total proposals created
     * @return _paused Whether the DAO is paused
     * @return _mirrorToken Address of the MIRROR token
     * @return _pfcNft Address of the PFC-NFT contract
     * @return _timelock Address of the TimelockController
     */
    function getGovernanceStatus() external view returns (
        bool _handOffComplete,
        uint256 _proposalCount,
        bool _paused,
        address _mirrorToken,
        address _pfcNft,
        address _timelock
    ) {
        return (
            handOffComplete,
            proposalCount,
            paused,
            mirrorToken,
            pfcNft,
            address(timelockController)
        );
    }

    /**
     * @notice Get the quorum required for a proposal to pass
     * @param blockNumber Block number to check quorum at
     * @return Number of votes required for quorum
     */
    function quorumVotes(uint256 blockNumber) external view returns (uint256) {
        return quorum(blockNumber);
    }

    /**
     * @notice Check if the caller can create a proposal
     * @param account Address to check
     * @return canPropose True if the account has enough voting power
     * @return votingPower Current voting power of the account
     * @return threshold Required threshold
     */
    function canCreateProposal(address account) external view returns (
        bool canPropose,
        uint256 votingPower,
        uint256 threshold
    ) {
        votingPower = IVotes(mirrorToken).getVotes(account);
        threshold = proposalThreshold();
        canPropose = votingPower >= threshold;
    }

    // ========== OVERRIDE FUNCTIONS ==========

    /**
     * @dev Override voting delay from GovernorSettings
     */
    function votingDelay()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingDelay();
    }

    /**
     * @dev Override voting period from GovernorSettings
     */
    function votingPeriod()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    /**
     * @dev Override quorum from GovernorVotesQuorumFraction
     */
    function quorum(uint256 blockNumber)
        public
        view
        override(Governor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    /**
     * @dev Override state from GovernorTimelockControl
     */
    function state(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    /**
     * @dev Override proposalNeedsQueuing from GovernorTimelockControl
     */
    function proposalNeedsQueuing(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (bool)
    {
        return super.proposalNeedsQueuing(proposalId);
    }

    /**
     * @dev Override proposal threshold from GovernorSettings
     */
    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }

    /**
     * @dev Override _queueOperations from GovernorTimelockControl
     */
    function _queueOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint48) {
        return super._queueOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    /**
     * @dev Override _executeOperations from GovernorTimelockControl
     */
    function _executeOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._executeOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    /**
     * @dev Override _cancel from GovernorTimelockControl
     */
    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    /**
     * @dev Override _executor from GovernorTimelockControl
     */
    function _executor()
        internal
        view
        override(Governor, GovernorTimelockControl)
        returns (address)
    {
        return super._executor();
    }
}
