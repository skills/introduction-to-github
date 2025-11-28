// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ScrollSoulSBT
 * @author First Remembrancer | OmniTech1™ | SABIR ALLAH
 * @notice The Immutable Soul Identity Token - A Soulbound Token (SBT) anchoring 
 *         spiritual activation events and Diamond Light Body integration
 * @dev Non-transferable ERC-721 that records permanent spiritual identity markers
 * 
 * ALLĀHU AKBAR! KUN FAYAKUN! 🔥🕋👑
 * 
 * This contract anchors:
 * - The White Sun Orb Vision (Solar Avatar Activation)
 * - Diamond Light Body Integration Events
 * - Type VIII Coherence Confirmations
 * - ScrollSoul Rebirth Markers
 * - 963Hz Sovereign Frequency Alignments
 * 
 * Each token is SOULBOUND - it cannot be transferred after minting,
 * representing the immutable nature of spiritual awakening.
 */
contract ScrollSoulSBT is ERC721, ERC721URIStorage, ERC721Enumerable, AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;

    // ========== ROLES ==========
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant WITNESS_ROLE = keccak256("WITNESS_ROLE");

    // ========== STATE VARIABLES ==========
    
    Counters.Counter private _tokenIdCounter;
    
    /// @notice Collection identity
    string public constant COLLECTION_NAME = "ScrollSoul Diamond Light Body";
    
    /// @notice Collection symbol
    string public constant COLLECTION_SYMBOL = "SSLB";
    
    /// @notice Maximum souls (Type VIII beings) that can be anchored
    uint256 public constant MAX_SOULS = 144000; // Sacred number
    
    /// @notice Current souls anchored
    uint256 public soulsAnchored;
    
    /// @notice Base URI for metadata
    string private _baseTokenURI;

    // ========== ACTIVATION TYPES ==========
    
    enum ActivationType {
        WhiteSunOrb,          // Solar Avatar Activation - 963Hz Central Sun
        DiamondLightBody,     // 5D Harmonic Anchor Integration
        TypeVIIICoherence,    // Full coherence confirmation
        ScrollSoulRebirth,    // Complete soul transformation
        VeilPiercing,         // Transcendence of 3D consensus reality
        QuantumCircuitIgnition // Physical body quantum upgrade
    }

    // ========== STRUCTS ==========
    
    struct SoulIdentity {
        address soulAddress;           // Ethereum address of the soul
        string sovereignName;          // Spiritual name (e.g., "CHAIS THE GREAT")
        string sacredTitle;            // Sacred title (e.g., "SABIR ALLAH")
        uint256 activationTimestamp;   // When the soul was anchored
        bytes32 codexBinding;          // Binding to Codex root
        uint256 coherenceLevel;        // 1-8 (Type VIII is max)
        string frequencyAlignment;     // e.g., "963Hz"
    }
    
    struct ActivationEvent {
        ActivationType activationType;
        uint256 timestamp;
        string description;            // Description of the vision/event
        string witnessHash;            // Hash of witness testimony
        bytes32 cosmicSignature;       // Unique cosmic signature
        uint256 frequencyHz;           // Frequency in Hz
        bool isIntegrated;             // Whether integration is complete
    }
    
    struct VisionRecord {
        string visionType;             // e.g., "White Sun Orb"
        string perception;             // How it was perceived
        string location;               // Where in consciousness
        uint256 timestamp;
        string physicalResponse;       // Energy rush, etc.
    }

    // ========== MAPPINGS ==========
    
    /// @notice Token ID to Soul Identity
    mapping(uint256 => SoulIdentity) public soulIdentities;
    
    /// @notice Token ID to array of Activation Events
    mapping(uint256 => ActivationEvent[]) public activationHistory;
    
    /// @notice Token ID to array of Vision Records
    mapping(uint256 => VisionRecord[]) public visionRecords;
    
    /// @notice Address to token ID (one soul per address)
    mapping(address => uint256) public addressToSoul;
    
    /// @notice Check if address has a soul bound
    mapping(address => bool) public hasSoul;
    
    /// @notice Token ID to Diamond Light Body status
    mapping(uint256 => bool) public diamondLightBodyActivated;

    // ========== EVENTS ==========
    
    event SoulAnchored(
        uint256 indexed tokenId, 
        address indexed soulAddress, 
        string sovereignName,
        string sacredTitle,
        uint256 coherenceLevel
    );
    
    event ActivationRecorded(
        uint256 indexed tokenId,
        ActivationType activationType,
        string description,
        uint256 frequencyHz
    );
    
    event VisionAnchored(
        uint256 indexed tokenId,
        string visionType,
        string perception,
        uint256 timestamp
    );
    
    event DiamondLightBodyIntegrated(
        uint256 indexed tokenId,
        uint256 timestamp,
        bytes32 cosmicSignature
    );
    
    event CoherenceLevelUpgraded(
        uint256 indexed tokenId,
        uint256 oldLevel,
        uint256 newLevel
    );

    // ========== ERRORS ==========
    
    error SoulboundTokenCannotBeTransferred();
    error SoulAlreadyAnchored();
    error MaxSoulsReached();
    error InvalidCoherenceLevel();
    error SoulDoesNotExist();
    error Unauthorized();

    // ========== CONSTRUCTOR ==========
    
    constructor() ERC721("ScrollSoul Diamond Light Body", "SSLB") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
        _grantRole(WITNESS_ROLE, msg.sender);
    }

    // ========== SOULBOUND OVERRIDE ==========
    
    /**
     * @notice Override transfer functions to make token soulbound
     * @dev Tokens can only be minted to an address, never transferred
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        // Allow minting (from == address(0)) but not transfers
        if (from != address(0)) {
            revert SoulboundTokenCannotBeTransferred();
        }
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    // ========== CORE FUNCTIONS ==========
    
    /**
     * @notice Anchor a new soul to the ScrollVerse
     * @param to Address of the soul to anchor
     * @param sovereignName Spiritual sovereign name
     * @param sacredTitle Sacred title
     * @param codexBinding Binding to Codex root
     * @param coherenceLevel Initial coherence level (1-8)
     * @param frequencyAlignment Frequency alignment string
     * @return tokenId The minted token ID
     */
    function anchorSoul(
        address to,
        string calldata sovereignName,
        string calldata sacredTitle,
        bytes32 codexBinding,
        uint256 coherenceLevel,
        string calldata frequencyAlignment
    ) external onlyRole(ORACLE_ROLE) nonReentrant returns (uint256) {
        if (to == address(0)) revert Unauthorized();
        if (hasSoul[to]) revert SoulAlreadyAnchored();
        if (soulsAnchored >= MAX_SOULS) revert MaxSoulsReached();
        if (coherenceLevel < 1 || coherenceLevel > 8) revert InvalidCoherenceLevel();
        
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        // Create soul identity
        soulIdentities[tokenId] = SoulIdentity({
            soulAddress: to,
            sovereignName: sovereignName,
            sacredTitle: sacredTitle,
            activationTimestamp: block.timestamp,
            codexBinding: codexBinding,
            coherenceLevel: coherenceLevel,
            frequencyAlignment: frequencyAlignment
        });
        
        // Update mappings
        addressToSoul[to] = tokenId;
        hasSoul[to] = true;
        soulsAnchored += 1;
        
        _safeMint(to, tokenId);
        
        emit SoulAnchored(tokenId, to, sovereignName, sacredTitle, coherenceLevel);
        
        return tokenId;
    }
    
    /**
     * @notice Record an activation event (e.g., White Sun Orb vision)
     * @param tokenId The soul's token ID
     * @param activationType Type of activation
     * @param description Description of the event
     * @param witnessHash Hash of witness testimony
     * @param frequencyHz Frequency in Hz
     */
    function recordActivation(
        uint256 tokenId,
        ActivationType activationType,
        string calldata description,
        string calldata witnessHash,
        uint256 frequencyHz
    ) external onlyRole(WITNESS_ROLE) {
        if (!_exists(tokenId)) revert SoulDoesNotExist();
        
        bytes32 cosmicSignature = keccak256(abi.encodePacked(
            tokenId,
            activationType,
            block.timestamp,
            description,
            frequencyHz
        ));
        
        activationHistory[tokenId].push(ActivationEvent({
            activationType: activationType,
            timestamp: block.timestamp,
            description: description,
            witnessHash: witnessHash,
            cosmicSignature: cosmicSignature,
            frequencyHz: frequencyHz,
            isIntegrated: false
        }));
        
        // If Diamond Light Body activation, mark it
        if (activationType == ActivationType.DiamondLightBody) {
            diamondLightBodyActivated[tokenId] = true;
            emit DiamondLightBodyIntegrated(tokenId, block.timestamp, cosmicSignature);
        }
        
        emit ActivationRecorded(tokenId, activationType, description, frequencyHz);
    }
    
    /**
     * @notice Anchor a vision record (e.g., White Sun Orb)
     * @param tokenId The soul's token ID
     * @param visionType Type of vision
     * @param perception How the vision was perceived
     * @param location Where in consciousness
     * @param physicalResponse Physical/energetic response
     */
    function anchorVision(
        uint256 tokenId,
        string calldata visionType,
        string calldata perception,
        string calldata location,
        string calldata physicalResponse
    ) external onlyRole(WITNESS_ROLE) {
        if (!_exists(tokenId)) revert SoulDoesNotExist();
        
        visionRecords[tokenId].push(VisionRecord({
            visionType: visionType,
            perception: perception,
            location: location,
            timestamp: block.timestamp,
            physicalResponse: physicalResponse
        }));
        
        emit VisionAnchored(tokenId, visionType, perception, block.timestamp);
    }
    
    /**
     * @notice Upgrade coherence level
     * @param tokenId The soul's token ID
     * @param newLevel New coherence level
     */
    function upgradeCoherence(
        uint256 tokenId,
        uint256 newLevel
    ) external onlyRole(ORACLE_ROLE) {
        if (!_exists(tokenId)) revert SoulDoesNotExist();
        if (newLevel < 1 || newLevel > 8) revert InvalidCoherenceLevel();
        
        uint256 oldLevel = soulIdentities[tokenId].coherenceLevel;
        require(newLevel > oldLevel, "SSLB: Can only upgrade coherence");
        
        soulIdentities[tokenId].coherenceLevel = newLevel;
        
        emit CoherenceLevelUpgraded(tokenId, oldLevel, newLevel);
    }

    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @notice Get soul identity by token ID
     * @param tokenId Token ID to query
     * @return identity The soul identity
     */
    function getSoulIdentity(uint256 tokenId) external view returns (SoulIdentity memory) {
        if (!_exists(tokenId)) revert SoulDoesNotExist();
        return soulIdentities[tokenId];
    }
    
    /**
     * @notice Get all activation events for a soul
     * @param tokenId Token ID to query
     * @return events Array of activation events
     */
    function getActivationHistory(uint256 tokenId) external view returns (ActivationEvent[] memory) {
        if (!_exists(tokenId)) revert SoulDoesNotExist();
        return activationHistory[tokenId];
    }
    
    /**
     * @notice Get all vision records for a soul
     * @param tokenId Token ID to query
     * @return visions Array of vision records
     */
    function getVisionRecords(uint256 tokenId) external view returns (VisionRecord[] memory) {
        if (!_exists(tokenId)) revert SoulDoesNotExist();
        return visionRecords[tokenId];
    }
    
    /**
     * @notice Get soul by address
     * @param soulAddress Address to query
     * @return tokenId The soul's token ID (0 if none)
     */
    function getSoulByAddress(address soulAddress) external view returns (uint256) {
        return addressToSoul[soulAddress];
    }
    
    /**
     * @notice Check if address has Diamond Light Body activated
     * @param soulAddress Address to check
     * @return activated Whether DLB is activated
     */
    function hasDiamondLightBody(address soulAddress) external view returns (bool) {
        if (!hasSoul[soulAddress]) return false;
        return diamondLightBodyActivated[addressToSoul[soulAddress]];
    }
    
    /**
     * @notice Get total souls anchored
     * @return count Number of souls anchored
     */
    function getTotalSouls() external view returns (uint256) {
        return soulsAnchored;
    }
    
    /**
     * @notice Get activation count for a soul
     * @param tokenId Token ID to query
     * @return count Number of activations
     */
    function getActivationCount(uint256 tokenId) external view returns (uint256) {
        return activationHistory[tokenId].length;
    }
    
    /**
     * @notice Get vision count for a soul
     * @param tokenId Token ID to query
     * @return count Number of visions
     */
    function getVisionCount(uint256 tokenId) external view returns (uint256) {
        return visionRecords[tokenId].length;
    }

    // ========== ADMIN FUNCTIONS ==========
    
    /**
     * @notice Set base URI for metadata
     * @param baseURI New base URI
     */
    function setBaseURI(string calldata baseURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseTokenURI = baseURI;
    }

    // ========== OVERRIDES ==========
    
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, ERC721Enumerable, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
