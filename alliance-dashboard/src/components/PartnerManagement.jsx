/**
 * Partner Management Component
 * 
 * Manages partners within an alliance
 * 
 * Features:
 * - Partner list with verification status
 * - Add new partners
 * - Verify partners (admin only)
 * - Partner details and KYC status
 * 
 * OmniTech1™ - Partner Management Interface
 */

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const PartnerManagement = ({ allianceId, alliance, contracts }) => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddPartner, setShowAddPartner] = useState(false);

  // Load partners
  useEffect(() => {
    const loadPartners = async () => {
      if (!contracts.registry || !allianceId) return;

      try {
        setLoading(true);

        // Mock partner data - replace with actual contract calls
        const mockPartners = [
          {
            address: '0x1234567890123456789012345678901234567890',
            name: 'Real Estate Partner LLC',
            organizationType: 'Real Estate Development',
            verified: true,
            joinedAt: new Date(Date.now() - 2592000000),
            kycHash: ethers.keccak256(ethers.toUtf8Bytes('KYC_DOC_001')),
          },
          {
            address: '0x2345678901234567890123456789012345678901',
            name: 'Asset Management Corp',
            organizationType: 'Asset Management',
            verified: true,
            joinedAt: new Date(Date.now() - 1728000000),
            kycHash: ethers.keccak256(ethers.toUtf8Bytes('KYC_DOC_002')),
          },
          {
            address: '0x3456789012345678901234567890123456789012',
            name: 'Tech Innovation Partners',
            organizationType: 'Technology Provider',
            verified: false,
            joinedAt: new Date(Date.now() - 86400000),
            kycHash: ethers.keccak256(ethers.toUtf8Bytes('KYC_DOC_003')),
          },
        ];

        setPartners(mockPartners);
        setLoading(false);
      } catch (error) {
        console.error('Error loading partners:', error);
        setLoading(false);
      }
    };

    loadPartners();
  }, [allianceId, contracts]);

  // Format date
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="partner-management loading">
        <div className="spinner"></div>
        <p>Loading partners...</p>
      </div>
    );
  }

  return (
    <div className="partner-management">
      {/* Header */}
      <header className="partners-header">
        <div className="header-left">
          <h2>Alliance Partners</h2>
          <p className="partners-subtitle">
            {partners.length} total • {partners.filter((p) => p.verified).length} verified
          </p>
        </div>
        <div className="header-right">
          {alliance.isCreator && (
            <button className="add-partner-button" onClick={() => setShowAddPartner(true)}>
              + Add Partner
            </button>
          )}
        </div>
      </header>

      {/* Partner Stats */}
      <div className="partner-stats">
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{partners.filter((p) => p.verified).length}</h3>
            <p>Verified Partners</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{partners.filter((p) => !p.verified).length}</h3>
            <p>Pending Verification</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{partners.length > 0 ? formatDate(partners[partners.length - 1].joinedAt) : 'N/A'}</h3>
            <p>Latest Addition</p>
          </div>
        </div>
      </div>

      {/* Partner List */}
      <div className="partner-list">
        {partners.length === 0 ? (
          <div className="no-partners">
            <p>No partners yet</p>
            <button onClick={() => setShowAddPartner(true)}>Add your first partner</button>
          </div>
        ) : (
          partners.map((partner, index) => (
            <div key={index} className="partner-card">
              <div className="partner-card-header">
                <div className="partner-avatar">
                  {partner.name.charAt(0).toUpperCase()}
                </div>
                <div className="partner-info">
                  <h3 className="partner-name">{partner.name}</h3>
                  <p className="partner-type">{partner.organizationType}</p>
                </div>
                <div className={`verification-badge ${partner.verified ? 'verified' : 'pending'}`}>
                  {partner.verified ? '✓ Verified' : '⏳ Pending'}
                </div>
              </div>
              <div className="partner-card-body">
                <div className="partner-detail">
                  <span className="detail-label">Address:</span>
                  <span className="detail-value monospace">
                    {partner.address.substring(0, 10)}...{partner.address.substring(32)}
                  </span>
                </div>
                <div className="partner-detail">
                  <span className="detail-label">Joined:</span>
                  <span className="detail-value">{formatDate(partner.joinedAt)}</span>
                </div>
                <div className="partner-detail">
                  <span className="detail-label">KYC Hash:</span>
                  <span className="detail-value monospace">
                    {partner.kycHash.substring(0, 10)}...
                  </span>
                </div>
              </div>
              <div className="partner-card-footer">
                {!partner.verified && alliance.isCreator && (
                  <button className="verify-button">Verify Partner</button>
                )}
                <button className="details-button">View Details</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Partner Modal */}
      {showAddPartner && (
        <div className="modal-overlay" onClick={() => setShowAddPartner(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Partner</h2>
              <button className="modal-close" onClick={() => setShowAddPartner(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p className="add-partner-info">
                Add a new partner to the alliance. All partners must complete KYC verification.
              </p>
              <form className="add-partner-form">
                <div className="form-group">
                  <label>Partner Wallet Address *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="0x..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Partner Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Organization or Individual Name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Organization Type *</label>
                  <select className="form-control" required>
                    <option value="">Select Type</option>
                    <option>Real Estate Development</option>
                    <option>Asset Management</option>
                    <option>Technology Provider</option>
                    <option>Financial Services</option>
                    <option>Legal Services</option>
                    <option>Individual Investor</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>KYC Document Hash *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Hash of KYC verification documents"
                    required
                  />
                  <small className="form-hint">
                    Upload KYC documents to IPFS and enter the hash here
                  </small>
                </div>
                <div className="form-group checkbox">
                  <input type="checkbox" id="kyc-verified" />
                  <label htmlFor="kyc-verified">
                    I confirm that KYC verification has been completed
                  </label>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="button-secondary" onClick={() => setShowAddPartner(false)}>
                Cancel
              </button>
              <button className="button-primary">Add Partner</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerManagement;
