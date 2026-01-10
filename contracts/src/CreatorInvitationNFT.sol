// Sovereign Chais owns every yield
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CreatorInvitationNFT
 * @dev Specialized NFTs for talent and creators with unique rights and benefits
 * 
 * Types:
 * - Director's Vision: Complete creative control
 * - Actor's Presence: Character ownership rights
 * - Writer's Quill: Story credit and royalties
 * - Composer's Frequency: Music rights ownership
 * - Crew Collective: Fair profit sharing for crew
 */
contract CreatorInvitationNFT is ERC721, ERC721URIStorage, Pausable, AccessControl {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    uint256 private _tokenIdCounter;
    
    // Creator type enum
    enum CreatorType {
        Director,
        Actor,
        Writer,
        Composer,
        Crew
    }
    
    // Maximum supply per type
    uint256 public constant MAX_DIRECTORS = 10;
    uint256 public constant MAX_ACTORS = 50;
    uint256 public constant MAX_WRITERS = 20;
    uint256 public constant MAX_COMPOSERS = 15;
    uint256 public constant MAX_CREW = 500;
    
    // Counter per type
    mapping(CreatorType => uint256) public mintedPerType;
    
    // Token metadata
    struct CreatorToken {
        CreatorType creatorType;
        string name;
        string role;
        uint256 revenueShareBps; // Revenue share in basis points (100 = 1%)
        uint256 tokenAllocationBps; // Percentage of token allocation (1000 = 10%)
        bool hasVetoRights;
        bool hasApprovalRights;
        uint256 mintedAt;
    }
    
    mapping(uint256 => CreatorToken) public tokens;
    
    // Base URI for metadata
    string private _baseTokenURI;
    
    event CreatorTokenMinted(
        address indexed to,
        uint256 indexed tokenId,
        CreatorType creatorType,
        string name,
        string role
    );
    
    event RevenueShareUpdated(uint256 indexed tokenId, uint256 newShareBps);
    event RightsGranted(uint256 indexed tokenId, string rightType);
    
    constructor(string memory baseURI) ERC721("Creator Invitation NFT", "CINFT") {
        _baseTokenURI = baseURI;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }
    
    /**
     * @dev Mint Director's Vision NFT
     */
    function mintDirectorToken(
        address to,
        string memory name,
        string memory projectRole
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        require(mintedPerType[CreatorType.Director] < MAX_DIRECTORS, "Max directors reached");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        mintedPerType[CreatorType.Director]++;
        
        _safeMint(to, tokenId);
        
        tokens[tokenId] = CreatorToken({
            creatorType: CreatorType.Director,
            name: name,
            role: projectRole,
            revenueShareBps: 1000, // 10% revenue share
            tokenAllocationBps: 1000, // 10% of director's token allocation
            hasVetoRights: true,
            hasApprovalRights: true,
            mintedAt: block.timestamp
        });
        
        emit CreatorTokenMinted(to, tokenId, CreatorType.Director, name, projectRole);
        
        return tokenId;
    }
    
    /**
     * @dev Mint Actor's Presence NFT
     */
    function mintActorToken(
        address to,
        string memory name,
        string memory characterName,
        uint256 revenueShareBps,
        uint256 tokenAllocationBps
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        require(mintedPerType[CreatorType.Actor] < MAX_ACTORS, "Max actors reached");
        require(revenueShareBps <= 1000, "Revenue share too high"); // Max 10%
        require(tokenAllocationBps <= 1000, "Token allocation too high"); // Max 10%
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        mintedPerType[CreatorType.Actor]++;
        
        _safeMint(to, tokenId);
        
        tokens[tokenId] = CreatorToken({
            creatorType: CreatorType.Actor,
            name: name,
            role: characterName,
            revenueShareBps: revenueShareBps,
            tokenAllocationBps: tokenAllocationBps,
            hasVetoRights: false,
            hasApprovalRights: true, // Approval rights for character usage
            mintedAt: block.timestamp
        });
        
        emit CreatorTokenMinted(to, tokenId, CreatorType.Actor, name, characterName);
        
        return tokenId;
    }
    
    /**
     * @dev Mint Writer's Quill NFT
     */
    function mintWriterToken(
        address to,
        string memory name,
        string memory contribution
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        require(mintedPerType[CreatorType.Writer] < MAX_WRITERS, "Max writers reached");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        mintedPerType[CreatorType.Writer]++;
        
        _safeMint(to, tokenId);
        
        tokens[tokenId] = CreatorToken({
            creatorType: CreatorType.Writer,
            name: name,
            role: contribution,
            revenueShareBps: 800, // 8% revenue share
            tokenAllocationBps: 800, // 8% of writing token allocation
            hasVetoRights: false,
            hasApprovalRights: true, // Approval rights for script revisions
            mintedAt: block.timestamp
        });
        
        emit CreatorTokenMinted(to, tokenId, CreatorType.Writer, name, contribution);
        
        return tokenId;
    }
    
    /**
     * @dev Mint Composer's Frequency NFT
     */
    function mintComposerToken(
        address to,
        string memory name,
        string memory musicalContribution
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        require(mintedPerType[CreatorType.Composer] < MAX_COMPOSERS, "Max composers reached");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        mintedPerType[CreatorType.Composer]++;
        
        _safeMint(to, tokenId);
        
        tokens[tokenId] = CreatorToken({
            creatorType: CreatorType.Composer,
            name: name,
            role: musicalContribution,
            revenueShareBps: 500, // 5% revenue share (includes soundtrack sales)
            tokenAllocationBps: 500, // 5% of composer token allocation
            hasVetoRights: false,
            hasApprovalRights: true, // Approval rights for music usage
            mintedAt: block.timestamp
        });
        
        emit CreatorTokenMinted(to, tokenId, CreatorType.Composer, name, musicalContribution);
        
        return tokenId;
    }
    
    /**
     * @dev Mint Crew Collective NFT
     */
    function mintCrewToken(
        address to,
        string memory name,
        string memory position
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        require(mintedPerType[CreatorType.Crew] < MAX_CREW, "Max crew members reached");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        mintedPerType[CreatorType.Crew]++;
        
        _safeMint(to, tokenId);
        
        tokens[tokenId] = CreatorToken({
            creatorType: CreatorType.Crew,
            name: name,
            role: position,
            revenueShareBps: 10, // 0.1% revenue share per crew member
            tokenAllocationBps: 10, // 0.1% of crew token allocation
            hasVetoRights: false,
            hasApprovalRights: false,
            mintedAt: block.timestamp
        });
        
        emit CreatorTokenMinted(to, tokenId, CreatorType.Crew, name, position);
        
        return tokenId;
    }
    
    /**
     * @dev Update revenue share for a token
     */
    function updateRevenueShare(uint256 tokenId, uint256 newShareBps) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(_exists(tokenId), "Token does not exist");
        require(newShareBps <= 2000, "Revenue share too high"); // Max 20%
        
        tokens[tokenId].revenueShareBps = newShareBps;
        emit RevenueShareUpdated(tokenId, newShareBps);
    }
    
    /**
     * @dev Grant special rights to a token
     */
    function grantVetoRights(uint256 tokenId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_exists(tokenId), "Token does not exist");
        tokens[tokenId].hasVetoRights = true;
        emit RightsGranted(tokenId, "Veto");
    }
    
    /**
     * @dev Grant approval rights to a token
     */
    function grantApprovalRights(uint256 tokenId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_exists(tokenId), "Token does not exist");
        tokens[tokenId].hasApprovalRights = true;
        emit RightsGranted(tokenId, "Approval");
    }
    
    /**
     * @dev Get token details
     */
    function getTokenDetails(uint256 tokenId) external view returns (CreatorToken memory) {
        require(_exists(tokenId), "Token does not exist");
        return tokens[tokenId];
    }
    
    /**
     * @dev Get all tokens owned by an address
     */
    function getTokensByOwner(address owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](balance);
        
        uint256 index = 0;
        for (uint256 i = 0; i < _tokenIdCounter; i++) {
            if (_exists(i) && ownerOf(i) == owner) {
                tokenIds[index] = i;
                index++;
            }
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Check if address has veto rights
     */
    function hasVetoRights(address owner) external view returns (bool) {
        uint256 balance = balanceOf(owner);
        
        for (uint256 i = 0; i < _tokenIdCounter; i++) {
            if (_exists(i) && ownerOf(i) == owner && tokens[i].hasVetoRights) {
                return true;
            }
        }
        
        return false;
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
     * @dev Pause token transfers
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    // Required overrides
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
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
