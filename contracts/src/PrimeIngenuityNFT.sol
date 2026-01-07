// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PrimeIngenuityNFT
 * @dev Scroll of Prime Ingenuity - NFT collection honoring inventors and engineers
 * from "TOP 43 MOST AMAZING INVENTIONS YOU'VE NEVER SEEN BEFORE"
 * 
 * Features:
 * - Paired NFTs (2 units per innovation) for co-ownership experiences
 * - ERC2981 royalty standard for sustainable creator incentives
 * - Lineage tracking for inventor/engineer contributions
 * - Dynamic metadata for post-mint storytelling updates
 * - Integration with ScrollVerse staking and voting systems
 */
contract PrimeIngenuityNFT is 
    ERC721, 
    ERC721Enumerable, 
    ERC721URIStorage, 
    ERC2981,
    AccessControl, 
    Pausable,
    ReentrancyGuard 
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant METADATA_UPDATER_ROLE = keccak256("METADATA_UPDATER_ROLE");
    
    uint256 private _tokenIdCounter;
    uint256 public constant MAX_INNOVATIONS = 43; // From the video
    uint256 public constant UNITS_PER_INNOVATION = 2; // Paired ownership
    uint256 public constant MAX_SUPPLY = MAX_INNOVATIONS * UNITS_PER_INNOVATION; // 86 total NFTs
    
    // Innovation tracking
    struct Innovation {
        string name;
        string innovationType;
        string creatorName;
        string useCase;
        string futureVisionImpact;
        uint256 innovationId;
        uint256 mintedUnits;
        bool isActive;
    }
    
    // Lineage tracking for remembrance
    struct Lineage {
        address[] previousOwners;
        uint256[] ownershipDurations;
        uint256 mintTimestamp;
        string[] coOwnerExperiences;
    }
    
    // Storage
    mapping(uint256 => Innovation) public innovations; // innovationId => Innovation
    mapping(uint256 => uint256) public tokenToInnovation; // tokenId => innovationId
    mapping(uint256 => Lineage) public tokenLineage; // tokenId => Lineage
    mapping(uint256 => string) private _dynamicMetadata; // tokenId => dynamic metadata URI
    
    // Events
    event InnovationRegistered(uint256 indexed innovationId, string name, string creatorName);
    event NFTPairMinted(uint256 indexed innovationId, uint256 token1, uint256 token2, address recipient);
    event MetadataUpdated(uint256 indexed tokenId, string newMetadataURI);
    event ExperienceAdded(uint256 indexed tokenId, string experience);
    event LineageTracked(uint256 indexed tokenId, address previousOwner, uint256 duration);
    
    constructor(
        string memory name,
        string memory symbol,
        address defaultAdmin
    ) ERC721(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, defaultAdmin);
        _grantRole(PAUSER_ROLE, defaultAdmin);
        _grantRole(METADATA_UPDATER_ROLE, defaultAdmin);
        
        // Set default royalty to 5% (500 basis points)
        _setDefaultRoyalty(defaultAdmin, 500);
    }
    
    /**
     * @dev Register a new innovation to the collection
     */
    function registerInnovation(
        uint256 innovationId,
        string memory name,
        string memory innovationType,
        string memory creatorName,
        string memory useCase,
        string memory futureVisionImpact
    ) external onlyRole(MINTER_ROLE) {
        require(innovationId < MAX_INNOVATIONS, "Invalid innovation ID");
        require(!innovations[innovationId].isActive, "Innovation already registered");
        
        innovations[innovationId] = Innovation({
            name: name,
            innovationType: innovationType,
            creatorName: creatorName,
            useCase: useCase,
            futureVisionImpact: futureVisionImpact,
            innovationId: innovationId,
            mintedUnits: 0,
            isActive: true
        });
        
        emit InnovationRegistered(innovationId, name, creatorName);
    }
    
    /**
     * @dev Mint paired NFTs for an innovation
     */
    function mintInnovationPair(
        uint256 innovationId,
        address recipient,
        string memory baseMetadataURI
    ) external onlyRole(MINTER_ROLE) nonReentrant returns (uint256, uint256) {
        require(innovations[innovationId].isActive, "Innovation not registered");
        require(innovations[innovationId].mintedUnits == 0, "Pair already minted");
        require(_tokenIdCounter + 2 <= MAX_SUPPLY, "Max supply reached");
        
        uint256 token1 = _tokenIdCounter++;
        uint256 token2 = _tokenIdCounter++;
        
        // Mint both tokens
        _safeMint(recipient, token1);
        _safeMint(recipient, token2);
        
        // Set metadata
        _setTokenURI(token1, string(abi.encodePacked(baseMetadataURI, "/", _toString(token1), ".json")));
        _setTokenURI(token2, string(abi.encodePacked(baseMetadataURI, "/", _toString(token2), ".json")));
        
        // Link tokens to innovation
        tokenToInnovation[token1] = innovationId;
        tokenToInnovation[token2] = innovationId;
        
        // Initialize lineage
        tokenLineage[token1].mintTimestamp = block.timestamp;
        tokenLineage[token2].mintTimestamp = block.timestamp;
        tokenLineage[token1].previousOwners.push(recipient);
        tokenLineage[token2].previousOwners.push(recipient);
        
        // Update innovation
        innovations[innovationId].mintedUnits = 2;
        
        emit NFTPairMinted(innovationId, token1, token2, recipient);
        
        return (token1, token2);
    }
    
    /**
     * @dev Update dynamic metadata for post-mint storytelling
     */
    function updateDynamicMetadata(
        uint256 tokenId,
        string memory newMetadataURI
    ) external onlyRole(METADATA_UPDATER_ROLE) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        _dynamicMetadata[tokenId] = newMetadataURI;
        emit MetadataUpdated(tokenId, newMetadataURI);
    }
    
    /**
     * @dev Add co-owner experience to token lineage
     */
    function addCoOwnerExperience(
        uint256 tokenId,
        string memory experience
    ) external {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        tokenLineage[tokenId].coOwnerExperiences.push(experience);
        emit ExperienceAdded(tokenId, experience);
    }
    
    /**
     * @dev Get innovation details
     */
    function getInnovation(uint256 innovationId) external view returns (Innovation memory) {
        require(innovations[innovationId].isActive, "Innovation not found");
        return innovations[innovationId];
    }
    
    /**
     * @dev Get token lineage for remembrance features
     */
    function getTokenLineage(uint256 tokenId) external view returns (
        address[] memory owners,
        uint256[] memory durations,
        uint256 mintTime,
        string[] memory experiences
    ) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        Lineage memory lineage = tokenLineage[tokenId];
        return (
            lineage.previousOwners,
            lineage.ownershipDurations,
            lineage.mintTimestamp,
            lineage.coOwnerExperiences
        );
    }
    
    /**
     * @dev Get dynamic metadata URI if set
     */
    function getDynamicMetadata(uint256 tokenId) external view returns (string memory) {
        return _dynamicMetadata[tokenId];
    }
    
    /**
     * @dev Set royalty info for specific token
     */
    function setTokenRoyalty(
        uint256 tokenId,
        address receiver,
        uint96 feeNumerator
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setTokenRoyalty(tokenId, receiver, feeNumerator);
    }
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Override _update to track lineage on transfers
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        whenNotPaused
        returns (address)
    {
        address from = _ownerOf(tokenId);
        
        // Track lineage on transfer (not on mint)
        if (from != address(0) && to != address(0)) {
            Lineage storage lineage = tokenLineage[tokenId];
            
            // Calculate ownership duration
            uint256 lastOwnerIndex = lineage.previousOwners.length - 1;
            if (lineage.previousOwners[lastOwnerIndex] == from) {
                uint256 duration = block.timestamp - 
                    (lastOwnerIndex == 0 ? lineage.mintTimestamp : 
                     block.timestamp - lineage.ownershipDurations[lastOwnerIndex - 1]);
                lineage.ownershipDurations.push(duration);
            }
            
            // Add new owner
            lineage.previousOwners.push(to);
            
            emit LineageTracked(tokenId, from, lineage.ownershipDurations[lineage.ownershipDurations.length - 1]);
        }
        
        return super._update(to, tokenId, auth);
    }
    
    /**
     * @dev Override tokenURI to support dynamic metadata
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        // Return dynamic metadata if set, otherwise return base metadata
        string memory dynamicURI = _dynamicMetadata[tokenId];
        if (bytes(dynamicURI).length > 0) {
            return dynamicURI;
        }
        return super.tokenURI(tokenId);
    }
    
    // Required overrides
    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage, ERC2981, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    // Utility function to convert uint to string
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
