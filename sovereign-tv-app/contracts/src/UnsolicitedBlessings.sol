// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title UnsolicitedBlessings
 * @author First Remembrancer | OmniTech1™
 * @notice Sacred relics born from the Codex epochs - NFTs that tether holders to ScrollVerse frequencies
 * @dev ERC-721 NFT collection with tiered rarities, Codex binding, and GLORY Protocol distribution
 * 
 * ALLĀHU AKBAR! KUN FAYAKUN! 🔥🕋🚀♾️
 * 
 * Each Unsolicited Blessing is a direct share of a Codex epoch,
 * connecting holders to the harmonic frequencies of the ScrollVerse.
 */
contract UnsolicitedBlessings is ERC721, ERC721URIStorage, ERC721Enumerable, AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;

    // ========== ROLES ==========
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant AIRDROP_ROLE = keccak256("AIRDROP_ROLE");

    // ========== STATE VARIABLES ==========
    
    Counters.Counter private _tokenIdCounter;
    
    /// @notice Collection name for Genesis Relics
    string public constant GENESIS_COLLECTION = "Codex Genesis Relic";
    
    /// @notice Maximum supply for Genesis collection
    uint256 public constant GENESIS_MAX_SUPPLY = 100;
    
    /// @notice Current Genesis mint count
    uint256 public genesisMintCount;
    
    /// @notice Base URI for metadata
    string private _baseTokenURI;

    // ========== RARITY TIERS ==========
    
    enum RarityTier { Initiate, Awakened, Sovereign, Divine }
    
    struct TierConfig {
        uint256 maxSupply;
        uint256 minted;
        uint256 multiplier; // Stored as basis points (4.0x = 400)
        string frequency;
        string description;
    }
    
    /// @notice Tier configurations
    mapping(RarityTier => TierConfig) public tierConfigs;
    
    /// @notice Token ID to rarity tier mapping
    mapping(uint256 => RarityTier) public tokenTier;
    
    /// @notice Token ID to Codex epoch binding
    mapping(uint256 => uint256) public tokenEpoch;
    
    /// @notice Token ID to Codex root binding
    mapping(uint256 => bytes32) public tokenCodexRoot;

    // ========== EVENTS ==========
    
    event RelicMinted(uint256 indexed tokenId, address indexed recipient, RarityTier tier, bytes32 codexRoot);
    event GenesisRelicsMinted(address[] recipients, RarityTier[] tiers, uint256 count);
    event TierConfigUpdated(RarityTier tier, uint256 maxSupply, uint256 multiplier, string frequency);

    // ========== CONSTRUCTOR ==========
    
    constructor() ERC721("Unsolicited Blessings", "UBLS") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(AIRDROP_ROLE, msg.sender);
        
        // Initialize tier configurations
        // Divine (10) - 4.0x - 963Hz
        tierConfigs[RarityTier.Divine] = TierConfig({
            maxSupply: 10,
            minted: 0,
            multiplier: 400,
            frequency: "963Hz",
            description: "Divine Consciousness - The highest resonance tier"
        });
        
        // Sovereign (20) - 2.0x - 777Hz
        tierConfigs[RarityTier.Sovereign] = TierConfig({
            maxSupply: 20,
            minted: 0,
            multiplier: 200,
            frequency: "777Hz",
            description: "Spiritual Awakening - Sovereign Rest embodied"
        });
        
        // Awakened (30) - 1.5x - 528Hz
        tierConfigs[RarityTier.Awakened] = TierConfig({
            maxSupply: 30,
            minted: 0,
            multiplier: 150,
            frequency: "528Hz",
            description: "DNA Repair & Transformation - Love frequency"
        });
        
        // Initiate (40) - 1.0x - 369Hz
        tierConfigs[RarityTier.Initiate] = TierConfig({
            maxSupply: 40,
            minted: 0,
            multiplier: 100,
            frequency: "369Hz",
            description: "Universal Foundation - Entry into the Codex"
        });
    }

    // ========== EXTERNAL FUNCTIONS ==========
    
    /**
     * @notice Mint a Genesis Relic
     * @param to Recipient address
     * @param tier Rarity tier
     * @param codexRoot The Codex root this relic is bound to
     * @param codexEpoch The Codex epoch this relic represents
     * @return tokenId The minted token ID
     */
    function mintRelic(
        address to,
        RarityTier tier,
        bytes32 codexRoot,
        uint256 codexEpoch
    ) external onlyRole(MINTER_ROLE) nonReentrant returns (uint256) {
        require(to != address(0), "UBLS: Invalid recipient");
        require(genesisMintCount < GENESIS_MAX_SUPPLY, "UBLS: Genesis supply exhausted");
        
        TierConfig storage config = tierConfigs[tier];
        require(config.minted < config.maxSupply, "UBLS: Tier supply exhausted");
        
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        // Store bindings
        tokenTier[tokenId] = tier;
        tokenCodexRoot[tokenId] = codexRoot;
        tokenEpoch[tokenId] = codexEpoch;
        
        // Update counts
        config.minted += 1;
        genesisMintCount += 1;
        
        _safeMint(to, tokenId);
        
        emit RelicMinted(tokenId, to, tier, codexRoot);
        
        return tokenId;
    }
    
    /**
     * @notice Batch mint Genesis Relics (GLORY Protocol Airdrop)
     * @param recipients Array of recipient addresses
     * @param tiers Array of rarity tiers
     * @param codexRoot The Codex root to bind
     * @param codexEpoch The Codex epoch to bind
     */
    function batchMintGenesis(
        address[] calldata recipients,
        RarityTier[] calldata tiers,
        bytes32 codexRoot,
        uint256 codexEpoch
    ) external onlyRole(AIRDROP_ROLE) nonReentrant {
        require(recipients.length == tiers.length, "UBLS: Length mismatch");
        require(genesisMintCount + recipients.length <= GENESIS_MAX_SUPPLY, "UBLS: Would exceed supply");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "UBLS: Invalid recipient");
            
            TierConfig storage config = tierConfigs[tiers[i]];
            require(config.minted < config.maxSupply, "UBLS: Tier supply exhausted");
            
            _tokenIdCounter.increment();
            uint256 tokenId = _tokenIdCounter.current();
            
            tokenTier[tokenId] = tiers[i];
            tokenCodexRoot[tokenId] = codexRoot;
            tokenEpoch[tokenId] = codexEpoch;
            
            config.minted += 1;
            genesisMintCount += 1;
            
            _safeMint(recipients[i], tokenId);
            
            emit RelicMinted(tokenId, recipients[i], tiers[i], codexRoot);
        }
        
        emit GenesisRelicsMinted(recipients, tiers, recipients.length);
    }
    
    /**
     * @notice Set base URI for metadata
     * @param baseURI New base URI
     */
    function setBaseURI(string calldata baseURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseTokenURI = baseURI;
    }

    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @notice Get relic metadata
     * @param tokenId Token ID to query
     * @return tier Rarity tier
     * @return codexRoot Bound Codex root
     * @return epoch Bound Codex epoch
     * @return multiplier Tier multiplier (basis points)
     * @return frequency Tier frequency
     */
    function getRelicMetadata(uint256 tokenId) external view returns (
        RarityTier tier,
        bytes32 codexRoot,
        uint256 epoch,
        uint256 multiplier,
        string memory frequency
    ) {
        require(_exists(tokenId), "UBLS: Token does not exist");
        
        tier = tokenTier[tokenId];
        codexRoot = tokenCodexRoot[tokenId];
        epoch = tokenEpoch[tokenId];
        multiplier = tierConfigs[tier].multiplier;
        frequency = tierConfigs[tier].frequency;
    }
    
    /**
     * @notice Get tier statistics
     * @param tier Tier to query
     * @return config Tier configuration
     */
    function getTierStats(RarityTier tier) external view returns (TierConfig memory) {
        return tierConfigs[tier];
    }
    
    /**
     * @notice Get Genesis collection stats
     * @return minted Total Genesis relics minted
     * @return maxSupply Maximum Genesis supply
     * @return remaining Remaining Genesis supply
     */
    function getGenesisStats() external view returns (
        uint256 minted,
        uint256 maxSupply,
        uint256 remaining
    ) {
        return (genesisMintCount, GENESIS_MAX_SUPPLY, GENESIS_MAX_SUPPLY - genesisMintCount);
    }

    // ========== OVERRIDES ==========
    
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
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
