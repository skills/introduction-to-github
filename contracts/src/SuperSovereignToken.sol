// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title SuperSovereignToken
 * @dev $SUPER_SOVEREIGN ERC-20 token for Superhero Sovereign ecosystem
 * 
 * Features:
 * - Governance voting capabilities
 * - Burnable for deflationary economics
 * - Pausable for emergency situations
 * - Role-based access control
 * - 1 Billion total supply
 */
contract SuperSovereignToken is ERC20, ERC20Burnable, ERC20Votes, Pausable, AccessControl {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 Billion tokens
    
    // Token distribution addresses
    address public immutable communityTreasury;
    address public immutable teamAddress;
    address public immutable talentPool;
    address public immutable publicSaleAddress;
    address public immutable industryPartners;
    address public immutable liquidityPool;
    address public immutable reserveFund;
    
    // Distribution amounts (in tokens with 18 decimals)
    uint256 public constant COMMUNITY_TREASURY_AMOUNT = 200_000_000 * 10**18;
    uint256 public constant TEAM_AMOUNT = 150_000_000 * 10**18;
    uint256 public constant TALENT_POOL_AMOUNT = 250_000_000 * 10**18;
    uint256 public constant PUBLIC_SALE_AMOUNT = 200_000_000 * 10**18;
    uint256 public constant INDUSTRY_PARTNERS_AMOUNT = 100_000_000 * 10**18;
    uint256 public constant LIQUIDITY_POOL_AMOUNT = 50_000_000 * 10**18;
    uint256 public constant RESERVE_FUND_AMOUNT = 50_000_000 * 10**18;
    
    // Transaction fee for burn mechanism (1% = 100 basis points)
    uint256 public transactionFeeBps = 100;
    uint256 public constant MAX_TRANSACTION_FEE_BPS = 500; // Max 5%
    
    // Revenue tracking for profit sharing
    mapping(string => uint256) public revenueStreams; // revenue type => amount
    
    event RevenueRecorded(string revenueType, uint256 amount, uint256 timestamp);
    event TransactionFeeUpdated(uint256 newFeeBps);
    event RevenueDistributed(address indexed recipient, uint256 amount, string revenueType);
    
    constructor(
        address _communityTreasury,
        address _teamAddress,
        address _talentPool,
        address _publicSaleAddress,
        address _industryPartners,
        address _liquidityPool,
        address _reserveFund
    ) ERC20("Super Sovereign", "SUPER_SOVEREIGN") ERC20Permit("Super Sovereign") {
        require(_communityTreasury != address(0), "Invalid community treasury address");
        require(_teamAddress != address(0), "Invalid team address");
        require(_talentPool != address(0), "Invalid talent pool address");
        require(_publicSaleAddress != address(0), "Invalid public sale address");
        require(_industryPartners != address(0), "Invalid industry partners address");
        require(_liquidityPool != address(0), "Invalid liquidity pool address");
        require(_reserveFund != address(0), "Invalid reserve fund address");
        
        communityTreasury = _communityTreasury;
        teamAddress = _teamAddress;
        talentPool = _talentPool;
        publicSaleAddress = _publicSaleAddress;
        industryPartners = _industryPartners;
        liquidityPool = _liquidityPool;
        reserveFund = _reserveFund;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        
        // Mint initial distribution
        _mint(_communityTreasury, COMMUNITY_TREASURY_AMOUNT);
        _mint(_teamAddress, TEAM_AMOUNT);
        _mint(_talentPool, TALENT_POOL_AMOUNT);
        _mint(_publicSaleAddress, PUBLIC_SALE_AMOUNT);
        _mint(_industryPartners, INDUSTRY_PARTNERS_AMOUNT);
        _mint(_liquidityPool, LIQUIDITY_POOL_AMOUNT);
        _mint(_reserveFund, RESERVE_FUND_AMOUNT);
    }
    
    /**
     * @dev Record revenue from various sources for profit sharing
     * @param revenueType Type of revenue (e.g., "BoxOffice", "Streaming", "Merchandise")
     * @param amount Amount of revenue in USD (represented in wei for precision)
     */
    function recordRevenue(string memory revenueType, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(amount > 0, "Amount must be greater than 0");
        revenueStreams[revenueType] += amount;
        emit RevenueRecorded(revenueType, amount, block.timestamp);
    }
    
    /**
     * @dev Update transaction fee for burn mechanism
     * @param newFeeBps New fee in basis points (100 = 1%)
     */
    function setTransactionFee(uint256 newFeeBps) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newFeeBps <= MAX_TRANSACTION_FEE_BPS, "Fee too high");
        transactionFeeBps = newFeeBps;
        emit TransactionFeeUpdated(newFeeBps);
    }
    
    /**
     * @dev Override transfer to include burn mechanism
     */
    function _transfer(address from, address to, uint256 amount) internal virtual override {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        
        // Calculate burn amount (1% default)
        uint256 burnAmount = (amount * transactionFeeBps) / 10000;
        uint256 transferAmount = amount - burnAmount;
        
        // Burn the fee (properly reduces total supply)
        if (burnAmount > 0) {
            _burn(from, burnAmount);
        }
        
        // Transfer remaining amount
        super._transfer(from, to, transferAmount);
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
    
    /**
     * @dev Hook that is called before any transfer of tokens
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }
    
    /**
     * @dev Required override for ERC20Votes
     */
    function _afterTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._afterTokenTransfer(from, to, amount);
    }
    
    /**
     * @dev Required override for ERC20Votes
     */
    function _mint(address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        super._mint(to, amount);
    }
    
    /**
     * @dev Required override for ERC20Votes
     */
    function _burn(address account, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._burn(account, amount);
    }
}
