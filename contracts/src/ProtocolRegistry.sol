// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ProtocolRegistry
 * @author OmniTech1™
 * @notice Security Layer 2.0 - Governance registry for ScrollVerse ecosystem protocols
 * @dev Implements lifecycle governance, metadata anchoring, and DAO-enforced transitions
 * 
 * Lifecycle States:
 * - Proposed: Initial state when protocol is submitted for consideration
 * - Vetted: Protocol has passed initial security review
 * - Approved: Protocol is fully approved and active in the ecosystem
 * - Revoked: Protocol has been deactivated (can be re-proposed)
 * 
 * Governance Flow:
 * 1. Deployer EOA maintains initial ownership for setup
 * 2. transferGovernor() transfers control to ScrollVerseDAO Timelock Controller
 * 3. All critical operations require onlyGovernor modifier (DAO-voted processes)
 */
contract ProtocolRegistry is ReentrancyGuard {
    // ========== ENUMS ==========

    /// @notice Lifecycle states for registered protocols
    enum ProtocolState {
        Proposed,   // Initial submission state
        Vetted,     // Passed security review
        Approved,   // Fully active in ecosystem
        Revoked     // Deactivated
    }

    // ========== STRUCTS ==========

    /// @notice Protocol entry with security metadata and lifecycle tracking
    struct ProtocolEntry {
        string name;                    // Human-readable protocol name
        address protocolAddress;        // Contract address of the protocol
        bytes32 securityReviewHash;     // Hash of security review document
        uint8 riskClass;                // Risk classification (1-5, 1 = lowest)
        uint256 registeredAt;           // Timestamp of initial registration
        uint256 lastAuditTimestamp;     // Timestamp of most recent audit
        uint256 stateChangedAt;         // Timestamp of last state change
        ProtocolState state;            // Current lifecycle state
        address registrant;             // Address that registered the protocol
        bool exists;                    // Flag to check existence
    }

    // ========== STATE VARIABLES ==========

    /// @notice Address with governor privileges (initially deployer, then DAO Timelock)
    address public governor;

    /// @notice Mapping from protocol ID to ProtocolEntry data
    mapping(bytes32 => ProtocolEntry) public protocols;

    /// @notice Array of all protocol IDs for enumeration
    bytes32[] public protocolIds;

    /// @notice Counter for total protocols registered
    uint256 public totalProtocols;

    /// @notice Counter for approved protocols
    uint256 public approvedProtocolCount;

    // ========== EVENTS ==========

    /// @notice Emitted when a new protocol is proposed
    event ProtocolProposed(
        bytes32 indexed protocolId,
        string name,
        address indexed protocolAddress,
        address indexed registrant,
        uint8 riskClass,
        uint256 timestamp
    );

    /// @notice Emitted when a protocol state changes
    event ProtocolStateChanged(
        bytes32 indexed protocolId,
        ProtocolState oldState,
        ProtocolState newState,
        address indexed changedBy,
        uint256 timestamp
    );

    /// @notice Emitted when protocol security metadata is updated
    event ProtocolMetadataUpdated(
        bytes32 indexed protocolId,
        bytes32 oldSecurityReviewHash,
        bytes32 newSecurityReviewHash,
        uint256 newAuditTimestamp
    );

    /// @notice Emitted when governorship is transferred
    event GovernorTransferred(
        address indexed previousGovernor,
        address indexed newGovernor,
        uint256 timestamp
    );

    // ========== ERRORS ==========

    error NotGovernor();
    error ZeroAddress();
    error ProtocolAlreadyExists(bytes32 protocolId);
    error ProtocolDoesNotExist(bytes32 protocolId);
    error InvalidProtocolName();
    error InvalidRiskClass(uint8 riskClass);
    error InvalidStateTransition(ProtocolState currentState, ProtocolState targetState);
    error IndexOutOfBounds(uint256 index, uint256 length);

    // ========== MODIFIERS ==========

    /// @notice Restricts function access to the governor (DAO Timelock after transfer)
    modifier onlyGovernor() {
        if (msg.sender != governor) revert NotGovernor();
        _;
    }

    // ========== CONSTRUCTOR ==========

    /**
     * @notice Initializes the ProtocolRegistry with deployer as initial governor
     * @dev Governor should be transferred to DAO Timelock after initial setup
     */
    constructor() {
        governor = msg.sender;
        emit GovernorTransferred(address(0), msg.sender, block.timestamp);
    }

    // ========== GOVERNANCE FUNCTIONS ==========

    /**
     * @notice Transfer governorship to a new address (typically DAO Timelock)
     * @param newGovernor Address of the new governor (e.g., ScrollVerseDAO Timelock Controller)
     * @dev Critical: This should be called after initial protocol bootstrap to secure DAO sovereignty
     */
    function transferGovernor(address newGovernor) external onlyGovernor {
        if (newGovernor == address(0)) revert ZeroAddress();
        
        address previousGovernor = governor;
        governor = newGovernor;
        
        emit GovernorTransferred(previousGovernor, newGovernor, block.timestamp);
    }

    // ========== PROTOCOL MANAGEMENT FUNCTIONS ==========

    /**
     * @notice Propose a new protocol for registration
     * @param name Human-readable protocol name
     * @param protocolAddress Contract address of the protocol
     * @param securityReviewHash Hash of security review document (IPFS CID hash recommended)
     * @param riskClass Risk classification (1-5, where 1 is lowest risk)
     * @return protocolId The unique identifier for the proposed protocol
     * @dev Anyone can propose, but only governor can advance states
     */
    function proposeProtocol(
        string calldata name,
        address protocolAddress,
        bytes32 securityReviewHash,
        uint8 riskClass
    ) external nonReentrant returns (bytes32 protocolId) {
        if (bytes(name).length == 0) revert InvalidProtocolName();
        if (protocolAddress == address(0)) revert ZeroAddress();
        if (riskClass == 0 || riskClass > 5) revert InvalidRiskClass(riskClass);

        // Generate protocol ID from name and address
        protocolId = keccak256(abi.encodePacked(name, protocolAddress));
        
        if (protocols[protocolId].exists) revert ProtocolAlreadyExists(protocolId);

        protocols[protocolId] = ProtocolEntry({
            name: name,
            protocolAddress: protocolAddress,
            securityReviewHash: securityReviewHash,
            riskClass: riskClass,
            registeredAt: block.timestamp,
            lastAuditTimestamp: block.timestamp,
            stateChangedAt: block.timestamp,
            state: ProtocolState.Proposed,
            registrant: msg.sender,
            exists: true
        });

        protocolIds.push(protocolId);
        totalProtocols++;

        emit ProtocolProposed(
            protocolId,
            name,
            protocolAddress,
            msg.sender,
            riskClass,
            block.timestamp
        );

        return protocolId;
    }

    /**
     * @notice Advance a protocol from Proposed to Vetted state
     * @param protocolId The protocol ID to advance
     * @dev Only governor can vet protocols (DAO-gated)
     */
    function vetProtocol(bytes32 protocolId) external onlyGovernor nonReentrant {
        if (!protocols[protocolId].exists) revert ProtocolDoesNotExist(protocolId);
        
        ProtocolEntry storage protocol = protocols[protocolId];
        
        if (protocol.state != ProtocolState.Proposed) {
            revert InvalidStateTransition(protocol.state, ProtocolState.Vetted);
        }

        ProtocolState oldState = protocol.state;
        protocol.state = ProtocolState.Vetted;
        protocol.stateChangedAt = block.timestamp;

        emit ProtocolStateChanged(protocolId, oldState, ProtocolState.Vetted, msg.sender, block.timestamp);
    }

    /**
     * @notice Approve a vetted protocol for full ecosystem participation
     * @param protocolId The protocol ID to approve
     * @dev Only governor can approve protocols (DAO-gated)
     */
    function approveProtocol(bytes32 protocolId) external onlyGovernor nonReentrant {
        if (!protocols[protocolId].exists) revert ProtocolDoesNotExist(protocolId);
        
        ProtocolEntry storage protocol = protocols[protocolId];
        
        if (protocol.state != ProtocolState.Vetted) {
            revert InvalidStateTransition(protocol.state, ProtocolState.Approved);
        }

        ProtocolState oldState = protocol.state;
        protocol.state = ProtocolState.Approved;
        protocol.stateChangedAt = block.timestamp;
        approvedProtocolCount++;

        emit ProtocolStateChanged(protocolId, oldState, ProtocolState.Approved, msg.sender, block.timestamp);
    }

    /**
     * @notice Revoke an approved protocol
     * @param protocolId The protocol ID to revoke
     * @dev Only governor can revoke protocols (DAO-gated)
     */
    function revokeProtocol(bytes32 protocolId) external onlyGovernor nonReentrant {
        if (!protocols[protocolId].exists) revert ProtocolDoesNotExist(protocolId);
        
        ProtocolEntry storage protocol = protocols[protocolId];
        
        if (protocol.state == ProtocolState.Revoked) {
            revert InvalidStateTransition(protocol.state, ProtocolState.Revoked);
        }

        ProtocolState oldState = protocol.state;
        
        // Decrement approved count if revoking an approved protocol
        if (protocol.state == ProtocolState.Approved) {
            approvedProtocolCount--;
        }
        
        protocol.state = ProtocolState.Revoked;
        protocol.stateChangedAt = block.timestamp;

        emit ProtocolStateChanged(protocolId, oldState, ProtocolState.Revoked, msg.sender, block.timestamp);
    }

    /**
     * @notice Update security metadata for a protocol
     * @param protocolId The protocol ID to update
     * @param newSecurityReviewHash New security review document hash
     * @param newRiskClass Updated risk classification
     * @dev Only governor can update security metadata (DAO-gated)
     */
    function updateSecurityMetadata(
        bytes32 protocolId,
        bytes32 newSecurityReviewHash,
        uint8 newRiskClass
    ) external onlyGovernor nonReentrant {
        if (!protocols[protocolId].exists) revert ProtocolDoesNotExist(protocolId);
        if (newRiskClass == 0 || newRiskClass > 5) revert InvalidRiskClass(newRiskClass);

        ProtocolEntry storage protocol = protocols[protocolId];
        
        bytes32 oldHash = protocol.securityReviewHash;
        protocol.securityReviewHash = newSecurityReviewHash;
        protocol.riskClass = newRiskClass;
        protocol.lastAuditTimestamp = block.timestamp;

        emit ProtocolMetadataUpdated(protocolId, oldHash, newSecurityReviewHash, block.timestamp);
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @notice Get full protocol entry by ID
     * @param protocolId The protocol ID to query
     * @return entry The complete ProtocolEntry struct
     */
    function getProtocol(bytes32 protocolId) external view returns (ProtocolEntry memory entry) {
        if (!protocols[protocolId].exists) revert ProtocolDoesNotExist(protocolId);
        return protocols[protocolId];
    }

    /**
     * @notice Get protocol state by ID
     * @param protocolId The protocol ID to query
     * @return state The current lifecycle state
     */
    function getProtocolState(bytes32 protocolId) external view returns (ProtocolState state) {
        if (!protocols[protocolId].exists) revert ProtocolDoesNotExist(protocolId);
        return protocols[protocolId].state;
    }

    /**
     * @notice Check if a protocol exists
     * @param protocolId The protocol ID to check
     * @return exists True if the protocol exists
     */
    function protocolExists(bytes32 protocolId) external view returns (bool) {
        return protocols[protocolId].exists;
    }

    /**
     * @notice Check if a protocol is approved
     * @param protocolId The protocol ID to check
     * @return approved True if the protocol is in Approved state
     */
    function isProtocolApproved(bytes32 protocolId) external view returns (bool approved) {
        if (!protocols[protocolId].exists) return false;
        return protocols[protocolId].state == ProtocolState.Approved;
    }

    /**
     * @notice Get the total count of protocols
     * @return count Total number of registered protocols
     */
    function getProtocolCount() external view returns (uint256 count) {
        return totalProtocols;
    }

    /**
     * @notice Get protocol ID at a specific index
     * @param index The index to query
     * @return protocolId The protocol ID at that index
     */
    function getProtocolIdAtIndex(uint256 index) external view returns (bytes32 protocolId) {
        if (index >= protocolIds.length) revert IndexOutOfBounds(index, protocolIds.length);
        return protocolIds[index];
    }

    /**
     * @notice Verify a security review hash for a protocol
     * @param protocolId The protocol ID to verify
     * @param securityReviewHash The hash to verify against
     * @return valid True if the hash matches
     */
    function verifySecurityReview(bytes32 protocolId, bytes32 securityReviewHash) external view returns (bool valid) {
        if (!protocols[protocolId].exists) return false;
        return protocols[protocolId].securityReviewHash == securityReviewHash;
    }
}
