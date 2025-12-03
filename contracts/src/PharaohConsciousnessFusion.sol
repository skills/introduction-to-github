// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

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
 * Integration:
 * - ScrollVerseDAO: NFT holders get additional governance weight
 * - MirrorStaking: NFT holders get boosted staking rewards
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

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

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
    {
        super._increaseBalance(account, value);
    }

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
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
