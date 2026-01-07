// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
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
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title ScrollVerseDAO
 * @author OmniTech1™
 * @notice Decentralized Autonomous Organization for ScrollVerse ecosystem governance
 * @dev Custom governance implementation using $MIRROR voting power
 * 
 * Governance Configuration:
 * - Voting Token: $MIRROR (ERC20Votes)
 * - Voting Delay: 1 day (allows time for token holders to prepare)
 * - Voting Period: 7 days (time to cast votes)
 * - Proposal Threshold: 100,000 MIRROR (minimum tokens to create proposal)
 * - Quorum: 4% of total supply (minimum participation for valid vote)
 * 
 * Supported Proposal Types:
 * - Parameter changes
 * - Treasury allocations
 * - Contract upgrades
 * - Ecosystem partnerships
 * - NFT collection approvals
 * 
 * Integration Points:
 * - MirrorToken: Voting power source
 * - ScrollVerseTimelock: Execution delay
 * - PharaohConsciousnessFusion NFTs: Additional governance weight
 */
contract ScrollVerseDAO is Ownable, ReentrancyGuard {
    // ========== ENUMS ==========

    /// @notice Proposal states
    enum ProposalState {
        Pending,    // Created but voting not started
        Active,     // Voting is ongoing
        Canceled,   // Proposal was canceled
        Defeated,   // Quorum not reached or majority against
        Succeeded,  // Voting passed
        Queued,     // Waiting in timelock
        Expired,    // Timelock grace period passed
        Executed    // Proposal was executed
    }

    // ========== STRUCTS ==========

    /// @notice Proposal data structure
    struct Proposal {
        uint256 id;
        address proposer;
        address[] targets;
        uint256[] values;
        bytes[] calldatas;
        string description;
        uint256 startBlock;
        uint256 endBlock;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        bool canceled;
        bool executed;
        mapping(address => bool) hasVoted;
    }

    /// @notice Receipt for a voter on a proposal
    struct Receipt {
        bool hasVoted;
        uint8 support; // 0=against, 1=for, 2=abstain
        uint256 votes;
    }

    // ========== CONSTANTS ==========

    /// @notice Default voting delay (1 day in blocks, ~7200 blocks at 12s/block)
    uint256 public constant DEFAULT_VOTING_DELAY = 7200;

    /// @notice Default voting period (7 days in blocks, ~50400 blocks at 12s/block)
    uint256 public constant DEFAULT_VOTING_PERIOD = 50400;

    /// @notice Default proposal threshold (100,000 MIRROR tokens)
    uint256 public constant DEFAULT_PROPOSAL_THRESHOLD = 100_000 * 10**18;

    /// @notice Default quorum fraction (4% = 400 basis points)
    uint256 public constant DEFAULT_QUORUM_BPS = 400;

    /// @notice Basis points denominator
    uint256 public constant BPS_DENOMINATOR = 10000;

    // ========== STATE VARIABLES ==========

    /// @notice The voting token ($MIRROR)
    ERC20Votes public immutable votingToken;

    /// @notice Timelock controller for execution delay
    address public timelock;

    /// @notice Voting delay in blocks
    uint256 public votingDelay;

    /// @notice Voting period in blocks
    uint256 public votingPeriod;

    /// @notice Minimum tokens required to create a proposal
    uint256 public proposalThreshold;

    /// @notice Quorum percentage in basis points
    uint256 public quorumBps;

    /// @notice Proposal counter
    uint256 public proposalCount;

    /// @notice Mapping of proposal ID to proposal data
    mapping(uint256 => Proposal) internal _proposals;

    /// @notice Mapping of proposal ID to voter receipts
    mapping(uint256 => mapping(address => Receipt)) public receipts;

    // ========== EVENTS ==========

    /// @notice Emitted when a proposal is created
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        address[] targets,
        uint256[] values,
        bytes[] calldatas,
        string description,
        uint256 startBlock,
        uint256 endBlock
    );

    /// @notice Emitted when a vote is cast
    event VoteCast(
        address indexed voter,
        uint256 indexed proposalId,
        uint8 support,
        uint256 votes,
        string reason
    );

    /// @notice Emitted when a proposal is canceled
    event ProposalCanceled(uint256 indexed proposalId);

    /// @notice Emitted when a proposal is queued for execution
    event ProposalQueued(uint256 indexed proposalId, uint256 eta);

    /// @notice Emitted when a proposal is executed
    event ProposalExecuted(uint256 indexed proposalId);

    /// @notice Emitted when governance parameters are updated
    event GovernanceParametersUpdated(
        uint256 votingDelay,
        uint256 votingPeriod,
        uint256 proposalThreshold,
        uint256 quorumBps
    );

    /// @notice Emitted when timelock is updated
    event TimelockUpdated(address indexed oldTimelock, address indexed newTimelock);

    // ========== ERRORS ==========

    error ZeroAddress();
    error ProposalNotFound();
    error ProposalNotActive();
    error ProposalNotSucceeded();
    error ProposalAlreadyExecuted();
    error ProposalAlreadyCanceled();
    error BelowProposalThreshold(uint256 votes, uint256 required);
    error AlreadyVoted();
    error InvalidVoteType();
    error ArrayLengthMismatch();
    error NotProposer();
    error QuorumNotReached(uint256 votes, uint256 required);
    error VotingEnded();
    error VotingNotStarted();
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

    // ========== STATE VARIABLES ==========

    /// @notice Address of the $MIRROR governance token
    address public immutable mirrorToken;

    /// @notice Address of the PharaohConsciousnessFusion NFT contract
    address public pfcNft;

    /// @notice Address of the TimelockController
    TimelockController public immutable timelockController;

    /// @notice Flag indicating if hand-off sequence is complete
    bool public handOffComplete;

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
 * @notice Governance contract for the ScrollVerse ecosystem
 * @dev Implements OpenZeppelin Governor with timelock for secure execution
 * 
 * Features:
 * - Proposal creation with voting
 * - Quorum-based voting (4% of total supply)
 * - Timelock-controlled execution for security
 * - Integration with MirrorToken ($MIRROR) for voting power
 * 
 * Governance Parameters:
 * - Voting Delay: 1 block (proposals can be voted on immediately after creation)
 * - Voting Period: 50400 blocks (~1 week on Ethereum mainnet)
 * - Proposal Threshold: 100,000 MIRROR tokens to create proposals
 * - Quorum: 4% of total voting power
 */
