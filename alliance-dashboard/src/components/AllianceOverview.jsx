/**
 * Alliance Dashboard - Main Component
 * 
 * Provides comprehensive overview and management interface for real-world alliances
 * 
 * Features:
 * - Alliance list and status monitoring
 * - Partner management
 * - Asset tracking and valuation
 * - Governance proposal viewing
 * - Real-time metrics and analytics
 * 
 * OmniTech1™ - Real-World Alliance Dashboard
 */

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import AllianceMetrics from './AllianceMetrics';
import AssetRegistry from './AssetRegistry';
import PartnerManagement from './PartnerManagement';
import GovernancePanel from './GovernancePanel';

const AllianceOverview = () => {
  // State management
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState('');
  const [contracts, setContracts] = useState({
    registry: null,
    governance: null,
    assetBridge: null,
  });
  const [alliances, setAlliances] = useState([]);
  const [selectedAlliance, setSelectedAlliance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Contract ABIs (simplified - import from actual ABI files in production)
  const ALLIANCE_REGISTRY_ABI = [
    "function getAlliance(uint256 allianceId) external view returns (tuple(uint256 id, string name, string description, address creator, address[] partners, uint8 status, uint256 createdAt, uint256 updatedAt, string metadataURI, bytes32 governanceHash))",
    "function getTotalAlliances() external view returns (uint256)",
    "function getAlliancesByCreator(address creator) external view returns (uint256[])",
    "function getAlliancesByPartner(address partner) external view returns (uint256[])",
    "function createAlliance(string name, string description, string metadataURI, bytes32 governanceHash) external returns (uint256)",
    "event AllianceCreated(uint256 indexed allianceId, string name, address indexed creator, uint256 timestamp)"
  ];

  // Connect to wallet
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }

      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await web3Provider.send('eth_requestAccounts', []);
      const web3Signer = await web3Provider.getSigner();

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(accounts[0]);

      // Initialize contracts (addresses should come from config)
      const registryAddress = process.env.REACT_APP_ALLIANCE_REGISTRY_ADDRESS;
      const registry = new ethers.Contract(registryAddress, ALLIANCE_REGISTRY_ABI, web3Signer);

      setContracts({ ...contracts, registry });
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Wallet connection error:', err);
    }
  };

  // Load alliances
  const loadAlliances = async () => {
    if (!contracts.registry || !account) return;

    try {
      setLoading(true);
      
      // Get alliances where user is creator or partner
      const creatorAlliances = await contracts.registry.getAlliancesByCreator(account);
      const partnerAlliances = await contracts.registry.getAlliancesByPartner(account);
      
      // Combine and deduplicate
      const allianceIds = [...new Set([...creatorAlliances, ...partnerAlliances])];
      
      // Fetch alliance details
      const allianceData = await Promise.all(
        allianceIds.map(async (id) => {
          const alliance = await contracts.registry.getAlliance(id);
          return {
            id: alliance.id.toString(),
            name: alliance.name,
            description: alliance.description,
            creator: alliance.creator,
            partners: alliance.partners,
            status: ['Pending', 'Active', 'Suspended', 'Dissolved'][alliance.status],
            createdAt: new Date(Number(alliance.createdAt) * 1000),
            updatedAt: new Date(Number(alliance.updatedAt) * 1000),
            metadataURI: alliance.metadataURI,
            isCreator: alliance.creator.toLowerCase() === account.toLowerCase(),
          };
        })
      );

      setAlliances(allianceData);
      if (allianceData.length > 0 && !selectedAlliance) {
        setSelectedAlliance(allianceData[0]);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      console.error('Error loading alliances:', err);
    }
  };

  // Effects
  useEffect(() => {
    if (contracts.registry && account) {
      loadAlliances();
    }
  }, [contracts.registry, account]);

  // Handle wallet disconnection
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          setAccount('');
          setSigner(null);
        } else {
          setAccount(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  // Render connection button
  if (!account) {
    return (
      <div className="alliance-dashboard">
        <div className="connection-container">
          <h1>🤝 Real-World Alliance Dashboard</h1>
          <p>Connect your wallet to manage alliances and partnerships</p>
          <button onClick={connectWallet} className="connect-button">
            Connect Wallet
          </button>
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    );
  }

  // Render loading state
  if (loading) {
    return (
      <div className="alliance-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading alliance data...</p>
        </div>
      </div>
    );
  }

  // Main dashboard render
  return (
    <div className="alliance-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🤝 Alliance Dashboard</h1>
          <div className="account-info">
            <span className="account-label">Connected:</span>
            <span className="account-address">
              {account.substring(0, 6)}...{account.substring(38)}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Sidebar - Alliance List */}
        <aside className="alliance-sidebar">
          <div className="sidebar-header">
            <h2>Your Alliances</h2>
            <button className="create-alliance-btn" title="Create New Alliance">
              + New
            </button>
          </div>
          <div className="alliance-list">
            {alliances.length === 0 ? (
              <div className="no-alliances">
                <p>No alliances found</p>
                <p className="hint">Create your first alliance to get started</p>
              </div>
            ) : (
              alliances.map((alliance) => (
                <div
                  key={alliance.id}
                  className={`alliance-item ${
                    selectedAlliance?.id === alliance.id ? 'active' : ''
                  }`}
                  onClick={() => setSelectedAlliance(alliance)}
                >
                  <div className="alliance-item-header">
                    <h3>{alliance.name}</h3>
                    <span className={`status-badge status-${alliance.status.toLowerCase()}`}>
                      {alliance.status}
                    </span>
                  </div>
                  <p className="alliance-item-desc">{alliance.description}</p>
                  <div className="alliance-item-meta">
                    <span>{alliance.partners.length} Partners</span>
                    {alliance.isCreator && <span className="creator-badge">Creator</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Main Panel */}
        <main className="main-panel">
          {selectedAlliance ? (
            <>
              {/* Tab Navigation */}
              <nav className="tab-navigation">
                <button
                  className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button
                  className={`tab ${activeTab === 'assets' ? 'active' : ''}`}
                  onClick={() => setActiveTab('assets')}
                >
                  Assets
                </button>
                <button
                  className={`tab ${activeTab === 'partners' ? 'active' : ''}`}
                  onClick={() => setActiveTab('partners')}
                >
                  Partners
                </button>
                <button
                  className={`tab ${activeTab === 'governance' ? 'active' : ''}`}
                  onClick={() => setActiveTab('governance')}
                >
                  Governance
                </button>
              </nav>

              {/* Tab Content */}
              <div className="tab-content">
                {activeTab === 'overview' && (
                  <AllianceMetrics
                    alliance={selectedAlliance}
                    contracts={contracts}
                  />
                )}
                {activeTab === 'assets' && (
                  <AssetRegistry
                    allianceId={selectedAlliance.id}
                    contracts={contracts}
                  />
                )}
                {activeTab === 'partners' && (
                  <PartnerManagement
                    allianceId={selectedAlliance.id}
                    alliance={selectedAlliance}
                    contracts={contracts}
                  />
                )}
                {activeTab === 'governance' && (
                  <GovernancePanel
                    allianceId={selectedAlliance.id}
                    contracts={contracts}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="no-selection">
              <h2>Select an alliance to view details</h2>
              <p>Choose an alliance from the sidebar or create a new one</p>
            </div>
          )}
        </main>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
          <button onClick={() => setError(null)} className="error-close">
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default AllianceOverview;
