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
 * @title IamKingNFT
 * @dev "Iam 👑 King" NFT Collection on Polygon zkEVM
 * @author Chais Hill - OmniTech1
 *
 * The "Iam 👑 King" collection represents sovereign identity within
 * the ScrollVerse ecosystem. Each NFT grants exclusive access to
 * Sovereign TV premium content and governance rights.
 *
 * Features:
 * - Deployed on Polygon zkEVM for low gas costs
 * - Tiered membership levels (Baron, Duke, Prince, King, Emperor)
 * - Sovereign TV integration for premium content gating
 * - Governance voting power based on tier
 * - Staking rewards integration
 *
 * Network: Polygon zkEVM
 * - Mainnet Chain ID: 1101
 * - Testnet (Cardona) Chain ID: 2442
 */
contract IamKingNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable, Pausable, ReentrancyGuard {
    // Token ID counter
    uint256 private _nextTokenId;

    // Maximum supply
    uint256 public constant MAX_SUPPLY = 5000;

    // Tier system
    enum Tier { Baron, Duke, Prince, King, Emperor }

    // Tier pricing in MATIC/POL
    uint256 public baronPrice = 50 ether;      // 50 POL
    uint256 public dukePrice = 100 ether;      // 100 POL
    uint256 public princePrice = 250 ether;    // 250 POL
    uint256 public kingPrice = 500 ether;      // 500 POL
    uint256 public emperorPrice = 1000 ether;  // 1000 POL

    // Tier supply limits
    uint256 public constant BARON_MAX = 2000;
    uint256 public constant DUKE_MAX = 1500;
    uint256 public constant PRINCE_MAX = 1000;
    uint256 public constant KING_MAX = 400;
    uint256 public constant EMPEROR_MAX = 100;

    // Tier minted counts
    uint256 public baronMinted;
    uint256 public dukeMinted;
    uint256 public princeMinted;
    uint256 public kingMinted;
    uint256 public emperorMinted;

    // Token tier mapping
    mapping(uint256 => Tier) public tokenTier;

    // Sovereign TV access levels per tier
    mapping(Tier => string[]) public tierBenefits;

    // Governance voting weight per tier
    mapping(Tier => uint256) public tierVotingPower;

    // Base URI for metadata
    string private _baseTokenURI;

    // Sovereign TV contract address for integration
    address public sovereignTVContract;

    // Events
    event KingMinted(address indexed to, uint256 indexed tokenId, Tier tier);
    event TierUpgraded(uint256 indexed tokenId, Tier oldTier, Tier newTier);
    event SovereignTVLinked(address indexed contractAddress);
    event PriceUpdated(Tier tier, uint256 oldPrice, uint256 newPrice);
    event Withdrawn(address indexed to, uint256 amount);

    constructor(
        address initialOwner,
        string memory baseURI
    ) ERC721("Iam King", "KING") Ownable(initialOwner) {
        _baseTokenURI = baseURI;

        // Initialize tier voting power
        tierVotingPower[Tier.Baron] = 1;
        tierVotingPower[Tier.Duke] = 3;
        tierVotingPower[Tier.Prince] = 5;
        tierVotingPower[Tier.King] = 10;
        tierVotingPower[Tier.Emperor] = 25;

        // Initialize tier benefits
        tierBenefits[Tier.Baron] = _createBenefits("basic_streaming", "community_access");
        tierBenefits[Tier.Duke] = _createBenefits("basic_streaming", "community_access", "exclusive_content", "early_access");
        tierBenefits[Tier.Prince] = _createBenefits("basic_streaming", "community_access", "exclusive_content", "early_access", "live_events", "governance_voice");
        tierBenefits[Tier.King] = _createBenefits("basic_streaming", "community_access", "exclusive_content", "early_access", "live_events", "governance_voice", "vip_events", "revenue_share");
        tierBenefits[Tier.Emperor] = _createBenefits("basic_streaming", "community_access", "exclusive_content", "early_access", "live_events", "governance_voice", "vip_events", "revenue_share", "founder_access", "advisory_council");
    }

    /**
     * @dev Helper to create benefits array
     */
    function _createBenefits(string memory b1, string memory b2) internal pure returns (string[] memory) {
        string[] memory benefits = new string[](2);
        benefits[0] = b1;
        benefits[1] = b2;
        return benefits;
    }

    function _createBenefits(string memory b1, string memory b2, string memory b3, string memory b4) internal pure returns (string[] memory) {
        string[] memory benefits = new string[](4);
        benefits[0] = b1;
        benefits[1] = b2;
        benefits[2] = b3;
        benefits[3] = b4;
        return benefits;
    }

    function _createBenefits(string memory b1, string memory b2, string memory b3, string memory b4, string memory b5, string memory b6) internal pure returns (string[] memory) {
        string[] memory benefits = new string[](6);
        benefits[0] = b1;
        benefits[1] = b2;
        benefits[2] = b3;
        benefits[3] = b4;
        benefits[4] = b5;
        benefits[5] = b6;
        return benefits;
    }

    function _createBenefits(string memory b1, string memory b2, string memory b3, string memory b4, string memory b5, string memory b6, string memory b7, string memory b8) internal pure returns (string[] memory) {
        string[] memory benefits = new string[](8);
        benefits[0] = b1;
        benefits[1] = b2;
        benefits[2] = b3;
        benefits[3] = b4;
        benefits[4] = b5;
        benefits[5] = b6;
        benefits[6] = b7;
        benefits[7] = b8;
        return benefits;
    }

    function _createBenefits(string memory b1, string memory b2, string memory b3, string memory b4, string memory b5, string memory b6, string memory b7, string memory b8, string memory b9, string memory b10) internal pure returns (string[] memory) {
        string[] memory benefits = new string[](10);
        benefits[0] = b1;
        benefits[1] = b2;
        benefits[2] = b3;
        benefits[3] = b4;
        benefits[4] = b5;
        benefits[5] = b6;
        benefits[6] = b7;
        benefits[7] = b8;
        benefits[8] = b9;
        benefits[9] = b10;
        return benefits;
    }

    /**
     * @dev Mint a King NFT at specified tier
     * @param tier The tier to mint
     */
    function mint(Tier tier) public payable whenNotPaused nonReentrant {
        require(_nextTokenId < MAX_SUPPLY, "IamKing: Max supply reached");
        
        uint256 price = getTierPrice(tier);
        require(msg.value >= price, "IamKing: Insufficient payment");

        // Check tier supply limits
        _checkTierSupply(tier);

        uint256 tokenId = _nextTokenId++;

        _safeMint(msg.sender, tokenId);
        tokenTier[tokenId] = tier;

        // Increment tier counter
        _incrementTierCount(tier);

        emit KingMinted(msg.sender, tokenId, tier);

        // Refund excess payment
        if (msg.value > price) {
            uint256 refund = msg.value - price;
            (bool success, ) = payable(msg.sender).call{value: refund}("");
            require(success, "IamKing: Refund failed");
        }
    }

    /**
     * @dev Check tier supply availability
     */
    function _checkTierSupply(Tier tier) internal view {
        if (tier == Tier.Baron) require(baronMinted < BARON_MAX, "IamKing: Baron tier sold out");
        else if (tier == Tier.Duke) require(dukeMinted < DUKE_MAX, "IamKing: Duke tier sold out");
        else if (tier == Tier.Prince) require(princeMinted < PRINCE_MAX, "IamKing: Prince tier sold out");
        else if (tier == Tier.King) require(kingMinted < KING_MAX, "IamKing: King tier sold out");
        else if (tier == Tier.Emperor) require(emperorMinted < EMPEROR_MAX, "IamKing: Emperor tier sold out");
    }

    /**
     * @dev Increment tier minted count
     */
    function _incrementTierCount(Tier tier) internal {
        if (tier == Tier.Baron) baronMinted++;
        else if (tier == Tier.Duke) dukeMinted++;
        else if (tier == Tier.Prince) princeMinted++;
        else if (tier == Tier.King) kingMinted++;
        else if (tier == Tier.Emperor) emperorMinted++;
    }

    /**
     * @dev Get price for a tier
     */
    function getTierPrice(Tier tier) public view returns (uint256) {
        if (tier == Tier.Baron) return baronPrice;
        if (tier == Tier.Duke) return dukePrice;
        if (tier == Tier.Prince) return princePrice;
        if (tier == Tier.King) return kingPrice;
        return emperorPrice;
    }

    /**
     * @dev Upgrade token to higher tier (pay difference)
     * @param tokenId The token to upgrade
     * @param newTier The target tier
     */
    function upgradeTier(uint256 tokenId, Tier newTier) public payable whenNotPaused nonReentrant {
        require(ownerOf(tokenId) == msg.sender, "IamKing: Not token owner");
        
        Tier currentTier = tokenTier[tokenId];
        require(uint8(newTier) > uint8(currentTier), "IamKing: Can only upgrade to higher tier");

        _checkTierSupply(newTier);

        uint256 currentPrice = getTierPrice(currentTier);
        uint256 newPrice = getTierPrice(newTier);
        uint256 upgradeCost = newPrice - currentPrice;

        require(msg.value >= upgradeCost, "IamKing: Insufficient upgrade payment");

        // Update tier counts
        _decrementTierCount(currentTier);
        _incrementTierCount(newTier);

        tokenTier[tokenId] = newTier;

        emit TierUpgraded(tokenId, currentTier, newTier);

        // Refund excess
        if (msg.value > upgradeCost) {
            uint256 refund = msg.value - upgradeCost;
            (bool success, ) = payable(msg.sender).call{value: refund}("");
            require(success, "IamKing: Refund failed");
        }
    }

    /**
     * @dev Decrement tier count
     */
    function _decrementTierCount(Tier tier) internal {
        if (tier == Tier.Baron) baronMinted--;
        else if (tier == Tier.Duke) dukeMinted--;
        else if (tier == Tier.Prince) princeMinted--;
        else if (tier == Tier.King) kingMinted--;
        else if (tier == Tier.Emperor) emperorMinted--;
    }

    /**
     * @dev Get benefits for a token
     * @param tokenId The token to check
     */
    function getTokenBenefits(uint256 tokenId) public view returns (string[] memory) {
        require(_ownerOf(tokenId) != address(0), "IamKing: Token does not exist");
        return tierBenefits[tokenTier[tokenId]];
    }

    /**
     * @dev Get voting power for a token
     * @param tokenId The token to check
     */
    function getVotingPower(uint256 tokenId) public view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "IamKing: Token does not exist");
        return tierVotingPower[tokenTier[tokenId]];
    }

    /**
     * @dev Get total voting power for an address
     * @param account The address to check
     */
    function getTotalVotingPower(address account) public view returns (uint256) {
        uint256 balance = balanceOf(account);
        uint256 totalPower = 0;
        
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(account, i);
            totalPower += tierVotingPower[tokenTier[tokenId]];
        }
        
        return totalPower;
    }

    /**
     * @dev Check if address has access to specific benefit
     * @param account The address to check
     * @param benefit The benefit to check for
     */
    function hasAccess(address account, string memory benefit) public view returns (bool) {
        uint256 balance = balanceOf(account);
        if (balance == 0) return false;

        bytes32 benefitHash = keccak256(bytes(benefit));
        
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(account, i);
            string[] memory benefits = tierBenefits[tokenTier[tokenId]];
            
            for (uint256 j = 0; j < benefits.length; j++) {
                if (keccak256(bytes(benefits[j])) == benefitHash) {
                    return true;
                }
            }
        }
        
        return false;
    }

    /**
     * @dev Link Sovereign TV contract for integration
     * @param contractAddress The Sovereign TV contract address
     */
    function linkSovereignTV(address contractAddress) public onlyOwner {
        require(contractAddress != address(0), "IamKing: Invalid address");
        sovereignTVContract = contractAddress;
        emit SovereignTVLinked(contractAddress);
    }

    /**
     * @dev Update tier price (owner only)
     */
    function setTierPrice(Tier tier, uint256 newPrice) public onlyOwner {
        uint256 oldPrice = getTierPrice(tier);
        
        if (tier == Tier.Baron) baronPrice = newPrice;
        else if (tier == Tier.Duke) dukePrice = newPrice;
        else if (tier == Tier.Prince) princePrice = newPrice;
        else if (tier == Tier.King) kingPrice = newPrice;
        else emperorPrice = newPrice;

        emit PriceUpdated(tier, oldPrice, newPrice);
    }

    /**
     * @dev Withdraw contract balance
     */
    function withdraw() public onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "IamKing: No balance to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "IamKing: Withdrawal failed");

        emit Withdrawn(owner(), balance);
    }

    /**
     * @dev Get tier supply info
     */
    function getTierSupply(Tier tier) public view returns (uint256 minted, uint256 max) {
        if (tier == Tier.Baron) return (baronMinted, BARON_MAX);
        if (tier == Tier.Duke) return (dukeMinted, DUKE_MAX);
        if (tier == Tier.Prince) return (princeMinted, PRINCE_MAX);
        if (tier == Tier.King) return (kingMinted, KING_MAX);
        return (emperorMinted, EMPEROR_MAX);
    }

    // Base URI
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function setBaseURI(string memory newBaseURI) public onlyOwner {
        _baseTokenURI = newBaseURI;
    }

    // Pausable
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    // Required overrides
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
