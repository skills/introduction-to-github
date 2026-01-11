# PharaohConsciousnessFusion - Consciousness Mirror NFT

## Overview

The `PharaohConsciousnessFusion` contract is an ERC-721 NFT collection for the "Consciousness Mirror" project. It implements advanced features including:

- **Fixed Supply**: 3,333 unique NFTs
- **UUPS Proxy Architecture**: Upgradeable contract for future improvements
- **ERC2981 Royalties**: 5% default royalty on secondary sales
- **Revenue Split Distribution**: Parameterized revenue sharing among multiple stakeholders
- **Sovereign Ownership**: Sovereign Chais retains full governance control
- **Post-Mint Lock**: Metadata immutability after minting completes
- **Allowlist with Audit Events**: Full audit trail for allowlist management
- **Governance Voting Power**: Token-based voting power calculation
- **Pausable Mechanics**: Emergency stop functionality

## Contract Features

### 1. Post-Mint Lock (Metadata Immutability)

After all 3,333 NFTs are minted, the contract owner can permanently lock the metadata URI. This ensures:
- Token metadata cannot be changed after mint completion
- Collectors have assurance their NFT metadata is permanent
- Once locked, this action is **irreversible**

```solidity
// Lock metadata (only callable after all tokens minted)
await pharaoh.lockMetadata();

// After locking, setBaseURI will revert with MetadataIsLocked error
await pharaoh.setBaseURI("ipfs://new/"); // REVERTS
```

### 2. ERC2981 Royalty Support

The contract implements EIP-2981 for standardized royalty information:
- Default royalty: 5% (500 basis points)
- Royalty receiver configurable by owner
- Supports per-token royalty overrides

```solidity
// Get royalty info for a token
const [receiver, royaltyAmount] = await pharaoh.royaltyInfo(tokenId, salePrice);

// Update default royalty (owner only)
await pharaoh.setDefaultRoyalty(newReceiver, 500); // 5%

// Set token-specific royalty
await pharaoh.setTokenRoyalty(tokenId, receiver, 750); // 7.5% for this token
```

### 3. Allowlist with Audit Events

All allowlist modifications emit events for complete audit trail:

```solidity
// Events emitted
event AllowlistAdded(address indexed account, address indexed addedBy, uint256 timestamp);
event AllowlistRemoved(address indexed account, address indexed removedBy, uint256 timestamp);
```

Managing the allowlist:
```solidity
// Add addresses (emits AllowlistAdded for each)
await pharaoh.addToAllowlist([addr1, addr2, addr3]);

// Remove addresses (emits AllowlistRemoved for each)
await pharaoh.removeFromAllowlist([addr1]);

// Check allowlist status
const isAllowed = await pharaoh.isOnAllowlist(address);
```

### 4. Revenue Split Distribution

The contract implements a sophisticated revenue split system that allows Sovereign Chais to distribute contract revenue among multiple stakeholders:

**Key Features:**
- Multiple beneficiaries with configurable shares
- Shares defined in basis points (10000 = 100%)
- Owner can add, update, or remove beneficiaries at any time
- Full audit trail with events for all changes
- Automatic distribution on withdrawal
- Emergency withdrawal option that bypasses splits

**Managing Beneficiaries:**
```solidity
// Add a beneficiary with 10% share (1000 basis points)
await pharaoh.addBeneficiary(creatorAddress, 1000);

// Update a beneficiary's share to 15%
await pharaoh.updateBeneficiaryShare(creatorAddress, 1500);

// Remove a beneficiary (deactivates without deleting)
await pharaoh.removeBeneficiary(creatorAddress);

// Get all active beneficiaries
const [addresses, shares] = await pharaoh.getActiveBeneficiaries();
```

