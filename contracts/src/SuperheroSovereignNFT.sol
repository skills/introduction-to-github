// Sovereign Chais owns every yield
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title SuperheroSovereignNFT
 * @dev NFT collection for Superhero Sovereign ecosystem with tiered benefits
 * 
 * Tiers:
 * - Founding Sovereign (1-1000): Highest privileges
 * - Sovereign Guardian (1001-6000): Premium privileges
 * - Sovereign Citizen (6001-21000): Standard privileges
 * - Frequency Keeper (21001-50000): Basic privileges
 */
contract SuperheroSovereignNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Pausable, AccessControl {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    uint256 private _tokenIdCounter;
    
    uint256 public constant MAX_SUPPLY = 50000;
    
    // Tier boundaries
    uint256 public constant FOUNDING_SOVEREIGN_MAX = 1000;
    uint256 public constant SOVEREIGN_GUARDIAN_MAX = 6000;
    uint256 public constant SOVEREIGN_CITIZEN_MAX = 21000;
    uint256 public constant FREQUENCY_KEEPER_MAX = 50000;
    
    // Mint prices in wei (approximate ETH values)
    uint256 public foundingSovereignPrice = 0.5 ether;
    uint256 public sovereignGuardianPrice = 0.2 ether;
    uint256 public sovereignCitizenPrice = 0.08 ether;
    uint256 public frequencyKeeperPrice = 0.05 ether;
    
    // Base URI for metadata
    string private _baseTokenURI;
    
    // Voting power multipliers for governance
    mapping(uint256 => uint256) public votingPowerMultiplier;
    
    // Revenue share percentages (in basis points, 100 = 1%)
    mapping(uint256 => uint256) public revenueShareBps;
    
    // NFT evolution tracking
    mapping(uint256 => uint256) public evolutionLevel;
    mapping(uint256 => string[]) public achievements;
    
    event NFTMinted(address indexed to, uint256 indexed tokenId, string tier);
    event NFTEvolved(uint256 indexed tokenId, uint256 newLevel);
    event AchievementUnlocked(uint256 indexed tokenId, string achievement);
    event RevenueDistributed(uint256 indexed tokenId, uint256 amount);
    
    constructor(string memory baseURI) ERC721("Superhero Sovereign NFT", "SSNFT") {
        _baseTokenURI = baseURI;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }
    
    /**
     * @dev Get the tier of a token based on its ID
     */
    function getTier(uint256 tokenId) public pure returns (string memory) {
        if (tokenId <= FOUNDING_SOVEREIGN_MAX) return "Founding Sovereign";
        if (tokenId <= SOVEREIGN_GUARDIAN_MAX) return "Sovereign Guardian";
        if (tokenId <= SOVEREIGN_CITIZEN_MAX) return "Sovereign Citizen";
        if (tokenId <= FREQUENCY_KEEPER_MAX) return "Frequency Keeper";
        return "Unknown";
    }
    
    /**
     * @dev Get voting power multiplier based on tier
     */
    function getVotingPower(uint256 tokenId) public view returns (uint256) {
        if (votingPowerMultiplier[tokenId] > 0) {
            return votingPowerMultiplier[tokenId];
        }
        
        // Default multipliers based on tier
        if (tokenId <= FOUNDING_SOVEREIGN_MAX) return 5;
        if (tokenId <= SOVEREIGN_GUARDIAN_MAX) return 3;
        if (tokenId <= SOVEREIGN_CITIZEN_MAX) return 2;
        return 1; // Frequency Keeper
    }
    
    /**
     * @dev Get current mint price based on supply
     */
    function getCurrentMintPrice() public view returns (uint256) {
        uint256 currentSupply = _tokenIdCounter;
        
        if (currentSupply < FOUNDING_SOVEREIGN_MAX) return foundingSovereignPrice;
        if (currentSupply < SOVEREIGN_GUARDIAN_MAX) return sovereignGuardianPrice;
        if (currentSupply < SOVEREIGN_CITIZEN_MAX) return sovereignCitizenPrice;
        return frequencyKeeperPrice;
    }
    
    /**
     * @dev Mint a new NFT
     */
    function mint(address to) public payable whenNotPaused {
        require(_tokenIdCounter < MAX_SUPPLY, "Max supply reached");
        
        uint256 mintPrice = getCurrentMintPrice();
        require(msg.value >= mintPrice, "Insufficient payment");
        
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        
        _safeMint(to, tokenId);
        
        string memory tier = getTier(tokenId);
        
        // Set initial voting power and revenue share based on tier
        _initializeTierBenefits(tokenId);
        
        emit NFTMinted(to, tokenId, tier);
        
        // Refund excess payment
        if (msg.value > mintPrice) {
            payable(msg.sender).transfer(msg.value - mintPrice);
        }
    }
    
    /**
     * @dev Batch mint for admin (used for team allocation)
     */
    function batchMint(address to, uint256 quantity) external onlyRole(MINTER_ROLE) {
        require(_tokenIdCounter + quantity <= MAX_SUPPLY, "Would exceed max supply");
        
        for (uint256 i = 0; i < quantity; i++) {
            _tokenIdCounter++;
            uint256 tokenId = _tokenIdCounter;
            _safeMint(to, tokenId);
            _initializeTierBenefits(tokenId);
        }
    }
    
    /**
     * @dev Initialize tier-specific benefits
     */
    function _initializeTierBenefits(uint256 tokenId) private {
        if (tokenId <= FOUNDING_SOVEREIGN_MAX) {
            votingPowerMultiplier[tokenId] = 5;
            revenueShareBps[tokenId] = 1; // 0.01% per NFT
        } else if (tokenId <= SOVEREIGN_GUARDIAN_MAX) {
            votingPowerMultiplier[tokenId] = 3;
            revenueShareBps[tokenId] = 0; // 0.005% per NFT (represented as 0 for simplicity)
        } else if (tokenId <= SOVEREIGN_CITIZEN_MAX) {
            votingPowerMultiplier[tokenId] = 2;
            revenueShareBps[tokenId] = 0;
        } else {
            votingPowerMultiplier[tokenId] = 1;
            revenueShareBps[tokenId] = 0;
        }
        
        evolutionLevel[tokenId] = 1;
    }
    
    /**
     * @dev Evolve NFT to increase its level and benefits
     */
    function evolveNFT(uint256 tokenId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_exists(tokenId), "Token does not exist");
        evolutionLevel[tokenId]++;
        
        // Increase voting power with evolution
        votingPowerMultiplier[tokenId] = getVotingPower(tokenId) + (evolutionLevel[tokenId] - 1);
        
        emit NFTEvolved(tokenId, evolutionLevel[tokenId]);
    }
    
    /**
     * @dev Add achievement to NFT
     */
    function addAchievement(uint256 tokenId, string memory achievement) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_exists(tokenId), "Token does not exist");
        achievements[tokenId].push(achievement);
        emit AchievementUnlocked(tokenId, achievement);
    }
    
    /**
     * @dev Get all achievements for a token
     */
    function getAchievements(uint256 tokenId) external view returns (string[] memory) {
        return achievements[tokenId];
    }
    
    /**
     * @dev Update mint prices
     */
    function updateMintPrices(
        uint256 _foundingSovereignPrice,
        uint256 _sovereignGuardianPrice,
        uint256 _sovereignCitizenPrice,
        uint256 _frequencyKeeperPrice
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        foundingSovereignPrice = _foundingSovereignPrice;
        sovereignGuardianPrice = _sovereignGuardianPrice;
        sovereignCitizenPrice = _sovereignCitizenPrice;
        frequencyKeeperPrice = _frequencyKeeperPrice;
    }
    
    /**
     * @dev Withdraw contract balance
     */
    function withdraw() external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        payable(msg.sender).transfer(balance);
    }
    
    /**
     * @dev Set base URI for metadata
     */
    function setBaseURI(string memory baseURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Base URI for computing tokenURI
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev Pause minting
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause minting
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    // Required overrides
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        whenNotPaused
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
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
        override(ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
