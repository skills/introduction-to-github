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
    }
}