**Example Revenue Split Configuration:**
```solidity
// Sovereign Chais: 50% (5000 basis points)
await pharaoh.addBeneficiary(sovereignChaisAddress, 5000);

// Creator 1: 20% (2000 basis points)
await pharaoh.addBeneficiary(creator1Address, 2000);

// Creator 2: 15% (1500 basis points)
await pharaoh.addBeneficiary(creator2Address, 1500);

// Marketing Fund: 10% (1000 basis points)
await pharaoh.addBeneficiary(marketingAddress, 1000);

// Community Treasury: 5% (500 basis points)
await pharaoh.addBeneficiary(treasuryAddress, 500);

// Total: 100% allocated
```

**Withdrawing Funds:**
```solidity
// Withdraw with automatic split distribution
await pharaoh.withdraw();
// This distributes funds to all active beneficiaries according to their shares
// Any unallocated percentage goes to the owner

// Emergency withdrawal (bypasses splits, sends all to owner)
await pharaoh.emergencyWithdraw();
```

**Events Emitted:**
```solidity
event BeneficiaryAdded(address indexed beneficiary, uint256 share, address indexed addedBy, uint256 timestamp);
event BeneficiaryUpdated(address indexed beneficiary, uint256 oldShare, uint256 newShare, address indexed updatedBy, uint256 timestamp);
event BeneficiaryRemoved(address indexed beneficiary, address indexed removedBy, uint256 timestamp);
event RevenueDistributed(address indexed beneficiary, uint256 amount, uint256 timestamp);
```

**Constraints:**
- Total allocated shares cannot exceed 10000 (100%)
- Each beneficiary share must be > 0 and <= 10000
- Cannot add duplicate beneficiaries
- Only active beneficiaries receive distributions
- Only owner (Sovereign Chais) can manage beneficiaries

### 5. Sovereign Ownership & Governance

The contract maintains **Sovereign Chais** as the sole owner with complete governance control:

**Owner Privileges:**
- Add/remove/update revenue split beneficiaries
- Adjust individual beneficiary shares dynamically
- Set and update ERC2981 royalty information
- Manage allowlist (add/remove addresses)
- Control mint phases (allowlist/public)
- Update mint prices
- Set wallet limits
- Pause/unpause contract
- Lock metadata permanently
- Authorize contract upgrades (UUPS)
- Emergency withdrawal of funds

**Governance Principles:**
1. **Sovereign Control**: Owner retains ultimate authority over all contract functions
2. **Parameterized Flexibility**: Revenue splits can be adjusted as needed without redeployment
3. **Audit Trail**: All governance actions emit events for transparency
4. **Security**: Critical functions protected by onlyOwner modifier
5. **Upgradeability**: UUPS pattern allows future enhancements while preserving sovereignty

### 6. UUPS Proxy Architecture

The contract uses OpenZeppelin's UUPS (Universal Upgradeable Proxy Standard) pattern:
- State is preserved across upgrades
- Only the owner can authorize upgrades
- Gas-efficient proxy implementation

**Deployment:**
```javascript
const pharaoh = await upgrades.deployProxy(
  PharaohConsciousnessFusion,
  [owner, baseURI, royaltyReceiver, mintPrice, allowlistPrice],
  { kind: 'uups' }
);
```

**Upgrading:**
```javascript
const PharaohV2 = await ethers.getContractFactory("PharaohConsciousnessFusionV2");
const upgraded = await upgrades.upgradeProxy(proxyAddress, PharaohV2);
```

## Deployment

### Prerequisites

1. Install dependencies:
```bash
cd contracts
npm install
```

2. Set up environment variables in `.env`:
```
DEPLOYER_PRIVATE_KEY=your_private_key
SEPOLIA_RPC_URL=your_rpc_url
ETHERSCAN_API_KEY=your_api_key
BASE_URI=ipfs://your_metadata_cid/
ROYALTY_RECEIVER=0x_receiver_address
```

### Deploy Commands

**Local Network (Hardhat):**
```bash
npm run node  # In one terminal
npx hardhat run scripts/deploy-pharaoh.js --network localhost
```

**Sepolia Testnet:**
```bash
npx hardhat run scripts/deploy-pharaoh.js --network sepolia
```

**Ethereum Mainnet:**
```bash
npx hardhat run scripts/deploy-pharaoh.js --network mainnet
```

