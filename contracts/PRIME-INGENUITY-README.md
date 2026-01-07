# Prime Ingenuity Smart Contracts

## Overview

Smart contracts for the **Scroll of Prime Ingenuity** NFT collection - a royalty-enabled NFT system honoring inventors and engineers from "TOP 43 MOST AMAZING INVENTIONS YOU'VE NEVER SEEN BEFORE."

## Contracts

### PrimeIngenuityNFT.sol
Main NFT contract featuring:
- **ERC721**: Standard NFT functionality
- **ERC2981**: On-chain royalty standard (5% default)
- **Paired Minting**: 2 units per innovation for co-ownership
- **Lineage Tracking**: Complete ownership history on-chain
- **Dynamic Metadata**: Post-mint metadata updates
- **Access Control**: Role-based permissions

**Key Features:**
- Max Supply: 86 NFTs (43 innovations × 2 units)
- Innovation registration and management
- Co-owner experience recording
- Remembrance and lineage preservation

### PrimeIngenuityStaking.sol
Staking and governance contract featuring:
- **NFT Staking**: Stake NFTs to earn rewards
- **Reward Distribution**: Daily rewards in ScrollCoin
- **Voting System**: Vote on new inventor inclusions
- **Proposal Creation**: Community-driven governance
- **Royalty Distribution**: Secondary sale royalties to stakers

**Key Features:**
- Configurable reward rates
- Voting power based on staked NFTs
- Transparent on-chain governance
- Emergency withdrawal functions

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface                            │
│              (Dashboard, OpenSea, etc.)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                   Smart Contracts                            │
│  ┌──────────────────────┐  ┌────────────────────────────┐  │
│  │ PrimeIngenuityNFT    │  │ PrimeIngenuityStaking      │  │
│  │ - Minting            │◄─┤ - Stake/Unstake            │  │
│  │ - Lineage Tracking   │  │ - Rewards                  │  │
│  │ - Metadata           │  │ - Voting                   │  │
│  │ - Royalties (ERC2981)│  │ - Proposals                │  │
│  └──────────────────────┘  └────────────────────────────┘  │
│              │                        │                      │
│              └────────┬───────────────┘                      │
│                       │                                      │
│         ┌─────────────┴──────────────┐                      │
│         │    Reward Token (ERC20)    │                      │
│         │      (ScrollCoin/Mock)     │                      │
│         └────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

## Installation

```bash
cd contracts
npm install
```

## Compilation

```bash
npm run compile
```

## Testing

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage
```

## Deployment

### Local (Hardhat Network)
```bash
npm run deploy:prime:local
```

### Testnet (Sepolia)
```bash
# Set environment variables in .env
SEPOLIA_RPC_URL=your_rpc_url
PRIVATE_KEY=your_private_key

npm run deploy:prime:sepolia
```

### Mainnet
```bash
# Set environment variables in .env
MAINNET_RPC_URL=your_rpc_url
PRIVATE_KEY=your_private_key

npm run deploy:prime:mainnet
```

## Configuration

### Environment Variables
Create a `.env` file:

```env
# Network RPC URLs
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY

# Deployment Account
PRIVATE_KEY=your_private_key_here

# Block Explorer API Keys (for verification)
ETHERSCAN_API_KEY=your_etherscan_api_key

# Optional: Existing Token Addresses
SCROLL_COIN_ADDRESS=0x...
```

## Contract Interactions

### Register Innovation
```javascript
const tx = await primeIngenuityNFT.registerInnovation(
  0,                                    // innovationId
  "Triton Flying Submarine",            // name
  "Transportation/Marine Technology",   // type
  "Pierre Paulo Latzarini",             // creator
  "Personal transport, exploration",    // useCase
  "Democratizes underwater/air access"  // impact
);
await tx.wait();
```

### Mint Innovation Pair
```javascript
const [token1, token2] = await primeIngenuityNFT.mintInnovationPair(
  0,                                      // innovationId
  "0x1234567890123456789012345678901234567890", // recipient
  "ipfs://QmXXXXX"                        // metadataBaseURI
);
```

### Stake NFT
```javascript
// First, approve the staking contract
await primeIngenuityNFT.approve(stakingContractAddress, tokenId);

