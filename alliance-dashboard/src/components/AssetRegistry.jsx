/**
 * Asset Registry Component
 * 
 * Manages and displays tokenized real-world assets within an alliance
 * 
 * Features:
 * - Asset listing with verification status
 * - Asset details and documentation
 * - Valuation tracking
 * - Custody information
 * - Add new assets (admin only)
 * 
 * OmniTech1™ - Asset Registry Interface
 */

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const AssetRegistry = ({ allianceId, contracts }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [filter, setFilter] = useState('all'); // all, verified, pending

  // Asset type mapping
  const assetTypes = {
    0: 'Real Estate',
    1: 'Commodity',
    2: 'Equity',
    3: 'Intellectual Property',
    4: 'Infrastructure',
    5: 'Other',
  };

  const verificationStatus = {
    0: 'Pending',
    1: 'Verified',
    2: 'Disputed',
    3: 'Revoked',
  };

  // Load assets
  useEffect(() => {
    const loadAssets = async () => {
      if (!contracts.assetBridge || !allianceId) return;

      try {
        setLoading(true);

        // Mock data - replace with actual contract calls
        const mockAssets = [
          {
            assetId: '1',
            allianceId: allianceId,
            assetType: 0,
            assetTypeName: 'Real Estate',
            tokenContract: '0x3456789012345678901234567890123456789012',
            tokenId: '0',
            realWorldIdentifier: 'DEED-NYC-2024-001',
            legalDocumentHash: '0xabc123...',
            custodian: '0x1111111111111111111111111111111111111111',
            status: 1,
            statusName: 'Verified',
            valuationUSD: '5000000000000',
            registeredAt: new Date(Date.now() - 2592000000),
            lastVerifiedAt: new Date(Date.now() - 86400000),
            metadataURI: 'ipfs://QmRealEstateAsset001',
          },
          {
            assetId: '2',
            allianceId: allianceId,
            assetType: 1,
            assetTypeName: 'Commodity',
            tokenContract: '0x4567890123456789012345678901234567890123',
            tokenId: '0',
            realWorldIdentifier: 'COMMODITY-GOLD-2024-001',
            legalDocumentHash: '0xdef456...',
            custodian: '0x2222222222222222222222222222222222222222',
            status: 1,
            statusName: 'Verified',
            valuationUSD: '2500000000000',
            registeredAt: new Date(Date.now() - 1728000000),
            lastVerifiedAt: new Date(Date.now() - 43200000),
            metadataURI: 'ipfs://QmCommodityAsset001',
          },
          {
            assetId: '3',
            allianceId: allianceId,
            assetType: 2,
            assetTypeName: 'Equity',
            tokenContract: '0x5678901234567890123456789012345678901234',
            tokenId: '0',
            realWorldIdentifier: 'EQUITY-STARTUP-2024-001',
            legalDocumentHash: '0xghi789...',
            custodian: '0x3333333333333333333333333333333333333333',
            status: 0,
            statusName: 'Pending',
            valuationUSD: '1000000000000',
            registeredAt: new Date(Date.now() - 86400000),
            lastVerifiedAt: null,
            metadataURI: 'ipfs://QmEquityAsset001',
          },
        ];

        setAssets(mockAssets);
        setLoading(false);
      } catch (error) {
        console.error('Error loading assets:', error);
        setLoading(false);
      }
    };

    loadAssets();
  }, [allianceId, contracts]);

  // Filter assets
  const filteredAssets = assets.filter((asset) => {
    if (filter === 'all') return true;
    if (filter === 'verified') return asset.status === 1;
    if (filter === 'pending') return asset.status === 0;
    return true;
  });

  // Format currency
  const formatCurrency = (value) => {
    const num = parseFloat(value) / 1e6;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  // Calculate total valuation
  const totalValuation = filteredAssets
    .filter((a) => a.status === 1)
    .reduce((sum, asset) => sum + parseFloat(asset.valuationUSD), 0);

  if (loading) {
    return (
      <div className="asset-registry loading">
        <div className="spinner"></div>
        <p>Loading assets...</p>
      </div>
    );
  }

  return (
    <div className="asset-registry">
      {/* Header */}
      <header className="registry-header">
        <div className="header-left">
          <h2>Asset Registry</h2>
          <p className="registry-subtitle">
            {filteredAssets.length} assets • {formatCurrency(totalValuation.toString())} verified
          </p>
        </div>
        <div className="header-right">
          <button className="add-asset-button" onClick={() => setShowAddAsset(true)}>
            + Add Asset
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="registry-filters">
        <button
          className={`filter-button ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Assets ({assets.length})
        </button>
        <button
          className={`filter-button ${filter === 'verified' ? 'active' : ''}`}
          onClick={() => setFilter('verified')}
        >
          Verified ({assets.filter((a) => a.status === 1).length})
        </button>
        <button
          className={`filter-button ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({assets.filter((a) => a.status === 0).length})
        </button>
      </div>

      {/* Asset List */}
      <div className="asset-list">
        {filteredAssets.length === 0 ? (
          <div className="no-assets">
            <p>No assets found</p>
            <button onClick={() => setShowAddAsset(true)}>Add your first asset</button>
          </div>
        ) : (
          filteredAssets.map((asset) => (
            <div
              key={asset.assetId}
              className="asset-card"
              onClick={() => setSelectedAsset(asset)}
            >
              <div className="asset-card-header">
                <div className="asset-type-badge">{asset.assetTypeName}</div>
                <div className={`verification-badge status-${asset.statusName.toLowerCase()}`}>
                  {asset.statusName}
                </div>
              </div>
              <div className="asset-card-body">
                <h3 className="asset-identifier">{asset.realWorldIdentifier}</h3>
                <div className="asset-valuation">{formatCurrency(asset.valuationUSD)}</div>
                <div className="asset-meta">
                  <span>Registered: {formatDate(asset.registeredAt)}</span>
                  <span>•</span>
                  <span>Verified: {formatDate(asset.lastVerifiedAt)}</span>
                </div>
              </div>
              <div className="asset-card-footer">
                <span className="custodian-info">
                  Custodian: {asset.custodian.substring(0, 10)}...
                </span>
                <span className="asset-id">ID: #{asset.assetId}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Asset Details Modal */}
      {selectedAsset && (
        <div className="modal-overlay" onClick={() => setSelectedAsset(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Asset Details</h2>
              <button className="modal-close" onClick={() => setSelectedAsset(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Asset ID:</span>
                  <span className="detail-value">#{selectedAsset.assetId}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">{selectedAsset.assetTypeName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Real-World ID:</span>
                  <span className="detail-value">{selectedAsset.realWorldIdentifier}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Valuation:</span>
                  <span className="detail-value">{formatCurrency(selectedAsset.valuationUSD)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className={`detail-value status-${selectedAsset.statusName.toLowerCase()}`}>
                    {selectedAsset.statusName}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Token Contract:</span>
                  <span className="detail-value monospace">{selectedAsset.tokenContract}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Custodian:</span>
                  <span className="detail-value monospace">{selectedAsset.custodian}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Registered:</span>
                  <span className="detail-value">{formatDate(selectedAsset.registeredAt)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Last Verified:</span>
                  <span className="detail-value">{formatDate(selectedAsset.lastVerifiedAt)}</span>
                </div>
                <div className="detail-item full-width">
                  <span className="detail-label">Legal Document Hash:</span>
                  <span className="detail-value monospace">{selectedAsset.legalDocumentHash}</span>
                </div>
                <div className="detail-item full-width">
                  <span className="detail-label">Metadata:</span>
                  <a
                    href={`https://ipfs.io/ipfs/${selectedAsset.metadataURI.replace('ipfs://', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="detail-link"
                  >
                    View on IPFS →
                  </a>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="button-secondary">View Verification History</button>
              <button className="button-secondary">Update Valuation</button>
              <button className="button-primary">Verify Asset</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Asset Modal */}
      {showAddAsset && (
        <div className="modal-overlay" onClick={() => setShowAddAsset(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Asset</h2>
              <button className="modal-close" onClick={() => setShowAddAsset(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p className="add-asset-info">
                Connect your real-world asset to the blockchain. Ensure all documentation is ready.
              </p>
              <form className="add-asset-form">
                <div className="form-group">
                  <label>Asset Type</label>
                  <select className="form-control">
                    <option>Real Estate</option>
                    <option>Commodity</option>
                    <option>Equity</option>
                    <option>Intellectual Property</option>
                    <option>Infrastructure</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Real-World Identifier</label>
                  <input type="text" className="form-control" placeholder="e.g., DEED-2024-001" />
                </div>
                <div className="form-group">
                  <label>Token Contract Address</label>
                  <input type="text" className="form-control" placeholder="0x..." />
                </div>
                <div className="form-group">
                  <label>Custodian Address</label>
                  <input type="text" className="form-control" placeholder="0x..." />
                </div>
                <div className="form-group">
                  <label>Valuation (USD)</label>
                  <input type="number" className="form-control" placeholder="1000000" />
                </div>
                <div className="form-group">
                  <label>Legal Document (IPFS Hash)</label>
                  <input type="text" className="form-control" placeholder="Qm..." />
                </div>
                <div className="form-group">
                  <label>Metadata URI</label>
                  <input type="text" className="form-control" placeholder="ipfs://..." />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="button-secondary" onClick={() => setShowAddAsset(false)}>
                Cancel
              </button>
              <button className="button-primary">Tokenize Asset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetRegistry;
