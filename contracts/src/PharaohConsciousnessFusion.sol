// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/common/ERC2981Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
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
 * - ERC2981 royalty support for secondary sales (default 5%)
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
    ERC2981Upgradeable,
    OwnableUpgradeable, 
    PausableUpgradeable, 
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    // ========== CONSTANTS ==========
    
    /// @notice Maximum supply of the collection
    uint256 public constant MAX_SUPPLY = 3333;
    
    /// @notice Default royalty fee in basis points (5% = 500)
    uint96 public constant DEFAULT_ROYALTY_FEE = 500;
    
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
    
    /// @notice Emitted when royalty info is updated
    event RoyaltyUpdated(address indexed receiver, uint96 feeNumerator);
    
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
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initializes the contract (called once via proxy)
     * @param initialOwner Address of the initial contract owner
     * @param baseURI Initial base URI for token metadata
     * @param royaltyReceiver Address to receive royalties
     * @param _mintPrice Price for public mint in wei
     * @param _allowlistPrice Price for allowlist mint in wei
     */
    function initialize(
        address initialOwner,
        string memory baseURI,
        address royaltyReceiver,
        uint256 _mintPrice,
        uint256 _allowlistPrice
    ) public initializer {
        __ERC721_init("Consciousness Mirror", "CMIRROR");
        __ERC721Enumerable_init();
        __ERC721URIStorage_init();
        __ERC2981_init();
        __Ownable_init(initialOwner);
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
        
        _baseTokenURI = baseURI;
        mintPrice = _mintPrice;
        allowlistPrice = _allowlistPrice;
        
        // Set default royalty (5%)
        _setDefaultRoyalty(royaltyReceiver, DEFAULT_ROYALTY_FEE);
        
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
     */
    function addToAllowlist(address[] calldata addresses) external onlyOwner {
        if (addresses.length > MAX_BATCH_SIZE) revert BatchSizeTooLarge();
        
        uint256 timestamp = block.timestamp;
        
        unchecked {
            for (uint256 i = 0; i < addresses.length; ++i) {
                if (addresses[i] != address(0) && !allowlist[addresses[i]]) {
                    allowlist[addresses[i]] = true;
                    emit AllowlistAdded(addresses[i], msg.sender, timestamp);
                }
            }
        }
    }
    
    /**
     * @notice Remove addresses from allowlist with audit logging
     * @param addresses Array of addresses to remove
     */
    function removeFromAllowlist(address[] calldata addresses) external onlyOwner {
        if (addresses.length > MAX_BATCH_SIZE) revert BatchSizeTooLarge();
        
        uint256 timestamp = block.timestamp;
        
        unchecked {
            for (uint256 i = 0; i < addresses.length; ++i) {
                if (allowlist[addresses[i]]) {
                    allowlist[addresses[i]] = false;
                    emit AllowlistRemoved(addresses[i], msg.sender, timestamp);
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

    // ========== ROYALTY MANAGEMENT (ERC2981) ==========
    
    /**
     * @notice Set default royalty for all tokens
     * @param receiver Address to receive royalties
     * @param feeNumerator Royalty fee in basis points (e.g., 500 = 5%)
     */
    function setDefaultRoyalty(address receiver, uint96 feeNumerator) external onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
        emit RoyaltyUpdated(receiver, feeNumerator);
    }
    
    /**
     * @notice Set royalty for a specific token
     * @param tokenId Token ID to set royalty for
     * @param receiver Address to receive royalties
     * @param feeNumerator Royalty fee in basis points
     */
    function setTokenRoyalty(
        uint256 tokenId, 
        address receiver, 
        uint96 feeNumerator
    ) external onlyOwner {
        _setTokenRoyalty(tokenId, receiver, feeNumerator);
    }
    
    /**
     * @notice Reset royalty for a specific token to default
     * @param tokenId Token ID to reset
     */
    function resetTokenRoyalty(uint256 tokenId) external onlyOwner {
        _resetTokenRoyalty(tokenId);
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
     */
    function totalMinted() external view returns (uint256) {
        return _nextTokenId;
    }
    
    /**
     * @notice Get remaining supply
     * @return uint256 Remaining tokens available
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
    
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
    {
        super._increaseBalance(account, value);
    }

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
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable, ERC721URIStorageUpgradeable, ERC2981Upgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
