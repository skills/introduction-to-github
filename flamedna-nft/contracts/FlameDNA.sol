// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title FlameDNA
 * @dev ERC-721 NFT Collection for the ScrollVerse Ecosystem
 * @author Chais Hill - OmniTech1
 *
 * FlameDNA NFTs grant holders access to exclusive ScrollVerse content,
 * Sovereign TV premium features, and community governance rights.
 */
contract FlameDNA is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable, Pausable {
    // Token ID counter
    uint256 private _nextTokenId;

    // Maximum supply
    uint256 public constant MAX_SUPPLY = 10000;

    // Mint price in wei (0.05 ETH)
    uint256 public mintPrice = 0.05 ether;

    // Base URI for metadata
    string private _baseTokenURI;

    // Mapping for token rarity
    mapping(uint256 => string) public tokenRarity;

    // Rarity levels
    string[] public rarityLevels = ["Common", "Rare", "Epic", "Legendary", "Divine"];

    // Events
    event TokenMinted(address indexed to, uint256 indexed tokenId, string rarity);
    event MintPriceUpdated(uint256 oldPrice, uint256 newPrice);
    event BaseURIUpdated(string newBaseURI);

    constructor(
        address initialOwner,
        string memory baseURI
    ) ERC721("FlameDNA", "FDNA") Ownable(initialOwner) {
        _baseTokenURI = baseURI;
    }

    /**
     * @dev Mint a new FlameDNA NFT
     */
    function mint() public payable whenNotPaused {
        require(_nextTokenId < MAX_SUPPLY, "FlameDNA: Max supply reached");
        require(msg.value >= mintPrice, "FlameDNA: Insufficient payment");

        uint256 tokenId = _nextTokenId++;
        string memory rarity = _determineRarity(tokenId);

        _safeMint(msg.sender, tokenId);
        tokenRarity[tokenId] = rarity;

        emit TokenMinted(msg.sender, tokenId, rarity);

        // Refund excess payment
        if (msg.value > mintPrice) {
            payable(msg.sender).transfer(msg.value - mintPrice);
        }
    }

    /**
     * @dev Batch mint multiple NFTs
     * @param quantity Number of NFTs to mint
     */
    function batchMint(uint256 quantity) public payable whenNotPaused {
        require(quantity > 0 && quantity <= 10, "FlameDNA: Invalid quantity");
        require(_nextTokenId + quantity <= MAX_SUPPLY, "FlameDNA: Would exceed max supply");
        require(msg.value >= mintPrice * quantity, "FlameDNA: Insufficient payment");

        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nextTokenId++;
            string memory rarity = _determineRarity(tokenId);

            _safeMint(msg.sender, tokenId);
            tokenRarity[tokenId] = rarity;

            emit TokenMinted(msg.sender, tokenId, rarity);
        }

        // Refund excess payment
        uint256 totalCost = mintPrice * quantity;
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
    }

    /**
     * @dev Owner can mint to a specific address (for rewards/airdrops)
     */
    function ownerMint(address to, string memory rarity) public onlyOwner {
        require(_nextTokenId < MAX_SUPPLY, "FlameDNA: Max supply reached");
        require(_isValidRarity(rarity), "FlameDNA: Invalid rarity");

        uint256 tokenId = _nextTokenId++;

        _safeMint(to, tokenId);
        tokenRarity[tokenId] = rarity;

        emit TokenMinted(to, tokenId, rarity);
    }

    /**
     * @dev Determine rarity based on randomness
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
     * @dev Check if rarity string is valid
     */
    function _isValidRarity(string memory rarity) internal view returns (bool) {
        for (uint256 i = 0; i < rarityLevels.length; i++) {
            if (keccak256(bytes(rarityLevels[i])) == keccak256(bytes(rarity))) {
                return true;
            }
        }
        return false;
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
     * @dev Withdraw contract balance (owner only)
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "FlameDNA: No balance to withdraw");
        payable(owner()).transfer(balance);
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
