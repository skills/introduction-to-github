// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title PharaohConsciousnessFusion
 * @author OmniTech1™
 * @notice ERC-721 NFT contract serving as the Fusion Engine for the ScrollVerse ecosystem
 * @dev Implements UUPS upgradeable pattern with enhanced voting power for DAO governance
 *
 * Features:
 * - UUPS Upgradeable proxy pattern for future enhancements
 * - ERC721 Enumerable for on-chain enumeration
 * - URI Storage for flexible metadata management
 * - Governance voting power multipliers based on token attributes
 * - Integration with ScrollVerse DAO
 *
 * Voting Power System:
 * - Genesis Sovereign Tier: 8.88x governance multiplier
 * - Eternal Guardian Tier: 4.44x governance multiplier
 * - Legacy Bearer Tier: 2.22x governance multiplier
 * - Wisdom Keeper Tier: 1.11x governance multiplier
 */
contract PharaohConsciousnessFusion is 
    Initializable,
    ERC721Upgradeable,
    ERC721EnumerableUpgradeable,
    ERC721URIStorageUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    // ========== CONSTANTS ==========

    /// @notice Maximum supply for the collection
    uint256 public constant MAX_SUPPLY = 8888;

    /// @notice Genesis Sovereign tier voting multiplier (8.88x = 888 basis points)
    uint256 public constant GENESIS_SOVEREIGN_MULTIPLIER = 888;

    /// @notice Eternal Guardian tier voting multiplier (4.44x = 444 basis points)
    uint256 public constant ETERNAL_GUARDIAN_MULTIPLIER = 444;

    /// @notice Legacy Bearer tier voting multiplier (2.22x = 222 basis points)
    uint256 public constant LEGACY_BEARER_MULTIPLIER = 222;

    /// @notice Wisdom Keeper tier voting multiplier (1.11x = 111 basis points)
    uint256 public constant WISDOM_KEEPER_MULTIPLIER = 111;

    /// @notice Multiplier base (100 = 1.00x)
    uint256 public constant MULTIPLIER_BASE = 100;

    // ========== ENUMS ==========

    /// @notice Token tier levels for voting power
    enum TokenTier {
        WisdomKeeper,      // 0 - Base tier (1.11x)
        LegacyBearer,      // 1 - (2.22x)
        EternalGuardian,   // 2 - (4.44x)
        GenesisSovereign   // 3 - Highest tier (8.88x)
    }

    // ========== STATE VARIABLES ==========

    /// @notice Base URI for token metadata
    string private _baseTokenURI;

    /// @notice Counter for token IDs
    uint256 private _tokenIdCounter;

    /// @notice Mapping from token ID to its tier
    mapping(uint256 => TokenTier) public tokenTiers;

    /// @notice Maximum tokens per tier
    mapping(TokenTier => uint256) public maxPerTier;

    /// @notice Current minted count per tier
    mapping(TokenTier => uint256) public mintedPerTier;

    /// @notice Pause state for minting
    bool public mintingPaused;

    // ========== EVENTS ==========

    /// @notice Emitted when a token is minted with its tier
    event TokenMinted(
        address indexed to,
        uint256 indexed tokenId,
        TokenTier tier,
        uint256 votingPower
    );

    /// @notice Emitted when the base URI is updated
    event BaseURIUpdated(string oldURI, string newURI);

    /// @notice Emitted when minting pause state is toggled
    event MintingPauseToggled(bool paused);

    /// @notice Emitted when voting power is queried
    event VotingPowerCalculated(
        address indexed holder,
        uint256 totalVotingPower,
        uint256 tokenCount
    );

    // ========== ERRORS ==========

    error MaxSupplyReached();
    error TierSupplyReached(TokenTier tier);
    error MintingPaused();
    error TokenDoesNotExist();

    // ========== INITIALIZER ==========

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initializes the contract with name, symbol, and base URI
     * @param initialOwner Address of the initial contract owner
     * @param baseURI Base URI for token metadata
     * @dev This function replaces the constructor for upgradeable contracts
     */
    function initialize(
        address initialOwner,
        string memory baseURI
    ) public initializer {
        __ERC721_init("Pharaoh Consciousness Fusion", "PFC");
        __ERC721Enumerable_init();
        __ERC721URIStorage_init();
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();

        _baseTokenURI = baseURI;

        // Initialize tier supply limits based on ScrollVerse framework
        maxPerTier[TokenTier.GenesisSovereign] = 8;
        maxPerTier[TokenTier.EternalGuardian] = 80;
        maxPerTier[TokenTier.LegacyBearer] = 800;
        maxPerTier[TokenTier.WisdomKeeper] = 8000;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Votes.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title PharaohConsciousnessFusion (PFC-NFT)
 * @author OmniTech1™
 * @notice Sacred NFT collection representing consciousness fusion within the ScrollVerse ecosystem
 * @dev ERC-721 with voting capabilities for DAO governance integration
 * 
 * The PFC-NFT is a foundational component of the ScrollVerse ecosystem:
 * - Grants holders access to exclusive governance participation
 * - Integrated with ScrollVerseDAO for enhanced voting weight
 * - Features consciousness levels that evolve with participation
 * - Supports delegation of voting power
 * 
 * Consciousness Levels:
 * - Awakening (Level 1): Initial mint state
 * - Ascending (Level 2): Active participation milestone
 * - Transcendent (Level 3): Community contributor status
 * - Divine (Level 4): Elite governance participant
 * - Pharaoh (Level 5): Maximum consciousness achievement
 */
contract PharaohConsciousnessFusion is 
    ERC721, 
    ERC721Enumerable, 
    ERC721URIStorage,
    ERC721Votes,
    AccessControl, 
    Pausable, 
    ReentrancyGuard 
{
    // ========== ROLES ==========

    /// @notice Role for minting new tokens
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /// @notice Role for administrative functions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    /// @notice Role for upgrading consciousness levels
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    // ========== ENUMS ==========

    /// @notice Consciousness levels for PFC-NFTs
    enum ConsciousnessLevel {
        Awakening,      // Level 1 - Initial state
        Ascending,      // Level 2 - Active participation
        Transcendent,   // Level 3 - Community contributor
        Divine,         // Level 4 - Elite governance
        Pharaoh         // Level 5 - Maximum achievement
    }

    // ========== STRUCTS ==========

    /// @notice Token metadata structure
    struct TokenData {
        ConsciousnessLevel level;
        uint256 mintTimestamp;
        uint256 lastUpgradeTimestamp;
        uint256 participationScore;
        bool isActive;
    }

    // ========== CONSTANTS ==========

    /// @notice Maximum supply of PFC-NFTs
    uint256 public constant MAX_SUPPLY = 5000;

    /// @notice Mint price in wei (0.1 ETH)
    uint256 public constant MINT_PRICE = 0.1 ether;

    // ========== STATE VARIABLES ==========

    /// @notice Token ID counter
    uint256 private _nextTokenId;

    /// @notice Base URI for metadata
    string private _baseTokenURI;

    /// @notice Mapping of token ID to token data
    mapping(uint256 => TokenData) public tokenData;

    /// @notice Address of the ScrollVerseDAO contract
    address public daoAddress;

    /// @notice Address of the treasury for minting proceeds
    address public treasuryAddress;

    // ========== EVENTS ==========

    /// @notice Emitted when a new token is minted
    event TokenMinted(
        address indexed to,
        uint256 indexed tokenId,
        ConsciousnessLevel level,
        uint256 timestamp
    );

    /// @notice Emitted when a token's consciousness level is upgraded
    event ConsciousnessUpgraded(
        uint256 indexed tokenId,
        ConsciousnessLevel oldLevel,
        ConsciousnessLevel newLevel,
        uint256 timestamp
    );

    /// @notice Emitted when participation score is updated
    event ParticipationScoreUpdated(
        uint256 indexed tokenId,
        uint256 oldScore,
        uint256 newScore
    );

    /// @notice Emitted when DAO address is updated
    event DaoAddressUpdated(
        address indexed oldAddress,
        address indexed newAddress
    );

    /// @notice Emitted when treasury address is updated
    event TreasuryAddressUpdated(
        address indexed oldAddress,
        address indexed newAddress
    );

    /// @notice Emitted when base URI is updated
    event BaseURIUpdated(string newBaseURI);

    /// @notice Emitted when funds are withdrawn
    event FundsWithdrawn(address indexed to, uint256 amount);

    // ========== ERRORS ==========

    error MaxSupplyReached();
    error InsufficientPayment(uint256 required, uint256 provided);
    error InvalidAddress();
    error TokenDoesNotExist(uint256 tokenId);
    error AlreadyMaxLevel();
    error NotTokenOwner();
    error TransferFailed();
    error InvalidLevel();

    // ========== CONSTRUCTOR ==========

    /**
     * @notice Deploys the PharaohConsciousnessFusion contract
     * @param _initialAdmin Address of the initial admin
     * @param _treasury Address of the treasury
     * @param baseURI Base URI for token metadata
     */
    constructor(
        address _initialAdmin,
        address _treasury,
        string memory baseURI
    ) 
        ERC721("PharaohConsciousnessFusion", "PFC")
        EIP712("PharaohConsciousnessFusion", "1")
    {
        if (_initialAdmin == address(0)) revert InvalidAddress();
        if (_treasury == address(0)) revert InvalidAddress();

        _grantRole(DEFAULT_ADMIN_ROLE, _initialAdmin);
        _grantRole(ADMIN_ROLE, _initialAdmin);
        _grantRole(MINTER_ROLE, _initialAdmin);
        _grantRole(UPGRADER_ROLE, _initialAdmin);

        treasuryAddress = _treasury;
        _baseTokenURI = baseURI;
    }

    // ========== EXTERNAL FUNCTIONS ==========

    /**
     * @notice Mint a new token with specified tier
     * @param to Address to receive the token
     * @param tier Token tier determining voting power
     * @return tokenId The ID of the minted token
     */
    function mint(address to, TokenTier tier) external onlyOwner returns (uint256 tokenId) {
        if (mintingPaused) revert MintingPaused();
        if (_tokenIdCounter >= MAX_SUPPLY) revert MaxSupplyReached();
        if (mintedPerTier[tier] >= maxPerTier[tier]) revert TierSupplyReached(tier);

        tokenId = _tokenIdCounter++;
        mintedPerTier[tier]++;
        tokenTiers[tokenId] = tier;

        _safeMint(to, tokenId);

        uint256 votingPower = getVotingMultiplier(tier);
        emit TokenMinted(to, tokenId, tier, votingPower);
     * @notice Mint a new PFC-NFT
     * @return tokenId The ID of the minted token
     */
    function mint() external payable whenNotPaused nonReentrant returns (uint256) {
        if (_nextTokenId >= MAX_SUPPLY) revert MaxSupplyReached();
        if (msg.value < MINT_PRICE) revert InsufficientPayment(MINT_PRICE, msg.value);

        uint256 tokenId = _nextTokenId;
        unchecked {
            _nextTokenId++;
        }

        _safeMint(msg.sender, tokenId);

        tokenData[tokenId] = TokenData({
            level: ConsciousnessLevel.Awakening,
            mintTimestamp: block.timestamp,
            lastUpgradeTimestamp: block.timestamp,
            participationScore: 0,
            isActive: true
        });

        emit TokenMinted(msg.sender, tokenId, ConsciousnessLevel.Awakening, block.timestamp);

        // Refund excess payment
        if (msg.value > MINT_PRICE) {
            uint256 refund = msg.value - MINT_PRICE;
            (bool success, ) = payable(msg.sender).call{value: refund}("");
            if (!success) revert TransferFailed();
        }

        return tokenId;
    }

    /**
     * @notice Admin mint function for airdrops and rewards
     * @param to Recipient address
     * @param level Initial consciousness level
     * @return tokenId The ID of the minted token
     */
    function adminMint(address to, ConsciousnessLevel level) 
        external 
        onlyRole(MINTER_ROLE) 
        returns (uint256) 
    {
        if (_nextTokenId >= MAX_SUPPLY) revert MaxSupplyReached();
        if (to == address(0)) revert InvalidAddress();

        uint256 tokenId = _nextTokenId;
        unchecked {
            _nextTokenId++;
        }

        _safeMint(to, tokenId);

        tokenData[tokenId] = TokenData({
            level: level,
            mintTimestamp: block.timestamp,
            lastUpgradeTimestamp: block.timestamp,
            participationScore: 0,
            isActive: true
        });

        emit TokenMinted(to, tokenId, level, block.timestamp);

        return tokenId;
    }

    /**
     * @notice Batch mint tokens to multiple recipients
     * @param recipients Array of addresses to receive tokens
     * @param tiers Array of tiers for each token
     */
    function batchMint(
        address[] calldata recipients,
        TokenTier[] calldata tiers
    ) external onlyOwner {
        require(recipients.length == tiers.length, "Array length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            if (mintingPaused) revert MintingPaused();
            if (_tokenIdCounter >= MAX_SUPPLY) revert MaxSupplyReached();
            if (mintedPerTier[tiers[i]] >= maxPerTier[tiers[i]]) revert TierSupplyReached(tiers[i]);

            uint256 tokenId = _tokenIdCounter++;
            mintedPerTier[tiers[i]]++;
            tokenTiers[tokenId] = tiers[i];

            _safeMint(recipients[i], tokenId);

            uint256 votingPower = getVotingMultiplier(tiers[i]);
            emit TokenMinted(recipients[i], tokenId, tiers[i], votingPower);
        }
    }

    /**
     * @notice Set the base URI for token metadata
     * @param newBaseURI The new base URI
     */
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        string memory oldURI = _baseTokenURI;
        _baseTokenURI = newBaseURI;
        emit BaseURIUpdated(oldURI, newBaseURI);
    }

    /**
     * @notice Toggle minting pause state
     */
    function toggleMintingPause() external onlyOwner {
        mintingPaused = !mintingPaused;
        emit MintingPauseToggled(mintingPaused);
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @notice Get the voting multiplier for a specific tier
     * @param tier The token tier
     * @return The voting multiplier in basis points (100 = 1.00x)
     */
    function getVotingMultiplier(TokenTier tier) public pure returns (uint256) {
        if (tier == TokenTier.GenesisSovereign) return GENESIS_SOVEREIGN_MULTIPLIER;
        if (tier == TokenTier.EternalGuardian) return ETERNAL_GUARDIAN_MULTIPLIER;
        if (tier == TokenTier.LegacyBearer) return LEGACY_BEARER_MULTIPLIER;
        return WISDOM_KEEPER_MULTIPLIER;
    }

    /**
     * @notice Calculate total voting power for an address
     * @param holder The address to calculate voting power for
     * @return totalPower The total voting power in basis points
     */
    function getVotingPower(address holder) external view returns (uint256 totalPower) {
        uint256 balance = balanceOf(holder);
        
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(holder, i);
            TokenTier tier = tokenTiers[tokenId];
            totalPower += getVotingMultiplier(tier);
        }

        return totalPower;
    }

    /**
     * @notice Get the tier of a specific token
     * @param tokenId The token ID
     * @return The tier of the token
     */
    function getTokenTier(uint256 tokenId) external view returns (TokenTier) {
        if (tokenId >= _tokenIdCounter) revert TokenDoesNotExist();
        return tokenTiers[tokenId];
    }

    /**
     * @notice Get current supply information
     * @return totalMinted Total tokens minted
     * @return maxSupply Maximum supply
     * @return genesisMinted Genesis Sovereign tokens minted
     * @return eternalMinted Eternal Guardian tokens minted
     * @return legacyMinted Legacy Bearer tokens minted
     * @return wisdomMinted Wisdom Keeper tokens minted
     */
    function getSupplyInfo() external view returns (
        uint256 totalMinted,
        uint256 maxSupply,
        uint256 genesisMinted,
        uint256 eternalMinted,
        uint256 legacyMinted,
        uint256 wisdomMinted
    ) {
        return (
            _tokenIdCounter,
            MAX_SUPPLY,
            mintedPerTier[TokenTier.GenesisSovereign],
            mintedPerTier[TokenTier.EternalGuardian],
            mintedPerTier[TokenTier.LegacyBearer],
            mintedPerTier[TokenTier.WisdomKeeper]
        );
    }

    /**
     * @notice Get remaining supply per tier
     * @param tier The token tier
     * @return remaining Remaining tokens that can be minted for this tier
     */
    function getRemainingTierSupply(TokenTier tier) external view returns (uint256 remaining) {
        return maxPerTier[tier] - mintedPerTier[tier];
    }

    /**
     * @notice Get all token IDs owned by an address
     * @param owner The address to query
     * @return tokenIds Array of token IDs owned by the address
     */
    function getTokensOfOwner(address owner) external view returns (uint256[] memory tokenIds) {
        uint256 balance = balanceOf(owner);
        tokenIds = new uint256[](balance);
        
        for (uint256 i = 0; i < balance; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return tokenIds;
     * @notice Upgrade a token's consciousness level
     * @param tokenId Token ID to upgrade
     */
    function upgradeConsciousness(uint256 tokenId) external onlyRole(UPGRADER_ROLE) {
        if (tokenId >= _nextTokenId) revert TokenDoesNotExist(tokenId);
        
        TokenData storage data = tokenData[tokenId];
        if (data.level == ConsciousnessLevel.Pharaoh) revert AlreadyMaxLevel();

        ConsciousnessLevel oldLevel = data.level;
        data.level = ConsciousnessLevel(uint8(oldLevel) + 1);
        data.lastUpgradeTimestamp = block.timestamp;

        emit ConsciousnessUpgraded(tokenId, oldLevel, data.level, block.timestamp);
    }

    /**
     * @notice Update participation score for a token
     * @param tokenId Token ID to update
     * @param score New participation score
     */
    function updateParticipationScore(uint256 tokenId, uint256 score) 
        external 
        onlyRole(UPGRADER_ROLE) 
    {
        if (tokenId >= _nextTokenId) revert TokenDoesNotExist(tokenId);
        
        uint256 oldScore = tokenData[tokenId].participationScore;
        tokenData[tokenId].participationScore = score;

        emit ParticipationScoreUpdated(tokenId, oldScore, score);
    }

    /**
     * @notice Set the DAO address for governance integration
     * @param _daoAddress New DAO address
     */
    function setDaoAddress(address _daoAddress) external onlyRole(ADMIN_ROLE) {
        if (_daoAddress == address(0)) revert InvalidAddress();
        
        address oldAddress = daoAddress;
        daoAddress = _daoAddress;

        emit DaoAddressUpdated(oldAddress, _daoAddress);
    }

    /**
     * @notice Set the treasury address
     * @param _treasuryAddress New treasury address
     */
    function setTreasuryAddress(address _treasuryAddress) external onlyRole(ADMIN_ROLE) {
        if (_treasuryAddress == address(0)) revert InvalidAddress();
        
        address oldAddress = treasuryAddress;
        treasuryAddress = _treasuryAddress;

        emit TreasuryAddressUpdated(oldAddress, _treasuryAddress);
    }

    /**
     * @notice Update base URI for metadata
     * @param newBaseURI New base URI
     */
    function setBaseURI(string memory newBaseURI) external onlyRole(ADMIN_ROLE) {
        _baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }

    /**
     * @notice Pause the contract
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @notice Withdraw contract balance to treasury
     */
    function withdraw() external onlyRole(ADMIN_ROLE) nonReentrant {
        uint256 balance = address(this).balance;
        if (balance == 0) revert TransferFailed();

        (bool success, ) = payable(treasuryAddress).call{value: balance}("");
        if (!success) revert TransferFailed();

        emit FundsWithdrawn(treasuryAddress, balance);
    }

    /**
     * @notice Transfer admin roles to DAO for decentralization
     * @param _daoAddress Address of the ScrollVerseDAO
     */
    function transferToDAO(address _daoAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_daoAddress == address(0)) revert InvalidAddress();

        // Grant all roles to DAO
        _grantRole(DEFAULT_ADMIN_ROLE, _daoAddress);
        _grantRole(ADMIN_ROLE, _daoAddress);
        _grantRole(MINTER_ROLE, _daoAddress);
        _grantRole(UPGRADER_ROLE, _daoAddress);

        // Set DAO address
        daoAddress = _daoAddress;

        emit DaoAddressUpdated(address(0), _daoAddress);
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @notice Get the level name for a consciousness level
     * @param level The consciousness level
     * @return The name as a string
     * @dev Uses a pure function to avoid storage reads for gas efficiency
     */
    function _getLevelName(ConsciousnessLevel level) internal pure returns (string memory) {
        if (level == ConsciousnessLevel.Awakening) return "Awakening";
        if (level == ConsciousnessLevel.Ascending) return "Ascending";
        if (level == ConsciousnessLevel.Transcendent) return "Transcendent";
        if (level == ConsciousnessLevel.Divine) return "Divine";
        return "Pharaoh";
    }

    /**
     * @notice Get the consciousness level of a token
     * @param tokenId Token ID to check
     * @return level The consciousness level as enum
     * @return levelName The consciousness level as string
     */
    function getConsciousnessLevel(uint256 tokenId) external view returns (
        ConsciousnessLevel level,
        string memory levelName
    ) {
        if (tokenId >= _nextTokenId) revert TokenDoesNotExist(tokenId);
        
        level = tokenData[tokenId].level;
        levelName = _getLevelName(level);
    }

    /**
     * @notice Get full token data
     * @param tokenId Token ID to query
     * @return level Consciousness level
     * @return mintTimestamp When the token was minted
     * @return lastUpgradeTimestamp When the token was last upgraded
     * @return participationScore Current participation score
     * @return isActive Whether the token is active
     */
    function getTokenData(uint256 tokenId) external view returns (
        ConsciousnessLevel level,
        uint256 mintTimestamp,
        uint256 lastUpgradeTimestamp,
        uint256 participationScore,
        bool isActive
    ) {
        if (tokenId >= _nextTokenId) revert TokenDoesNotExist(tokenId);
        
        TokenData memory data = tokenData[tokenId];
        return (
            data.level,
            data.mintTimestamp,
            data.lastUpgradeTimestamp,
            data.participationScore,
            data.isActive
        );
    }

    /**
     * @notice Get total supply minted
     * @return Number of tokens minted
     */
    function totalMinted() external view returns (uint256) {
        return _nextTokenId;
    }

    /**
     * @notice Get remaining supply
     * @return Number of tokens remaining
     */
    function remainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - _nextTokenId;
    }

    /**
     * @notice Check if an address holds any PFC-NFT
     * @param account Address to check
     * @return True if the address holds at least one token
     */
    function isHolder(address account) external view returns (bool) {
        return balanceOf(account) > 0;
    }

    /**
     * @notice Get the highest consciousness level owned by an address
     * @param account Address to check
     * @return highestLevel The highest consciousness level
     * @return tokenId The token ID with the highest level
     */
    function getHighestConsciousness(address account) external view returns (
        ConsciousnessLevel highestLevel,
        uint256 tokenId
    ) {
        uint256 balance = balanceOf(account);
        if (balance == 0) return (ConsciousnessLevel.Awakening, 0);

        highestLevel = ConsciousnessLevel.Awakening;
        tokenId = 0;

        for (uint256 i = 0; i < balance; i++) {
            uint256 ownedTokenId = tokenOfOwnerByIndex(account, i);
            ConsciousnessLevel level = tokenData[ownedTokenId].level;
            if (uint8(level) > uint8(highestLevel)) {
                highestLevel = level;
                tokenId = ownedTokenId;
            }
        }
    }

    // ========== OVERRIDE FUNCTIONS ==========

    /**
     * @dev Base URI for computing {tokenURI}
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Authorizes upgrades to the contract (UUPS pattern)
     * @param newImplementation Address of the new implementation
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /**
     * @dev Override for ERC721 and ERC721Enumerable
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable, ERC721Votes)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Override for ERC721 and ERC721Enumerable
     */
    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable, ERC721Votes)
    {
        super._increaseBalance(account, value);
    }

    /**
     * @dev Override tokenURI for ERC721URIStorage
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Override supportsInterface for multiple inheritance
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable, ERC721URIStorageUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
     * @notice Get current voting units (clock) for ERC721Votes
     */
    function clock() public view override returns (uint48) {
        return uint48(block.timestamp);
    }

    /**
     * @notice Get clock mode for ERC721Votes
     */
    // solhint-disable-next-line func-name-mixedcase
    function CLOCK_MODE() public pure override returns (string memory) {
        return "mode=timestamp";
    }
}
