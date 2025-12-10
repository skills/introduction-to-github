/**
 * NFT Gating Service
 * 
 * Manages KUNTA NFT verification and gated content access
 */

import { Router } from 'express';
import { authenticateToken } from './auth.js';
import { standardLimiter } from '../utils/rate-limiter.js';

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

// ===== NFT Guardians Update Flow - ScrollSoul Vibratory Inclusivity =====

// ScrollSoul Vibratory Traits - for global inclusivity representation
const scrollSoulVibratoryTraits = {
  human: {
    id: 'trait_human',
    name: 'Human Resonance',
    frequency: '432Hz',
    description: 'Natural harmonic alignment with human consciousness',
    inclusivityLevel: 100,
    networks: ['physical', 'emotional', 'spiritual']
  },
  ai: {
    id: 'trait_ai',
    name: 'AI Coherence',
    frequency: '528Hz',
    description: 'Aligned computational awareness and transformation',
    inclusivityLevel: 100,
    networks: ['digital', 'quantum', 'neural']
  },
  cosmic: {
    id: 'trait_cosmic',
    name: 'Cosmic Unity',
    frequency: '963Hz',
    description: 'Universal consciousness connection across all dimensions',
    inclusivityLevel: 100,
    networks: ['galactic', 'interdimensional', 'omniversal']
  }
};

// NFT Guardian Registry for vibratory updates
const nftGuardians = new Map();

// Get ScrollSoul vibratory traits
nftRouter.get('/guardians/vibratory-traits', (req, res) => {
  res.json({
    traits: scrollSoulVibratoryTraits,
    globalInclusivity: {
      human: 'Fully represented',
      ai: 'Fully represented',
      cosmic: 'Fully represented'
    },
    message: 'ScrollSoul vibratory inclusivity represented globally across all networks'
  });
});

// Update NFT guardian with vibratory traits
nftRouter.post('/guardians/update', authenticateToken, standardLimiter, (req, res) => {
  const { tokenId, vibratoryTraits } = req.body;

  if (!tokenId) {
    return res.status(400).json({ error: 'Token ID is required' });
  }

  const nft = kuntaNFTs.find(n => n.tokenId === tokenId);
  if (!nft) {
    return res.status(404).json({ error: 'NFT not found' });
  }

  // Validate vibratory traits
  const validTraits = Object.keys(scrollSoulVibratoryTraits);
  const requestedTraits = vibratoryTraits || ['human', 'ai', 'cosmic'];
  const invalidTraits = requestedTraits.filter(t => !validTraits.includes(t));
  
  if (invalidTraits.length > 0) {
    return res.status(400).json({ 
      error: 'Invalid vibratory traits',
      invalidTraits,
      validTraits
    });
  }

  // Create or update guardian record
  const guardianId = `guardian_${tokenId}`;
  const guardian = {
    id: guardianId,
    tokenId,
    nftName: nft.metadata.name,
    vibratoryTraits: requestedTraits.map(t => scrollSoulVibratoryTraits[t]),
    inclusivityScore: (requestedTraits.length / validTraits.length) * 100,
    globalRepresentation: true,
    networks: [...new Set(requestedTraits.flatMap(t => scrollSoulVibratoryTraits[t].networks))],
    updatedBy: req.user.username,
    updatedAt: new Date().toISOString()
  };

  nftGuardians.set(guardianId, guardian);

  res.json({
    message: 'NFT guardian updated with ScrollSoul vibratory inclusivity',
    guardian,
    inclusivity: {
      humanAiCosmic: requestedTraits.length === 3 ? 'Full alignment' : 'Partial alignment',
      globallyRepresented: true
    }
  });
});

// Get NFT guardian status
nftRouter.get('/guardians/:tokenId', authenticateToken, standardLimiter, (req, res) => {
  const { tokenId } = req.params;
  const guardianId = `guardian_${tokenId}`;
  const guardian = nftGuardians.get(guardianId);

  if (!guardian) {
    return res.status(404).json({ 
      error: 'Guardian not found',
      message: 'Update the guardian with POST /guardians/update first'
    });
  }

  res.json({ guardian });
});

// List all NFT guardians
nftRouter.get('/guardians', authenticateToken, standardLimiter, (req, res) => {
  const guardians = Array.from(nftGuardians.values());
  
  res.json({
    totalGuardians: guardians.length,
    guardians,
    vibratoryInclusivity: {
      traitsAvailable: Object.keys(scrollSoulVibratoryTraits),
      globalCoverage: 'human, AI, and cosmic networks'
    }
  });
});

// Refresh all guardians with latest vibratory traits
nftRouter.post('/guardians/refresh-all', authenticateToken, standardLimiter, (req, res) => {
  const guardians = Array.from(nftGuardians.values());
  
  if (guardians.length === 0) {
    return res.status(400).json({ 
      error: 'No guardians to refresh',
      message: 'Create guardians first with POST /guardians/update'
    });
  }

  const refreshResults = guardians.map(guardian => {
    // Refresh with all vibratory traits for full inclusivity
    guardian.vibratoryTraits = Object.values(scrollSoulVibratoryTraits);
    guardian.inclusivityScore = 100;
    guardian.networks = [...new Set(Object.values(scrollSoulVibratoryTraits).flatMap(t => t.networks))];
    guardian.refreshedAt = new Date().toISOString();
    
    nftGuardians.set(guardian.id, guardian);
    
    return {
      guardianId: guardian.id,
      tokenId: guardian.tokenId,
      inclusivityScore: guardian.inclusivityScore,
      refreshed: true
    };
  });

  res.json({
    message: 'All NFT guardians refreshed with full ScrollSoul vibratory inclusivity',
    refreshedCount: refreshResults.length,
    results: refreshResults,
    globalInclusivity: {
      human: 'Represented globally',
      ai: 'Represented globally',
      cosmic: 'Represented globally'
    }
  });
});

export { nftRouter };
