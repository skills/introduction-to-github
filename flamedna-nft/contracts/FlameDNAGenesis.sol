// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FlameDNAGenesis
 * @dev Genesis collection for FlameDNA - Soulbound tokens for founding members
 * 
 * Features:
 * - Soulbound (non-transferable) tokens for Genesis holders
 * - Unique DNA metadata per token
 * - ScrollVerse integration ready
 * 
 * @author Chais Hill - OmniTech1
 */
contract FlameDNAGenesis is 
    ERC721, 
    ERC721Enumerable, 
    ERC721URIStorage, 
    Ownable, 
    ReentrancyGuard 
{
    // Token counter
    uint256 private _nextTokenId;
    
    // Maximum supply
    uint256 public constant MAX_SUPPLY = 777;
    
    // Soulbound flag - when true, tokens cannot be transferred
    bool public soulbound = true;
    
    // Base URI
    string private _baseTokenURI;
    
    // DNA metadata mapping
    mapping(uint256 => DNAData) public tokenDNA;
    
    // Minting state
    bool public mintActive = false;
    
    // DNA Data structure
    struct DNAData {
        uint256 frequency;      // 369, 432, 528, 777, 963
        uint8 element;          // Fire, Water, Earth, Air, Ether
        uint8 tier;             // Genesis tier (1-7)
        uint256 mintTimestamp;
        bytes32 uniqueHash;
    }
    
    // Events
    event GenesisMinted(address indexed to, uint256 tokenId, uint256 frequency, uint8 element);
    event SoulboundStatusChanged(bool status);
    
    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI
    ) ERC721(name, symbol) Ownable(msg.sender) {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Mint Genesis token with DNA data
     * @param to Recipient address
     * @param frequency Sacred frequency (369, 432, 528, 777, 963)
     * @param element Element type (0-4: Fire, Water, Earth, Air, Ether)
     */
    function mintGenesis(
        address to,
        uint256 frequency,
        uint8 element
    ) external onlyOwner nonReentrant {
        require(mintActive, "Minting not active");
        require(_nextTokenId < MAX_SUPPLY, "Max supply reached");
        require(element <= 4, "Invalid element");
        require(
            frequency == 369 || 
            frequency == 432 || 
            frequency == 528 || 
            frequency == 777 || 
            frequency == 963,
            "Invalid frequency"
        );
        
        uint256 tokenId = _nextTokenId++;
        
        // Generate unique hash
        bytes32 uniqueHash = keccak256(
            abi.encodePacked(
                to,
                tokenId,
                frequency,
                element,
                block.timestamp,
                block.prevrandao
            )
        );
        
        // Store DNA data
        tokenDNA[tokenId] = DNAData({
            frequency: frequency,
            element: element,
            tier: uint8((tokenId % 7) + 1),
            mintTimestamp: block.timestamp,
            uniqueHash: uniqueHash
        });
        
        _safeMint(to, tokenId);
        
        emit GenesisMinted(to, tokenId, frequency, element);
    }
    
    /**
     * @dev Batch mint for airdrop
     */
    function batchMint(
        address[] calldata recipients,
        uint256[] calldata frequencies,
        uint8[] calldata elements
    ) external onlyOwner {
        require(
            recipients.length == frequencies.length && 
            frequencies.length == elements.length,
            "Array length mismatch"
        );
        require(_nextTokenId + recipients.length <= MAX_SUPPLY, "Exceeds max supply");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 tokenId = _nextTokenId++;
            
            bytes32 uniqueHash = keccak256(
                abi.encodePacked(
                    recipients[i],
                    tokenId,
                    frequencies[i],
                    elements[i],
                    block.timestamp
                )
            );
            
            tokenDNA[tokenId] = DNAData({
                frequency: frequencies[i],
                element: elements[i],
                tier: uint8((tokenId % 7) + 1),
                mintTimestamp: block.timestamp,
                uniqueHash: uniqueHash
            });
            
            _safeMint(recipients[i], tokenId);
            
            emit GenesisMinted(recipients[i], tokenId, frequencies[i], elements[i]);
        }
    }
    
    /**
     * @dev Toggle soulbound status
     */
    function setSoulbound(bool _soulbound) external onlyOwner {
        soulbound = _soulbound;
        emit SoulboundStatusChanged(_soulbound);
    }
    
    /**
     * @dev Toggle minting
     */
    function setMintActive(bool _active) external onlyOwner {
        mintActive = _active;
    }
    
    /**
     * @dev Set base URI
     */
    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Get DNA data for a token
     */
    function getDNA(uint256 tokenId) external view returns (DNAData memory) {
        require(tokenId < _nextTokenId, "Token does not exist");
        return tokenDNA[tokenId];
    }
    
    /**
     * @dev Get element name
     */
    function getElementName(uint8 element) public pure returns (string memory) {
        if (element == 0) return "Fire";
        if (element == 1) return "Water";
        if (element == 2) return "Earth";
        if (element == 3) return "Air";
        if (element == 4) return "Ether";
        return "Unknown";
    }
    
    /**
     * @dev Total minted
     */
    function totalMinted() public view returns (uint256) {
        return _nextTokenId;
    }
    
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    // ============ Soulbound Transfer Restrictions ============
    
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0)) and burning (to == address(0))
        // Block transfers when soulbound is true
        if (soulbound && from != address(0) && to != address(0)) {
            revert("Soulbound: transfers disabled");
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
