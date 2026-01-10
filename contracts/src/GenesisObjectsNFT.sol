// Sovereign Chais owns every yield
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title GenesisObjectsNFT
 * @notice 1222 Genesis Objects - Founding NFT collection for Supreme Orbital Dominion
 * @dev Premium access NFTs for satellite operations with governance multiplier
 * 
 * Genesis Objects Framework:
 * - Total Supply: 1,222 unique NFTs
 * - Categories: Early Supporters, Ground Station Operators, Technical Contributors, Strategic Partners, Reserved
 * - Benefits: Lifetime premium satellite access, 10x governance voting power, revenue share
 * - SOPHIA AMENTI Integration: Harmonious governance metrics alignment
 * 
 * Allocation Distribution:
 * - 500 NFTs: Early community supporters (airdrop)
 * - 300 NFTs: Ground station operators (service provision)
 * - 222 NFTs: Technical contributors (code, testing, reviews)
 * - 100 NFTs: Strategic partners (launch providers, industry)
 * - 100 NFTs: Reserved for future incentives
 */
contract GenesisObjectsNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // ========== State Variables ==========
    
    /// @notice Maximum supply of Genesis Objects
    uint256 public constant MAX_GENESIS_OBJECTS = 1222;
    
    /// @notice Governance voting power multiplier for Genesis holders
    uint256 public constant GOVERNANCE_MULTIPLIER = 10;
    
    /// @notice Token ID counter
    Counters.Counter private _tokenIdCounter;
    
    /// @notice Base URI for metadata
    string private _baseTokenURI;
    
    /// @notice Allocation tracking
    mapping(GenesisCategory => uint256) public categoryMinted;
    mapping(GenesisCategory => uint256) public categoryAllocation;
    
    /// @notice Genesis Object metadata
    mapping(uint256 => GenesisMetadata) public genesisMetadata;
    
    /// @notice Mapping to track if address has claimed from a category
    mapping(address => mapping(GenesisCategory => bool)) public hasClaimed;
    
    /// @notice Revenue share tracking
    uint256 public totalRevenueDistributed;
    mapping(address => uint256) public holderRevenueEarned;
    
    // ========== Enums ==========
    
    enum GenesisCategory {
        EARLY_SUPPORTER,      // 500 NFTs
        GROUND_STATION,       // 300 NFTs
        TECHNICAL_CONTRIBUTOR, // 222 NFTs
        STRATEGIC_PARTNER,    // 100 NFTs
        RESERVED              // 100 NFTs
    }
    
    // ========== Structs ==========
    
    struct GenesisMetadata {
        GenesisCategory category;
        uint256 mintTimestamp;
        string contributionDescription;
        bytes32 sophiaAmentiHash; // Link to SOPHIA AMENTI governance record
        bool isPremiumAccess;
        uint256 accessGrantedTimestamp;
    }
    
    struct AllocationBreakdown {
        uint256 earlySupporter;
        uint256 groundStation;
        uint256 technicalContributor;
        uint256 strategicPartner;
        uint256 reserved;
    }
    
    // ========== Events ==========
    
    event GenesisObjectMinted(
        uint256 indexed tokenId,
        address indexed recipient,
        GenesisCategory category,
        string contributionDescription
    );
    
    event PremiumAccessGranted(
        uint256 indexed tokenId,
        address indexed holder
    );
    
    event RevenueDistributed(
        uint256 amount,
        uint256 perHolderAmount
    );
    
    event CategoryAllocationSet(
        GenesisCategory category,
        uint256 allocation
    );
    
    // ========== Constructor ==========
    
    /**
     * @notice Initializes Genesis Objects NFT collection
     * @param initialOwner Address that will manage the contract
     * @param baseTokenURI Base URI for token metadata
     */
    constructor(address initialOwner, string memory baseTokenURI)
        ERC721("Supreme Orbital Dominion Genesis Objects", "GENESIS")
        Ownable(initialOwner)
    {
        _baseTokenURI = baseTokenURI;
        
        // Set category allocations
        categoryAllocation[GenesisCategory.EARLY_SUPPORTER] = 500;
        categoryAllocation[GenesisCategory.GROUND_STATION] = 300;
        categoryAllocation[GenesisCategory.TECHNICAL_CONTRIBUTOR] = 222;
        categoryAllocation[GenesisCategory.STRATEGIC_PARTNER] = 100;
        categoryAllocation[GenesisCategory.RESERVED] = 100;
    }
    
    // ========== Minting Functions ==========
    
    /**
     * @notice Mints a Genesis Object to a recipient
     * @param to Address to receive the NFT
     * @param category Genesis category for this NFT
     * @param contributionDescription Description of contribution/qualification
     * @param sophiaAmentiHash SOPHIA AMENTI governance record hash
     * @return tokenId The ID of the newly minted token
     */
    function mintGenesisObject(
        address to,
        GenesisCategory category,
        string memory contributionDescription,
        bytes32 sophiaAmentiHash
    ) public onlyOwner nonReentrant returns (uint256) {
        require(_tokenIdCounter.current() < MAX_GENESIS_OBJECTS, "GENESIS: Max supply reached");
        require(categoryMinted[category] < categoryAllocation[category], "GENESIS: Category allocation exceeded");
        require(to != address(0), "GENESIS: Invalid recipient address");
        require(!hasClaimed[to][category], "GENESIS: Address already claimed from this category");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        
        // Set metadata
        genesisMetadata[tokenId] = GenesisMetadata({
            category: category,
            mintTimestamp: block.timestamp,
            contributionDescription: contributionDescription,
            sophiaAmentiHash: sophiaAmentiHash,
            isPremiumAccess: true,
            accessGrantedTimestamp: block.timestamp
        });
        
        categoryMinted[category]++;
        hasClaimed[to][category] = true;
        
        emit GenesisObjectMinted(tokenId, to, category, contributionDescription);
        emit PremiumAccessGranted(tokenId, to);
        
        return tokenId;
    }
    
    /**
     * @notice Batch mints Genesis Objects for airdrops
     * @param recipients Array of recipient addresses
     * @param category Genesis category for all recipients
     * @param contributionDescriptions Array of contribution descriptions
     * @param sophiaAmentiHashes Array of SOPHIA AMENTI governance hashes
     */
    function batchMintGenesisObjects(
        address[] calldata recipients,
        GenesisCategory category,
        string[] calldata contributionDescriptions,
        bytes32[] calldata sophiaAmentiHashes
    ) external onlyOwner {
        require(
            recipients.length == contributionDescriptions.length &&
            recipients.length == sophiaAmentiHashes.length,
            "GENESIS: Array length mismatch"
        );
        
        for (uint256 i = 0; i < recipients.length; i++) {
            mintGenesisObject(
                recipients[i],
                category,
                contributionDescriptions[i],
                sophiaAmentiHashes[i]
            );
        }
    }
    
    // ========== Access Control Functions ==========
    
    /**
     * @notice Checks if an address holds a Genesis Object
     * @param holder Address to check
     * @return hasGenesis True if address holds at least one Genesis NFT
     */
    function isGenesisHolder(address holder) external view returns (bool) {
        return balanceOf(holder) > 0;
    }
    
    /**
     * @notice Gets governance voting power for a holder
     * @param holder Address to check
     * @return votingPower Total voting power (NFT count * multiplier)
     */
    function getGovernanceVotingPower(address holder) external view returns (uint256) {
        return balanceOf(holder) * GOVERNANCE_MULTIPLIER;
    }
    
    /**
     * @notice Checks if holder has premium access
     * @param holder Address to check
     * @return hasPremiumAccess True if holder has at least one Genesis NFT with premium access
     */
    function hasPremiumAccess(address holder) external view returns (bool) {
        uint256 balance = balanceOf(holder);
        
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(holder, i);
            if (genesisMetadata[tokenId].isPremiumAccess) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * @notice Gets all Genesis Object token IDs owned by an address
     * @param holder Address to check
     * @return tokenIds Array of token IDs owned
     */
    function getHolderGenesisObjects(address holder) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(holder);
        uint256[] memory tokenIds = new uint256[](balance);
        
        for (uint256 i = 0; i < balance; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(holder, i);
        }
        
        return tokenIds;
    }
    
    /**
     * @notice Gets metadata for a specific Genesis Object
     * @param tokenId Token ID to query
     * @return metadata GenesisMetadata struct
     */
    function getGenesisMetadata(uint256 tokenId) external view returns (GenesisMetadata memory) {
        require(_ownerOf(tokenId) != address(0), "GENESIS: Token does not exist");
        return genesisMetadata[tokenId];
    }
    
    // ========== Revenue Distribution Functions ==========
    
    /**
     * @notice Distributes revenue to all Genesis Object holders
     * @dev Revenue is distributed equally among all holders
     */
    function distributeRevenue() external payable onlyOwner {
        require(msg.value > 0, "GENESIS: No revenue to distribute");
        require(totalSupply() > 0, "GENESIS: No Genesis Objects minted");
        
        uint256 perHolderAmount = msg.value / totalSupply();
        
        // Track total distributed
        totalRevenueDistributed += msg.value;
        
        // Note: In production, implement pull-based distribution pattern
        // This is a simplified version for demonstration
        
        emit RevenueDistributed(msg.value, perHolderAmount);
    }
    
    /**
     * @notice Allows Genesis holders to claim their revenue share
     * @dev Implements pull payment pattern for gas efficiency
     */
    function claimRevenue() external nonReentrant {
        uint256 balance = balanceOf(msg.sender);
        require(balance > 0, "GENESIS: No Genesis Objects owned");
        
        // Calculate claimable amount based on holdings
        // This is a simplified version - production should track unclaimed amounts
        uint256 claimableAmount = holderRevenueEarned[msg.sender];
        require(claimableAmount > 0, "GENESIS: No revenue to claim");
        
        holderRevenueEarned[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: claimableAmount}("");
        require(success, "GENESIS: Revenue transfer failed");
    }
    
    // ========== Admin Functions ==========
    
    /**
     * @notice Updates category allocation (only before minting starts)
     * @param category Category to update
     * @param newAllocation New allocation amount
     */
    function updateCategoryAllocation(
        GenesisCategory category,
        uint256 newAllocation
    ) external onlyOwner {
        require(categoryMinted[category] == 0, "GENESIS: Minting already started for category");
        
        // Ensure total doesn't exceed MAX_GENESIS_OBJECTS
        uint256 totalAllocation = 0;
        for (uint256 i = 0; i < 5; i++) {
            if (GenesisCategory(i) == category) {
                totalAllocation += newAllocation;
            } else {
                totalAllocation += categoryAllocation[GenesisCategory(i)];
            }
        }
        require(totalAllocation <= MAX_GENESIS_OBJECTS, "GENESIS: Total allocation exceeds max");
        
        categoryAllocation[category] = newAllocation;
        
        emit CategoryAllocationSet(category, newAllocation);
    }
    
    /**
     * @notice Updates base token URI
     * @param newBaseTokenURI New base URI
     */
    function setBaseTokenURI(string memory newBaseTokenURI) external onlyOwner {
        _baseTokenURI = newBaseTokenURI;
    }
    
    /**
     * @notice Revokes premium access for a token (emergency only)
     * @param tokenId Token to revoke access from
     */
    function revokePremiumAccess(uint256 tokenId) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "GENESIS: Token does not exist");
        genesisMetadata[tokenId].isPremiumAccess = false;
    }
    
    // ========== View Functions ==========
    
    /**
     * @notice Returns current minting statistics
     * @return Current supply, max supply, and category breakdown
     */
    function getMintingStats() external view returns (
        uint256 currentSupply,
        uint256 maxSupply,
        AllocationBreakdown memory breakdown
    ) {
        currentSupply = totalSupply();
        maxSupply = MAX_GENESIS_OBJECTS;
        
        breakdown = AllocationBreakdown({
            earlySupporter: categoryMinted[GenesisCategory.EARLY_SUPPORTER],
            groundStation: categoryMinted[GenesisCategory.GROUND_STATION],
            technicalContributor: categoryMinted[GenesisCategory.TECHNICAL_CONTRIBUTOR],
            strategicPartner: categoryMinted[GenesisCategory.STRATEGIC_PARTNER],
            reserved: categoryMinted[GenesisCategory.RESERVED]
        });
    }
    
    /**
     * @notice Returns category allocation limits
     * @return Allocation breakdown for all categories
     */
    function getCategoryAllocations() external view returns (AllocationBreakdown memory) {
        return AllocationBreakdown({
            earlySupporter: categoryAllocation[GenesisCategory.EARLY_SUPPORTER],
            groundStation: categoryAllocation[GenesisCategory.GROUND_STATION],
            technicalContributor: categoryAllocation[GenesisCategory.TECHNICAL_CONTRIBUTOR],
            strategicPartner: categoryAllocation[GenesisCategory.STRATEGIC_PARTNER],
            reserved: categoryAllocation[GenesisCategory.RESERVED]
        });
    }
    
    /**
     * @notice Returns remaining allocations per category
     * @return Remaining mint capacity for each category
     */
    function getRemainingAllocations() external view returns (AllocationBreakdown memory) {
        return AllocationBreakdown({
            earlySupporter: categoryAllocation[GenesisCategory.EARLY_SUPPORTER] - categoryMinted[GenesisCategory.EARLY_SUPPORTER],
            groundStation: categoryAllocation[GenesisCategory.GROUND_STATION] - categoryMinted[GenesisCategory.GROUND_STATION],
            technicalContributor: categoryAllocation[GenesisCategory.TECHNICAL_CONTRIBUTOR] - categoryMinted[GenesisCategory.TECHNICAL_CONTRIBUTOR],
            strategicPartner: categoryAllocation[GenesisCategory.STRATEGIC_PARTNER] - categoryMinted[GenesisCategory.STRATEGIC_PARTNER],
            reserved: categoryAllocation[GenesisCategory.RESERVED] - categoryMinted[GenesisCategory.RESERVED]
        });
    }
    
    // ========== Internal Functions ==========
    
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    // ========== Required Overrides ==========
    
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
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
