// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

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
    }
}
