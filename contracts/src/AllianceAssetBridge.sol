// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title AllianceAssetBridge
 * @notice Bridge contract for tokenizing real-world assets within alliance framework
 * @dev Manages connections between physical assets and their on-chain representations
 * 
 * Features:
 * - Real-world asset tokenization tracking
 * - Multi-asset type support (ERC20, ERC721, custom)
 * - Verification and audit trail
 * - Ownership and transfer tracking
 * - Integration with AllianceRegistry
 * 
 * OmniTech1™ - Real-World Asset Bridge Infrastructure
 */
contract AllianceAssetBridge is
    Initializable,
    AccessControlUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable
{
    bytes32 public constant BRIDGE_ADMIN_ROLE = keccak256("BRIDGE_ADMIN_ROLE");
    bytes32 public constant ASSET_VERIFIER_ROLE = keccak256("ASSET_VERIFIER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    // Asset types supported by the bridge
    enum AssetType {
        RealEstate,
        Commodity,
        Equity,
        IntellectualProperty,
        Infrastructure,
        Other
    }

    // Asset verification status
    enum VerificationStatus {
        Pending,
        Verified,
        Disputed,
        Revoked
    }

    // Tokenized asset representation
    struct TokenizedAsset {
        uint256 assetId;
        uint256 allianceId;
        AssetType assetType;
        address tokenContract;
        uint256 tokenId; // For ERC721, 0 for ERC20
        string realWorldIdentifier;
        string legalDocumentHash;
        address custodian;
        VerificationStatus status;
        uint256 valuationUSD;
        uint256 registeredAt;
        uint256 lastVerifiedAt;
        string metadataURI;
    }

    // Asset verification record
    struct VerificationRecord {
        address verifier;
        VerificationStatus status;
        string reportHash;
        uint256 timestamp;
        string notes;
    }

    // State variables
    uint256 private _assetCounter;
    mapping(uint256 => TokenizedAsset) private _assets;
    mapping(address => uint256[]) private _assetsByToken;
    mapping(uint256 => uint256[]) private _assetsByAlliance;
    mapping(uint256 => VerificationRecord[]) private _verificationHistory;
    mapping(string => uint256) private _realWorldIdToAssetId;

    // Events
    event AssetTokenized(
        uint256 indexed assetId,
        uint256 indexed allianceId,
        AssetType assetType,
        address indexed tokenContract,
        string realWorldIdentifier,
        uint256 timestamp
    );

    event AssetVerified(
        uint256 indexed assetId,
        address indexed verifier,
        VerificationStatus status,
        string reportHash,
        uint256 timestamp
    );

    event AssetValuationUpdated(
        uint256 indexed assetId,
        uint256 oldValuation,
        uint256 newValuation,
        uint256 timestamp
    );

    event CustodianChanged(
        uint256 indexed assetId,
        address indexed oldCustodian,
        address indexed newCustodian,
        uint256 timestamp
    );

    event AssetStatusChanged(
        uint256 indexed assetId,
        VerificationStatus oldStatus,
        VerificationStatus newStatus,
        uint256 timestamp
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initialize the AllianceAssetBridge contract
     * @param admin Address to be granted admin role
     */
    function initialize(address admin) public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(BRIDGE_ADMIN_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);

        _assetCounter = 0;
    }

    /**
     * @notice Tokenize a real-world asset
     * @param allianceId ID of the alliance managing this asset
     * @param assetType Type of the asset
     * @param tokenContract Address of the token contract representing the asset
     * @param tokenId Token ID for ERC721, 0 for ERC20
     * @param realWorldIdentifier Unique real-world identifier (deed, serial, etc.)
     * @param legalDocumentHash Hash of legal documentation
     * @param custodian Address of the asset custodian
     * @param valuationUSD Asset valuation in USD (scaled by 1e6 for decimals)
     * @param metadataURI URI containing asset metadata
     * @return assetId The ID of the newly tokenized asset
     */
    function tokenizeAsset(
        uint256 allianceId,
        AssetType assetType,
        address tokenContract,
        uint256 tokenId,
        string memory realWorldIdentifier,
        string memory legalDocumentHash,
        address custodian,
        uint256 valuationUSD,
        string memory metadataURI
    ) external onlyRole(BRIDGE_ADMIN_ROLE) returns (uint256) {
        require(tokenContract != address(0), "Invalid token contract");
        require(custodian != address(0), "Invalid custodian");
        require(bytes(realWorldIdentifier).length > 0, "Real-world identifier required");
        require(_realWorldIdToAssetId[realWorldIdentifier] == 0, "Asset already tokenized");

        _assetCounter++;
        uint256 assetId = _assetCounter;

        TokenizedAsset storage asset = _assets[assetId];
        asset.assetId = assetId;
        asset.allianceId = allianceId;
        asset.assetType = assetType;
        asset.tokenContract = tokenContract;
        asset.tokenId = tokenId;
        asset.realWorldIdentifier = realWorldIdentifier;
        asset.legalDocumentHash = legalDocumentHash;
        asset.custodian = custodian;
        asset.status = VerificationStatus.Pending;
        asset.valuationUSD = valuationUSD;
        asset.registeredAt = block.timestamp;
        asset.lastVerifiedAt = 0;
        asset.metadataURI = metadataURI;

        _assetsByToken[tokenContract].push(assetId);
        _assetsByAlliance[allianceId].push(assetId);
        _realWorldIdToAssetId[realWorldIdentifier] = assetId;

        emit AssetTokenized(
            assetId,
            allianceId,
            assetType,
            tokenContract,
            realWorldIdentifier,
            block.timestamp
        );

        return assetId;
    }

    /**
     * @notice Verify a tokenized asset
     * @param assetId ID of the asset
     * @param status Verification status to set
     * @param reportHash Hash of the verification report
     * @param notes Additional verification notes
     */
    function verifyAsset(
        uint256 assetId,
        VerificationStatus status,
        string memory reportHash,
        string memory notes
    ) external onlyRole(ASSET_VERIFIER_ROLE) {
        require(_assets[assetId].assetId != 0, "Asset does not exist");

        TokenizedAsset storage asset = _assets[assetId];
        VerificationStatus oldStatus = asset.status;
        asset.status = status;
        asset.lastVerifiedAt = block.timestamp;

        VerificationRecord memory record = VerificationRecord({
            verifier: msg.sender,
            status: status,
            reportHash: reportHash,
            timestamp: block.timestamp,
            notes: notes
        });

        _verificationHistory[assetId].push(record);

        emit AssetVerified(assetId, msg.sender, status, reportHash, block.timestamp);
        emit AssetStatusChanged(assetId, oldStatus, status, block.timestamp);
    }

    /**
     * @notice Update asset valuation
     * @param assetId ID of the asset
     * @param newValuationUSD New valuation in USD (scaled by 1e6)
     */
    function updateValuation(uint256 assetId, uint256 newValuationUSD)
        external
        onlyRole(BRIDGE_ADMIN_ROLE)
    {
        require(_assets[assetId].assetId != 0, "Asset does not exist");

        TokenizedAsset storage asset = _assets[assetId];
        uint256 oldValuation = asset.valuationUSD;
        asset.valuationUSD = newValuationUSD;

        emit AssetValuationUpdated(assetId, oldValuation, newValuationUSD, block.timestamp);
    }

    /**
     * @notice Change asset custodian
     * @param assetId ID of the asset
     * @param newCustodian Address of the new custodian
     */
    function changeCustodian(uint256 assetId, address newCustodian)
        external
        onlyRole(BRIDGE_ADMIN_ROLE)
    {
        require(_assets[assetId].assetId != 0, "Asset does not exist");
        require(newCustodian != address(0), "Invalid custodian");

        TokenizedAsset storage asset = _assets[assetId];
        address oldCustodian = asset.custodian;
        asset.custodian = newCustodian;

        emit CustodianChanged(assetId, oldCustodian, newCustodian, block.timestamp);
    }

    // View functions

    /**
     * @notice Get asset details
     * @param assetId ID of the asset
     * @return TokenizedAsset struct
     */
    function getAsset(uint256 assetId)
        external
        view
        returns (TokenizedAsset memory)
    {
        require(_assets[assetId].assetId != 0, "Asset does not exist");
        return _assets[assetId];
    }

    /**
     * @notice Get asset by real-world identifier
     * @param realWorldIdentifier The real-world identifier
     * @return TokenizedAsset struct
     */
    function getAssetByRealWorldId(string memory realWorldIdentifier)
        external
        view
        returns (TokenizedAsset memory)
    {
        uint256 assetId = _realWorldIdToAssetId[realWorldIdentifier];
        require(assetId != 0, "Asset not found");
        return _assets[assetId];
    }

    /**
     * @notice Get all assets for a token contract
     * @param tokenContract Address of the token contract
     * @return Array of asset IDs
     */
    function getAssetsByToken(address tokenContract)
        external
        view
        returns (uint256[] memory)
    {
        return _assetsByToken[tokenContract];
    }

    /**
     * @notice Get all assets for an alliance
     * @param allianceId ID of the alliance
     * @return Array of asset IDs
     */
    function getAssetsByAlliance(uint256 allianceId)
        external
        view
        returns (uint256[] memory)
    {
        return _assetsByAlliance[allianceId];
    }

    /**
     * @notice Get verification history for an asset
     * @param assetId ID of the asset
     * @return Array of VerificationRecord structs
     */
    function getVerificationHistory(uint256 assetId)
        external
        view
        returns (VerificationRecord[] memory)
    {
        return _verificationHistory[assetId];
    }

    /**
     * @notice Get total number of tokenized assets
     * @return Total asset count
     */
    function getTotalAssets() external view returns (uint256) {
        return _assetCounter;
    }

    /**
     * @notice Calculate total valuation for an alliance
     * @param allianceId ID of the alliance
     * @return Total valuation in USD (scaled by 1e6)
     */
    function getAllianceTotalValuation(uint256 allianceId)
        external
        view
        returns (uint256)
    {
        uint256[] memory assetIds = _assetsByAlliance[allianceId];
        uint256 totalValuation = 0;

        for (uint256 i = 0; i < assetIds.length; i++) {
            TokenizedAsset storage asset = _assets[assetIds[i]];
            if (asset.status == VerificationStatus.Verified) {
                totalValuation += asset.valuationUSD;
            }
        }

        return totalValuation;
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