contract ScrollVerseDAO is 
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{
    using Strings for uint256;
    using Strings for address;

    // ========== CONSTANTS ==========

    /// @notice Proposal threshold: 100,000 MIRROR tokens required to create a proposal
    uint256 public constant PROPOSAL_THRESHOLD = 100_000 * 1e18;

    // ========== STATE VARIABLES ==========

    /// @notice Counter for tracking the number of proposals
    uint256 public proposalCount;

    /// @notice Mapping from proposal ID to proposal title
    mapping(uint256 => string) public proposalTitles;

    /// @notice Mapping from proposal ID to proposal description hash
    mapping(uint256 => bytes32) public proposalDescriptionHashes;

    // ========== EVENTS ==========

    /// @notice Emitted when a new proposal is created with additional metadata
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
    /// @notice Emitted when a proposal is executed successfully
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

    /// @notice Emitted when the Genesis Proposal is submitted
    event GenesisProposalSubmitted(
        uint256 indexed proposalId,
        address indexed proposer,
        uint256 timestamp
    );

    // ========== ERRORS ==========

    error ProposalAlreadyExists(uint256 proposalId);
    error InvalidProposalParameters();

    // ========== CONSTRUCTOR ==========

    /**
     * @notice Deploy the ScrollVerse DAO
     * @param _votingToken Address of the MirrorToken (ERC20Votes)
     * @param _timelock Address of the timelock controller
     * @param _owner Address of the contract owner
     */
    constructor(
        address _votingToken,
        address _timelock,
        address _owner
    ) Ownable(_owner) {
        if (_votingToken == address(0)) revert ZeroAddress();
        if (_owner == address(0)) revert ZeroAddress();

        votingToken = ERC20Votes(_votingToken);
        timelock = _timelock;

        votingDelay = DEFAULT_VOTING_DELAY;
        votingPeriod = DEFAULT_VOTING_PERIOD;
        proposalThreshold = DEFAULT_PROPOSAL_THRESHOLD;
        quorumBps = DEFAULT_QUORUM_BPS;
    }

    // ========== PROPOSAL FUNCTIONS ==========

    /**
     * @notice Create a new proposal
     * @param targets Contract addresses to call
     * @param values ETH values to send with each call
     * @param calldatas Encoded function calls
     * @param description Human-readable proposal description
     * @return proposalId The unique ID of the created proposal
     */
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) external returns (uint256) {
        if (targets.length != values.length || targets.length != calldatas.length) {
            revert ArrayLengthMismatch();
        }

        uint256 proposerVotes = votingToken.getVotes(msg.sender);
        if (proposerVotes < proposalThreshold) {
            revert BelowProposalThreshold(proposerVotes, proposalThreshold);
        }

        proposalCount++;
        uint256 proposalId = proposalCount;

        Proposal storage proposal = _proposals[proposalId];
        proposal.id = proposalId;
        proposal.proposer = msg.sender;
        proposal.targets = targets;
        proposal.values = values;
        proposal.calldatas = calldatas;
        proposal.description = description;
        proposal.startBlock = block.number + votingDelay;
        proposal.endBlock = proposal.startBlock + votingPeriod;

        emit ProposalCreated(
            proposalId,
            msg.sender,
            targets,
            values,
            calldatas,
            description,
            proposal.startBlock,
            proposal.endBlock
        );
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
     * @param _token Address of the MirrorToken contract for voting power
     * @param _timelock Address of the TimelockController contract
     * @param _votingDelay Number of blocks to wait before voting starts
     * @param _votingPeriod Number of blocks for the voting period
     * @dev The quorum is set to 4% of total voting power
     */
    constructor(
        IVotes _token,
        TimelockController _timelock,
        uint48 _votingDelay,
        uint32 _votingPeriod
    )
        Governor("ScrollVerseDAO")
        GovernorSettings(_votingDelay, _votingPeriod, PROPOSAL_THRESHOLD)
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4) // 4% quorum
        GovernorTimelockControl(_timelock)
    {}

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
     * @notice Submit the Genesis Proposal to inaugurate DAO governance
     * @param targets Array of target addresses for the proposal actions
     * @param values Array of ETH values for each action
     * @param calldatas Array of encoded function calls
     * @param treasuryTransferAmount Amount of $MIRROR to transfer from treasury
     * @param distributionFund Address of the distribution fund
     * @return proposalId The ID of the created proposal
     * @dev This is a convenience function for submitting the Genesis Proposal
     */
    function submitGenesisProposal(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        uint256 treasuryTransferAmount,
        address distributionFund
    ) external returns (uint256 proposalId) {
        string memory title = "The Genesis Proposal: Incentivizing NFT Fusion and Community Engagement";
        string memory description = _getGenesisProposalDescription(treasuryTransferAmount, distributionFund);

        proposalId = propose(targets, values, calldatas, description);

        // Store metadata
        proposalTitles[proposalId] = title;
        proposalDescriptionHashes[proposalId] = keccak256(bytes(description));
        proposalCount++;

        emit GenesisProposalSubmitted(proposalId, msg.sender, block.timestamp);
        emit ProposalCreatedWithMetadata(proposalId, msg.sender, title, description, block.timestamp);

        return proposalId;
    }

    /**
     * @notice Create a proposal with a title for better tracking
     * @param targets Array of target addresses
     * @param values Array of ETH values
     * @param calldatas Array of encoded function calls
     * @param title Human-readable title for the proposal
     * @param description Detailed description of the proposal
     * @return proposalId The ID of the created proposal
     */
    function proposeWithTitle(
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
    ) external returns (uint256 proposalId) {
        proposalId = propose(targets, values, calldatas, description);
        
        proposalTitles[proposalId] = title;
        proposalDescriptionHashes[proposalId] = keccak256(bytes(description));
        proposalCount++;

        emit ProposalCreatedWithMetadata(proposalId, msg.sender, title, description, block.timestamp);

        return proposalId;
    }

    /**
     * @notice Cast a vote on a proposal
     * @param proposalId The ID of the proposal
     * @param support Vote type (0=against, 1=for, 2=abstain)
     */
    function castVote(uint256 proposalId, uint8 support) external {
        _castVote(proposalId, msg.sender, support, "");
    }

    /**
     * @notice Cast a vote with a reason
     * @param proposalId The ID of the proposal
     * @param support Vote type (0=against, 1=for, 2=abstain)
     * @param reason Reason for the vote
     */
    function castVoteWithReason(
        uint256 proposalId,
        uint8 support,
        string calldata reason
    ) external {
        _castVote(proposalId, msg.sender, support, reason);
    }

    /**
     * @notice Cancel a proposal (only proposer or owner)
     * @param proposalId The ID of the proposal to cancel
     */
    function cancel(uint256 proposalId) external {
        Proposal storage proposal = _proposals[proposalId];
        if (proposal.id == 0) revert ProposalNotFound();
        if (proposal.canceled) revert ProposalAlreadyCanceled();
        if (proposal.executed) revert ProposalAlreadyExecuted();
        if (msg.sender != proposal.proposer && msg.sender != owner()) {
            revert NotProposer();
        }

        proposal.canceled = true;
        emit ProposalCanceled(proposalId);
    }

    /**
     * @notice Execute a succeeded proposal
     * @param proposalId The ID of the proposal to execute
     */
    function execute(uint256 proposalId) external payable nonReentrant {
        Proposal storage proposal = _proposals[proposalId];
        if (proposal.id == 0) revert ProposalNotFound();
        if (state(proposalId) != ProposalState.Succeeded) revert ProposalNotSucceeded();

        proposal.executed = true;

        for (uint256 i = 0; i < proposal.targets.length; i++) {
            (bool success, ) = proposal.targets[i].call{value: proposal.values[i]}(
                proposal.calldatas[i]
            );
            require(success, "Execution failed");
        }

        emit ProposalExecuted(proposalId);
    }

    // ========== INTERNAL FUNCTIONS ==========

    /**
     * @notice Internal function to cast a vote
     */
    function _castVote(
        uint256 proposalId,
        address voter,
        uint8 support,
        string memory reason
    ) internal {
        Proposal storage proposal = _proposals[proposalId];
        if (proposal.id == 0) revert ProposalNotFound();
        if (block.number < proposal.startBlock) revert VotingNotStarted();
        if (block.number > proposal.endBlock) revert VotingEnded();
        if (proposal.hasVoted[voter]) revert AlreadyVoted();
        if (support > 2) revert InvalidVoteType();

        uint256 votes = votingToken.getPastVotes(voter, proposal.startBlock);

        proposal.hasVoted[voter] = true;
        receipts[proposalId][voter] = Receipt({
            hasVoted: true,
            support: support,
            votes: votes
        });

        if (support == 0) {
            proposal.againstVotes += votes;
        } else if (support == 1) {
            proposal.forVotes += votes;
        } else {
            proposal.abstainVotes += votes;
        }

        emit VoteCast(voter, proposalId, support, votes, reason);
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @notice Get the current state of a proposal
     * @param proposalId The ID of the proposal
     * @return The current proposal state
     */
    function state(uint256 proposalId) public view returns (ProposalState) {
        Proposal storage proposal = _proposals[proposalId];
        if (proposal.id == 0) revert ProposalNotFound();

        if (proposal.canceled) {
            return ProposalState.Canceled;
        }

        if (proposal.executed) {
            return ProposalState.Executed;
        }

        if (block.number < proposal.startBlock) {
            return ProposalState.Pending;
        }

        if (block.number <= proposal.endBlock) {
            return ProposalState.Active;
        }

        // Check quorum
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
        uint256 quorumRequired = (votingToken.getPastTotalSupply(proposal.startBlock) * quorumBps) / BPS_DENOMINATOR;

        if (totalVotes < quorumRequired) {
            return ProposalState.Defeated;
        }

        // Check majority
        if (proposal.forVotes > proposal.againstVotes) {
            return ProposalState.Succeeded;
        }

        return ProposalState.Defeated;
    }

    /**
     * @notice Get proposal details
     * @param proposalId The ID of the proposal
     */
    function getProposal(uint256 proposalId) external view returns (
        address proposer,
        uint256 startBlock,
        uint256 endBlock,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 abstainVotes,
        bool canceled,
        bool executed
    ) {
        Proposal storage proposal = _proposals[proposalId];
        return (
            proposal.proposer,
            proposal.startBlock,
            proposal.endBlock,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.abstainVotes,
            proposal.canceled,
            proposal.executed
        );
    }

    /**
     * @notice Get vote counts for a proposal
     * @param proposalId The ID of the proposal
     */
    function getVotes(uint256 proposalId) external view returns (
        uint256 forVotes,
        uint256 againstVotes,
        uint256 abstainVotes
    ) {
        Proposal storage proposal = _proposals[proposalId];
        return (proposal.forVotes, proposal.againstVotes, proposal.abstainVotes);
    }

    /**
     * @notice Check if an account has voted on a proposal
     * @param proposalId The ID of the proposal
     * @param account The account to check
     */
    function hasVoted(uint256 proposalId, address account) external view returns (bool) {
        return _proposals[proposalId].hasVoted[account];
    }

    /**
     * @notice Calculate the current quorum requirement
     */
    function quorum() external view returns (uint256) {
        return (votingToken.totalSupply() * quorumBps) / BPS_DENOMINATOR;
    }

    // ========== ADMIN FUNCTIONS ==========

    /**
     * @notice Update governance parameters
     * @param _votingDelay New voting delay
     * @param _votingPeriod New voting period
     * @param _proposalThreshold New proposal threshold
     * @param _quorumBps New quorum in basis points
     */
    function setGovernanceParameters(
        uint256 _votingDelay,
        uint256 _votingPeriod,
        uint256 _proposalThreshold,
        uint256 _quorumBps
    ) external onlyOwner {
        votingDelay = _votingDelay;
        votingPeriod = _votingPeriod;
        proposalThreshold = _proposalThreshold;
        quorumBps = _quorumBps;

        emit GovernanceParametersUpdated(
            _votingDelay,
            _votingPeriod,
            _proposalThreshold,
            _quorumBps
        );
    }

    /**
     * @notice Update the timelock address
     * @param _timelock New timelock address
     */
    function setTimelock(address _timelock) external onlyOwner {
        address old = timelock;
        timelock = _timelock;
        emit TimelockUpdated(old, _timelock);
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
    // ========== VIEW FUNCTIONS ==========

    /**
     * @notice Get the title of a proposal
     * @param proposalId The ID of the proposal
     * @return The proposal title
     */
    function getProposalTitle(uint256 proposalId) external view returns (string memory) {
        return proposalTitles[proposalId];
    }

    /**
     * @notice Get the description hash of a proposal
     * @param proposalId The ID of the proposal
     * @return The keccak256 hash of the proposal description
     */
    function getProposalDescriptionHash(uint256 proposalId) external view returns (bytes32) {
        return proposalDescriptionHashes[proposalId];
    }

    /**
     * @notice Get the Genesis Proposal description
     * @param treasuryTransferAmount Amount to transfer
     * @param distributionFund Destination address
     * @return Full proposal description
     */
    function getGenesisProposalDescription(
        uint256 treasuryTransferAmount,
        address distributionFund
    ) external pure returns (string memory) {
        return _getGenesisProposalDescription(treasuryTransferAmount, distributionFund);
    }

    // ========== INTERNAL FUNCTIONS ==========

    /**
     * @notice Generate the Genesis Proposal description
     * @param treasuryTransferAmount Amount to transfer
     * @param distributionFund Destination address
     * @return Full proposal description
     */
    function _getGenesisProposalDescription(
        uint256 treasuryTransferAmount,
        address distributionFund
    ) internal pure returns (string memory) {
        return string(abi.encodePacked(
            "# The Genesis Proposal: Incentivizing NFT Fusion and Community Engagement\n\n",
            "## Description\n",
            "This proposal officially recognizes the strategic importance of the Omnisovereign VIII and TECHANGEL Sigil NFT sets.\n\n",
            "It allocates $MIRROR from the DAO Treasury to fund the following:\n",
            "- Initial rewards for early NFT holders and participants in fusion events.\n",
            "- Community engagement and adoption activities aligned with the ScrollVerse ethos.\n\n",
            "## Execution Payload\n",
            "Upon successful proposal approval, the DAO Treasury will transfer the allocated $MIRROR to a distribution fund designated for this purpose.\n\n",
            "This action validates the core functions of the DAO: Propose, Vote, Queue, and Execute.\n\n",
            "## Parameters\n",
            "- Treasury Transfer Amount: ", treasuryTransferAmount.toString(), " MIRROR\n",
            "- Distribution Fund: ", distributionFund.toHexString(), "\n"
        ));
    }

    // ========== OVERRIDE FUNCTIONS ==========

    /**
     * @dev Override voting delay from GovernorSettings
     * @dev Override required by Solidity for multiple inheritance
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
     * @dev Override required by Solidity for multiple inheritance
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
     * @dev Override required by Solidity for multiple inheritance
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
     * @dev Override required by Solidity for multiple inheritance
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
     * @dev Override required by Solidity for multiple inheritance
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
     * @dev Override required by Solidity for multiple inheritance
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
     * @dev Override required by Solidity for multiple inheritance
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
     * @dev Override required by Solidity for multiple inheritance
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
        emit ProposalExecuted(proposalId, msg.sender, block.timestamp);
    }

    /**
     * @dev Override required by Solidity for multiple inheritance
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
     * @dev Override required by Solidity for multiple inheritance
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
