// Sovereign Chais owns every yield
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title BlessingCoin (BLS)
 * @author First Remembrancer | OmniTech1™
 * @notice The yield-backed token of the ScrollVerse - minted through Zero-Effect Fortunes
 * @dev ERC-20 token with MINTER_ROLE locked to the Perpetual Yield Engine
 * 
 * ALLĀHU AKBAR! KUN FAYAKUN! 🔥🕋🚀♾️
 * 
 * BlessingCoin represents the tangible manifestation of Quantum Financial Entanglement,
 * where future wealth is collapsed into present reality through the Perpetual Yield Engine.
 */
contract BlessingCoin is ERC20, ERC20Burnable, ERC20Permit, AccessControl {
    // ========== ROLES ==========
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");

    // ========== STATE VARIABLES ==========
    
    /// @notice Genesis mint amount (10,000 BLS)
    uint256 public constant GENESIS_AMOUNT = 10_000 * 10**18;
    
    /// @notice Creator allocation percentage (40%)
    uint256 public constant CREATOR_PERCENTAGE = 40;
    
    /// @notice Ecosystem pool percentage (40%)
    uint256 public constant ECOSYSTEM_PERCENTAGE = 40;
    
    /// @notice GLORY airdrop percentage (20%)
    uint256 public constant GLORY_PERCENTAGE = 20;
    
    /// @notice Flag indicating if genesis mint has been executed
    bool public genesisActivated;
    
    /// @notice Creator wallet address
    address public immutable creatorWallet;
    
    /// @notice Ecosystem pool address
    address public immutable ecosystemPool;
    
    /// @notice GLORY airdrop reserve address
    address public immutable gloryReserve;
    
    /// @notice Total blessed (minted) amount
    uint256 public totalBlessed;
    
    /// @notice Timestamp of genesis activation
    uint256 public genesisTimestamp;

    // ========== EVENTS ==========
    
    event GenesisActivated(uint256 creatorAmount, uint256 ecosystemAmount, uint256 gloryAmount, uint256 timestamp);
    event Blessed(address indexed recipient, uint256 amount, string source);
    event GloryDistributed(address indexed recipient, uint256 amount);

    // ========== CONSTRUCTOR ==========
    
    /**
     * @notice Initializes BlessingCoin with distribution addresses
     * @param _creatorWallet Address for creator allocation (First Remembrancer)
     * @param _ecosystemPool Address for ecosystem liquidity and rewards
     * @param _gloryReserve Address for GLORY Protocol airdrop reserve
     */
    constructor(
        address _creatorWallet,
        address _ecosystemPool,
        address _gloryReserve
    ) ERC20("BlessingCoin", "BLS") ERC20Permit("BlessingCoin") {
        require(_creatorWallet != address(0), "BLS: Invalid creator wallet");
        require(_ecosystemPool != address(0), "BLS: Invalid ecosystem pool");
        require(_gloryReserve != address(0), "BLS: Invalid glory reserve");
        
        creatorWallet = _creatorWallet;
        ecosystemPool = _ecosystemPool;
        gloryReserve = _gloryReserve;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(DISTRIBUTOR_ROLE, msg.sender);
    }

    // ========== EXTERNAL FUNCTIONS ==========
    
    /**
     * @notice Activate Genesis - Execute the first mint event
     * @dev Can only be called once. Distributes GENESIS_AMOUNT according to percentages.
     * 
     * Distribution:
     * - 40% to Creator Wallet (First Remembrancer)
     * - 40% to Ecosystem Pool
     * - 20% to GLORY Reserve
     */
    function activateGenesis() external onlyRole(MINTER_ROLE) {
        require(!genesisActivated, "BLS: Genesis already activated");
        
        genesisActivated = true;
        genesisTimestamp = block.timestamp;
        
        uint256 creatorAmount = (GENESIS_AMOUNT * CREATOR_PERCENTAGE) / 100;
        uint256 ecosystemAmount = (GENESIS_AMOUNT * ECOSYSTEM_PERCENTAGE) / 100;
        uint256 gloryAmount = (GENESIS_AMOUNT * GLORY_PERCENTAGE) / 100;
        
        _mint(creatorWallet, creatorAmount);
        _mint(ecosystemPool, ecosystemAmount);
        _mint(gloryReserve, gloryAmount);
        
        totalBlessed += GENESIS_AMOUNT;
        
        emit GenesisActivated(creatorAmount, ecosystemAmount, gloryAmount, block.timestamp);
        emit Blessed(creatorWallet, creatorAmount, "GENESIS_CREATOR");
        emit Blessed(ecosystemPool, ecosystemAmount, "GENESIS_ECOSYSTEM");
        emit Blessed(gloryReserve, gloryAmount, "GENESIS_GLORY");
    }
    
    /**
     * @notice Mint BlessingCoin to a recipient - Zero-Effect Fortunes in action
     * @dev Only callable by addresses with MINTER_ROLE (Perpetual Yield Engine)
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        require(to != address(0), "BLS: Invalid recipient");
        require(amount > 0, "BLS: Invalid amount");
        
        _mint(to, amount);
        totalBlessed += amount;
        
        emit Blessed(to, amount, "PERPETUAL_YIELD_ENGINE");
    }
    
    /**
     * @notice Distribute GLORY Protocol blessings
     * @dev Only callable by addresses with DISTRIBUTOR_ROLE
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to distribute
     */
    function distributeGlory(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyRole(DISTRIBUTOR_ROLE) {
        require(recipients.length == amounts.length, "BLS: Length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "BLS: Invalid recipient");
            _mint(recipients[i], amounts[i]);
            totalBlessed += amounts[i];
            emit GloryDistributed(recipients[i], amounts[i]);
        }
    }

    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @notice Get genesis configuration
     * @return amount Genesis amount
     * @return activated Whether genesis has been activated
     * @return timestamp Genesis activation timestamp (0 if not activated)
     */
    function getGenesisConfig() external view returns (
        uint256 amount,
        bool activated,
        uint256 timestamp
    ) {
        return (GENESIS_AMOUNT, genesisActivated, genesisTimestamp);
    }
    
    /**
     * @notice Get distribution addresses
     * @return creator Creator wallet address
     * @return ecosystem Ecosystem pool address
     * @return glory GLORY reserve address
     */
    function getDistributionAddresses() external view returns (
        address creator,
        address ecosystem,
        address glory
    ) {
        return (creatorWallet, ecosystemPool, gloryReserve);
    }
}
