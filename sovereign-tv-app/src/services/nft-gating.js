/**
 * NFT Gating Service
 * 
 * Manages KUNTA NFT verification and gated content access
 */

import { Router } from 'express';
import { authenticateToken } from './auth.js';

const nftRouter = Router();

// Mock KUNTA NFT database
const kuntaNFTs = [
  {
    tokenId: '1',
    owner: '0x1234567890abcdef1234567890abcdef12345678',
    metadata: {
      name: 'KUNTA Genesis #1',
      description: 'First KUNTA NFT from the Genesis collection',
      attributes: {
        rarity: 'legendary',
        power: 100,
        realm: 'OmniVerse'
      }
    },
    benefits: ['elite_access', 'early_releases', 'exclusive_events'],
    mintedAt: '2025-01-01T00:00:00Z'
  },
  {
    tokenId: '2',
    owner: '0xabcdef1234567890abcdef1234567890abcdef12',
    metadata: {
      name: 'KUNTA Genesis #2',
      description: 'Second KUNTA NFT from the Genesis collection',
      attributes: {
        rarity: 'rare',
        power: 75,
        realm: 'ScrollVerse'
      }
    },
    benefits: ['premium_access', 'exclusive_content'],
    mintedAt: '2025-01-02T00:00:00Z'
  }
];

// Verify NFT ownership
nftRouter.post('/verify', authenticateToken, async (req, res) => {
  try {
    const { walletAddress, tokenId } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    // In production, this would call smart contract to verify ownership
    const ownedNFTs = kuntaNFTs.filter(nft => 
      nft.owner.toLowerCase() === walletAddress.toLowerCase()
    );

    if (tokenId) {
      const specificNFT = ownedNFTs.find(nft => nft.tokenId === tokenId);
      if (!specificNFT) {
        return res.status(404).json({ 
          verified: false,
          error: 'NFT not found or not owned by this wallet' 
        });
      }

      return res.json({
        verified: true,
        nft: specificNFT,
        benefits: specificNFT.benefits
      });
    }

    res.json({
      verified: ownedNFTs.length > 0,
      count: ownedNFTs.length,
      nfts: ownedNFTs,
      aggregatedBenefits: [...new Set(ownedNFTs.flatMap(nft => nft.benefits))]
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Verification failed', 
      details: error.message 
    });
  }
});

// Get KUNTA NFT details
nftRouter.get('/kunta/:tokenId', (req, res) => {
  const { tokenId } = req.params;
  const nft = kuntaNFTs.find(n => n.tokenId === tokenId);

  if (!nft) {
    return res.status(404).json({ error: 'KUNTA NFT not found' });
  }

  res.json({
    tokenId: nft.tokenId,
    metadata: nft.metadata,
    benefits: nft.benefits,
    mintedAt: nft.mintedAt,
    contractAddress: process.env.KUNTA_NFT_CONTRACT_ADDRESS || '0x...'
  });
});

// List all KUNTA NFTs
nftRouter.get('/kunta', (req, res) => {
  res.json({
    collection: 'KUNTA Genesis',
    totalSupply: kuntaNFTs.length,
    contractAddress: process.env.KUNTA_NFT_CONTRACT_ADDRESS || '0x...',
    nfts: kuntaNFTs.map(nft => ({
      tokenId: nft.tokenId,
      name: nft.metadata.name,
      rarity: nft.metadata.attributes.rarity,
      owner: nft.owner
    }))
  });
});

// Get NFT benefits for authenticated user
nftRouter.get('/benefits', authenticateToken, (req, res) => {
  const { walletAddress } = req.user;

  if (!walletAddress) {
    return res.status(400).json({ 
      error: 'No wallet address associated with account',
      message: 'Please link your wallet to view NFT benefits'
    });
  }

  const ownedNFTs = kuntaNFTs.filter(nft => 
    nft.owner.toLowerCase() === walletAddress.toLowerCase()
  );

  const allBenefits = [...new Set(ownedNFTs.flatMap(nft => nft.benefits))];

  res.json({
    walletAddress,
    nftsOwned: ownedNFTs.length,
    benefits: allBenefits,
    nfts: ownedNFTs.map(nft => ({
      tokenId: nft.tokenId,
      name: nft.metadata.name,
      benefits: nft.benefits
    }))
  });
});

// Check access to NFT-gated content
nftRouter.post('/check-access', authenticateToken, (req, res) => {
  const { contentId, requiredBenefit } = req.body;
  const { walletAddress } = req.user;

  if (!walletAddress) {
    return res.json({
      hasAccess: false,
      reason: 'No wallet connected'
    });
  }

  const ownedNFTs = kuntaNFTs.filter(nft => 
    nft.owner.toLowerCase() === walletAddress.toLowerCase()
  );

  const hasRequiredBenefit = ownedNFTs.some(nft => 
    nft.benefits.includes(requiredBenefit)
  );

  res.json({
    hasAccess: hasRequiredBenefit,
    contentId,
    requiredBenefit,
    nftsOwned: ownedNFTs.length
  });
});

// Mint new KUNTA NFT (admin only - simplified for demo)
nftRouter.post('/mint', authenticateToken, (req, res) => {
  const { walletAddress, metadata } = req.body;

  if (!walletAddress || !metadata) {
    return res.status(400).json({ 
      error: 'Wallet address and metadata required' 
    });
  }

  const newTokenId = (kuntaNFTs.length + 1).toString();
  const newNFT = {
    tokenId: newTokenId,
    owner: walletAddress,
    metadata: {
      name: metadata.name || `KUNTA Genesis #${newTokenId}`,
      description: metadata.description || 'KUNTA NFT',
      attributes: metadata.attributes || {
        rarity: 'common',
        power: 50,
        realm: 'OmniVerse'
      }
    },
    benefits: metadata.benefits || ['premium_access'],
    mintedAt: new Date().toISOString()
  };

  kuntaNFTs.push(newNFT);

  res.status(201).json({
    message: 'KUNTA NFT minted successfully',
    nft: newNFT,
    transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`
  });
});

// Get NFT ownership statistics
nftRouter.get('/stats', (req, res) => {
  const ownershipMap = new Map();
  
  kuntaNFTs.forEach(nft => {
    const owner = nft.owner.toLowerCase();
    ownershipMap.set(owner, (ownershipMap.get(owner) || 0) + 1);
  });

  const rarityCount = {};
  kuntaNFTs.forEach(nft => {
    const rarity = nft.metadata.attributes.rarity;
    rarityCount[rarity] = (rarityCount[rarity] || 0) + 1;
  });

  res.json({
    totalSupply: kuntaNFTs.length,
    uniqueOwners: ownershipMap.size,
    rarityDistribution: rarityCount,
    contractAddress: process.env.KUNTA_NFT_CONTRACT_ADDRESS || '0x...'
  });
});

export { nftRouter };
