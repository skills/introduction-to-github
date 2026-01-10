// Sovereign Chais owns every yield
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title ProtectiveTokenLayer
 * @notice Multi-signature protected treasury with time-locks and emergency controls
 * @dev Implements core frequency protection mechanisms for DAO assets
 */
contract ProtectiveTokenLayer is ReentrancyGuard, AccessControl, Pausable {
    
    // Role definitions
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");
    bytes32 public constant ELDER_ROLE = keccak256("ELDER_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    
    // Time-lock periods
    uint256 public constant TIMELOCK_PERIOD = 48 hours;
    uint256 public constant EMERGENCY_DELAY = 24 hours;
    uint256 public constant CRITICAL_DELAY = 7 days;
    
    // Protection structures
    struct ProtectedAsset {
        address assetAddress;
        uint256 amount;
        uint256 unlockTime;
        bool isProtected;
        bytes32 protectionHash;
        AssetType assetType;
    }
    
    struct PendingTransaction {
        address target;
        uint256 value;
        bytes data;
        uint256 executeAfter;
        uint256 approvalCount;
        bool executed;
        mapping(address => bool) approvals;
    }
    
    enum AssetType {
        ERC20,
        ERC721,
        NATIVE,
        OTHER
    }
    
    // State variables
    mapping(uint256 => ProtectedAsset) public protectedAssets;
    mapping(address => bool) public trustedContracts;
    mapping(uint256 => PendingTransaction) public pendingTransactions;
    
    uint256 public protectedAssetsCount;
    uint256 public pendingTransactionsCount;
    uint256 public requiredApprovals = 3;
    
    // Events
    event AssetProtected(
        uint256 indexed assetId,
        address indexed asset,
        uint256 amount,
        AssetType assetType
    );
    
    event AssetUnlocked(
        uint256 indexed assetId,
        address indexed recipient,
        uint256 amount
    );
    
    event EmergencyActivated(
        address indexed activator,
        uint256 timestamp,
        string reason
    );
    
    event TransactionProposed(
        uint256 indexed txId,
        address indexed proposer,
        address target,
        uint256 value
    );
    
    event TransactionApproved(
        uint256 indexed txId,
        address indexed approver,
        uint256 totalApprovals
    );
    
    event TransactionExecuted(
        uint256 indexed txId,
        address indexed executor,
        bool success
    );
    
    event GuardianAdded(address indexed guardian);
    event GuardianRemoved(address indexed guardian);
    
    // Constructor
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GUARDIAN_ROLE, msg.sender);
        _grantRole(ELDER_ROLE, msg.sender);
    }
    
    /**
     * @notice Protect assets with time-lock and multi-sig
     * @param assetAddress Address of the asset to protect
     * @param amount Amount to protect
     * @param assetType Type of asset (ERC20, ERC721, etc.)
     * @param protectionHash Hash of protection parameters
     */
    function protectAsset(
        address assetAddress,
        uint256 amount,
        AssetType assetType,
        bytes32 protectionHash
    ) external onlyRole(GUARDIAN_ROLE) whenNotPaused returns (uint256) {
        uint256 assetId = protectedAssetsCount++;
        
        protectedAssets[assetId] = ProtectedAsset({
            assetAddress: assetAddress,
            amount: amount,
            unlockTime: block.timestamp + TIMELOCK_PERIOD,
            isProtected: true,
            protectionHash: protectionHash,
            assetType: assetType
        });
        
        emit AssetProtected(assetId, assetAddress, amount, assetType);
        
        return assetId;
    }
    
    /**
     * @notice Propose a transaction requiring multi-sig approval
     * @param target Target contract address
     * @param value ETH value to send
     * @param data Transaction calldata
     */
    function proposeTransaction(
        address target,
        uint256 value,
        bytes memory data
    ) external onlyRole(GUARDIAN_ROLE) whenNotPaused returns (uint256) {
        uint256 txId = pendingTransactionsCount++;
        
        PendingTransaction storage newTx = pendingTransactions[txId];
        newTx.target = target;
        newTx.value = value;
        newTx.data = data;
        newTx.executeAfter = block.timestamp + TIMELOCK_PERIOD;
        newTx.approvalCount = 0;
        newTx.executed = false;
        
        emit TransactionProposed(txId, msg.sender, target, value);
        
        return txId;
    }
    
    /**
     * @notice Approve a pending transaction
     * @param txId Transaction ID to approve
     */
    function approveTransaction(uint256 txId) 
        external 
        onlyRole(GUARDIAN_ROLE) 
        whenNotPaused 
    {
        PendingTransaction storage txn = pendingTransactions[txId];
        require(!txn.executed, "Transaction already executed");
        require(!txn.approvals[msg.sender], "Already approved");
        
        txn.approvals[msg.sender] = true;
        txn.approvalCount++;
        
        emit TransactionApproved(txId, msg.sender, txn.approvalCount);
    }
    
    /**
     * @notice Execute an approved transaction
     * @param txId Transaction ID to execute
     */
    function executeTransaction(uint256 txId) 
        external 
        onlyRole(GUARDIAN_ROLE) 
        whenNotPaused 
        nonReentrant 
    {
        PendingTransaction storage txn = pendingTransactions[txId];
        
        require(!txn.executed, "Transaction already executed");
        require(
            txn.approvalCount >= requiredApprovals,
            "Insufficient approvals"
        );
        require(
            block.timestamp >= txn.executeAfter,
            "Time-lock not expired"
        );
        
        txn.executed = true;
        
        (bool success, ) = txn.target.call{value: txn.value}(txn.data);
        
        emit TransactionExecuted(txId, msg.sender, success);
        
        require(success, "Transaction execution failed");
    }
    
    /**
     * @notice Emergency pause functionality
     * @param reason Reason for emergency pause
     */
    function emergencyPause(string memory reason) 
        external 
        onlyRole(ELDER_ROLE) 
    {
        _pause();
        emit EmergencyActivated(msg.sender, block.timestamp, reason);
    }
    
    /**
     * @notice Resume operations after security review
     */
    function resume() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @notice Add a trusted contract
     * @param contractAddress Address to trust
     */
    function addTrustedContract(address contractAddress) 
        external 
        onlyRole(ELDER_ROLE) 
    {
        trustedContracts[contractAddress] = true;
    }
    
    /**
     * @notice Remove a trusted contract
     * @param contractAddress Address to untrust
     */
    function removeTrustedContract(address contractAddress) 
        external 
        onlyRole(ELDER_ROLE) 
    {
        trustedContracts[contractAddress] = false;
    }
    
    /**
     * @notice Update required approvals count
     * @param newRequired New required approval count
     */
    function updateRequiredApprovals(uint256 newRequired) 
        external 
        onlyRole(ELDER_ROLE) 
    {
        require(newRequired > 0, "Must require at least 1 approval");
        requiredApprovals = newRequired;
    }
    
    /**
     * @notice Withdraw protected assets after time-lock
     * @param assetId Asset ID to withdraw
     * @param recipient Recipient address
     */
    function withdrawProtectedAsset(uint256 assetId, address recipient)
        external
        onlyRole(GUARDIAN_ROLE)
        nonReentrant
    {
        ProtectedAsset storage asset = protectedAssets[assetId];
        
        require(asset.isProtected, "Asset not protected");
        require(
            block.timestamp >= asset.unlockTime,
            "Asset still locked"
        );
        
        asset.isProtected = false;
        
        if (asset.assetType == AssetType.ERC20) {
            IERC20(asset.assetAddress).transfer(recipient, asset.amount);
        } else if (asset.assetType == AssetType.ERC721) {
            IERC721(asset.assetAddress).transferFrom(
                address(this),
                recipient,
                asset.amount
            );
        }
        
        emit AssetUnlocked(assetId, recipient, asset.amount);
    }
    
    /**
     * @notice Receive ETH
     */
    receive() external payable {}
}
