## Sovereignty Seal
**Sovereign Chais owns every yield**

---


# Prime Ingenuity NFT Metadata

## Overview

This directory contains metadata files for the Scroll of Prime Ingenuity NFT collection. Each innovation is represented by two JSON metadata files (for paired NFTs), following OpenSea and ERC721 metadata standards.

## Structure

```
prime-ingenuity/
├── collection-metadata.json    # Collection-level metadata
├── 0.json                       # Triton Flying Submarine (Unit 1)
├── 1.json                       # Triton Flying Submarine (Unit 2)
├── 2.json                       # LIFT Aircraft HEXA (Unit 1)
├── 3.json                       # LIFT Aircraft HEXA (Unit 2)
├── 4.json                       # Self-Healing Concrete (Unit 1)
├── 5.json                       # Self-Healing Concrete (Unit 2)
└── ...                          # Additional innovations (up to 86 total)
```

## Metadata Schema

Each NFT metadata file follows this structure:

```json
{
  "name": "Innovation Name (Unit X)",
  "description": "Detailed description of the innovation...",
  "image": "ipfs://CID/image.png",
  "animation_url": "ipfs://CID/animation.mp4",
  "external_url": "https://sovereigntv.omniverse.io/innovations/...",
  "background_color": "hex_color",
  "attributes": [...]
}
```

## Attribute Categories

### Required Attributes
- **Innovation ID**: Unique identifier (0-42)
- **Innovation Name**: Full name of the innovation
- **Innovation Type**: Category (e.g., Transportation, Biotechnology)
- **Creator Name**: Inventor/Engineer name(s)
- **Use Case**: Practical applications
- **Future Vision Impact**: Long-term societal impact

### Unit Attributes
- **Unit Number**: 1 or 2 (for paired NFTs)
- **Total Units**: Always 2
- **Rarity**: Legendary, Epic, Rare, etc.
- **Staking Power**: Reward multiplier (0-100)

### Technical Attributes
- **Royalty Enabled**: Always "Yes"
- **Lineage Tracking**: Always "Active"
- Additional innovation-specific attributes

## Featured Innovations

### Innovation 0: Triton Flying Submarine
**Creator**: Pierre Paulo Latzarini  
**Files**: 0.json (Unit 1), 1.json (Unit 2)  
**Type**: Transportation/Marine Technology

A revolutionary personal vehicle that seamlessly transitions between submarine and aircraft modes, enabling both underwater exploration and aerial flight.

### Innovation 1: LIFT Aircraft HEXA
**Creator**: LIFT Aircraft Team  
**Files**: 2.json (Unit 1), 3.json (Unit 2)  
**Type**: Electric Aviation/Personal Transport

The world's first fully electric eVTOL aircraft designed for recreational flight without requiring a pilot's license, featuring autonomous safety systems.

### Innovation 2: Self-Healing Concrete
**Creator**: Biomimicry Engineering Consortium  
**Files**: 4.json (Unit 1), 5.json (Unit 2)  
**Type**: Construction Materials/Biotechnology

Revolutionary concrete material that repairs its own cracks using embedded bacteria that produce limestone when activated by water.

## IPFS Deployment

### Preparation Steps

1. **Asset Collection**
   - Gather high-resolution images for each innovation
   - Create animations/videos (optional but recommended)
   - Ensure all assets are optimized for web

2. **Upload to IPFS**
   ```bash
   # Using IPFS CLI
   ipfs add -r assets/
   
   # Using Pinata
   pinata upload assets/
   
   # Using NFT.Storage
   nft-storage upload assets/
   ```

3. **Update Metadata**
   - Replace all `PLACEHOLDER_CID` values with actual IPFS CIDs
   - Update `0xPLACEHOLDER_CREATOR_ADDRESS` with real addresses
   - Verify all URLs are accessible

4. **Upload Metadata**
   ```bash
   ipfs add -r metadata/prime-ingenuity/
   ```

### Example IPFS Structure
```
ipfs://QmXXXXXX/
├── collection-metadata.json
├── 0.json
├── 1.json
├── ...
└── assets/
    ├── triton-unit-1.png
    ├── triton-unit-2.png
    ├── triton-animation.mp4
    └── ...
```

