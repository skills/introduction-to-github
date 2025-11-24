/**
 * Prophecy Documentation Protocol (PDP) Integration Service
 * 
 * Manages PDP data synchronization and access
 */

import { Router } from 'express';
import { authenticateToken } from './auth.js';
import { TIER_HIERARCHY } from '../utils/constants.js';

const pdpRouter = Router();

// Mock PDP documents database
const pdpDocuments = [
  {
    id: 'pdp_001',
    title: 'The First Remembrance',
    category: 'foundational',
    author: 'Chais Hill - First Remembrancer',
    publishedDate: '2025-01-01T00:00:00Z',
    tier: 'free',
    summary: 'The foundational document establishing the Prophecy Documentation Protocol',
    content: 'In the beginning, there was the Word, and the Word became Code...',
    tags: ['foundation', 'prophecy', 'sacred-logic'],
    views: 10000,
    attestations: 500
  },
  {
    id: 'pdp_002',
    title: 'The Scroll Chess Manifesto',
    category: 'protocol',
    author: 'Chais Hill - First Remembrancer',
    publishedDate: '2025-01-15T00:00:00Z',
    tier: 'free',
    summary: 'Defining the Scroll Chess Protocol and its divine logic',
    content: 'Truth is Currency. Sacred Logic is Code. Remembrance is the Gateway...',
    tags: ['scroll-chess', 'protocol', 'divine-logic'],
    views: 8500,
    attestations: 420
  },
  {
    id: 'pdp_003',
    title: 'The Echo Sigil Revelation',
    category: 'nft-protocol',
    author: 'Chais Hill - First Remembrancer',
    publishedDate: '2025-02-01T00:00:00Z',
    tier: 'premium',
    summary: 'Understanding the Echo Sigil NFT system and its metaphysical properties',
    content: 'Each Echo Sigil carries the resonance of truth across dimensions...',
    tags: ['echo-sigil', 'nft', 'metaphysics'],
    views: 5200,
    attestations: 310
  },
  {
    id: 'pdp_004',
    title: 'The Sealed Function Codex',
    category: 'technical',
    author: 'Chais Hill - First Remembrancer',
    publishedDate: '2025-02-14T00:00:00Z',
    tier: 'premium',
    summary: 'Deep dive into the If-Then-Else Gate logic and sealed functions',
    content: 'The Sealed Function represents the divine conditional logic...',
    tags: ['sealed-function', 'if-then-else', 'technical'],
    views: 4100,
    attestations: 280
  },
  {
    id: 'pdp_005',
    title: 'KUNTA Genesis Protocol',
    category: 'kunta',
    author: 'Chais Hill - First Remembrancer',
    publishedDate: '2025-03-01T00:00:00Z',
    tier: 'elite',
    summary: 'The complete KUNTA NFT protocol and sovereignty framework',
    content: 'KUNTA represents sovereign identity in the digital realm...',
    tags: ['kunta', 'sovereignty', 'nft-protocol'],
    views: 3800,
    attestations: 250
  },
  {
    id: 'pdp_006',
    title: 'ScrollVerse Constitution',
    category: 'governance',
    author: 'Chais Hill - First Remembrancer',
    publishedDate: '2025-03-15T00:00:00Z',
    tier: 'premium',
    summary: 'The constitutional framework for ScrollVerse governance',
    content: 'We, the sovereign beings of the ScrollVerse, establish this constitution...',
    tags: ['constitution', 'governance', 'sovereignty'],
    views: 6200,
    attestations: 380
  }
];

// Get all PDP documents
pdpRouter.get('/documents', authenticateToken, (req, res) => {
  const userTier = req.user.tier || 'free';
  
  const userTierLevel = TIER_HIERARCHY[userTier] || 0;

  const accessibleDocs = pdpDocuments.filter(doc => {
    const docTierLevel = TIER_HIERARCHY[doc.tier] || 0;
    return userTierLevel >= docTierLevel;
  });

  res.json({
    protocol: 'Prophecy Documentation Protocol',
    totalDocuments: pdpDocuments.length,
    accessibleDocuments: accessibleDocs.length,
    userTier,
    documents: accessibleDocs.map(doc => ({
      id: doc.id,
      title: doc.title,
      category: doc.category,
      author: doc.author,
      publishedDate: doc.publishedDate,
      summary: doc.summary,
      tags: doc.tags,
      views: doc.views,
      attestations: doc.attestations,
      tier: doc.tier
    }))
  });
});

// Get specific PDP document
pdpRouter.get('/documents/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const document = pdpDocuments.find(doc => doc.id === id);

  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const userTier = req.user.tier || 'free';
  

  const hasAccess = TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[document.tier];

  if (!hasAccess) {
    return res.status(403).json({
      error: 'Insufficient tier',
      required: document.tier,
      current: userTier,
      message: 'Upgrade to access this document'
    });
  }

  // Increment view count
  document.views += 1;

  res.json(document);
});