// Then stake
await primeIngenuityStaking.stakeNFT(tokenId);
```

### Claim Rewards
```javascript
await primeIngenuityStaking.claimRewards(tokenId);
```

### Create Proposal
```javascript
const proposalId = await primeIngenuityStaking.createProposal(
  "Vertical Farming Tower",              // inventor name
  "Sustainable Agriculture Innovation",  // innovation
  "Revolutionary vertical farming..."    // description
);
```

### Vote on Proposal
```javascript
await primeIngenuityStaking.vote(
  proposalId,
  true  // true = support, false = against
);
```

## Security Features

### Access Control Roles
- **DEFAULT_ADMIN_ROLE**: Full admin privileges
- **MINTER_ROLE**: Can register innovations and mint NFTs
- **PAUSER_ROLE**: Can pause/unpause contract
- **METADATA_UPDATER_ROLE**: Can update dynamic metadata
- **DISTRIBUTOR_ROLE**: Can distribute royalties (staking contract)

### Security Measures
- ReentrancyGuard on critical functions
- Pausable for emergency stops
- Role-based access control
- Input validation
- Event emission for transparency

## Gas Optimization

### Estimated Gas Costs (on Ethereum mainnet)
- Deploy PrimeIngenuityNFT: ~4,500,000 gas
- Deploy PrimeIngenuityStaking: ~3,800,000 gas
- Register Innovation: ~150,000 gas
- Mint Pair: ~350,000 gas
- Stake NFT: ~120,000 gas
- Claim Rewards: ~80,000 gas
- Vote: ~100,000 gas

### Optimization Techniques Used
- Minimal storage reads
- Batch operations where possible
- Efficient data structures
- Event-based tracking

## Upgrade Path

While these contracts are not upgradeable (for security and immutability), future enhancements can be achieved through:

1. **New Staking Contracts**: Deploy new staking versions with migration
2. **Metadata Updates**: Use dynamic metadata feature
3. **Additional Contracts**: Deploy complementary contracts
4. **Cross-chain**: Deploy to multiple chains

## Integration with ScrollVerse

### ScrollCoin Economy
- Staking rewards paid in ScrollCoin
- Voting weight influenced by ScrollCoin holdings
- Royalties convertible to ScrollCoin

### Ecosystem Benefits
- Integration with Sovereign TV App
- ScrollVerse dashboard tracking
- Community engagement metrics
- Prophecy Documentation Protocol

## Monitoring & Analytics

### Events to Monitor
```solidity
// PrimeIngenuityNFT
event InnovationRegistered(uint256 indexed innovationId, string name, string creatorName);
event NFTPairMinted(uint256 indexed innovationId, uint256 token1, uint256 token2, address recipient);
event MetadataUpdated(uint256 indexed tokenId, string newMetadataURI);
event ExperienceAdded(uint256 indexed tokenId, string experience);
event LineageTracked(uint256 indexed tokenId, address previousOwner, uint256 duration);

// PrimeIngenuityStaking
event NFTStaked(address indexed user, uint256 indexed tokenId, uint256 timestamp);
event NFTUnstaked(address indexed user, uint256 indexed tokenId, uint256 timestamp);
event RewardsClaimed(address indexed user, uint256 amount);
event ProposalCreated(uint256 indexed proposalId, string inventorName);
event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 votingPower);
event ProposalExecuted(uint256 indexed proposalId, bool passed);
event RoyaltyDistributed(uint256 amount, uint256 timestamp);
```

### Recommended Monitoring
- Total minted vs max supply
- Staking participation rate
- Reward distribution amounts
- Voting participation
- Proposal outcomes
- Royalty collection

## Testing Strategy

### Unit Tests Required
- [ ] Innovation registration
- [ ] Paired minting
- [ ] Lineage tracking
- [ ] Metadata updates
- [ ] Staking operations
- [ ] Reward calculations
- [ ] Voting mechanics
- [ ] Access control
- [ ] Edge cases

### Integration Tests Required
- [ ] End-to-end minting → staking → rewards
- [ ] Voting → proposal execution
- [ ] Royalty → distribution flow
- [ ] Multi-user scenarios

### Security Tests Required
- [ ] Reentrancy attacks
- [ ] Access control violations
- [ ] Integer overflow/underflow
- [ ] Gas limit attacks
- [ ] Front-running scenarios

## Audit Checklist

Before mainnet deployment:
- [ ] Complete unit test coverage (>95%)
- [ ] Integration tests passing
- [ ] External security audit
- [ ] Gas optimization review
- [ ] Documentation complete
- [ ] Testnet deployment successful
- [ ] Community review period
- [ ] Legal compliance check

## Support & Resources

### Documentation
- Main Documentation: `/docs/PRIME-INGENUITY-NFT.md`
- Deployment Roadmap: `/docs/PRIME-INGENUITY-DEPLOYMENT-ROADMAP.md`
- Dashboard Specs: `/docs/PRIME-INGENUITY-DASHBOARD-SPECS.md`
- Metadata Guide: `/metadata/prime-ingenuity/README.md`

### Community
- Discord: https://discord.gg/scrollverse
- GitHub: https://github.com/chaishillomnitech1/introduction-to-github
- Twitter: @ScrollVerse

### Technical Support
- Email: dev@scrollverse.com
- GitHub Issues: https://github.com/chaishillomnitech1/introduction-to-github/issues

## License

MIT License

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Submit a pull request

## Acknowledgments

- **Pierre Paulo Latzarini**: Triton Flying Submarine
- **LIFT Aircraft Team**: HEXA eVTOL
- **OpenZeppelin**: Smart contract libraries
- **Hardhat Team**: Development framework
- **ScrollVerse Community**: Vision and support

---

**Built with ❤️ by OmniTech1™**  
*Part of the ScrollVerse Ecosystem*
