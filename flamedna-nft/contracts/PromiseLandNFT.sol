// Sovereign Chais owns every yield
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PromiseLandNFT
 * @dev FlameDNA NFT Collection - ERC-721 with OpenSea integration
 * 
 * Features:
 * - Genesis and Founding Supporter tier minting
 * - Royalty support (ERC-2981)
 * - OpenSea metadata compatibility
 * - Scroll Testnet and Mainnet deployment ready
 * 
 * @author Chais Hill - OmniTech1
 */
contract PromiseLandNFT is 
    ERC721, 
    ERC721Enumerable, 
    ERC721URIStorage, 
    ERC721Royalty, 
    Ownable, 
    ReentrancyGuard 
{
    using Strings for uint256;

    // Token counter
    uint256 private _nextTokenId;
    
    // Maximum supply constants
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant GENESIS_SUPPLY = 1000;
    uint256 public constant FOUNDING_SUPPLY = 3000;
    
    // Pricing
    uint256 public genesisMintPrice = 0.1 ether;
    uint256 public foundingMintPrice = 0.05 ether;
    uint256 public publicMintPrice = 0.03 ether;
    
    // Minting state
    bool public genesisActive = false;
    bool public foundingActive = false;
    bool public publicMintActive = false;
    
    // Base URI for metadata
    string private _baseTokenURI;
    string private _contractURI;
    
    // Tier tracking
    mapping(uint256 => Tier) public tokenTier;
    mapping(address => uint256) public genesisMinted;
    mapping(address => uint256) public foundingMinted;
    
    // Allowlists
    mapping(address => bool) public genesisAllowlist;
    mapping(address => bool) public foundingAllowlist;
    
    // Max per wallet
    uint256 public maxGenesisPerWallet = 2;
    uint256 public maxFoundingPerWallet = 5;
    uint256 public maxPublicPerWallet = 10;
    
    // Tier enum
    enum Tier {
        Genesis,
        FoundingSupporter,
        Public
    }
    
    // Events
    event GenesisNFTMinted(address indexed to, uint256 tokenId);
    event FoundingNFTMinted(address indexed to, uint256 tokenId);
    event PublicNFTMinted(address indexed to, uint256 tokenId);
    event AllowlistUpdated(address indexed account, bool isGenesis, bool status);
    event MintPhaseUpdated(bool genesis, bool founding, bool publicMint);
    
    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI,
        string memory contractURI_,
        address royaltyReceiver,
        uint96 royaltyFeeNumerator
    ) ERC721(name, symbol) Ownable(msg.sender) {
        _baseTokenURI = baseURI;
        _contractURI = contractURI_;
        
        // Set default royalty (e.g., 5% = 500 basis points)
        _setDefaultRoyalty(royaltyReceiver, royaltyFeeNumerator);
    }
    
    // ============ Minting Functions ============
    
    /**
     * @dev Mint Genesis tier NFT (allowlist only)
     */
    function mintGenesis(uint256 quantity) 
        external 
        payable 
        nonReentrant 
    {
        require(genesisActive, "Genesis minting not active");
        require(genesisAllowlist[msg.sender], "Not on Genesis allowlist");
        require(genesisMinted[msg.sender] + quantity <= maxGenesisPerWallet, "Exceeds max per wallet");
        require(_nextTokenId + quantity <= GENESIS_SUPPLY, "Exceeds Genesis supply");
        require(msg.value >= genesisMintPrice * quantity, "Insufficient payment");
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nextTokenId++;
            _safeMint(msg.sender, tokenId);
            tokenTier[tokenId] = Tier.Genesis;
            emit GenesisNFTMinted(msg.sender, tokenId);
        }
        
        genesisMinted[msg.sender] += quantity;
    }
    
    /**
     * @dev Mint Founding Supporter tier NFT
     * @notice Requires being on the founding allowlist to mint
     */
    function mintFounding(uint256 quantity) 
        external 
        payable 
        nonReentrant 
    {
        require(foundingActive, "Founding minting not active");
        require(foundingAllowlist[msg.sender], "Not on Founding allowlist");
        require(foundingMinted[msg.sender] + quantity <= maxFoundingPerWallet, "Exceeds max per wallet");
        require(_nextTokenId + quantity <= GENESIS_SUPPLY + FOUNDING_SUPPLY, "Exceeds Founding supply");
        require(msg.value >= foundingMintPrice * quantity, "Insufficient payment");
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nextTokenId++;
            _safeMint(msg.sender, tokenId);
            tokenTier[tokenId] = Tier.FoundingSupporter;
            emit FoundingNFTMinted(msg.sender, tokenId);
        }
        
        foundingMinted[msg.sender] += quantity;
    }
    
    /**
     * @dev Public mint function
     */
    function mintPublic(uint256 quantity) 
        external 
        payable 
        nonReentrant 
    {
        require(publicMintActive, "Public minting not active");
        require(_nextTokenId + quantity <= MAX_SUPPLY, "Exceeds max supply");
        require(quantity <= maxPublicPerWallet, "Exceeds max per transaction");
        require(msg.value >= publicMintPrice * quantity, "Insufficient payment");
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nextTokenId++;
            _safeMint(msg.sender, tokenId);
            tokenTier[tokenId] = Tier.Public;
            emit PublicNFTMinted(msg.sender, tokenId);
        }
    }
    
    /**
     * @dev Owner mint for airdrops and reserves
     */
    function ownerMint(address to, uint256 quantity, Tier tier) 
        external 
        onlyOwner 
    {
        require(_nextTokenId + quantity <= MAX_SUPPLY, "Exceeds max supply");
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nextTokenId++;
            _safeMint(to, tokenId);
            tokenTier[tokenId] = tier;
        }
    }
    
    // ============ Allowlist Management ============
    
    function setGenesisAllowlist(address[] calldata addresses, bool status) 
        external 
        onlyOwner 
    {
        for (uint256 i = 0; i < addresses.length; i++) {
            genesisAllowlist[addresses[i]] = status;
            emit AllowlistUpdated(addresses[i], true, status);
        }
    }
    
    function setFoundingAllowlist(address[] calldata addresses, bool status) 
        external 
        onlyOwner 
    {
        for (uint256 i = 0; i < addresses.length; i++) {
            foundingAllowlist[addresses[i]] = status;
            emit AllowlistUpdated(addresses[i], false, status);
        }
    }
    
    // ============ Phase Management ============
    
    function setMintPhases(bool genesis, bool founding, bool publicMint) 
        external 
        onlyOwner 
    {
        genesisActive = genesis;
        foundingActive = founding;
        publicMintActive = publicMint;
        emit MintPhaseUpdated(genesis, founding, publicMint);
    }
    
    // ============ Price Management ============
    
    function setPrices(
        uint256 _genesisMintPrice,
        uint256 _foundingMintPrice,
        uint256 _publicMintPrice
    ) external onlyOwner {
        genesisMintPrice = _genesisMintPrice;
        foundingMintPrice = _foundingMintPrice;
        publicMintPrice = _publicMintPrice;
    }
    
    // ============ URI Functions ============
    
    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    function setContractURI(string calldata contractURI_) external onlyOwner {
        _contractURI = contractURI_;
    }
    
    /**
     * @dev Returns contract-level metadata for OpenSea
     */
    function contractURI() public view returns (string memory) {
        return _contractURI;
    }
    
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    // ============ Withdrawal ============
    
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    // ============ View Functions ============
    
    function totalMinted() public view returns (uint256) {
        return _nextTokenId;
    }
    
    function getTokenTier(uint256 tokenId) public view returns (Tier) {
        require(tokenId < _nextTokenId, "Token does not exist");
        return tokenTier[tokenId];
    }
    
    function remainingGenesis() public view returns (uint256) {
        if (_nextTokenId >= GENESIS_SUPPLY) return 0;
        return GENESIS_SUPPLY - _nextTokenId;
    }
    
    function remainingFounding() public view returns (uint256) {
        uint256 maxFounding = GENESIS_SUPPLY + FOUNDING_SUPPLY;
        if (_nextTokenId >= maxFounding) return 0;
        if (_nextTokenId < GENESIS_SUPPLY) return FOUNDING_SUPPLY;
        return maxFounding - _nextTokenId;
    }
    
    // ============ Required Overrides ============
    
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
        override(ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Royalty)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
