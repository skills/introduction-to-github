// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title ScrollSoulSBT
 * @dev Soulbound Token (SBT) for ScrollVerse identity and achievements
 * @author Chais Hill - OmniTech1
 *
 * ScrollSoulSBT represents a user's soul-bound identity within the ScrollVerse ecosystem.
 * These tokens are non-transferable and represent:
 * - Verified ScrollSoul identity
 * - Achievement milestones
 * - Training completion badges
 * - Community engagement levels
 * - Governance participation rights
 *
 * Features:
 * - Non-transferable (Soulbound)
 * - Upgradeable soul levels
 * - Achievement tracking
 * - Integration with ScrollSoul Onboarding
 * - Governance voting weight
 */
contract ScrollSoulSBT is ERC721, ERC721URIStorage, Ownable, Pausable {
    // Token ID counter
    uint256 private _nextTokenId;

    // Soul levels (represents user progression)
    enum SoulLevel { 
        Initiate,      // Level 0: Just started
        Seeker,        // Level 1: Completed basic onboarding
        Adept,         // Level 2: Completed all training modules
        Master,        // Level 3: Active community contributor
        Sovereign      // Level 4: Full ecosystem participation
    }

    // Soul data structure
    struct SoulData {
        SoulLevel level;
        uint256 xpTotal;
        uint256 achievementCount;
        uint256 governanceWeight;
        uint256 mintedAt;
        uint256 lastLevelUp;
        bool verified;
    }

    // Mapping from token ID to soul data
    mapping(uint256 => SoulData) public souls;

    // Mapping from address to their soul token ID (one per address)
    mapping(address => uint256) public soulOf;

    // Mapping to track if address has a soul
    mapping(address => bool) public hasSoul;

    // Achievement types
    mapping(uint256 => string[]) public soulAchievements;

    // XP thresholds for level ups
    uint256 public constant XP_SEEKER = 500;
    uint256 public constant XP_ADEPT = 2000;
    uint256 public constant XP_MASTER = 5000;
    uint256 public constant XP_SOVEREIGN = 10000;

    // Authorized XP granters (onboarding, festival, dashboard contracts)
    mapping(address => bool) public xpGranters;

    // Events
    event SoulMinted(address indexed to, uint256 indexed tokenId, SoulLevel level);
    event SoulLevelUp(uint256 indexed tokenId, SoulLevel oldLevel, SoulLevel newLevel);
    event XPGranted(uint256 indexed tokenId, uint256 amount, string reason);
    event AchievementUnlocked(uint256 indexed tokenId, string achievement);
    event SoulVerified(uint256 indexed tokenId);
    event XPGranterUpdated(address indexed granter, bool authorized);

    constructor(
        address initialOwner
    ) ERC721("ScrollSoul Identity", "SOUL") Ownable(initialOwner) {}

    /**
     * @dev Mint a new ScrollSoul SBT (one per address)
     * @param to The address to mint the soul to
     */
    function mintSoul(address to) public whenNotPaused returns (uint256) {
        require(!hasSoul[to], "ScrollSoulSBT: Address already has a soul");
        require(to != address(0), "ScrollSoulSBT: Cannot mint to zero address");

        uint256 tokenId = _nextTokenId++;

        _safeMint(to, tokenId);
        
        souls[tokenId] = SoulData({
            level: SoulLevel.Initiate,
            xpTotal: 0,
            achievementCount: 0,
            governanceWeight: 1,
            mintedAt: block.timestamp,
            lastLevelUp: block.timestamp,
            verified: false
        });

        soulOf[to] = tokenId;
        hasSoul[to] = true;

        emit SoulMinted(to, tokenId, SoulLevel.Initiate);

        return tokenId;
    }

    /**
     * @dev Grant XP to a soul
     * @param tokenId The soul token ID
     * @param amount Amount of XP to grant
     * @param reason Reason for XP grant
     */
    function grantXP(uint256 tokenId, uint256 amount, string memory reason) public {
        require(xpGranters[msg.sender] || msg.sender == owner(), "ScrollSoulSBT: Not authorized to grant XP");
        require(_ownerOf(tokenId) != address(0), "ScrollSoulSBT: Soul does not exist");

        SoulData storage soul = souls[tokenId];
        soul.xpTotal += amount;

        emit XPGranted(tokenId, amount, reason);

        // Check for level up
        _checkLevelUp(tokenId);
    }

    /**
     * @dev Check and process level ups based on XP
     */
    function _checkLevelUp(uint256 tokenId) internal {
        SoulData storage soul = souls[tokenId];
        SoulLevel oldLevel = soul.level;
        SoulLevel newLevel = oldLevel;

        if (soul.xpTotal >= XP_SOVEREIGN && oldLevel != SoulLevel.Sovereign) {
            newLevel = SoulLevel.Sovereign;
            soul.governanceWeight = 5;
        } else if (soul.xpTotal >= XP_MASTER && oldLevel < SoulLevel.Master) {
            newLevel = SoulLevel.Master;
            soul.governanceWeight = 4;
        } else if (soul.xpTotal >= XP_ADEPT && oldLevel < SoulLevel.Adept) {
            newLevel = SoulLevel.Adept;
            soul.governanceWeight = 3;
        } else if (soul.xpTotal >= XP_SEEKER && oldLevel < SoulLevel.Seeker) {
            newLevel = SoulLevel.Seeker;
            soul.governanceWeight = 2;
        }

        if (newLevel != oldLevel) {
            soul.level = newLevel;
            soul.lastLevelUp = block.timestamp;
            emit SoulLevelUp(tokenId, oldLevel, newLevel);
        }
    }

    /**
     * @dev Unlock an achievement for a soul
     * @param tokenId The soul token ID
     * @param achievement The achievement name
     */
    function unlockAchievement(uint256 tokenId, string memory achievement) public {
        require(xpGranters[msg.sender] || msg.sender == owner(), "ScrollSoulSBT: Not authorized");
        require(_ownerOf(tokenId) != address(0), "ScrollSoulSBT: Soul does not exist");

        soulAchievements[tokenId].push(achievement);
        souls[tokenId].achievementCount++;

        emit AchievementUnlocked(tokenId, achievement);
    }

    /**
     * @dev Verify a soul (admin function)
     * @param tokenId The soul token ID
     */
    function verifySoul(uint256 tokenId) public onlyOwner {
        require(_ownerOf(tokenId) != address(0), "ScrollSoulSBT: Soul does not exist");
        souls[tokenId].verified = true;
        emit SoulVerified(tokenId);
    }

    /**
     * @dev Set XP granter authorization
     * @param granter The address to authorize/deauthorize
     * @param authorized Whether to authorize or not
     */
    function setXPGranter(address granter, bool authorized) public onlyOwner {
        xpGranters[granter] = authorized;
        emit XPGranterUpdated(granter, authorized);
    }

    /**
     * @dev Get soul data for a token
     * @param tokenId The soul token ID
     */
    function getSoul(uint256 tokenId) public view returns (
        SoulLevel level,
        uint256 xpTotal,
        uint256 achievementCount,
        uint256 governanceWeight,
        uint256 mintedAt,
        uint256 lastLevelUp,
        bool verified
    ) {
        require(_ownerOf(tokenId) != address(0), "ScrollSoulSBT: Soul does not exist");
        SoulData memory soul = souls[tokenId];
        return (
            soul.level,
            soul.xpTotal,
            soul.achievementCount,
            soul.governanceWeight,
            soul.mintedAt,
            soul.lastLevelUp,
            soul.verified
        );
    }

    /**
     * @dev Get achievements for a soul
     * @param tokenId The soul token ID
     */
    function getAchievements(uint256 tokenId) public view returns (string[] memory) {
        return soulAchievements[tokenId];
    }

    /**
     * @dev Get XP needed for next level
     * @param tokenId The soul token ID
     */
    function xpToNextLevel(uint256 tokenId) public view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "ScrollSoulSBT: Soul does not exist");
        SoulData memory soul = souls[tokenId];

        if (soul.level == SoulLevel.Sovereign) return 0;
        if (soul.level == SoulLevel.Master) return XP_SOVEREIGN - soul.xpTotal;
        if (soul.level == SoulLevel.Adept) return XP_MASTER - soul.xpTotal;
        if (soul.level == SoulLevel.Seeker) return XP_ADEPT - soul.xpTotal;
        return XP_SEEKER - soul.xpTotal;
    }

    /**
     * @dev Override transfer functions to make token soulbound (non-transferable)
     */
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0)) and burning (to == address(0))
        // But prevent transfers between addresses
        if (from != address(0) && to != address(0)) {
            revert("ScrollSoulSBT: Soulbound tokens are non-transferable by design");
        }

        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Burn a soul (only by owner of the soul)
     * @param tokenId The soul token ID to burn
     */
    function burnSoul(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "ScrollSoulSBT: Only soul owner can burn");
        
        address soulOwner = ownerOf(tokenId);
        hasSoul[soulOwner] = false;
        delete soulOf[soulOwner];
        delete souls[tokenId];
        delete soulAchievements[tokenId];

        _burn(tokenId);
    }

    // Pausable functions
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    // Required overrides
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Set token URI (admin function)
     */
    function setTokenURI(uint256 tokenId, string memory _tokenURI) public onlyOwner {
        _setTokenURI(tokenId, _tokenURI);
    }

    /**
     * @dev Get total souls minted
     */
    function totalSouls() public view returns (uint256) {
        return _nextTokenId;
    }
}
