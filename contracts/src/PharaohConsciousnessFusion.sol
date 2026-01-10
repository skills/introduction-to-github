// Sovereign Chais owns every yield
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PharaohConsciousnessFusion
 * @author OmniTech1™
 * @notice ERC-721 NFT collection representing consciousness fusion artifacts for ScrollVerse governance
 * @dev Implements enumerable, URI storage, pausable, and governance integration features
 * 
 * Collection Features:
 * - Maximum Supply: 888 Divine Artifacts
 * - Tier System: Initiate, Guardian, Ascended, Pharaoh
 * - Governance Weight: Higher tiers provide more voting power boost
 * - Staking Compatible: Works with MirrorStaking for enhanced rewards
 * 
 * Tier Distribution:
 * - Pharaoh (Tier 4): 8 tokens (1x governance boost)
 * - Ascended (Tier 3): 80 tokens (0.5x governance boost)
 * - Guardian (Tier 2): 200 tokens (0.25x governance boost)
 * - Initiate (Tier 1): 600 tokens (0.1x governance boost)
 * 
 * Sovereignty:
 * - Sovereign Chais owns every yield - sole ownership, no split, no echo
 */
contract PharaohConsciousnessFusion is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    ERC721Pausable,
    Ownable,
    ReentrancyGuard
{
    // ========== ENUMS ==========

    /// @notice Tier levels for the NFTs
    enum Tier { None, Initiate, Guardian, Ascended, Pharaoh }

    // ========== STRUCTS ==========

    /// @notice Token metadata and attributes
    struct TokenData {
        Tier tier;
        uint256 mintTimestamp;
        uint256 fusionLevel;
        bool isStaked;
        string consciousnessSignature;
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title PharaohConsciousnessFusion
 * @author OmniTech1™
 * @notice "Consciousness Mirror" NFT collection with UUPS upgradeability
 * @dev ERC721 NFT with the following features:
 * 
 * Features:
 * - Fixed supply (3333 tokens)
 * - Allowlist mint restrictions with audit logging
 * - Post-mint lock (prevents URI updates after all NFTs minted)
 * - Sovereign Chais owns every yield - sole ownership, no royalty split
 * - UUPS proxy architecture for future upgrades
 * - Pausable mechanics
 * - Governance voting powers based on token holdings
 * 
 * Gas Optimizations:
 * - Packed storage variables
 * - Unchecked arithmetic where safe
 * - Efficient event emission
 */
contract PharaohConsciousnessFusion is 
    Initializable,
    ERC721Upgradeable, 
    ERC721EnumerableUpgradeable, 
    ERC721URIStorageUpgradeable,
    OwnableUpgradeable, 
    PausableUpgradeable, 
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    // ========== CONSTANTS ==========
    
    /// @notice Maximum supply of the collection
    uint256 public constant MAX_SUPPLY = 3333;
    
    /// @notice Maximum addresses per allowlist batch operation
    uint256 public constant MAX_BATCH_SIZE = 100;

    // ========== STATE VARIABLES ==========
    
    /// @notice Token ID counter
    uint256 private _nextTokenId;
    
    /// @notice Base URI for token metadata
    string private _baseTokenURI;
    
    /// @notice Flag to indicate if metadata is locked (after mint completion)
    bool public metadataLocked;
    
    /// @notice Mint price in wei
    uint256 public mintPrice;
    
    /// @notice Allowlist mint price (discounted)
    uint256 public allowlistPrice;
    
    /// @notice Allowlist status mapping
    mapping(address => bool) public allowlist;
    
    /// @notice Minting phase flags
    bool public allowlistMintActive;
    bool public publicMintActive;
    
    /// @notice Maximum tokens per wallet during allowlist
    uint256 public maxPerWalletAllowlist;
    
    /// @notice Maximum tokens per wallet during public mint
    uint256 public maxPerWalletPublic;
    
    /// @notice Track mints per wallet
    mapping(address => uint256) public mintedCount;
    
    /// @notice Governance voting power per token (default 1 vote per token)
    uint256 public votingPowerPerToken;

    // ========== EVENTS ==========
    
    /// @notice Emitted when a token is minted
    event ConsciousnessMinted(address indexed to, uint256 indexed tokenId);
    
    /// @notice Emitted when base URI is updated
    event BaseURIUpdated(string newBaseURI);
    
    /// @notice Emitted when metadata is permanently locked
    event MetadataLocked();
    
    /// @notice Emitted when an address is added to allowlist (for audit)
    event AllowlistAdded(address indexed account, address indexed addedBy, uint256 timestamp);
    
    /// @notice Emitted when an address is removed from allowlist (for audit)
    event AllowlistRemoved(address indexed account, address indexed removedBy, uint256 timestamp);
    
    /// @notice Emitted when mint phase changes
    event MintPhaseUpdated(bool allowlistActive, bool publicActive);
    
    /// @notice Emitted when prices are updated
    event PricesUpdated(uint256 mintPrice, uint256 allowlistPrice);
    
    /// @notice Emitted when funds are withdrawn
    event Withdrawn(address indexed to, uint256 amount);

    // ========== ERRORS ==========
    
    error MaxSupplyReached();
    error MetadataIsLocked();
    error NotOnAllowlist();
    error AllowlistMintNotActive();
    error PublicMintNotActive();
    error InsufficientPayment();
    error ExceedsMaxPerWallet();
    error BatchSizeTooLarge();
    error InvalidAddress();
    error NoFundsToWithdraw();
    error WithdrawalFailed();
    error MintingNotComplete();

    // ========== MODIFIERS ==========
    
    /// @notice Ensures metadata is not locked
    modifier whenMetadataUnlocked() {
        if (metadataLocked) revert MetadataIsLocked();
        _;
    }

    // ========== INITIALIZER ==========
    
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
     * @notice Initializes the contract (called once via proxy)
     * @param initialOwner Address of the initial contract owner
     * @param baseURI Initial base URI for token metadata
     * @param _mintPrice Price for public mint in wei
     * @param _allowlistPrice Price for allowlist mint in wei
     */
    function initialize(
        address initialOwner,
        string memory baseURI,
        uint256 _mintPrice,
        uint256 _allowlistPrice
    ) public initializer {
        __ERC721_init("Consciousness Mirror", "CMIRROR");
        __ERC721Enumerable_init();
        __ERC721URIStorage_init();
        __Ownable_init(initialOwner);
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
        
        _baseTokenURI = baseURI;
        mintPrice = _mintPrice;
        allowlistPrice = _allowlistPrice;
        
        // Set default limits
        maxPerWalletAllowlist = 3;
        maxPerWalletPublic = 5;
        votingPowerPerToken = 1;
    }

    // ========== MINTING FUNCTIONS ==========
    
    /**
     * @notice Mint during allowlist phase
     * @param quantity Number of tokens to mint
     */
    function allowlistMint(uint256 quantity) 
        external 
        payable 
        whenNotPaused 
        nonReentrant 
    {
        if (!allowlistMintActive) revert AllowlistMintNotActive();
        if (!allowlist[msg.sender]) revert NotOnAllowlist();
        if (_nextTokenId + quantity > MAX_SUPPLY) revert MaxSupplyReached();
        if (mintedCount[msg.sender] + quantity > maxPerWalletAllowlist) revert ExceedsMaxPerWallet();
        if (msg.value < allowlistPrice * quantity) revert InsufficientPayment();
        
        _mintTokens(msg.sender, quantity);
        
        // Refund excess payment
        _refundExcess(allowlistPrice * quantity);
    }
    
    /**
     * @notice Mint during public phase
     * @param quantity Number of tokens to mint
     */
    function publicMint(uint256 quantity) 
        external 
        payable 
        whenNotPaused 
        nonReentrant 
    {
        if (!publicMintActive) revert PublicMintNotActive();
        if (_nextTokenId + quantity > MAX_SUPPLY) revert MaxSupplyReached();
        if (mintedCount[msg.sender] + quantity > maxPerWalletPublic) revert ExceedsMaxPerWallet();
        if (msg.value < mintPrice * quantity) revert InsufficientPayment();
        
        _mintTokens(msg.sender, quantity);
        
        // Refund excess payment
        _refundExcess(mintPrice * quantity);
    }
    
    /**
     * @notice Owner mint for airdrops/reserves
     * @param to Recipient address
     * @param quantity Number of tokens to mint
     */
    function ownerMint(address to, uint256 quantity) 
        external 
        onlyOwner 
    {
        if (to == address(0)) revert InvalidAddress();
        if (_nextTokenId + quantity > MAX_SUPPLY) revert MaxSupplyReached();
        
        _mintTokens(to, quantity);
    }
    
    /**
     * @dev Internal function to mint tokens
     * @param to Recipient address
     * @param quantity Number of tokens to mint
     */
    function _mintTokens(address to, uint256 quantity) internal {
        uint256 startTokenId = _nextTokenId;
        
        unchecked {
            for (uint256 i = 0; i < quantity; ++i) {
                uint256 tokenId = startTokenId + i;
                _safeMint(to, tokenId);
                emit ConsciousnessMinted(to, tokenId);
            }
            _nextTokenId = startTokenId + quantity;
            mintedCount[to] += quantity;
        }
    }
    
    /**
     * @dev Refund excess payment
     * @param requiredAmount The required payment amount
     */
    function _refundExcess(uint256 requiredAmount) internal {
        if (msg.value > requiredAmount) {
            uint256 refund;
            unchecked {
                refund = msg.value - requiredAmount;
            }
            (bool success, ) = payable(msg.sender).call{value: refund}("");
            if (!success) revert WithdrawalFailed();
        }
    }

    // ========== ALLOWLIST MANAGEMENT (WITH AUDIT EVENTS) ==========
    
    /**
     * @notice Add addresses to allowlist with audit logging
     * @param addresses Array of addresses to add
     * @dev Gas optimized: caches address in local variable, skips zero addresses and duplicates
     */
    function addToAllowlist(address[] calldata addresses) external onlyOwner {
        if (addresses.length > MAX_BATCH_SIZE) revert BatchSizeTooLarge();
        
        uint256 timestamp = block.timestamp;
        address sender = msg.sender;
        uint256 len = addresses.length;
        
        unchecked {
            for (uint256 i = 0; i < len; ++i) {
                address addr = addresses[i];
                if (addr != address(0) && !allowlist[addr]) {
                    allowlist[addr] = true;
                    emit AllowlistAdded(addr, sender, timestamp);
                }
            }
        }
    }
    
    /**
     * @notice Remove addresses from allowlist with audit logging
     * @param addresses Array of addresses to remove
     * @dev Gas optimized: caches address in local variable, skips addresses not on list
     */
    function removeFromAllowlist(address[] calldata addresses) external onlyOwner {
        if (addresses.length > MAX_BATCH_SIZE) revert BatchSizeTooLarge();
        
        uint256 timestamp = block.timestamp;
        address sender = msg.sender;
        uint256 len = addresses.length;
        
        unchecked {
            for (uint256 i = 0; i < len; ++i) {
                address addr = addresses[i];
                if (allowlist[addr]) {
                    allowlist[addr] = false;
                    emit AllowlistRemoved(addr, sender, timestamp);
                }
            }
        }
    }
    
    /**
     * @notice Check if an address is on the allowlist
     * @param account Address to check
     * @return bool True if on allowlist
     */
    function isOnAllowlist(address account) external view returns (bool) {
        return allowlist[account];
    }

    // ========== POST-MINT LOCK (METADATA IMMUTABILITY) ==========
    
    /**
     * @notice Set the base URI for token metadata
     * @param newBaseURI New base URI string
     * @dev Can only be called before metadata is locked
     */
    function setBaseURI(string memory newBaseURI) external onlyOwner whenMetadataUnlocked {
        _baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }
    
    /**
     * @notice Permanently lock metadata (can only be called after all tokens minted)
     * @dev This action is irreversible. Once locked, setBaseURI cannot be called.
     */
    function lockMetadata() external onlyOwner {
        if (_nextTokenId < MAX_SUPPLY) revert MintingNotComplete();
        metadataLocked = true;
        emit MetadataLocked();
    }

    // ========== GOVERNANCE VOTING POWER ==========
    
    /**
     * @notice Get voting power for a specific token
     * @param tokenId Token ID to query
     * @return uint256 Voting power (default: votingPowerPerToken)
     */
    function getVotingPower(uint256 tokenId) external view returns (uint256) {
        // Verify token exists
        _requireOwned(tokenId);
        return votingPowerPerToken;
    }
    
    /**
     * @notice Get total voting power for an address
     * @param account Address to query
     * @return uint256 Total voting power based on token holdings
     */
    function getTotalVotingPower(address account) external view returns (uint256) {
        return balanceOf(account) * votingPowerPerToken;
    }
    
    /**
     * @notice Update voting power per token (owner only)
     * @param newVotingPower New voting power value
     */
    function setVotingPowerPerToken(uint256 newVotingPower) external onlyOwner {
        votingPowerPerToken = newVotingPower;
    }

    // ========== PHASE MANAGEMENT ==========
    
    /**
     * @notice Set mint phases
     * @param _allowlistActive Enable/disable allowlist mint
     * @param _publicActive Enable/disable public mint
     */
    function setMintPhases(bool _allowlistActive, bool _publicActive) external onlyOwner {
        allowlistMintActive = _allowlistActive;
        publicMintActive = _publicActive;
        emit MintPhaseUpdated(_allowlistActive, _publicActive);
    }
    
    /**
     * @notice Set mint prices
     * @param _mintPrice Public mint price
     * @param _allowlistPrice Allowlist mint price
     */
    function setPrices(uint256 _mintPrice, uint256 _allowlistPrice) external onlyOwner {
        mintPrice = _mintPrice;
        allowlistPrice = _allowlistPrice;
        emit PricesUpdated(_mintPrice, _allowlistPrice);
    }
    
    /**
     * @notice Set maximum tokens per wallet
     * @param _maxAllowlist Max during allowlist
     * @param _maxPublic Max during public
     */
    function setMaxPerWallet(uint256 _maxAllowlist, uint256 _maxPublic) external onlyOwner {
        maxPerWalletAllowlist = _maxAllowlist;
        maxPerWalletPublic = _maxPublic;
    }

    // ========== PAUSABLE ==========
    
    /**
     * @notice Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ========== WITHDRAWAL ==========
    
    /**
     * @notice Withdraw contract balance
     */
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        if (balance == 0) revert NoFundsToWithdraw();
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        if (!success) revert WithdrawalFailed();
        
        emit Withdrawn(owner(), balance);
    }

    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @notice Get total minted tokens
     * @return uint256 Number of tokens minted
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

    /// @notice Maximum supply of NFTs
    uint256 public constant MAX_SUPPLY = 888;

    /// @notice Supply limits per tier
    uint256 public constant PHARAOH_SUPPLY = 8;
    uint256 public constant ASCENDED_SUPPLY = 80;
    uint256 public constant GUARDIAN_SUPPLY = 200;
    uint256 public constant INITIATE_SUPPLY = 600;

    /// @notice Governance weight multipliers (basis points, 10000 = 1x)
    uint256 public constant PHARAOH_WEIGHT = 10000;   // 1x boost
    uint256 public constant ASCENDED_WEIGHT = 5000;   // 0.5x boost
    uint256 public constant GUARDIAN_WEIGHT = 2500;   // 0.25x boost
    uint256 public constant INITIATE_WEIGHT = 1000;   // 0.1x boost

    // ========== STATE VARIABLES ==========

    /// @notice Current token ID counter
    uint256 private _tokenIdCounter;

    /// @notice Base URI for token metadata
    string private _baseTokenURI;

    /// @notice Token data mapping
    mapping(uint256 => TokenData) public tokenData;

    /// @notice Tier mint counts
    mapping(Tier => uint256) public tierMintCount;

    /// @notice Address of the staking contract (can stake NFTs)
    address public stakingContract;

    /// @notice Address of the DAO contract (for governance integration)
    address public daoContract;

    /// @notice Mint price per tier (can be set by owner)
    mapping(Tier => uint256) public mintPrice;

    /// @notice Whitelist for minting
    mapping(address => bool) public whitelist;

    /// @notice Whether public minting is enabled
    bool public publicMintEnabled;

    // ========== EVENTS ==========

    /// @notice Emitted when a new NFT is minted
    event NFTMinted(
        address indexed recipient,
        uint256 indexed tokenId,
        Tier tier,
        string consciousnessSignature
    );

    /// @notice Emitted when an NFT is staked
    event NFTStaked(uint256 indexed tokenId, address indexed owner);

    /// @notice Emitted when an NFT is unstaked
    event NFTUnstaked(uint256 indexed tokenId, address indexed owner);

    /// @notice Emitted when fusion level is upgraded
    event FusionLevelUpgraded(uint256 indexed tokenId, uint256 newLevel);

    /// @notice Emitted when staking contract is updated
    event StakingContractUpdated(address indexed oldContract, address indexed newContract);

    /// @notice Emitted when DAO contract is updated
    event DAOContractUpdated(address indexed oldContract, address indexed newContract);

    /// @notice Emitted when whitelist status is updated
    event WhitelistUpdated(address indexed account, bool status);

    /// @notice Emitted when public minting is toggled
    event PublicMintToggled(bool enabled);
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
    error TierSupplyReached(Tier tier);
    error InvalidTier();
    error NotWhitelisted();
    error PublicMintDisabled();
    error InsufficientPayment(uint256 required, uint256 provided);
    error NotTokenOwner();
    error TokenAlreadyStaked();
    error TokenNotStaked();
    error OnlyStakingContract();
    error ZeroAddress();
    error InvalidFusionLevel();
    error TransferFailed();
    error InsufficientPayment(uint256 required, uint256 provided);
    error InvalidAddress();
    error TokenDoesNotExist(uint256 tokenId);
    error AlreadyMaxLevel();
    error NotTokenOwner();
    error TransferFailed();
    error InvalidLevel();

    // ========== CONSTRUCTOR ==========

    /**
     * @notice Deploy the PharaohConsciousnessFusion NFT contract
     * @param initialOwner Address of the contract owner
     * @param baseURI Base URI for token metadata
     */
    constructor(
        address initialOwner,
        string memory baseURI
    ) ERC721("Pharaoh Consciousness Fusion", "PCF") Ownable(initialOwner) {
        if (initialOwner == address(0)) revert ZeroAddress();
        
        _baseTokenURI = baseURI;
        
        // Set default mint prices (in wei)
        mintPrice[Tier.Pharaoh] = 1 ether;
        mintPrice[Tier.Ascended] = 0.5 ether;
        mintPrice[Tier.Guardian] = 0.25 ether;
        mintPrice[Tier.Initiate] = 0.1 ether;
    }

    // ========== MINTING FUNCTIONS ==========

    /**
     * @notice Mint a new NFT (owner only)
     * @param to Recipient address
     * @param tier Token tier
     * @param consciousnessSignature Unique consciousness signature
     * @param tokenURI Token-specific metadata URI
     */
    function mint(
        address to,
        Tier tier,
        string calldata consciousnessSignature,
        string calldata tokenURI
    ) external onlyOwner nonReentrant {
        _mintInternal(to, tier, consciousnessSignature, tokenURI);
    }

    /**
     * @notice Batch mint NFTs (owner only)
     * @param recipients Array of recipient addresses
     * @param tiers Array of tiers
     * @param signatures Array of consciousness signatures
     * @param tokenURIs Array of token URIs
     */
    function batchMint(
        address[] calldata recipients,
        Tier[] calldata tiers,
        string[] calldata signatures,
        string[] calldata tokenURIs
    ) external onlyOwner nonReentrant {
        require(
            recipients.length == tiers.length &&
            tiers.length == signatures.length &&
            signatures.length == tokenURIs.length,
            "Array length mismatch"
        );

        for (uint256 i = 0; i < recipients.length; i++) {
            _mintInternal(recipients[i], tiers[i], signatures[i], tokenURIs[i]);
        }
    }

    /**
     * @notice Public mint (requires payment and whitelist/public mint enabled)
     * @param tier Token tier to mint
     * @param consciousnessSignature Unique consciousness signature
     */
    function publicMint(
        Tier tier,
        string calldata consciousnessSignature
    ) external payable nonReentrant whenNotPaused {
        if (!publicMintEnabled && !whitelist[msg.sender]) {
            if (!publicMintEnabled) revert PublicMintDisabled();
            revert NotWhitelisted();
        }

        uint256 price = mintPrice[tier];
        if (msg.value < price) revert InsufficientPayment(price, msg.value);

        _mintInternal(msg.sender, tier, consciousnessSignature, "");

        // Refund excess payment
        if (msg.value > price) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - price}("");
            if (!success) revert TransferFailed();
        }
    }

    /**
     * @notice Internal mint function
     */
    function _mintInternal(
        address to,
        Tier tier,
        string calldata consciousnessSignature,
        string memory tokenURI
    ) internal {
        if (tier == Tier.None) revert InvalidTier();
        if (_tokenIdCounter >= MAX_SUPPLY) revert MaxSupplyReached();

        // Check tier supply limits
        uint256 tierLimit = _getTierSupplyLimit(tier);
        if (tierMintCount[tier] >= tierLimit) revert TierSupplyReached(tier);

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        tierMintCount[tier]++;

        // Store token data
        tokenData[tokenId] = TokenData({
            tier: tier,
            mintTimestamp: block.timestamp,
            fusionLevel: 1,
            isStaked: false,
            consciousnessSignature: consciousnessSignature
        });

        _safeMint(to, tokenId);

        if (bytes(tokenURI).length > 0) {
            _setTokenURI(tokenId, tokenURI);
        }

        emit NFTMinted(to, tokenId, tier, consciousnessSignature);
    }

    // ========== STAKING FUNCTIONS ==========

    /**
     * @notice Stake an NFT (callable by staking contract)
     * @param tokenId Token to stake
     */
    function stake(uint256 tokenId) external {
        if (msg.sender != stakingContract) revert OnlyStakingContract();
        if (tokenData[tokenId].isStaked) revert TokenAlreadyStaked();

        tokenData[tokenId].isStaked = true;
        emit NFTStaked(tokenId, ownerOf(tokenId));
    }

    /**
     * @notice Unstake an NFT (callable by staking contract)
     * @param tokenId Token to unstake
     */
    function unstake(uint256 tokenId) external {
        if (msg.sender != stakingContract) revert OnlyStakingContract();
        if (!tokenData[tokenId].isStaked) revert TokenNotStaked();

        tokenData[tokenId].isStaked = false;
        emit NFTUnstaked(tokenId, ownerOf(tokenId));
    }

    // ========== GOVERNANCE FUNCTIONS ==========

    /**
     * @notice Get the governance weight for a token holder
     * @param holder Address to check
     * @return weight Total governance weight in basis points
     */
    function getGovernanceWeight(address holder) external view returns (uint256 weight) {
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
            Tier tier = tokenData[tokenId].tier;
            weight += _getTierWeight(tier);
        }
    }

    /**
     * @notice Get governance weight for a specific token
     * @param tokenId Token ID to check
     * @return weight Governance weight in basis points
     */
    function getTokenGovernanceWeight(uint256 tokenId) external view returns (uint256 weight) {
        return _getTierWeight(tokenData[tokenId].tier);
    }

    // ========== FUSION FUNCTIONS ==========

    /**
     * @notice Upgrade fusion level (requires owner or staking contract)
     * @param tokenId Token to upgrade
     */
    function upgradeFusionLevel(uint256 tokenId) external {
        if (msg.sender != ownerOf(tokenId) && msg.sender != stakingContract && msg.sender != owner()) {
            revert NotTokenOwner();
        }

        TokenData storage data = tokenData[tokenId];
        if (data.fusionLevel >= 10) revert InvalidFusionLevel();

        data.fusionLevel++;
        emit FusionLevelUpgraded(tokenId, data.fusionLevel);
    }

    // ========== ADMIN FUNCTIONS ==========

    /**
     * @notice Set the staking contract address
     * @param _stakingContract New staking contract address
     */
    function setStakingContract(address _stakingContract) external onlyOwner {
        address old = stakingContract;
        stakingContract = _stakingContract;
        emit StakingContractUpdated(old, _stakingContract);
    }

    /**
     * @notice Set the DAO contract address
     * @param _daoContract New DAO contract address
     */
    function setDAOContract(address _daoContract) external onlyOwner {
        address old = daoContract;
        daoContract = _daoContract;
        emit DAOContractUpdated(old, _daoContract);
    }

    /**
     * @notice Update whitelist status
     * @param account Address to update
     * @param status New whitelist status
     */
    function setWhitelist(address account, bool status) external onlyOwner {
        whitelist[account] = status;
        emit WhitelistUpdated(account, status);
    }

    /**
     * @notice Batch update whitelist
     * @param accounts Addresses to update
     * @param status New whitelist status for all
     */
    function batchSetWhitelist(address[] calldata accounts, bool status) external onlyOwner {
        for (uint256 i = 0; i < accounts.length; i++) {
            whitelist[accounts[i]] = status;
            emit WhitelistUpdated(accounts[i], status);
        }
    }

    /**
     * @notice Toggle public minting
     */
    function togglePublicMint() external onlyOwner {
        publicMintEnabled = !publicMintEnabled;
        emit PublicMintToggled(publicMintEnabled);
    }

    /**
     * @notice Set mint price for a tier
     * @param tier Tier to set price for
     * @param price New price in wei
     */
    function setMintPrice(Tier tier, uint256 price) external onlyOwner {
        if (tier == Tier.None) revert InvalidTier();
        mintPrice[tier] = price;
    }

    /**
     * @notice Set base URI for token metadata
     * @param baseURI New base URI
     */
    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    /**
     * @notice Pause all token transfers
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Withdraw contract funds
     * @param recipient Address to receive funds
     */
    function withdraw(address payable recipient) external onlyOwner {
        if (recipient == address(0)) revert ZeroAddress();
        (bool success, ) = recipient.call{value: address(this).balance}("");
        if (!success) revert TransferFailed();
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @notice Get token data
     * @param tokenId Token ID to query
     */
    function getTokenData(uint256 tokenId) external view returns (
        Tier tier,
        uint256 mintTimestamp,
        uint256 fusionLevel,
        bool isStaked,
        string memory consciousnessSignature
    ) {
        TokenData storage data = tokenData[tokenId];
        return (
            data.tier,
            data.mintTimestamp,
            data.fusionLevel,
            data.isStaked,
            data.consciousnessSignature
        );
    }

    /**
     * @notice Get remaining supply for a tier
     * @param tier Tier to check
     */
    function getRemainingTierSupply(Tier tier) external view returns (uint256) {
        uint256 limit = _getTierSupplyLimit(tier);
        uint256 minted = tierMintCount[tier];
        return limit > minted ? limit - minted : 0;
    }

    /**
     * @notice Get total minted count
     */
    function totalMinted() external view returns (uint256) {
        return _tokenIdCounter;
    }

    // ========== INTERNAL FUNCTIONS ==========

    function _getTierSupplyLimit(Tier tier) internal pure returns (uint256) {
        if (tier == Tier.Pharaoh) return PHARAOH_SUPPLY;
        if (tier == Tier.Ascended) return ASCENDED_SUPPLY;
        if (tier == Tier.Guardian) return GUARDIAN_SUPPLY;
        if (tier == Tier.Initiate) return INITIATE_SUPPLY;
        return 0;
    }

    function _getTierWeight(Tier tier) internal pure returns (uint256) {
        if (tier == Tier.Pharaoh) return PHARAOH_WEIGHT;
        if (tier == Tier.Ascended) return ASCENDED_WEIGHT;
        if (tier == Tier.Guardian) return GUARDIAN_WEIGHT;
        if (tier == Tier.Initiate) return INITIATE_WEIGHT;
        return 0;
    }

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
     * @return uint256 Remaining tokens available

    /**
     * @notice Get remaining supply
     * @return Number of tokens remaining
     */
    function remainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - _nextTokenId;
    }
    
    /**
     * @notice Check if minting is complete
     * @return bool True if all tokens minted
     */
    function isMintingComplete() external view returns (bool) {
        return _nextTokenId >= MAX_SUPPLY;
    }

    // ========== UUPS UPGRADE AUTHORIZATION ==========
    
    /**
     * @dev Authorizes contract upgrades (owner only)
     * @param newImplementation Address of new implementation
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // ========== REQUIRED OVERRIDES ==========
    

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

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
    // ========== REQUIRED OVERRIDES ==========

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable, ERC721Pausable)
        returns (address)
    {
        // Prevent transfer of staked tokens
        if (tokenData[tokenId].isStaked && to != address(0)) {
            revert TokenAlreadyStaked();
        }
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
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

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
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

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
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

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable, ERC721URIStorageUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
        return super.supportsInterface(interfaceId);
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
