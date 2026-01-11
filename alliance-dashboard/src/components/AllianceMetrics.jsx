/**
 * Alliance Metrics Component
 * 
 * Displays key performance indicators and metrics for an alliance
 * 
 * Features:
 * - Total asset valuation
 * - Partner count and status
 * - Activity timeline
 * - Governance participation
 * - Health indicators
 * 
 * OmniTech1™ - Alliance Metrics Dashboard
 */

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const AllianceMetrics = ({ alliance, contracts }) => {
  const [metrics, setMetrics] = useState({
    totalAssets: 0,
    totalValuation: '0',
    verifiedAssets: 0,
    activePartners: 0,
    pendingProposals: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  // Load metrics data
  useEffect(() => {
    const loadMetrics = async () => {
      if (!alliance || !contracts.assetBridge) return;

      try {
        setLoading(true);

        // Load asset data from AssetBridge
        // Note: In production, implement proper contract methods
        const mockMetrics = {
          totalAssets: 5,
          totalValuation: '8500000', // $8.5M in USD (scaled by 1e6)
          verifiedAssets: 4,
          activePartners: alliance.partners.length,
          pendingProposals: 0,
          recentActivity: [
            {
              type: 'asset_added',
              description: 'Real Estate Asset tokenized',
              timestamp: new Date(Date.now() - 86400000),
            },
            {
              type: 'partner_verified',
              description: 'New partner verified',
              timestamp: new Date(Date.now() - 172800000),
            },
            {
              type: 'alliance_created',
              description: 'Alliance created',
              timestamp: alliance.createdAt,
            },
          ],
        };

        setMetrics(mockMetrics);
        setLoading(false);
      } catch (error) {
        console.error('Error loading metrics:', error);
        setLoading(false);
      }
    };

    loadMetrics();
  }, [alliance, contracts]);

  // Format currency
  const formatCurrency = (value) => {
    const num = parseFloat(value) / 1e6; // Convert from scaled value
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Format date
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Calculate health score (0-100)
  const calculateHealthScore = () => {
    const assetVerificationRate = metrics.totalAssets > 0
      ? (metrics.verifiedAssets / metrics.totalAssets) * 40
      : 0;
    const partnerActivity = Math.min(metrics.activePartners * 10, 30);
    const governanceParticipation = 30; // Mock value
    
    return Math.round(assetVerificationRate + partnerActivity + governanceParticipation);
  };

  const healthScore = calculateHealthScore();

  if (loading) {
    return (
      <div className="alliance-metrics loading">
        <div className="spinner"></div>
        <p>Loading metrics...</p>
      </div>
    );
  }

  return (
    <div className="alliance-metrics">
      {/* Alliance Header */}
      <section className="metrics-header">
        <div className="alliance-title-section">
          <h2>{alliance.name}</h2>
          <p className="alliance-description">{alliance.description}</p>
        </div>
        <div className="alliance-status-section">
          <div className={`status-indicator status-${alliance.status.toLowerCase()}`}>
            <span className="status-dot"></span>
            <span className="status-text">{alliance.status}</span>
          </div>
          <div className="created-date">
            Created: {formatDate(alliance.createdAt)}
          </div>
        </div>
      </section>

      {/* Key Metrics Grid */}
      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <h3>Total Valuation</h3>
            <p className="metric-value">{formatCurrency(metrics.totalValuation)}</p>
            <p className="metric-subtitle">Verified assets only</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🏛️</div>
          <div className="metric-content">
            <h3>Total Assets</h3>
            <p className="metric-value">{metrics.totalAssets}</p>
            <p className="metric-subtitle">
              {metrics.verifiedAssets} verified ({Math.round((metrics.verifiedAssets / metrics.totalAssets) * 100)}%)
            </p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <h3>Partners</h3>
            <p className="metric-value">{metrics.activePartners}</p>
            <p className="metric-subtitle">Active participants</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <h3>Health Score</h3>
            <p className="metric-value">{healthScore}/100</p>
            <div className="health-bar">
              <div
                className="health-bar-fill"
                style={{ width: `${healthScore}%` }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Information */}
      <div className="metrics-details">
        {/* Alliance Info */}
        <section className="info-panel">
          <h3>Alliance Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Alliance ID:</span>
              <span className="info-value">#{alliance.id}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Creator:</span>
              <span className="info-value monospace">
                {alliance.creator.substring(0, 10)}...{alliance.creator.substring(32)}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Last Updated:</span>
              <span className="info-value">{formatDate(alliance.updatedAt)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Metadata:</span>
              <a
                href={`https://ipfs.io/ipfs/${alliance.metadataURI.replace('ipfs://', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="info-link"
              >
                View on IPFS →
              </a>
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="activity-panel">
          <h3>Recent Activity</h3>
          <div className="activity-timeline">
            {metrics.recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className={`activity-icon activity-${activity.type}`}>
                  {activity.type === 'asset_added' && '🏛️'}
                  {activity.type === 'partner_verified' && '✅'}
                  {activity.type === 'alliance_created' && '🤝'}
                </div>
                <div className="activity-content">
                  <p className="activity-description">{activity.description}</p>
                  <p className="activity-time">{formatDate(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Asset Breakdown */}
      <section className="asset-breakdown">
        <h3>Asset Distribution</h3>
        <div className="asset-types">
          <div className="asset-type">
            <div className="asset-type-header">
              <span className="asset-type-icon">🏠</span>
              <span className="asset-type-name">Real Estate</span>
            </div>
            <div className="asset-type-value">$5.0M</div>
            <div className="asset-type-bar">
              <div className="asset-type-fill" style={{ width: '59%' }}></div>
            </div>
          </div>
          <div className="asset-type">
            <div className="asset-type-header">
              <span className="asset-type-icon">🥇</span>
              <span className="asset-type-name">Commodities</span>
            </div>
            <div className="asset-type-value">$2.5M</div>
            <div className="asset-type-bar">
              <div className="asset-type-fill" style={{ width: '29%' }}></div>
            </div>
          </div>
          <div className="asset-type">
            <div className="asset-type-header">
              <span className="asset-type-icon">📈</span>
              <span className="asset-type-name">Equity</span>
            </div>
            <div className="asset-type-value">$1.0M</div>
            <div className="asset-type-bar">
              <div className="asset-type-fill" style={{ width: '12%' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="metrics-actions">
        <button className="action-button primary">View Full Report</button>
        <button className="action-button secondary">Export Data</button>
        {alliance.isCreator && (
          <button className="action-button secondary">Alliance Settings</button>
        )}
      </section>
    </div>
  );
};

export default AllianceMetrics;
