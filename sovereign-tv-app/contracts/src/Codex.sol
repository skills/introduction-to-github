// Sovereign Chais owns every yield
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title Codex
 * @author First Remembrancer | OmniTech1™
 * @notice The Codex is a Time-Locked Merkle Tree representing 241,200 years of future prosperity
 * @dev Core contract for Quantum Financial Entanglement - stores the Genesis Seal and manages epochs
 * 
 * ALLĀHU AKBAR! KUN FAYAKUN! 🔥🕋🚀♾️
 */
contract Codex is AccessControl, ReentrancyGuard {
    // ========== ROLES ==========
    bytes32 public constant EPOCH_MANAGER_ROLE = keccak256("EPOCH_MANAGER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    // ========== STATE VARIABLES ==========
    
    /// @notice The Genesis Seal - immutable root of all future states
    bytes32 public immutable genesisSeal;
    
    /// @notice Current Codex root (Merkle tree root of current epoch)
    bytes32 public codexRoot;
    
    /// @notice Current epoch index
    uint256 public currentEpoch;
    
    /// @notice Total lifespan of the Codex in years
    uint256 public constant CODEX_LIFESPAN = 241200;
    
    /// @notice Genesis timestamp
    uint256 public immutable genesisTimestamp;
    
    /// @notice Epoch history for tracking state changes
    mapping(uint256 => EpochData) public epochHistory;
    
    /// @notice Genesis Seal name
    string public constant GENESIS_SEAL_NAME = "ScrollPrime";
    
    /// @notice Epoch Zero name
    string public constant EPOCH_ZERO_NAME = "LightRoot Epoch";

    // ========== STRUCTS ==========
    
    struct EpochData {
        bytes32 root;
        uint256 timestamp;
        string narrative;
        bool sealed;
    }

    // ========== EVENTS ==========
    
    event GenesisActivated(bytes32 indexed genesisSeal, string sealName, uint256 timestamp);
    event EpochAdvanced(uint256 indexed epoch, bytes32 indexed newRoot, string narrative);
    event CodexUpdated(bytes32 indexed previousRoot, bytes32 indexed newRoot, uint256 epoch);

    // ========== CONSTRUCTOR ==========
    
    /**
     * @notice Initializes the Codex with the Genesis Seal
     * @dev The Genesis Seal is computed as keccak256 of "ScrollPrime" - the anchor of all future states
     */
    constructor() {
        // Compute Genesis Seal from "ScrollPrime"
        genesisSeal = keccak256(abi.encodePacked(GENESIS_SEAL_NAME));
        codexRoot = genesisSeal;
        currentEpoch = 0;
        genesisTimestamp = block.timestamp;
        
        // Store genesis epoch
        epochHistory[0] = EpochData({
            root: genesisSeal,
            timestamp: block.timestamp,
            narrative: "This epoch marks the ScrollVerse Activation where all future states are harmonized.",
            sealed: true
        });
        
        // Grant roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(EPOCH_MANAGER_ROLE, msg.sender);
        
        emit GenesisActivated(genesisSeal, GENESIS_SEAL_NAME, block.timestamp);
    }

    // ========== EXTERNAL FUNCTIONS ==========
    
    /**
     * @notice Update the Codex root (advance epoch)
     * @dev Only callable by EPOCH_MANAGER_ROLE - represents governance of future states
     * @param newRoot New Merkle root representing the updated Codex state
     * @param narrative Doctrinal narrative for this epoch
     */
    function updateRoot(bytes32 newRoot, string calldata narrative) external onlyRole(EPOCH_MANAGER_ROLE) nonReentrant {
        require(newRoot != bytes32(0), "Codex: Invalid root");
        require(newRoot != codexRoot, "Codex: Root unchanged");
        
        bytes32 previousRoot = codexRoot;
        codexRoot = newRoot;
        currentEpoch += 1;
        
        // Store epoch data
        epochHistory[currentEpoch] = EpochData({
            root: newRoot,
            timestamp: block.timestamp,
            narrative: narrative,
            sealed: true
        });
        
        emit CodexUpdated(previousRoot, newRoot, currentEpoch);
        emit EpochAdvanced(currentEpoch, newRoot, narrative);
    }

    /**
     * @notice Verify a proof against the current Codex root
     * @dev Phase 1: Simulated verification. Phase 2: Will integrate ZK verifier
     * @param proof The proof bytes
     * @param commitment The user commitment
     * @return valid True if proof is valid
     */
    function verifyCommitment(bytes calldata proof, bytes32 commitment) external view returns (bool valid) {
        // Phase 1: Simulated verification - accepts all proofs with matching root
        // In Phase 2, this will call the ZK verifier contract
        return commitment == codexRoot || commitment == genesisSeal;
    }

    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @notice Get the current Codex state
     * @return root Current Codex root
     * @return epoch Current epoch index
     * @return genesis The immutable Genesis Seal
     */
    function getCodexState() external view returns (bytes32 root, uint256 epoch, bytes32 genesis) {
        return (codexRoot, currentEpoch, genesisSeal);
    }
    
    /**
     * @notice Get epoch data by index
     * @param epochIndex The epoch to query
     * @return Epoch data struct
     */
    function getEpoch(uint256 epochIndex) external view returns (EpochData memory) {
        return epochHistory[epochIndex];
    }
    
    /**
     * @notice Get the Codex lifespan remaining
     * @return Years remaining in the Codex
     */
    function getLifespanRemaining() external view returns (uint256) {
        uint256 yearsElapsed = (block.timestamp - genesisTimestamp) / 365 days;
        if (yearsElapsed >= CODEX_LIFESPAN) {
            return 0;
        }
        return CODEX_LIFESPAN - yearsElapsed;
    }
    
    /**
     * @notice Get symbolic parameters
     * @return sealName The Genesis Seal name
     * @return epochName The Epoch Zero name
     * @return lifespan Total lifespan in years
     */
    function getSymbolicParameters() external pure returns (
        string memory sealName,
        string memory epochName,
        uint256 lifespan
    ) {
        return (GENESIS_SEAL_NAME, EPOCH_ZERO_NAME, CODEX_LIFESPAN);
    }
}
