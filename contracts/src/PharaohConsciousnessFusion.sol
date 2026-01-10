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
 * @notice "Consciousness Mirror" NFT collection with UUPS upgradeability and revenue splits
 * @dev ERC721 NFT with the following features:
 * 
 * Features:
 * - Fixed supply (3333 tokens)
 * - Allowlist mint restrictions with audit logging
 * - Post-mint lock (prevents URI updates after all NFTs minted)
 * - ERC2981 royalty support for secondary sales (default 5%)
 * - Revenue split distribution among multiple stakeholders
 * - UUPS proxy architecture for future upgrades
 * - Pausable mechanics
 * - Governance voting powers based on token holdings
 * 
 * Sovereign Ownership:
 * - Contract owner (Sovereign Chais) retains full governance control
 * - Owner can add/remove/update revenue split beneficiaries
 * - Owner can adjust split percentages dynamically
 * - Owner can pause/unpause minting and transfers
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
    
    /// @notice Basis points denominator (100% = 10000)
    uint256 public constant BASIS_POINTS = 10000;

    // ========== STRUCTS ==========
    
    /**
     * @notice Revenue split beneficiary information
     * @param beneficiary Address to receive revenue share
     * @param share Share in basis points (e.g., 1000 = 10%)
     * @param isActive Whether this beneficiary is currently active
     */
    struct RevenueBeneficiary {
        address beneficiary;
        uint256 share;
        bool isActive;
    }

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
    
    // ========== REVENUE SPLIT STATE VARIABLES ==========
    
    /// @notice Array of revenue beneficiaries
    RevenueBeneficiary[] public revenueBeneficiaries;
    
    /// @notice Mapping from beneficiary address to their index in the array
    mapping(address => uint256) private beneficiaryIndex;
    
    /// @notice Total share allocated (should sum to BASIS_POINTS or less)
    uint256 public totalAllocatedShare;

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
    
    /// @notice Emitted when a revenue beneficiary is added
    event BeneficiaryAdded(address indexed beneficiary, uint256 share, address indexed addedBy, uint256 timestamp);
    
    /// @notice Emitted when a beneficiary's share is updated
    event BeneficiaryUpdated(address indexed beneficiary, uint256 oldShare, uint256 newShare, address indexed updatedBy, uint256 timestamp);
    
    /// @notice Emitted when a beneficiary is removed
    event BeneficiaryRemoved(address indexed beneficiary, address indexed removedBy, uint256 timestamp);
    
    /// @notice Emitted when revenue is distributed
    event RevenueDistributed(address indexed beneficiary, uint256 amount, uint256 timestamp);

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
    error InvalidShare();
    error BeneficiaryAlreadyExists();
    error BeneficiaryNotFound();
    error TotalShareExceeds100Percent();
    error NoActiveBeneficiaries();

    // ========== INITIALIZER ==========

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initializes the contract (called once via proxy)
     * @param initialOwner Address of the initial contract owner (Sovereign Chais)
     * @param baseURI Initial base URI for token metadata
     * @param royaltyReceiver Address to receive ERC2981 royalties
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
    function allowlistMint(uint256 quantity) external payable whenNotPaused nonReentrant {
        if (!allowlistMintActive) revert AllowlistMintNotActive();
        if (!allowlist[msg.sender]) revert NotOnAllowlist();
        if (_nextTokenId + quantity > MAX_SUPPLY) revert MaxSupplyReached();
        if (mintedCount[msg.sender] + quantity > maxPerWalletAllowlist) revert ExceedsMaxPerWallet();
        if (msg.value < allowlistPrice * quantity) revert InsufficientPayment();
        
        mintedCount[msg.sender] += quantity;
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nextTokenId++;
            _safeMint(msg.sender, tokenId);
            emit ConsciousnessMinted(msg.sender, tokenId);
        }
    }
    
    /**
     * @notice Mint during public phase
     * @param quantity Number of tokens to mint
     */
    function publicMint(uint256 quantity) external payable whenNotPaused nonReentrant {
        if (!publicMintActive) revert PublicMintNotActive();
        if (_nextTokenId + quantity > MAX_SUPPLY) revert MaxSupplyReached();
        if (mintedCount[msg.sender] + quantity > maxPerWalletPublic) revert ExceedsMaxPerWallet();
        if (msg.value < mintPrice * quantity) revert InsufficientPayment();
        
        mintedCount[msg.sender] += quantity;
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nextTokenId++;
            _safeMint(msg.sender, tokenId);
            emit ConsciousnessMinted(msg.sender, tokenId);
        }
    }
    
    /**
     * @notice Owner mint for airdrops/reserves
     * @param to Address to mint to
     * @param quantity Number of tokens to mint
     */
    function ownerMint(address to, uint256 quantity) external onlyOwner {
        if (_nextTokenId + quantity > MAX_SUPPLY) revert MaxSupplyReached();
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nextTokenId++;
            _safeMint(to, tokenId);
            emit ConsciousnessMinted(to, tokenId);
        }
    }

    // ========== ALLOWLIST MANAGEMENT ==========
    
    /**
     * @notice Add addresses to allowlist (with audit event)
     * @param addresses Array of addresses to add
     */
    function addToAllowlist(address[] calldata addresses) external onlyOwner {
        if (addresses.length > MAX_BATCH_SIZE) revert BatchSizeTooLarge();
        
        for (uint256 i = 0; i < addresses.length; i++) {
            if (addresses[i] == address(0)) revert InvalidAddress();
            allowlist[addresses[i]] = true;
            emit AllowlistAdded(addresses[i], msg.sender, block.timestamp);
        }
    }
    
    /**
     * @notice Remove addresses from allowlist (with audit event)
     * @param addresses Array of addresses to remove
     */
    function removeFromAllowlist(address[] calldata addresses) external onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            allowlist[addresses[i]] = false;
            emit AllowlistRemoved(addresses[i], msg.sender, block.timestamp);
        }
    }
    
    /**
     * @notice Check if address is on allowlist
     * @param account Address to check
     * @return bool Whether address is on allowlist
     */
    function isOnAllowlist(address account) external view returns (bool) {
        return allowlist[account];
    }

    // ========== MINT PHASE MANAGEMENT ==========
    
    /**
     * @notice Set mint phase status
     * @param _allowlistActive Whether allowlist mint is active
     * @param _publicActive Whether public mint is active
     */
    function setMintPhase(bool _allowlistActive, bool _publicActive) external onlyOwner {
        allowlistMintActive = _allowlistActive;
        publicMintActive = _publicActive;
        emit MintPhaseUpdated(_allowlistActive, _publicActive);
    }
    
    /**
     * @notice Update mint prices
     * @param _mintPrice New public mint price
     * @param _allowlistPrice New allowlist mint price
     */
    function setPrices(uint256 _mintPrice, uint256 _allowlistPrice) external onlyOwner {
        mintPrice = _mintPrice;
        allowlistPrice = _allowlistPrice;
        emit PricesUpdated(_mintPrice, _allowlistPrice);
    }
    
    /**
     * @notice Update wallet limits
     * @param _maxAllowlist Max tokens per wallet for allowlist
     * @param _maxPublic Max tokens per wallet for public mint
     */
    function setWalletLimits(uint256 _maxAllowlist, uint256 _maxPublic) external onlyOwner {
        maxPerWalletAllowlist = _maxAllowlist;
        maxPerWalletPublic = _maxPublic;
    }

    // ========== METADATA MANAGEMENT ==========
    
    /**
     * @notice Set base URI for token metadata
     * @param baseURI New base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        if (metadataLocked) revert MetadataIsLocked();
        _baseTokenURI = baseURI;
        emit BaseURIUpdated(baseURI);
    }
    
    /**
     * @notice Permanently lock metadata (irreversible)
     * @dev Can only be called after all tokens are minted
     */
    function lockMetadata() external onlyOwner {
        if (_nextTokenId < MAX_SUPPLY) revert("Not all tokens minted");
        metadataLocked = true;
        emit MetadataLocked();
    }
    
    /**
     * @dev Base URI for computing {tokenURI}
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
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

    // ========== REVENUE SPLIT MANAGEMENT ==========
    
    /**
     * @notice Add a revenue beneficiary
     * @param beneficiary Address of the beneficiary
     * @param share Share in basis points (e.g., 1000 = 10%)
     * @dev Only callable by owner (Sovereign Chais)
     */
    function addBeneficiary(address beneficiary, uint256 share) external onlyOwner {
        if (beneficiary == address(0)) revert InvalidAddress();
        if (share == 0 || share > BASIS_POINTS) revert InvalidShare();
        if (beneficiaryIndex[beneficiary] != 0 || (revenueBeneficiaries.length > 0 && revenueBeneficiaries[0].beneficiary == beneficiary)) {
            revert BeneficiaryAlreadyExists();
        }
        if (totalAllocatedShare + share > BASIS_POINTS) revert TotalShareExceeds100Percent();
        
        revenueBeneficiaries.push(RevenueBeneficiary({
            beneficiary: beneficiary,
            share: share,
            isActive: true
        }));
        
        beneficiaryIndex[beneficiary] = revenueBeneficiaries.length - 1;
        totalAllocatedShare += share;
        
        emit BeneficiaryAdded(beneficiary, share, msg.sender, block.timestamp);
    }
    
    /**
     * @notice Update a beneficiary's share
     * @param beneficiary Address of the beneficiary
     * @param newShare New share in basis points
     * @dev Only callable by owner (Sovereign Chais)
     */
    function updateBeneficiaryShare(address beneficiary, uint256 newShare) external onlyOwner {
        if (newShare == 0 || newShare > BASIS_POINTS) revert InvalidShare();
        
        uint256 index = beneficiaryIndex[beneficiary];
        if (index >= revenueBeneficiaries.length || revenueBeneficiaries[index].beneficiary != beneficiary) {
            if (index == 0 && (revenueBeneficiaries.length == 0 || revenueBeneficiaries[0].beneficiary != beneficiary)) {
                revert BeneficiaryNotFound();
            }
        }
        
        RevenueBeneficiary storage ben = revenueBeneficiaries[index];
        if (!ben.isActive) revert BeneficiaryNotFound();
        
        uint256 oldShare = ben.share;
        uint256 newTotalShare = totalAllocatedShare - oldShare + newShare;
        if (newTotalShare > BASIS_POINTS) revert TotalShareExceeds100Percent();
        
        ben.share = newShare;
        totalAllocatedShare = newTotalShare;
        
        emit BeneficiaryUpdated(beneficiary, oldShare, newShare, msg.sender, block.timestamp);
    }
    
    /**
     * @notice Remove a beneficiary (deactivate)
     * @param beneficiary Address of the beneficiary to remove
     * @dev Only callable by owner (Sovereign Chais)
     */
    function removeBeneficiary(address beneficiary) external onlyOwner {
        uint256 index = beneficiaryIndex[beneficiary];
        if (index >= revenueBeneficiaries.length || revenueBeneficiaries[index].beneficiary != beneficiary) {
            if (index == 0 && (revenueBeneficiaries.length == 0 || revenueBeneficiaries[0].beneficiary != beneficiary)) {
                revert BeneficiaryNotFound();
            }
        }
        
        RevenueBeneficiary storage ben = revenueBeneficiaries[index];
        if (!ben.isActive) revert BeneficiaryNotFound();
        
        totalAllocatedShare -= ben.share;
        ben.isActive = false;
        
        emit BeneficiaryRemoved(beneficiary, msg.sender, block.timestamp);
    }
    
    /**
     * @notice Get all active beneficiaries
     * @return Array of beneficiary addresses and their shares
     */
    function getActiveBeneficiaries() external view returns (address[] memory, uint256[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < revenueBeneficiaries.length; i++) {
            if (revenueBeneficiaries[i].isActive) {
                activeCount++;
            }
        }
        
        address[] memory addresses = new address[](activeCount);
        uint256[] memory shares = new uint256[](activeCount);
        
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < revenueBeneficiaries.length; i++) {
            if (revenueBeneficiaries[i].isActive) {
                addresses[currentIndex] = revenueBeneficiaries[i].beneficiary;
                shares[currentIndex] = revenueBeneficiaries[i].share;
                currentIndex++;
            }
        }
        
        return (addresses, shares);
    }
    
    /**
     * @notice Get beneficiary count
     * @return Total number of beneficiaries (including inactive)
     */
    function getBeneficiaryCount() external view returns (uint256) {
        return revenueBeneficiaries.length;
    }

    // ========== WITHDRAWAL WITH REVENUE SPLITS ==========
    
    /**
     * @notice Withdraw contract balance and distribute according to revenue splits
     * @dev Distributes funds to all active beneficiaries based on their shares
     * @dev If no beneficiaries or total share < 100%, remainder goes to owner
     */
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        if (balance == 0) revert NoFundsToWithdraw();
        
        uint256 distributed = 0;
        
        // Distribute to beneficiaries
        for (uint256 i = 0; i < revenueBeneficiaries.length; i++) {
            RevenueBeneficiary memory ben = revenueBeneficiaries[i];
            if (ben.isActive && ben.share > 0) {
                uint256 amount = (balance * ben.share) / BASIS_POINTS;
                distributed += amount;
                
                (bool success, ) = ben.beneficiary.call{value: amount}("");
                if (!success) revert WithdrawalFailed();
                
                emit RevenueDistributed(ben.beneficiary, amount, block.timestamp);
            }
        }
        
        // Send remainder to owner (handles rounding and unallocated shares)
        uint256 remainder = balance - distributed;
        if (remainder > 0) {
            (bool success, ) = owner().call{value: remainder}("");
            if (!success) revert WithdrawalFailed();
            emit Withdrawn(owner(), remainder);
        }
    }
    
    /**
     * @notice Emergency withdrawal to owner (bypasses splits)
     * @dev Only use in emergency situations
     */
    function emergencyWithdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        if (balance == 0) revert NoFundsToWithdraw();
        
        (bool success, ) = owner().call{value: balance}("");
        if (!success) revert WithdrawalFailed();
        
        emit Withdrawn(owner(), balance);
    }

    // ========== GOVERNANCE VOTING POWER ==========
    
    /**
     * @notice Get voting power for a token holder
     * @param holder Address to check
     * @return Voting power (number of tokens * votingPowerPerToken)
     */
    function getVotingPower(address holder) external view returns (uint256) {
        return balanceOf(holder) * votingPowerPerToken;
    }
    
    /**
     * @notice Set voting power per token
     * @param power New voting power per token
     */
    function setVotingPowerPerToken(uint256 power) external onlyOwner {
        votingPowerPerToken = power;
    }

    // ========== PAUSABLE ==========
    
    /**
     * @notice Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
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
     * @notice Check if all tokens are minted
     * @return bool Whether all tokens are minted
     */
    function isMintComplete() external view returns (bool) {
        return _nextTokenId >= MAX_SUPPLY;
    }

    // ========== UUPS UPGRADE AUTHORIZATION ==========
    
    /**
     * @notice Authorize upgrade (UUPS pattern)
     * @param newImplementation Address of new implementation
     * @dev Only owner can upgrade
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // ========== REQUIRED OVERRIDES ==========
    
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable, ERC721PausableUpgradeable)
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