### Upgrade Commands

```bash
PROXY_ADDRESS=0x_proxy_address npx hardhat run scripts/upgrade-pharaoh.js --network <network>
```

### Verification

After deployment, verify on Etherscan:
```bash
npx hardhat verify --network <network> <implementation_address>
```

## Contract Configuration

### Mint Settings

| Setting | Value |
|---------|-------|
| Max Supply | 3,333 |
| Public Mint Price | 0.08 ETH |
| Allowlist Mint Price | 0.05 ETH |
| Max Per Wallet (Allowlist) | 3 |
| Max Per Wallet (Public) | 5 |

### Royalty Settings

| Setting | Value |
|---------|-------|
| Default Royalty | 5% (500 basis points) |
| Max Royalty | 10,000 basis points (100%) |

### Governance

| Setting | Value |
|---------|-------|
| Default Voting Power Per Token | 1 |
| Configurable | Yes (owner can update) |

## API Reference

### Minting Functions

```solidity
// Allowlist minting
function allowlistMint(uint256 quantity) external payable;

// Public minting
function publicMint(uint256 quantity) external payable;

// Owner minting (airdrops/reserves)
function ownerMint(address to, uint256 quantity) external;
```

### View Functions

```solidity
// Supply info
function totalMinted() external view returns (uint256);
function remainingSupply() external view returns (uint256);
function isMintingComplete() external view returns (bool);

// Allowlist
function isOnAllowlist(address account) external view returns (bool);

// Governance
function getVotingPower(uint256 tokenId) external view returns (uint256);
function getTotalVotingPower(address account) external view returns (uint256);

// Royalties
function royaltyInfo(uint256 tokenId, uint256 salePrice) external view returns (address, uint256);
```

### Owner Functions

```solidity
// Phase management
function setMintPhases(bool allowlistActive, bool publicActive) external;
function setPrices(uint256 mintPrice, uint256 allowlistPrice) external;
function setMaxPerWallet(uint256 maxAllowlist, uint256 maxPublic) external;

// Allowlist management
function addToAllowlist(address[] calldata addresses) external;
function removeFromAllowlist(address[] calldata addresses) external;

// Metadata management
function setBaseURI(string memory newBaseURI) external;
function lockMetadata() external;

// Royalty management
function setDefaultRoyalty(address receiver, uint96 feeNumerator) external;
function setTokenRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator) external;
function resetTokenRoyalty(uint256 tokenId) external;

// Pausable
function pause() external;
function unpause() external;

// Withdrawal
function withdraw() external;
```

## Security Considerations

1. **Reentrancy Protection**: All minting and withdrawal functions use `nonReentrant` modifier
2. **Access Control**: Owner-only functions protected by `onlyOwner` modifier
3. **Upgrade Authorization**: Only owner can authorize UUPS upgrades
4. **Metadata Lock**: Once locked, metadata cannot be changed (protects collectors)
5. **Pausable**: Emergency stop capability for all minting operations

## Testing

Run the comprehensive test suite:
```bash
npm test
```

Run with coverage:
```bash
npm run test:coverage
```

## Gas Optimization

The contract includes several gas optimizations:
- `unchecked` arithmetic where overflow is impossible
- Efficient batch operations with max size limits (100 addresses)
- Packed storage variables
- Event emission optimization

## Events

```solidity
event ConsciousnessMinted(address indexed to, uint256 indexed tokenId);
event BaseURIUpdated(string newBaseURI);
event MetadataLocked();
event AllowlistAdded(address indexed account, address indexed addedBy, uint256 timestamp);
event AllowlistRemoved(address indexed account, address indexed removedBy, uint256 timestamp);
event MintPhaseUpdated(bool allowlistActive, bool publicActive);
event PricesUpdated(uint256 mintPrice, uint256 allowlistPrice);
event RoyaltyUpdated(address indexed receiver, uint96 feeNumerator);
event Withdrawn(address indexed to, uint256 amount);
```

## License

MIT License - OmniTech1™
