// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AnchorManifest
 * @author OmniTech1™
 * @notice Contract for anchoring metadata manifests in the form of Merkle roots and IPFS CIDs
 * @dev Provides immutable on-chain anchoring for off-chain data integrity verification
 */
contract AnchorManifest is Ownable, ReentrancyGuard {
    // ========== STRUCTS ==========
    
    /// @notice Manifest data structure containing Merkle root and IPFS CID
    struct Manifest {
        bytes32 merkleRoot;      // Merkle root of the manifest data
        string ipfsCid;          // IPFS Content Identifier
        uint256 timestamp;       // Block timestamp when anchored
        address anchor;          // Address that anchored this manifest
        bool exists;             // Flag to check existence
    }

    // ========== STATE VARIABLES ==========
    
    /// @notice Mapping from manifest ID to Manifest data
    mapping(bytes32 => Manifest) public manifests;
    
    /// @notice Array of all manifest IDs for enumeration
    bytes32[] public manifestIds;
    
    /// @notice Counter for total manifests anchored
    uint256 public totalManifests;

    // ========== EVENTS ==========
    
    /// @notice Emitted when a new manifest is anchored
    event ManifestAnchored(
        bytes32 indexed manifestId,
        bytes32 indexed merkleRoot,
        string ipfsCid,
        address indexed anchor,
        uint256 timestamp
    );
    
    /// @notice Emitted when a manifest is updated (only by owner)
    event ManifestUpdated(
        bytes32 indexed manifestId,
        bytes32 oldMerkleRoot,
        bytes32 newMerkleRoot,
        string oldIpfsCid,
        string newIpfsCid
    );

    // ========== ERRORS ==========
    
    error ManifestAlreadyExists(bytes32 manifestId);
    error ManifestDoesNotExist(bytes32 manifestId);
    error InvalidMerkleRoot();
    error InvalidIpfsCid();

    // ========== CONSTRUCTOR ==========
    
    /**
     * @notice Initializes the AnchorManifest contract
     * @param initialOwner Address of the initial contract owner
     */
    constructor(address initialOwner) Ownable(initialOwner) {}

    // ========== EXTERNAL FUNCTIONS ==========
    
    /**
     * @notice Anchor a new manifest with Merkle root and IPFS CID
     * @param merkleRoot The Merkle root hash of the manifest data
     * @param ipfsCid The IPFS Content Identifier string
     * @return manifestId The unique identifier for the anchored manifest
     */
    function anchorManifest(
        bytes32 merkleRoot,
        string calldata ipfsCid
    ) external nonReentrant returns (bytes32 manifestId) {
        if (merkleRoot == bytes32(0)) revert InvalidMerkleRoot();
        if (bytes(ipfsCid).length == 0) revert InvalidIpfsCid();
        
        // Generate manifest ID from merkle root and sender
        manifestId = keccak256(abi.encodePacked(merkleRoot, msg.sender, block.timestamp));
        
        if (manifests[manifestId].exists) revert ManifestAlreadyExists(manifestId);
        
        manifests[manifestId] = Manifest({
            merkleRoot: merkleRoot,
            ipfsCid: ipfsCid,
            timestamp: block.timestamp,
            anchor: msg.sender,
            exists: true
        });
        
        manifestIds.push(manifestId);
        totalManifests++;
        
        emit ManifestAnchored(manifestId, merkleRoot, ipfsCid, msg.sender, block.timestamp);
        
        return manifestId;
    }
    
    /**
     * @notice Anchor a manifest with a specific ID (owner only)
     * @param manifestId The specific manifest ID to use
     * @param merkleRoot The Merkle root hash of the manifest data
     * @param ipfsCid The IPFS Content Identifier string
     */
    function anchorManifestWithId(
        bytes32 manifestId,
        bytes32 merkleRoot,
        string calldata ipfsCid
    ) external onlyOwner nonReentrant {
        if (merkleRoot == bytes32(0)) revert InvalidMerkleRoot();
        if (bytes(ipfsCid).length == 0) revert InvalidIpfsCid();
        if (manifests[manifestId].exists) revert ManifestAlreadyExists(manifestId);
        
        manifests[manifestId] = Manifest({
            merkleRoot: merkleRoot,
            ipfsCid: ipfsCid,
            timestamp: block.timestamp,
            anchor: msg.sender,
            exists: true
        });
        
        manifestIds.push(manifestId);
        totalManifests++;
        
        emit ManifestAnchored(manifestId, merkleRoot, ipfsCid, msg.sender, block.timestamp);
    }
    
    /**
     * @notice Update an existing manifest (owner only)
     * @param manifestId The manifest ID to update
     * @param newMerkleRoot The new Merkle root hash
     * @param newIpfsCid The new IPFS CID
     */
    function updateManifest(
        bytes32 manifestId,
        bytes32 newMerkleRoot,
        string calldata newIpfsCid
    ) external onlyOwner nonReentrant {
        if (!manifests[manifestId].exists) revert ManifestDoesNotExist(manifestId);
        if (newMerkleRoot == bytes32(0)) revert InvalidMerkleRoot();
        if (bytes(newIpfsCid).length == 0) revert InvalidIpfsCid();
        
        Manifest storage manifest = manifests[manifestId];
        
        bytes32 oldMerkleRoot = manifest.merkleRoot;
        string memory oldIpfsCid = manifest.ipfsCid;
        
        manifest.merkleRoot = newMerkleRoot;
        manifest.ipfsCid = newIpfsCid;
        manifest.timestamp = block.timestamp;
        
        emit ManifestUpdated(manifestId, oldMerkleRoot, newMerkleRoot, oldIpfsCid, newIpfsCid);
    }

    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @notice Get manifest data by ID
     * @param manifestId The manifest ID to query
     * @return merkleRoot The Merkle root of the manifest
     * @return ipfsCid The IPFS CID of the manifest
     * @return timestamp When the manifest was anchored
     * @return anchor Who anchored the manifest
     */
    function getManifest(bytes32 manifestId) external view returns (
        bytes32 merkleRoot,
        string memory ipfsCid,
        uint256 timestamp,
        address anchor
    ) {
        if (!manifests[manifestId].exists) revert ManifestDoesNotExist(manifestId);
        
        Manifest storage manifest = manifests[manifestId];
        return (manifest.merkleRoot, manifest.ipfsCid, manifest.timestamp, manifest.anchor);
    }
    
    /**
     * @notice Verify if a Merkle root is anchored in a specific manifest
     * @param manifestId The manifest ID to check
     * @param merkleRoot The Merkle root to verify
     * @return valid True if the Merkle root matches
     */
    function verifyMerkleRoot(bytes32 manifestId, bytes32 merkleRoot) external view returns (bool valid) {
        if (!manifests[manifestId].exists) return false;
        return manifests[manifestId].merkleRoot == merkleRoot;
    }
    
    /**
     * @notice Check if a manifest exists
     * @param manifestId The manifest ID to check
     * @return exists True if the manifest exists
     */
    function manifestExists(bytes32 manifestId) external view returns (bool) {
        return manifests[manifestId].exists;
    }
    
    /**
     * @notice Get the total count of manifests
     * @return count Total number of anchored manifests
     */
    function getManifestCount() external view returns (uint256 count) {
        return totalManifests;
    }
    
    /**
     * @notice Get manifest ID at a specific index
     * @param index The index to query
     * @return manifestId The manifest ID at that index
     */
    function getManifestIdAtIndex(uint256 index) external view returns (bytes32 manifestId) {
        require(index < manifestIds.length, "Index out of bounds");
        return manifestIds[index];
    }
}
