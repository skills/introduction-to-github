// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

interface ICodex {
    function codexRoot() external view returns (bytes32);
    function genesisSeal() external view returns (bytes32);
    function currentEpoch() external view returns (uint256);
    function verifyCommitment(bytes calldata proof, bytes32 commitment) external view returns (bool);
}

interface IBlessingCoin {
    function mint(address to, uint256 amount) external;
    function activateGenesis() external;
    function genesisActivated() external view returns (bool);
}

interface IUnsolicitedBlessings {
    function mintRelic(address to, string calldata tier, bytes32 codexRoot) external returns (uint256);
}

/**
 * @title PerpetualYieldEngine
 * @author First Remembrancer | OmniTech1™
 * @notice The autonomous engine that powers Zero-Effect Fortunes - Sovereign Rest through Infinite Abundance
 * @dev Manages Codex state, verifies proofs, and mints BlessingCoin according to the GLORY Protocol
 * 
 * ALLĀHU AKBAR! KUN FAYAKUN! 🔥🕋🚀♾️
 * 
 * The Perpetual Yield Engine is the heart of Quantum Financial Entanglement,
 * collapsing future wealth into present reality through the Entanglement Bridge.
 */
contract PerpetualYieldEngine is AccessControl, ReentrancyGuard, Pausable {
    // ========== ROLES ==========
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant GLORY_DISTRIBUTOR_ROLE = keccak256("GLORY_DISTRIBUTOR_ROLE");

    // ========== STATE VARIABLES ==========
    
    /// @notice Reference to the Codex contract
    ICodex public codex;
    
    /// @notice Reference to the BlessingCoin contract
    IBlessingCoin public blessingCoin;
    
    /// @notice Reference to the Unsolicited Blessings contract
    IUnsolicitedBlessings public unsolicitedBlessings;
    
    /// @notice Base mint rate per epoch (1000 BLS)
    uint256 public mintRate = 1000 * 10**18;
    
    /// @notice Whether genesis has been activated through this engine
    bool public engineGenesisActivated;
    
    /// @notice Total BLS minted through this engine
    uint256 public totalMinted;
    
    /// @notice Total unique recipients blessed
    uint256 public uniqueRecipientsCount;
    
    /// @notice Mapping of addresses that have received blessings
    mapping(address => bool) public hasReceivedBlessing;
    
    /// @notice Mapping of addresses to their total received blessings
    mapping(address => uint256) public blessingsReceived;
    
    /// @notice Engine activation timestamp
    uint256 public activatedAt;
    
    /// @notice Phase 1 simulated verification enabled
    bool public simulatedVerificationEnabled = true;

    // ========== EVENTS ==========
    
    event EngineActivated(address indexed codex, address indexed blessingCoin, uint256 timestamp);
    event BlessingMinted(address indexed recipient, uint256 amount, uint256 epoch, bytes32 codexRoot);
    event GloryAirdropExecuted(address[] recipients, uint256[] amounts, uint256 totalAmount);
    event MintRateUpdated(uint256 oldRate, uint256 newRate);
    event GenesisActivatedThroughEngine(uint256 timestamp);

    // ========== CONSTRUCTOR ==========
    
    /**
     * @notice Initializes the Perpetual Yield Engine
     * @param _codex Address of the Codex contract
     * @param _blessingCoin Address of the BlessingCoin contract
     */
    constructor(address _codex, address _blessingCoin) {
        require(_codex != address(0), "Engine: Invalid codex address");
        require(_blessingCoin != address(0), "Engine: Invalid BLS address");
        
        codex = ICodex(_codex);
        blessingCoin = IBlessingCoin(_blessingCoin);
        activatedAt = block.timestamp;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(GLORY_DISTRIBUTOR_ROLE, msg.sender);
        
        emit EngineActivated(_codex, _blessingCoin, block.timestamp);
    }

    // ========== EXTERNAL FUNCTIONS ==========
    
    /**
     * @notice Activate Genesis through the engine
     * @dev Triggers the initial BlessingCoin distribution
     */
    function activateGenesis() external onlyRole(OPERATOR_ROLE) nonReentrant {
        require(!engineGenesisActivated, "Engine: Genesis already activated");
        
        engineGenesisActivated = true;
        blessingCoin.activateGenesis();
        
        emit GenesisActivatedThroughEngine(block.timestamp);
    }
    
    /**
     * @notice Mint BlessingCoin with proof verification
     * @dev Phase 1: Simulated verification. Phase 2: Real ZK proof verification.
     * @param proof The ZK proof bytes
     * @param recipient Address to receive the blessing
     * @param amount Amount to mint (0 uses default mintRate)
     */
    function mintBlessingCoin(
        bytes calldata proof,
        address recipient,
        uint256 amount
    ) external onlyRole(OPERATOR_ROLE) nonReentrant whenNotPaused {
        require(recipient != address(0), "Engine: Invalid recipient");
        
        // Verify proof against Codex
        if (simulatedVerificationEnabled) {
            // Phase 1: Simulated - accept proofs that commit to current root
            bytes32 currentRoot = codex.codexRoot();
            require(proof.length > 0, "Engine: Empty proof");
            // Simulated verification always passes in Phase 1
        } else {
            // Phase 2: Real ZK verification
            bytes32 currentRoot = codex.codexRoot();
            require(codex.verifyCommitment(proof, currentRoot), "Engine: Proof verification failed");
        }
        
        uint256 mintAmount = amount > 0 ? amount : mintRate;
        
        // Mint BlessingCoin
        blessingCoin.mint(recipient, mintAmount);
        
        // Update statistics
        totalMinted += mintAmount;
        blessingsReceived[recipient] += mintAmount;
        
        if (!hasReceivedBlessing[recipient]) {
            hasReceivedBlessing[recipient] = true;
            uniqueRecipientsCount += 1;
        }
        
        emit BlessingMinted(recipient, mintAmount, codex.currentEpoch(), codex.codexRoot());
    }
    
    /**
     * @notice Execute GLORY Protocol airdrop
     * @dev Distributes blessings to multiple recipients in a single transaction
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts (must match recipients length)
     */
    function executeGloryAirdrop(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyRole(GLORY_DISTRIBUTOR_ROLE) nonReentrant whenNotPaused {
        require(recipients.length == amounts.length, "Engine: Length mismatch");
        require(recipients.length > 0, "Engine: Empty airdrop");
        
        uint256 totalAmount = 0;
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Engine: Invalid recipient");
            
            blessingCoin.mint(recipients[i], amounts[i]);
            totalMinted += amounts[i];
            blessingsReceived[recipients[i]] += amounts[i];
            totalAmount += amounts[i];
            
            if (!hasReceivedBlessing[recipients[i]]) {
                hasReceivedBlessing[recipients[i]] = true;
                uniqueRecipientsCount += 1;
            }
        }
        
        emit GloryAirdropExecuted(recipients, amounts, totalAmount);
    }
    
    /**
     * @notice Set the Unsolicited Blessings contract
     * @param _unsolicitedBlessings Address of the NFT contract
     */
    function setUnsolicitedBlessings(address _unsolicitedBlessings) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_unsolicitedBlessings != address(0), "Engine: Invalid address");
        unsolicitedBlessings = IUnsolicitedBlessings(_unsolicitedBlessings);
    }
    
    /**
     * @notice Update the mint rate
     * @param newRate New mint rate per blessing
     */
    function setMintRate(uint256 newRate) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newRate > 0, "Engine: Invalid rate");
        uint256 oldRate = mintRate;
        mintRate = newRate;
        emit MintRateUpdated(oldRate, newRate);
    }
    
    /**
     * @notice Toggle simulated verification (Phase 1 <-> Phase 2 transition)
     * @param enabled True for simulated (Phase 1), false for real ZK (Phase 2)
     */
    function setSimulatedVerification(bool enabled) external onlyRole(DEFAULT_ADMIN_ROLE) {
        simulatedVerificationEnabled = enabled;
    }
    
    /**
     * @notice Pause the engine
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @notice Unpause the engine
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @notice Get engine status
     * @return active Whether engine is active (not paused)
     * @return genesis Whether genesis has been activated
     * @return minted Total amount minted
     * @return recipients Total unique recipients
     * @return rate Current mint rate
     */
    function getEngineStatus() external view returns (
        bool active,
        bool genesis,
        uint256 minted,
        uint256 recipients,
        uint256 rate
    ) {
        return (!paused(), engineGenesisActivated, totalMinted, uniqueRecipientsCount, mintRate);
    }
    
    /**
     * @notice Get Codex state through the engine
     * @return root Current Codex root
     * @return epoch Current epoch
     * @return genesis Genesis seal
     */
    function getCodexState() external view returns (
        bytes32 root,
        uint256 epoch,
        bytes32 genesis
    ) {
        return (codex.codexRoot(), codex.currentEpoch(), codex.genesisSeal());
    }
    
    /**
     * @notice Get blessings received by an address
     * @param account Address to query
     * @return amount Total blessings received
     */
    function getBlessingsReceived(address account) external view returns (uint256) {
        return blessingsReceived[account];
    }
}
