// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

/**
 * @title AllianceRegistry
 * @notice Core registry for managing real-world alliances, partnerships, and asset connections
 * @dev UUPS upgradeable contract for alliance management with governance controls
 * 
 * Features:
 * - Alliance creation and management
 * - Partner verification and onboarding
 * - Real-world asset tokenization tracking
 * - Multi-signature governance support
 * - Integration points for dApps and external systems
 * 
 * OmniTech1™ - Real-World Alliance Infrastructure
 */
contract AllianceRegistry is 
    Initializable, 
    AccessControlUpgradeable, 
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable 
{
    // Role definitions
    bytes32 public constant ALLIANCE_ADMIN_ROLE = keccak256("ALLIANCE_ADMIN_ROLE");
    bytes32 public constant ALLIANCE_CREATOR_ROLE = keccak256("ALLIANCE_CREATOR_ROLE");
    bytes32 public constant PARTNER_VERIFIER_ROLE = keccak256("PARTNER_VERIFIER_ROLE");
    bytes32 public constant ASSET_MANAGER_ROLE = keccak256("ASSET_MANAGER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    // Alliance status enumeration
    enum AllianceStatus {
        Pending,      // Newly created, awaiting verification
        Active,       // Verified and operational
        Suspended,    // Temporarily paused
        Dissolved     // Permanently closed
    }

    // Alliance structure
    struct Alliance {
        uint256 id;
        string name;
        string description;
        address creator;
        address[] partners;
        AllianceStatus status;
        uint256 createdAt;
        uint256 updatedAt;
        string metadataURI;
        bytes32 governanceHash;
    }

    // Asset bridge connection structure
    struct AssetBridge {
        uint256 allianceId;
        address assetContract;
        string assetType;
        string realWorldIdentifier;
        bool verified;
        uint256 registeredAt;
    }

    // Partner structure
    struct Partner {
        address partnerAddress;
        string name;
        string organizationType;
        bool verified;
        uint256 joinedAt;
        string kycHash;
    }

    // State variables
    uint256 private _allianceCounter;
    mapping(uint256 => Alliance) private _alliances;
    mapping(address => uint256[]) private _creatorAlliances;
    mapping(address => uint256[]) private _partnerAlliances;
    mapping(uint256 => Partner[]) private _alliancePartners;
    mapping(uint256 => AssetBridge[]) private _allianceBridges;
    mapping(address => bool) private _verifiedPartners;

    // Events
    event AllianceCreated(
        uint256 indexed allianceId,
        string name,
        address indexed creator,
        uint256 timestamp
    );
    
    event AllianceStatusUpdated(
        uint256 indexed allianceId,
        AllianceStatus oldStatus,
        AllianceStatus newStatus,
        uint256 timestamp
    );

    event PartnerAdded(
        uint256 indexed allianceId,
        address indexed partner,
        string name,
        uint256 timestamp
    );

    event PartnerVerified(
        address indexed partner,
        address indexed verifier,
        uint256 timestamp
    );

    event AssetBridgeRegistered(
        uint256 indexed allianceId,
        address indexed assetContract,
        string assetType,
        uint256 timestamp
    );

    event AssetBridgeVerified(
        uint256 indexed allianceId,
        address indexed assetContract,
        uint256 timestamp
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initialize the AllianceRegistry contract
     * @param admin Address to be granted admin role
     */
    function initialize(address admin) public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ALLIANCE_ADMIN_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);
        
        _allianceCounter = 0;
    }

    /**
     * @notice Create a new alliance
     * @param name Alliance name
     * @param description Alliance description
     * @param metadataURI IPFS or URI containing alliance metadata
     * @param governanceHash Hash of governance agreement
     * @return allianceId The ID of the newly created alliance
     */
    function createAlliance(
        string memory name,
        string memory description,
        string memory metadataURI,
        bytes32 governanceHash
    ) external onlyRole(ALLIANCE_CREATOR_ROLE) returns (uint256) {
        require(bytes(name).length > 0, "Alliance name required");
        
        _allianceCounter++;
        uint256 allianceId = _allianceCounter;

        Alliance storage alliance = _alliances[allianceId];
        alliance.id = allianceId;
        alliance.name = name;
        alliance.description = description;
        alliance.creator = msg.sender;
        alliance.status = AllianceStatus.Pending;
        alliance.createdAt = block.timestamp;
        alliance.updatedAt = block.timestamp;
        alliance.metadataURI = metadataURI;
        alliance.governanceHash = governanceHash;

        _creatorAlliances[msg.sender].push(allianceId);

        emit AllianceCreated(allianceId, name, msg.sender, block.timestamp);

        return allianceId;
    }

    /**
     * @notice Update alliance status
     * @param allianceId ID of the alliance
     * @param newStatus New status to set
     */
    function updateAllianceStatus(
        uint256 allianceId,
        AllianceStatus newStatus
    ) external onlyRole(ALLIANCE_ADMIN_ROLE) {
        require(_alliances[allianceId].id != 0, "Alliance does not exist");
        
        Alliance storage alliance = _alliances[allianceId];
        AllianceStatus oldStatus = alliance.status;
        
        alliance.status = newStatus;
        alliance.updatedAt = block.timestamp;

        emit AllianceStatusUpdated(allianceId, oldStatus, newStatus, block.timestamp);
    }

    /**
     * @notice Add a partner to an alliance
     * @param allianceId ID of the alliance
     * @param partnerAddress Address of the partner
     * @param partnerName Name of the partner
     * @param organizationType Type of organization
     * @param kycHash Hash of KYC/verification documents
     */
    function addPartner(
        uint256 allianceId,
        address partnerAddress,
        string memory partnerName,
        string memory organizationType,
        string memory kycHash
    ) external onlyRole(ALLIANCE_ADMIN_ROLE) {
        require(_alliances[allianceId].id != 0, "Alliance does not exist");
        require(partnerAddress != address(0), "Invalid partner address");

        Alliance storage alliance = _alliances[allianceId];
        alliance.partners.push(partnerAddress);
        alliance.updatedAt = block.timestamp;

        Partner memory newPartner = Partner({
            partnerAddress: partnerAddress,
            name: partnerName,
            organizationType: organizationType,
            verified: false,
            joinedAt: block.timestamp,
            kycHash: kycHash
        });

        _alliancePartners[allianceId].push(newPartner);
        _partnerAlliances[partnerAddress].push(allianceId);

        emit PartnerAdded(allianceId, partnerAddress, partnerName, block.timestamp);
    }

    /**
     * @notice Verify a partner
     * @param partnerAddress Address of the partner to verify
     */
    function verifyPartner(address partnerAddress) 
        external 
        onlyRole(PARTNER_VERIFIER_ROLE) 
    {
        require(partnerAddress != address(0), "Invalid partner address");
        
        _verifiedPartners[partnerAddress] = true;

        emit PartnerVerified(partnerAddress, msg.sender, block.timestamp);
    }

    /**
     * @notice Register an asset bridge for real-world asset tokenization
     * @param allianceId ID of the alliance
     * @param assetContract Address of the asset token contract
     * @param assetType Type of asset (e.g., "real-estate", "commodity", "equity")
     * @param realWorldIdentifier Real-world identifier (deed number, serial, etc.)
     */
    function registerAssetBridge(
        uint256 allianceId,
        address assetContract,
        string memory assetType,
        string memory realWorldIdentifier
    ) external onlyRole(ASSET_MANAGER_ROLE) {
        require(_alliances[allianceId].id != 0, "Alliance does not exist");
        require(assetContract != address(0), "Invalid asset contract");

        AssetBridge memory bridge = AssetBridge({
            allianceId: allianceId,
            assetContract: assetContract,
            assetType: assetType,
            realWorldIdentifier: realWorldIdentifier,
            verified: false,
            registeredAt: block.timestamp
        });

        _allianceBridges[allianceId].push(bridge);

        emit AssetBridgeRegistered(
            allianceId,
            assetContract,
            assetType,
            block.timestamp
        );
    }

    /**
     * @notice Verify an asset bridge connection
     * @param allianceId ID of the alliance
     * @param bridgeIndex Index of the bridge in the alliance's bridges array
     */
    function verifyAssetBridge(uint256 allianceId, uint256 bridgeIndex)
        external
        onlyRole(ASSET_MANAGER_ROLE)
    {
        require(_allianceBridges[allianceId].length > bridgeIndex, "Invalid bridge index");
        
        _allianceBridges[allianceId][bridgeIndex].verified = true;

        emit AssetBridgeVerified(
            allianceId,
            _allianceBridges[allianceId][bridgeIndex].assetContract,
            block.timestamp
        );
    }

    // View functions

    /**
     * @notice Get alliance details
     * @param allianceId ID of the alliance
     * @return Alliance struct
     */
    function getAlliance(uint256 allianceId) 
        external 
        view 
        returns (Alliance memory) 
    {
        require(_alliances[allianceId].id != 0, "Alliance does not exist");
        return _alliances[allianceId];
    }

    /**
     * @notice Get alliances created by an address
     * @param creator Address of the creator
     * @return Array of alliance IDs
     */
    function getAlliancesByCreator(address creator)
        external
        view
        returns (uint256[] memory)
    {
        return _creatorAlliances[creator];
    }

    /**
     * @notice Get alliances a partner is part of
     * @param partner Address of the partner
     * @return Array of alliance IDs
     */
    function getAlliancesByPartner(address partner)
        external
        view
        returns (uint256[] memory)
    {
        return _partnerAlliances[partner];
    }

    /**
     * @notice Get partners of an alliance
     * @param allianceId ID of the alliance
     * @return Array of Partner structs
     */
    function getAlliancePartners(uint256 allianceId)
        external
        view
        returns (Partner[] memory)
    {
        return _alliancePartners[allianceId];
    }

    /**
     * @notice Get asset bridges for an alliance
     * @param allianceId ID of the alliance
     * @return Array of AssetBridge structs
     */
    function getAllianceBridges(uint256 allianceId)
        external
        view
        returns (AssetBridge[] memory)
    {
        return _allianceBridges[allianceId];
    }

    /**
     * @notice Check if a partner is verified
     * @param partner Address of the partner
     * @return Boolean indicating verification status
     */
    function isPartnerVerified(address partner) external view returns (bool) {
        return _verifiedPartners[partner];
    }

    /**
     * @notice Get total number of alliances
     * @return Total alliance count
     */
    function getTotalAlliances() external view returns (uint256) {
        return _allianceCounter;
    }

    /**
     * @notice Required override for UUPS upgradeable pattern
     */
    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(UPGRADER_ROLE)
    {}
}
