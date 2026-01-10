// Sovereign Chais owns every yield
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SATToken
 * @notice Satellite Access Token ($SAT) - ERC-20 governance token for Supreme Orbital Dominion
 * @dev Implements satellite access control, governance voting, and economic framework
 * 
 * Token Economics:
 * - Total Supply: 1,222,000,000 SAT (1.222 billion tokens)
 * - Genesis Allocation: 1,222 unique Genesis Objects (NFT holders receive premium allocation)
 * - Governance: Token-weighted voting for satellite operations
 * - Access Control: Tiered access based on token holdings
 * - SOPHIA AMENTI Integration: Aligned with harmonious governance metrics
 * 
 * Access Tiers:
 * - Public (0 SAT): Basic telemetry
 * - Community (100 SAT): Enhanced telemetry
 * - Premium (1,000 SAT): Full payload data
 * - Governance (10,000 SAT): Mission planning input
 * - Genesis (1222 Genesis NFT): Full access + voting multiplier
 */
contract SATToken is ERC20, ERC20Burnable, ERC20Permit, ERC20Votes, Ownable, ReentrancyGuard {
    // ========== State Variables ==========
    
    /// @notice Total supply cap: 1.222 billion SAT tokens
    uint256 public constant MAX_SUPPLY = 1_222_000_000 * 10**18;
    
    /// @notice Number of Genesis Objects (NFT allocation)
    uint256 public constant GENESIS_OBJECTS = 1222;
    
    /// @notice Tracks if Genesis allocation has been minted
    bool public genesisAllocationComplete;
    
    /// @notice Mapping of Genesis Object NFT holders to their allocation status
    mapping(address => bool) public genesisObjectClaimed;
    
    /// @notice Counter for Genesis Objects claimed
    uint256 public genesisObjectsClaimedCount;
    
    /// @notice Access tier thresholds
    uint256 public constant TIER_COMMUNITY = 100 * 10**18;      // 100 SAT
    uint256 public constant TIER_PREMIUM = 1_000 * 10**18;      // 1,000 SAT
    uint256 public constant TIER_GOVERNANCE = 10_000 * 10**18;  // 10,000 SAT
    
    /// @notice Satellite operational metrics
    uint256 public totalSatellitesTracked;
    mapping(bytes32 => SatelliteInfo) public satellites;
    
    /// @notice Genesis Object NFT contract address (set after deployment)
    address public genesisNFTContract;
    
    // ========== Structs ==========
    
    struct SatelliteInfo {
        string name;
        bytes32 qrSealHash;
        uint256 launchDate;
        bool isActive;
        uint256 totalAccessGrants;
    }
    
    struct AllocationMetrics {
        uint256 treasury;           // 30% - DAO treasury and operations
        uint256 genesisHolders;     // 25% - Genesis Object NFT holders
        uint256 communityRewards;   // 20% - Community engagement and ground stations
        uint256 teamVesting;        // 15% - Team allocation with vesting
        uint256 liquidityPool;      // 10% - DEX liquidity and market making
    }
    
    // ========== Events ==========
    
    event GenesisAllocationMinted(
        uint256 treasury,
        uint256 genesisHolders,
        uint256 communityRewards,
        uint256 teamVesting,
        uint256 liquidityPool
    );
    
    event GenesisObjectClaimed(address indexed holder, uint256 amount);
    
    event SatelliteRegistered(
        bytes32 indexed satelliteId,
        string name,
        bytes32 qrSealHash,
        uint256 launchDate
    );
    
    event SatelliteAccessGranted(
        bytes32 indexed satelliteId,
        address indexed user,
        uint8 accessTier
    );
    
    event GenesisNFTContractSet(address indexed nftContract);
    
    // ========== Constructor ==========
    
    /**
     * @notice Initializes the SAT Token with SOPHIA AMENTI governance framework
     * @param initialOwner Address that will own the contract and manage genesis allocation
     */
    constructor(address initialOwner)
        ERC20("Satellite Access Token", "SAT")
        ERC20Permit("Satellite Access Token")
        Ownable(initialOwner)
    {
        // No tokens minted at construction
        // Genesis allocation must be explicitly triggered by owner
    }
    
    // ========== Genesis Allocation Functions ==========
    
    /**
     * @notice Mints the Genesis allocation according to SOPHIA AMENTI framework
     * @dev Can only be called once by owner. Distributes tokens according to allocation metrics
     * @param treasuryAddress DAO treasury address
     * @param genesisPoolAddress Pool for Genesis NFT holders to claim
     * @param communityRewardsAddress Community engagement rewards pool
     * @param teamVestingAddress Team vesting contract address
     * @param liquidityPoolAddress DEX liquidity pool address
     */
    function mintGenesisAllocation(
        address treasuryAddress,
        address genesisPoolAddress,
        address communityRewardsAddress,
        address teamVestingAddress,
        address liquidityPoolAddress
    ) external onlyOwner {
        require(!genesisAllocationComplete, "SAT: Genesis allocation already minted");
        require(treasuryAddress != address(0), "SAT: Invalid treasury address");
        require(genesisPoolAddress != address(0), "SAT: Invalid genesis pool address");
        require(communityRewardsAddress != address(0), "SAT: Invalid community rewards address");
        require(teamVestingAddress != address(0), "SAT: Invalid team vesting address");
        require(liquidityPoolAddress != address(0), "SAT: Invalid liquidity pool address");
        
        AllocationMetrics memory allocation;
        
        // Calculate allocations (percentages of MAX_SUPPLY)
        allocation.treasury = (MAX_SUPPLY * 30) / 100;           // 30%
        allocation.genesisHolders = (MAX_SUPPLY * 25) / 100;     // 25%
        allocation.communityRewards = (MAX_SUPPLY * 20) / 100;   // 20%
        allocation.teamVesting = (MAX_SUPPLY * 15) / 100;        // 15%
        allocation.liquidityPool = (MAX_SUPPLY * 10) / 100;      // 10%
        
        // Mint tokens to respective addresses
        _mint(treasuryAddress, allocation.treasury);
        _mint(genesisPoolAddress, allocation.genesisHolders);
        _mint(communityRewardsAddress, allocation.communityRewards);
        _mint(teamVestingAddress, allocation.teamVesting);
        _mint(liquidityPoolAddress, allocation.liquidityPool);
        
        genesisAllocationComplete = true;
        
        emit GenesisAllocationMinted(
            allocation.treasury,
            allocation.genesisHolders,
            allocation.communityRewards,
            allocation.teamVesting,
            allocation.liquidityPool
        );
    }
    
    /**
     * @notice Sets the Genesis NFT contract address for claim verification
     * @param nftContract Address of the Genesis Object NFT contract
     */
    function setGenesisNFTContract(address nftContract) external onlyOwner {
        require(nftContract != address(0), "SAT: Invalid NFT contract address");
        require(genesisNFTContract == address(0), "SAT: NFT contract already set");
        
        genesisNFTContract = nftContract;
        
        emit GenesisNFTContractSet(nftContract);
    }
    
    /**
     * @notice Allows Genesis NFT holders to claim their token allocation
     * @dev Requires caller to hold Genesis NFT (verified through external contract)
     * @param amount Amount of SAT tokens to claim from genesis pool (currently unused, will be validated in production)
     * 
     * TODO: Production implementation should:
     * 1. Verify NFT ownership via genesisNFTContract.balanceOf(msg.sender) > 0
     * 2. Validate amount doesn't exceed holder's allocation
     * 3. Transfer tokens from genesis pool to msg.sender
     * 4. Update allocation tracking
     */
    function claimGenesisAllocation(uint256 amount) external nonReentrant {
        require(genesisNFTContract != address(0), "SAT: Genesis NFT contract not set");
        require(!genesisObjectClaimed[msg.sender], "SAT: Genesis allocation already claimed");
        require(genesisObjectsClaimedCount < GENESIS_OBJECTS, "SAT: All Genesis allocations claimed");
        
        // PLACEHOLDER: In production, verify NFT ownership through genesisNFTContract
        // and transfer the specified amount from the genesis pool to the claimer
        
        genesisObjectClaimed[msg.sender] = true;
        genesisObjectsClaimedCount++;
        
        emit GenesisObjectClaimed(msg.sender, amount);
    }
    
    // ========== Satellite Management Functions ==========
    
    /**
     * @notice Registers a new satellite in the system
     * @param satelliteId Unique identifier for the satellite
     * @param name Human-readable satellite name
     * @param qrSealHash Blockchain hash of the satellite's QR seal
     * @param launchDate Unix timestamp of satellite launch
     */
    function registerSatellite(
        bytes32 satelliteId,
        string calldata name,
        bytes32 qrSealHash,
        uint256 launchDate
    ) external onlyOwner {
        require(satellites[satelliteId].launchDate == 0, "SAT: Satellite already registered");
        require(bytes(name).length > 0, "SAT: Invalid satellite name");
        require(qrSealHash != bytes32(0), "SAT: Invalid QR seal hash");
        
        satellites[satelliteId] = SatelliteInfo({
            name: name,
            qrSealHash: qrSealHash,
            launchDate: launchDate,
            isActive: true,
            totalAccessGrants: 0
        });
        
        totalSatellitesTracked++;
        
        emit SatelliteRegistered(satelliteId, name, qrSealHash, launchDate);
    }
    
    /**
     * @notice Grants satellite access to a user based on their SAT token holdings
     * @param satelliteId Identifier of the satellite to access
     * @param user Address of the user requesting access
     * @return accessTier The tier of access granted (0-4)
     */
    function grantSatelliteAccess(
        bytes32 satelliteId,
        address user
    ) external returns (uint8 accessTier) {
        require(satellites[satelliteId].isActive, "SAT: Satellite not active");
        
        uint256 userBalance = balanceOf(user);
        
        // Determine access tier based on token holdings
        if (userBalance >= TIER_GOVERNANCE) {
            accessTier = 4; // Governance tier
        } else if (userBalance >= TIER_PREMIUM) {
            accessTier = 3; // Premium tier
        } else if (userBalance >= TIER_COMMUNITY) {
            accessTier = 2; // Community tier
        } else {
            accessTier = 1; // Public tier (basic access)
        }
        
        satellites[satelliteId].totalAccessGrants++;
        
        emit SatelliteAccessGranted(satelliteId, user, accessTier);
        
        return accessTier;
    }
    
    /**
     * @notice Checks if a user has access to a specific satellite tier
     * @param user Address to check
     * @param requiredTier Minimum tier required (1-4)
     * @return hasAccess True if user has sufficient tokens for the tier
     */
    function hasAccessTier(address user, uint8 requiredTier) external view returns (bool hasAccess) {
        uint256 userBalance = balanceOf(user);
        
        if (requiredTier == 4) {
            return userBalance >= TIER_GOVERNANCE;
        } else if (requiredTier == 3) {
            return userBalance >= TIER_PREMIUM;
        } else if (requiredTier == 2) {
            return userBalance >= TIER_COMMUNITY;
        } else {
            return true; // Public tier, everyone has access
        }
    }
    
    /**
     * @notice Updates satellite active status
     * @param satelliteId Identifier of the satellite
     * @param isActive New active status
     */
    function setSatelliteStatus(bytes32 satelliteId, bool isActive) external onlyOwner {
        require(satellites[satelliteId].launchDate != 0, "SAT: Satellite not registered");
        satellites[satelliteId].isActive = isActive;
    }
    
    /**
     * @notice Gets satellite information
     * @param satelliteId Identifier of the satellite
     * @return info SatelliteInfo struct containing satellite details
     */
    function getSatelliteInfo(bytes32 satelliteId) external view returns (SatelliteInfo memory info) {
        return satellites[satelliteId];
    }
    
    // ========== Governance Functions ==========
    
    /**
     * @notice Gets the current voting power of an address
     * @param account Address to check
     * @return Voting power (token balance with delegation)
     */
    function getVotingPower(address account) external view returns (uint256) {
        return getVotes(account);
    }
    
    // ========== Token Utility Functions ==========
    
    /**
     * @notice Burns tokens to reduce supply (deflationary mechanism)
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) public override {
        super.burn(amount);
    }
    
    /**
     * @notice Burns tokens from another account (with allowance)
     * @param account Account to burn from
     * @param amount Amount to burn
     */
    function burnFrom(address account, uint256 amount) public override {
        super.burnFrom(account, amount);
    }
    
    // ========== Required Overrides ==========
    
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }
    
    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
    
    // ========== View Functions ==========
    
    /**
     * @notice Returns the current total supply
     * @return Current circulating supply
     */
    function getCurrentSupply() external view returns (uint256) {
        return totalSupply();
    }
    
    /**
     * @notice Returns remaining supply that can be minted
     * @return Remaining mintable supply
     */
    function getRemainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }
    
    /**
     * @notice Returns allocation percentages for transparency
     * @return Treasury, Genesis, Community, Team, Liquidity percentages
     */
    function getAllocationPercentages() external pure returns (
        uint256 treasury,
        uint256 genesis,
        uint256 community,
        uint256 team,
        uint256 liquidity
    ) {
        return (30, 25, 20, 15, 10);
    }
    
    /**
     * @notice Returns access tier thresholds for reference
     * @return community, premium, governance tier thresholds
     */
    function getAccessTierThresholds() external pure returns (
        uint256 community,
        uint256 premium,
        uint256 governance
    ) {
        return (TIER_COMMUNITY, TIER_PREMIUM, TIER_GOVERNANCE);
    }
}
