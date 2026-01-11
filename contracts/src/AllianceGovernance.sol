// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/governance/GovernorUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorSettingsUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorCountingSimpleUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorVotesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

/**
 * @title AllianceGovernance
 * @notice Governance contract for alliance decision-making and proposal execution
 * @dev OpenZeppelin Governor-based governance with customized alliance voting
 * 
 * Features:
 * - Proposal creation and voting
 * - Weighted voting by alliance stake
 * - Timelock integration ready
 * - Multi-alliance governance support
 * - Emergency action capabilities
 * 
 * OmniTech1™ - Real-World Alliance Governance
 */
contract AllianceGovernance is
    Initializable,
    GovernorUpgradeable,
    GovernorSettingsUpgradeable,
    GovernorCountingSimpleUpgradeable,
    GovernorVotesUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable
{
    bytes32 public constant GOVERNANCE_ADMIN_ROLE = keccak256("GOVERNANCE_ADMIN_ROLE");
    bytes32 public constant PROPOSAL_CREATOR_ROLE = keccak256("PROPOSAL_CREATOR_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    // Proposal categories for alliance governance
    enum ProposalCategory {
        General,           // General alliance matters
        PartnerAddition,   // Adding new partners
        AssetBridge,       // Asset tokenization approvals
        Treasury,          // Treasury management
        Governance,        // Governance parameter changes
        Emergency          // Emergency actions
    }

    // Extended proposal metadata
    struct ProposalMetadata {
        uint256 allianceId;
        ProposalCategory category;
        string ipfsHash;
        uint256 createdAt;
    }

    // State variables
    mapping(uint256 => ProposalMetadata) private _proposalMetadata;

    // Events
    event ProposalCreatedWithMetadata(
        uint256 indexed proposalId,
        uint256 indexed allianceId,
        ProposalCategory category,
        address proposer,
        string ipfsHash
    );

    event EmergencyActionExecuted(
        uint256 indexed proposalId,
        address indexed executor,
        uint256 timestamp
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initialize the AllianceGovernance contract
     * @param token Address of the voting token contract (ERC20Votes)
     * @param admin Address to be granted admin role
     */
    function initialize(
        IVotes token,
        address admin
    ) public initializer {
        __Governor_init("AllianceGovernance");
        __GovernorSettings_init(
            1,      // voting delay (1 block)
            50400,  // voting period (~1 week with 12s blocks)
            0       // proposal threshold
        );
        __GovernorCountingSimple_init();
        __GovernorVotes_init(token);
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(GOVERNANCE_ADMIN_ROLE, admin);
        _grantRole(PROPOSAL_CREATOR_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);
    }

    /**
     * @notice Create a proposal with alliance-specific metadata
     * @param targets Array of target addresses for proposal calls
     * @param values Array of ETH values for proposal calls
     * @param calldatas Array of encoded function calls
     * @param description Proposal description
     * @param allianceId ID of the alliance this proposal relates to
     * @param category Category of the proposal
     * @param ipfsHash IPFS hash containing detailed proposal documentation
     * @return Proposal ID
     */
    function proposeWithMetadata(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description,
        uint256 allianceId,
        ProposalCategory category,
        string memory ipfsHash
    ) public onlyRole(PROPOSAL_CREATOR_ROLE) returns (uint256) {
        uint256 proposalId = propose(targets, values, calldatas, description);

        _proposalMetadata[proposalId] = ProposalMetadata({
            allianceId: allianceId,
            category: category,
            ipfsHash: ipfsHash,
            createdAt: block.timestamp
        });

        emit ProposalCreatedWithMetadata(
            proposalId,
            allianceId,
            category,
            msg.sender,
            ipfsHash
        );

        return proposalId;
    }

    /**
     * @notice Execute an emergency proposal with expedited timeline
     * @param targets Array of target addresses
     * @param values Array of ETH values
     * @param calldatas Array of encoded function calls
     * @param descriptionHash Hash of the proposal description
     */
    function executeEmergency(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) external onlyRole(GOVERNANCE_ADMIN_ROLE) returns (uint256) {
        uint256 proposalId = hashProposal(targets, values, calldatas, descriptionHash);
        
        emit EmergencyActionExecuted(proposalId, msg.sender, block.timestamp);
        
        return execute(targets, values, calldatas, descriptionHash);
    }

    /**
     * @notice Get proposal metadata
     * @param proposalId ID of the proposal
     * @return ProposalMetadata struct
     */
    function getProposalMetadata(uint256 proposalId)
        external
        view
        returns (ProposalMetadata memory)
    {
        return _proposalMetadata[proposalId];
    }

    // Required overrides

    function votingDelay()
        public
        view
        override(GovernorUpgradeable, GovernorSettingsUpgradeable)
        returns (uint256)
    {
        return super.votingDelay();
    }

    function votingPeriod()
        public
        view
        override(GovernorUpgradeable, GovernorSettingsUpgradeable)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    function proposalThreshold()
        public
        view
        override(GovernorUpgradeable, GovernorSettingsUpgradeable)
        returns (uint256)
    {
        return super.proposalThreshold();
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(GovernorUpgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(UPGRADER_ROLE)
    {}
}
