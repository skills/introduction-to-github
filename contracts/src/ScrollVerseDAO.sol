// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

/**
 * @title ScrollVerseDAO
 * @author OmniTech1™
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
    // ========== CONSTANTS ==========

    /// @notice Proposal threshold: 100,000 MIRROR tokens required to create a proposal
    uint256 public constant PROPOSAL_THRESHOLD = 100_000 * 10**18;

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

    /// @notice Emitted when a proposal is executed successfully
    event ProposalExecuted(
        uint256 indexed proposalId,
        address indexed executor,
        uint256 timestamp
    );

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
     * @notice Deploys the ScrollVerseDAO contract
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
    ) external returns (uint256 proposalId) {
        proposalId = propose(targets, values, calldatas, description);
        
        proposalTitles[proposalId] = title;
        proposalDescriptionHashes[proposalId] = keccak256(bytes(description));
        proposalCount++;

        emit ProposalCreatedWithMetadata(proposalId, msg.sender, title, description, block.timestamp);

        return proposalId;
    }

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
            "- Treasury Transfer Amount: ", _toString(treasuryTransferAmount), " MIRROR\n",
            "- Distribution Fund: ", _toHexString(distributionFund), "\n"
        ));
    }

    /**
     * @notice Convert uint256 to string
     * @param value The number to convert
     * @return String representation
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    /**
     * @notice Convert address to hex string
     * @param addr The address to convert
     * @return String representation with 0x prefix
     */
    function _toHexString(address addr) internal pure returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(uint160(addr) >> (8 * (19 - i)) >> 4) & 0x0f];
            str[3 + i * 2] = alphabet[uint8(uint160(addr) >> (8 * (19 - i))) & 0x0f];
        }
        return string(str);
    }

    // ========== OVERRIDE FUNCTIONS ==========

    /**
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