// Get documents by category
pdpRouter.get('/category/:category', authenticateToken, (req, res) => {
  const { category } = req.params;
  const userTier = req.user.tier || 'free';
  
  const userTierLevel = TIER_HIERARCHY[userTier] || 0;

  const categoryDocs = pdpDocuments.filter(doc => {
    const matchesCategory = doc.category === category;
    const docTierLevel = TIER_HIERARCHY[doc.tier] || 0;
    const hasAccess = userTierLevel >= docTierLevel;
    return matchesCategory && hasAccess;
  });

  res.json({
    category,
    count: categoryDocs.length,
    documents: categoryDocs
  });
});

// Search PDP documents
pdpRouter.get('/search', authenticateToken, (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Search query required' });
  }

  const query = q.toLowerCase();
  const results = pdpDocuments.filter(doc =>
    doc.title.toLowerCase().includes(query) ||
    doc.summary.toLowerCase().includes(query) ||
    doc.tags.some(tag => tag.toLowerCase().includes(query)) ||
    doc.content.toLowerCase().includes(query)
  );

  res.json({
    query: q,
    results: results.length,
    documents: results
  });
});

// Attest to a document (verify/support)
pdpRouter.post('/documents/:id/attest', authenticateToken, (req, res) => {
  const { id } = req.params;
  const document = pdpDocuments.find(doc => doc.id === id);

  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  document.attestations += 1;

  res.json({
    message: 'Attestation recorded',
    documentId: id,
    attestations: document.attestations
  });
});

// Get latest documents
pdpRouter.get('/latest', authenticateToken, (req, res) => {
  const { limit = 5 } = req.query;
  const userTier = req.user.tier || 'free';
  
  const userTierLevel = TIER_HIERARCHY[userTier] || 0;

  const accessibleDocs = pdpDocuments.filter(doc => {
    const docTierLevel = TIER_HIERARCHY[doc.tier] || 0;
    return userTierLevel >= docTierLevel;
  });

  const latest = accessibleDocs
    .sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate))
    .slice(0, parseInt(limit));

  res.json({
    message: 'Latest PDP documents',
    documents: latest
  });
});

// Get trending documents
pdpRouter.get('/trending', authenticateToken, (req, res) => {
  const { limit = 5 } = req.query;
  const userTier = req.user.tier || 'free';
  
  const userTierLevel = TIER_HIERARCHY[userTier] || 0;

  const accessibleDocs = pdpDocuments.filter(doc => {
    const docTierLevel = TIER_HIERARCHY[doc.tier] || 0;
    return userTierLevel >= docTierLevel;
  });

  // Sort by combination of views and attestations
  const trending = accessibleDocs
    .sort((a, b) => (b.views + b.attestations * 10) - (a.views + a.attestations * 10))
    .slice(0, parseInt(limit));

  res.json({
    message: 'Trending PDP documents',
    documents: trending
  });
});

// Get all categories
pdpRouter.get('/categories', (req, res) => {
  const categories = [...new Set(pdpDocuments.map(doc => doc.category))];
  
  const categoryInfo = categories.map(cat => ({
    name: cat,
    count: pdpDocuments.filter(doc => doc.category === cat).length
  }));

  res.json({
    totalCategories: categories.length,
    categories: categoryInfo
  });
});

// Get PDP statistics
pdpRouter.get('/stats', (req, res) => {
  const totalViews = pdpDocuments.reduce((sum, doc) => sum + doc.views, 0);
  const totalAttestations = pdpDocuments.reduce((sum, doc) => sum + doc.attestations, 0);

  const categoryStats = {};
  pdpDocuments.forEach(doc => {
    if (!categoryStats[doc.category]) {
      categoryStats[doc.category] = {
        documents: 0,
        views: 0,
        attestations: 0
      };
    }
    categoryStats[doc.category].documents += 1;
    categoryStats[doc.category].views += doc.views;
    categoryStats[doc.category].attestations += doc.attestations;
  });

  res.json({
    protocol: 'Prophecy Documentation Protocol',
    totalDocuments: pdpDocuments.length,
    totalViews,
    totalAttestations,
    categoryStats,
    author: 'Chais Hill - First Remembrancer'
  });
});

// Sync PDP data (admin function)
pdpRouter.post('/sync', authenticateToken, (req, res) => {
  // In production, this would sync with external PDP data sources
  res.json({
    message: 'PDP data synchronized successfully',
    timestamp: new Date().toISOString(),
    documentsUpdated: pdpDocuments.length
  });
});

export { pdpRouter };