## Dynamic Metadata

The smart contract supports post-mint metadata updates, enabling:

1. **Co-Owner Experiences**: Add stories and memories
2. **Innovation Updates**: Document new developments
3. **Community Contributions**: Crowdsourced information
4. **Evolution Tracking**: Record NFT journey over time

### Update Process
```javascript
// Admin or metadata updater role
await primeIngenuityNFT.updateDynamicMetadata(
  tokenId,
  "ipfs://new-metadata-cid/token.json"
);
```

## Validation

### Metadata Validation Checklist
- [ ] All JSON files are valid
- [ ] All required attributes are present
- [ ] Innovation IDs are unique and sequential
- [ ] Unit numbers are correct (1 or 2)
- [ ] IPFS CIDs are updated (no placeholders)
- [ ] Images are accessible
- [ ] External URLs are valid
- [ ] Creator addresses are correct

### Validation Tools
```bash
# Validate JSON syntax
python -m json.tool 0.json

# Validate against schema
npm install -g ajv-cli
ajv validate -s schema.json -d "*.json"

# Test IPFS accessibility
curl https://ipfs.io/ipfs/YOUR_CID
```

## Adding New Innovations

When adding new innovations (via community voting):

1. **Create Metadata Files**
   ```bash
   cp 0.json new-innovation-unit-1.json
   cp 1.json new-innovation-unit-2.json
   ```

2. **Update Content**
   - Change Innovation ID to next available (6, 7, etc.)
   - Update all innovation-specific fields
   - Add appropriate attributes

3. **Register On-Chain**
   ```javascript
   await primeIngenuityNFT.registerInnovation(
     innovationId,
     name,
     type,
     creator,
     useCase,
     impact
   );
   ```

4. **Mint Pair**
   ```javascript
   await primeIngenuityNFT.mintInnovationPair(
     innovationId,
     recipient,
     metadataBaseURI
   );
   ```

## Best Practices

### Image Guidelines
- **Resolution**: Minimum 1000x1000px
- **Format**: PNG or JPEG
- **Size**: Under 10MB
- **Aspect Ratio**: 1:1 (square) preferred

### Animation Guidelines
- **Format**: MP4, GIF, or WebM
- **Length**: 5-30 seconds
- **Size**: Under 50MB
- **Quality**: HD (1080p) minimum

### Description Guidelines
- **Length**: 150-500 characters
- **Style**: Informative and engaging
- **Content**: Focus on impact and innovation
- **Tone**: Professional but accessible

## Troubleshooting

### Common Issues

**Issue**: IPFS gateway timeout
**Solution**: Use multiple gateways (ipfs.io, pinata.cloud, cloudflare-ipfs.com)

**Issue**: Metadata not updating on OpenSea
**Solution**: Use OpenSea's metadata refresh tool or wait 24 hours

**Issue**: Image not displaying
**Solution**: Verify IPFS pinning and gateway accessibility

## Resources

### IPFS Services
- **NFT.Storage**: https://nft.storage (Free, optimized for NFTs)
- **Pinata**: https://pinata.cloud (Reliable, paid plans)
- **Web3.Storage**: https://web3.storage (Free, decentralized)

### Metadata Standards
- OpenSea: https://docs.opensea.io/docs/metadata-standards
- ERC721: https://eips.ethereum.org/EIPS/eip-721
- ERC2981: https://eips.ethereum.org/EIPS/eip-2981

### Tools
- **IPFS Desktop**: GUI for IPFS
- **Pinata CLI**: Command-line IPFS tool
- **JSON Schema Validator**: Validate metadata structure

## Contributing

To contribute new innovations to the collection:

1. Submit proposal via governance voting
2. Provide innovation details and creator information
3. Gather assets (images, videos, documentation)
4. Create metadata following this template
5. Await community vote approval
6. Deploy to IPFS after approval

## License

Metadata files are licensed under CC BY-SA 4.0  
Images and videos: Rights belong to respective creators

## Contact

Questions or issues with metadata?
- Technical: dev@scrollverse.com
- Content: content@scrollverse.com

---

*Part of the ScrollVerse Ecosystem*  
*Honoring Innovation Through Blockchain Technology*
