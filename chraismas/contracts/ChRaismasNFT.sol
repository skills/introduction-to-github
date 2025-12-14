// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ChRaismasNFT
 * @dev ChRaismas NFT collection with embedded utility:
 * - Voting rights in ScrollVerse DAOs
 * - Access to IRL exclusives
 * - Sacred geometry and universal significance attributes
 */
contract ChRaismasNFT is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable {
    uint256 private _nextTokenId;
    
    // NFT Tiers
    enum Tier {
        NONE,
        REDEEMER_OF_LIGHT,
        SURGE_FREQUENCY_GUARDIAN,
        SACRED_GEOMETRY_KEEPER,
        UNIVERSAL_HARMONIZER
    }
    
    // Mapping from token ID to tier
    mapping(uint256 => Tier) public tokenTiers;
    
    // Mapping from token ID to voting power
    mapping(uint256 => uint256) public votingPower;
    
    // Mapping from token ID to IRL exclusive access level
    mapping(uint256 => uint256) public irlAccessLevel;
    
    // Base URI for metadata
    string private _baseURIExtended;
    
    // Minting enabled flag
    bool public mintingEnabled = true;
    
    // Max supply
    uint256 public constant MAX_SUPPLY = 10000;
    
    // Events
    event NFTMinted(address indexed recipient, uint256 indexed tokenId, Tier tier);
    event VotingPowerUpdated(uint256 indexed tokenId, uint256 newPower);
    event IRLAccessGranted(uint256 indexed tokenId, uint256 accessLevel);
    event MintingToggled(bool enabled);
    
    constructor(address initialOwner) 
        ERC721("ChRaismas Collection", "CHRAISMAS") 
        Ownable(initialOwner) 
    {
        _baseURIExtended = "ipfs://";
    }
    
    /**
     * @dev Mint a ChRaismas NFT with specified attributes
     * @param recipient Address receiving the NFT
     * @param tier NFT tier/type
     * @param votingPowerAmount Voting power assigned to this NFT
     * @param accessLevel IRL exclusive access level
     * @param tokenURI IPFS metadata URI
     */
    function mintChRaismasNFT(
        address recipient,
        Tier tier,
        uint256 votingPowerAmount,
        uint256 accessLevel,
        string memory tokenURI
    ) external onlyOwner returns (uint256) {
        require(mintingEnabled, "Minting is disabled");
        require(_nextTokenId < MAX_SUPPLY, "Max supply reached");
        require(recipient != address(0), "Invalid recipient");
        require(tier != Tier.NONE, "Invalid tier");
        
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        tokenTiers[tokenId] = tier;
        votingPower[tokenId] = votingPowerAmount;
        irlAccessLevel[tokenId] = accessLevel;
        
        emit NFTMinted(recipient, tokenId, tier);
        emit VotingPowerUpdated(tokenId, votingPowerAmount);
        emit IRLAccessGranted(tokenId, accessLevel);
        
        return tokenId;
    }
    
    /**
     * @dev Batch mint multiple NFTs
     * @param recipients Array of recipient addresses
     * @param tiers Array of NFT tiers
     * @param votingPowers Array of voting powers
     * @param accessLevels Array of access levels
     * @param tokenURIs Array of token URIs
     */
    function batchMint(
        address[] calldata recipients,
        Tier[] calldata tiers,
        uint256[] calldata votingPowers,
        uint256[] calldata accessLevels,
        string[] calldata tokenURIs
    ) external onlyOwner {
        require(
            recipients.length == tiers.length &&
            recipients.length == votingPowers.length &&
            recipients.length == accessLevels.length &&
            recipients.length == tokenURIs.length,
            "Array lengths mismatch"
        );
        
        for (uint256 i = 0; i < recipients.length; i++) {
            mintChRaismasNFT(
                recipients[i],
                tiers[i],
                votingPowers[i],
                accessLevels[i],
                tokenURIs[i]
            );
        }
    }
    
    /**
     * @dev Update voting power for a token
     * @param tokenId Token ID to update
     * @param newPower New voting power
     */
    function updateVotingPower(uint256 tokenId, uint256 newPower) external onlyOwner {
        require(tokenId < _nextTokenId, "Token does not exist");
        votingPower[tokenId] = newPower;
        emit VotingPowerUpdated(tokenId, newPower);
    }
    
    /**
     * @dev Grant IRL exclusive access
     * @param tokenId Token ID to update
     * @param accessLevel New access level
     */
    function grantIRLAccess(uint256 tokenId, uint256 accessLevel) external onlyOwner {
        require(tokenId < _nextTokenId, "Token does not exist");
        irlAccessLevel[tokenId] = accessLevel;
        emit IRLAccessGranted(tokenId, accessLevel);
    }
    
    /**
     * @dev Toggle minting on/off
     */
    function toggleMinting() external onlyOwner {
        mintingEnabled = !mintingEnabled;
        emit MintingToggled(mintingEnabled);
    }
    
    /**
     * @dev Set base URI for metadata
     * @param baseURI New base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseURIExtended = baseURI;
    }
    
    /**
     * @dev Get total voting power for an address
     * @param owner Address to query
     * @return Total voting power across all owned tokens
     */
    function getVotingPowerForAddress(address owner) external view returns (uint256) {
        uint256 balance = balanceOf(owner);
        uint256 totalPower = 0;
        
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(owner, i);
            totalPower += votingPower[tokenId];
        }
        
        return totalPower;
    }
    
    /**
     * @dev Get all token IDs owned by an address
     * @param owner Address to query
     * @return Array of token IDs
     */
    function getTokensOfOwner(address owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokens = new uint256[](balance);
        
        for (uint256 i = 0; i < balance; i++) {
            tokens[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return tokens;
    }
    
    // Override required functions
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseURIExtended;
    }
    
    function tokenURI(uint256 tokenId) public view virtual override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC721Enumerable, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    function _update(address to, uint256 tokenId, address auth) internal virtual override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }
    
    function _increaseBalance(address account, uint128 value) internal virtual override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }
}
