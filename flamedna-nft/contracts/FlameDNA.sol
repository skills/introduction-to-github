// Sovereign Chais owns every yield
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FlameDNA
 * @dev ERC-721 NFT Collection for the ScrollVerse Ecosystem
 * @author Chais Hill - OmniTech1
 *
 * FlameDNA NFTs grant holders access to exclusive ScrollVerse content,
 * Sovereign TV premium features, and community governance rights.
 * 
 * Features:
 * - Rarity-based minting (Common, Rare, Epic, Legendary, Divine)
 * - Whitelist support for early access
 * - Batch minting (up to 10 tokens)
 * - Owner airdrops with custom rarity
 * - Pausable for emergency stops
 * - ReentrancyGuard for security
 * - Gas optimized storage and operations
 *
 * Gas Optimizations:
 * - Use uint8 for rarity enum instead of string storage
 * - Packed struct for token metadata
 * - Unchecked arithmetic where safe
 * - Cached storage reads
 */
contract FlameDNA is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable, Pausable, ReentrancyGuard {
    // Gas optimization: Use enum instead of string for rarity
    enum Rarity { Common, Rare, Epic, Legendary, Divine }
    
    // Token ID counter
    uint256 private _nextTokenId;

    // Maximum supply - immutable for gas savings
    uint256 public constant MAX_SUPPLY = 10000;

    // Mint price in wei (0.05 ETH)
    uint256 public mintPrice = 0.05 ether;

    // Whitelist mint price (discounted)
    uint256 public whitelistPrice = 0.04 ether;

    // Base URI for metadata
    string private _baseTokenURI;

    // Gas optimization: Use uint8 mapping for rarity instead of string
    mapping(uint256 => uint8) private _tokenRarity;

    // Whitelist mapping
    mapping(address => bool) public whitelist;
    
    // Whitelist minting enabled
    bool public whitelistEnabled;

    // Rarity level names for display
    string[5] private _rarityNames = ["Common", "Rare", "Epic", "Legendary", "Divine"];

    // Events
    event TokenMinted(address indexed to, uint256 indexed tokenId, uint8 rarity);
    event MintPriceUpdated(uint256 oldPrice, uint256 newPrice);
    event BaseURIUpdated(string newBaseURI);
    event WhitelistUpdated(address indexed account, bool status);
    event WhitelistEnabledUpdated(bool enabled);
    event Withdrawn(address indexed to, uint256 amount);

    constructor(
        address initialOwner,
        string memory baseURI
    ) ERC721("FlameDNA", "FDNA") Ownable(initialOwner) {
        _baseTokenURI = baseURI;
    }

    /**
     * @dev Get token rarity as string (for compatibility)
     */
    function tokenRarity(uint256 tokenId) public view returns (string memory) {
        require(tokenId < _nextTokenId, "FlameDNA: Token does not exist");
        return _rarityNames[_tokenRarity[tokenId]];
    }

    /**
     * @dev Get token rarity as uint8 (gas efficient)
     */
    function tokenRarityRaw(uint256 tokenId) public view returns (uint8) {
        require(tokenId < _nextTokenId, "FlameDNA: Token does not exist");
        return _tokenRarity[tokenId];
    }

    /**
     * @dev Get rarity levels array (for compatibility)
     */
    function rarityLevels(uint256 index) public view returns (string memory) {
        require(index < 5, "FlameDNA: Invalid rarity index");
        return _rarityNames[index];
    }

    /**
     * @dev Get the current mint price for an address
     */
    function getMintPrice(address minter) public view returns (uint256) {
        if (whitelistEnabled && whitelist[minter]) {
            return whitelistPrice;
        }
        return mintPrice;
    }

    /**
     * @dev Mint a new FlameDNA NFT (gas optimized)
     */
    function mint() public payable whenNotPaused nonReentrant {
        // Cache storage reads for gas optimization
        uint256 currentTokenId = _nextTokenId;
        require(currentTokenId < MAX_SUPPLY, "FlameDNA: Max supply reached");
        
        uint256 price = getMintPrice(msg.sender);
        require(msg.value >= price, "FlameDNA: Insufficient payment");

        // Use unchecked for gas savings (overflow impossible due to MAX_SUPPLY check)
        unchecked {
            _nextTokenId = currentTokenId + 1;
        }
        
        uint8 rarity = _determineRarityOptimized(currentTokenId);

        _safeMint(msg.sender, currentTokenId);
        _tokenRarity[currentTokenId] = rarity;

        emit TokenMinted(msg.sender, currentTokenId, rarity);

        // Refund excess payment using call for better compatibility
        if (msg.value > price) {
            uint256 refund;
            unchecked {
                refund = msg.value - price;
            }
            (bool success, ) = payable(msg.sender).call{value: refund}("");
            require(success, "FlameDNA: Refund failed");
        }
    }

    /**
     * @dev Batch mint multiple NFTs (gas optimized)
     * @param quantity Number of NFTs to mint
     */
    function batchMint(uint256 quantity) public payable whenNotPaused nonReentrant {
        require(quantity > 0 && quantity <= 10, "FlameDNA: Invalid quantity");
        
        // Cache storage read
        uint256 currentTokenId = _nextTokenId;
        require(currentTokenId + quantity <= MAX_SUPPLY, "FlameDNA: Would exceed max supply");
        
        uint256 price = getMintPrice(msg.sender);
        uint256 totalCost = price * quantity;
        require(msg.value >= totalCost, "FlameDNA: Insufficient payment");

        // Gas optimized loop with unchecked arithmetic
        for (uint256 i; i < quantity;) {
            uint256 tokenId = currentTokenId + i;
            uint8 rarity = _determineRarityOptimized(tokenId);

            _safeMint(msg.sender, tokenId);
            _tokenRarity[tokenId] = rarity;

            emit TokenMinted(msg.sender, tokenId, rarity);
            
            unchecked { ++i; }
        }
        
        // Update token counter once at end for gas savings
        unchecked {
            _nextTokenId = currentTokenId + quantity;
        }

        // Refund excess payment using call for better compatibility
        if (msg.value > totalCost) {
            uint256 refund;
            unchecked {
                refund = msg.value - totalCost;
            }
            (bool success, ) = payable(msg.sender).call{value: refund}("");
            require(success, "FlameDNA: Refund failed");
        }
    }

    /**
     * @dev Owner can mint to a specific address (for rewards/airdrops)
     */
    function ownerMint(address to, uint8 rarityIndex) public onlyOwner {
        require(_nextTokenId < MAX_SUPPLY, "FlameDNA: Max supply reached");
        require(rarityIndex < 5, "FlameDNA: Invalid rarity");

        uint256 tokenId = _nextTokenId;
        unchecked {
            _nextTokenId = tokenId + 1;
        }

        _safeMint(to, tokenId);
        _tokenRarity[tokenId] = rarityIndex;

        emit TokenMinted(to, tokenId, rarityIndex);
    }

    /**
     * @dev Owner mint with string rarity (backward compatible)
     */
    function ownerMintByName(address to, string memory rarity) public onlyOwner {
        uint8 rarityIndex = _rarityStringToIndex(rarity);
        ownerMint(to, rarityIndex);
    }

    /**
     * @dev Convert rarity string to index
     */
    function _rarityStringToIndex(string memory rarity) internal pure returns (uint8) {
        bytes32 rarityHash = keccak256(bytes(rarity));
        if (rarityHash == keccak256("Common")) return 0;
        if (rarityHash == keccak256("Rare")) return 1;
        if (rarityHash == keccak256("Epic")) return 2;
        if (rarityHash == keccak256("Legendary")) return 3;
        if (rarityHash == keccak256("Divine")) return 4;
        revert("FlameDNA: Invalid rarity");
    }

    /**
     * @dev Gas optimized rarity determination (returns uint8 instead of string)
     * @notice For production deployments requiring tamper-proof randomness,
     *         consider integrating Chainlink VRF (Verifiable Random Function)
     *         to prevent miner manipulation of block properties.
     *         Current implementation uses block properties for demonstration.
     */
    function _determineRarityOptimized(uint256 tokenId) internal view returns (uint8) {
        uint256 random = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            tokenId
        ))) % 100;

        if (random < 50) return 0;      // Common: 50%
        if (random < 80) return 1;      // Rare: 30%
        if (random < 93) return 2;      // Epic: 13%
        if (random < 99) return 3;      // Legendary: 6%
        return 4;                        // Divine: 1%
    }

    /**
     * @dev Determine rarity based on randomness (backward compatible)
     */
    function _determineRarity(uint256 tokenId) internal view returns (string memory) {
        uint256 random = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            tokenId
        ))) % 100;

        if (random < 50) return "Common";      // 50%
        if (random < 80) return "Rare";        // 30%
        if (random < 93) return "Epic";        // 13%
        if (random < 99) return "Legendary";   // 6%
        return "Divine";                        // 1%
    }

    /**
     * @dev Update mint price (owner only)
     */
    function setMintPrice(uint256 newPrice) public onlyOwner {
        uint256 oldPrice = mintPrice;
        mintPrice = newPrice;
        emit MintPriceUpdated(oldPrice, newPrice);
    }

    /**
     * @dev Update base URI (owner only)
     */
    function setBaseURI(string memory newBaseURI) public onlyOwner {
        _baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }

    /**
     * @dev Add addresses to whitelist (owner only)
     * @param addresses Array of addresses to whitelist (max 100 per call for gas efficiency)
     */
    function addToWhitelist(address[] calldata addresses) public onlyOwner {
        require(addresses.length <= 100, "FlameDNA: Max 100 addresses per call");
        
        for (uint256 i; i < addresses.length;) {
            whitelist[addresses[i]] = true;
            emit WhitelistUpdated(addresses[i], true);
            unchecked { ++i; }
        }
    }

    /**
     * @dev Remove addresses from whitelist (owner only)
     * @param addresses Array of addresses to remove (max 100 per call)
     */
    function removeFromWhitelist(address[] calldata addresses) public onlyOwner {
        require(addresses.length <= 100, "FlameDNA: Max 100 addresses per call");
        
        for (uint256 i; i < addresses.length;) {
            whitelist[addresses[i]] = false;
            emit WhitelistUpdated(addresses[i], false);
            unchecked { ++i; }
        }
    }

    /**
     * @dev Enable/disable whitelist minting (owner only)
     */
    function setWhitelistEnabled(bool enabled) public onlyOwner {
        whitelistEnabled = enabled;
        emit WhitelistEnabledUpdated(enabled);
    }

    /**
     * @dev Update whitelist price (owner only)
     */
    function setWhitelistPrice(uint256 newPrice) public onlyOwner {
        whitelistPrice = newPrice;
    }

    /**
     * @dev Pause minting (owner only)
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause minting (owner only)
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @dev Withdraw contract balance (owner only) - uses call for safety
     */
    function withdraw() public onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "FlameDNA: No balance to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "FlameDNA: Withdrawal failed");
        
        emit Withdrawn(owner(), balance);
    }

    /**
     * @dev Get total supply minted
     */
    function totalMinted() public view returns (uint256) {
        return _nextTokenId;
    }

    /**
     * @dev Get remaining supply
     */
    function remainingSupply() public view returns (uint256) {
        return MAX_SUPPLY - _nextTokenId;
    }

    // Override functions required by Solidity

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
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
}
