/**
 * Governance Panel Component
 * 
 * Manages governance proposals and voting for the alliance
 * 
 * Features:
 * - View active proposals
 * - Create new proposals (authorized users)
 * - Vote on proposals
 * - View proposal history
 * - Execution tracking
 * 
 * OmniTech1™ - Alliance Governance Interface
 */

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const GovernancePanel = ({ allianceId, contracts }) => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showCreateProposal, setShowCreateProposal] = useState(false);
  const [filter, setFilter] = useState('active'); // active, executed, defeated

  // Load proposals
  useEffect(() => {
    const loadProposals = async () => {
      if (!contracts.governance || !allianceId) return;

      try {
        setLoading(true);

        // Mock proposal data - replace with actual contract calls
        const mockProposals = [
          {
            proposalId: '1',
            allianceId: allianceId,
            title: 'Add New Real Estate Asset',
            description: 'Proposal to tokenize 123 Main St property',
            category: 'AssetBridge',
            proposer: '0x1234567890123456789012345678901234567890',
            status: 'Active',
            votesFor: '1500000',
            votesAgainst: '300000',
            votesAbstain: '100000',
            quorum: '1000000',
            createdAt: new Date(Date.now() - 259200000),
            votingEnds: new Date(Date.now() + 345600000),
            ipfsHash: 'QmProposal001',
          },
          {
            proposalId: '2',
            allianceId: allianceId,
            title: 'Verify New Partner: Tech Corp',
            description: 'Proposal to verify Tech Corporation as alliance partner',
            category: 'PartnerAddition',
            proposer: '0x2345678901234567890123456789012345678901',
            status: 'Executed',
            votesFor: '2000000',
            votesAgainst: '100000',
            votesAbstain: '50000',
            quorum: '1000000',
            createdAt: new Date(Date.now() - 864000000),
            votingEnds: new Date(Date.now() - 259200000),
            ipfsHash: 'QmProposal002',
          },
        ];

        setProposals(mockProposals);
        setLoading(false);
      } catch (error) {
        console.error('Error loading proposals:', error);
        setLoading(false);
      }
    };

    loadProposals();
  }, [allianceId, contracts]);

  // Filter proposals
  const filteredProposals = proposals.filter((proposal) => {
    if (filter === 'active') return proposal.status === 'Active';
    if (filter === 'executed') return proposal.status === 'Executed';
    if (filter === 'defeated') return proposal.status === 'Defeated';
    return true;
  });

  // Format numbers
  const formatVotes = (votes) => {
    return (parseFloat(votes) / 1e18).toLocaleString(undefined, {
      maximumFractionDigits: 0,
    });
  };

  // Calculate vote percentage
  const calculatePercentage = (votes, total) => {
    const v = parseFloat(votes);
    const t = parseFloat(total);
    return t > 0 ? ((v / t) * 100).toFixed(1) : 0;
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

  // Time remaining
  const getTimeRemaining = (endDate) => {
    const now = new Date();
    const diff = endDate - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  if (loading) {
    return (
      <div className="governance-panel loading">
        <div className="spinner"></div>
        <p>Loading proposals...</p>
      </div>
    );
  }

  return (
    <div className="governance-panel">
      {/* Header */}
      <header className="governance-header">
        <div className="header-left">
          <h2>Governance</h2>
          <p className="governance-subtitle">
            {filteredProposals.length} {filter} proposals
          </p>
        </div>
        <div className="header-right">
          <button className="create-proposal-button" onClick={() => setShowCreateProposal(true)}>
            + Create Proposal
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="governance-filters">
        <button
          className={`filter-button ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active ({proposals.filter((p) => p.status === 'Active').length})
        </button>
        <button
          className={`filter-button ${filter === 'executed' ? 'active' : ''}`}
          onClick={() => setFilter('executed')}
        >
          Executed ({proposals.filter((p) => p.status === 'Executed').length})
        </button>
        <button
          className={`filter-button ${filter === 'defeated' ? 'active' : ''}`}
          onClick={() => setFilter('defeated')}
        >
          Defeated ({proposals.filter((p) => p.status === 'Defeated').length})
        </button>
      </div>

      {/* Proposal List */}
      <div className="proposal-list">
        {filteredProposals.length === 0 ? (
          <div className="no-proposals">
            <p>No {filter} proposals</p>
            <button onClick={() => setShowCreateProposal(true)}>Create a proposal</button>
          </div>
        ) : (
          filteredProposals.map((proposal) => {
            const totalVotes =
              parseFloat(proposal.votesFor) +
              parseFloat(proposal.votesAgainst) +
              parseFloat(proposal.votesAbstain);

            return (
              <div
                key={proposal.proposalId}
                className="proposal-card"
                onClick={() => setSelectedProposal(proposal)}
              >
                <div className="proposal-card-header">
                  <div className="proposal-title-section">
                    <h3>{proposal.title}</h3>
                    <span className="proposal-category">{proposal.category}</span>
                  </div>
                  <div className={`proposal-status status-${proposal.status.toLowerCase()}`}>
                    {proposal.status}
                  </div>
                </div>

                <p className="proposal-description">{proposal.description}</p>

                {/* Voting Progress */}
                <div className="voting-progress">
                  <div className="votes-summary">
                    <div className="vote-stat">
                      <span className="vote-label">For</span>
                      <span className="vote-value for">{formatVotes(proposal.votesFor)}</span>
                    </div>
                    <div className="vote-stat">
                      <span className="vote-label">Against</span>
                      <span className="vote-value against">{formatVotes(proposal.votesAgainst)}</span>
                    </div>
                    <div className="vote-stat">
                      <span className="vote-label">Abstain</span>
                      <span className="vote-value abstain">{formatVotes(proposal.votesAbstain)}</span>
                    </div>
                  </div>

                  <div className="vote-bars">
                    <div className="vote-bar">
                      <div
                        className="vote-bar-fill for"
                        style={{ width: `${calculatePercentage(proposal.votesFor, totalVotes)}%` }}
                      ></div>
                    </div>
                    <div className="vote-percentages">
                      <span className="for">
                        {calculatePercentage(proposal.votesFor, totalVotes)}%
                      </span>
                      <span className="against">
                        {calculatePercentage(proposal.votesAgainst, totalVotes)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Proposal Meta */}
                <div className="proposal-meta">
                  <span>
                    Proposed by: {proposal.proposer.substring(0, 10)}...
                  </span>
                  <span>•</span>
                  <span>{formatDate(proposal.createdAt)}</span>
                  {proposal.status === 'Active' && (
                    <>
                      <span>•</span>
                      <span className="time-remaining">{getTimeRemaining(proposal.votingEnds)}</span>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Proposal Details Modal */}
      {selectedProposal && (
        <div className="modal-overlay" onClick={() => setSelectedProposal(null)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedProposal.title}</h2>
              <button className="modal-close" onClick={() => setSelectedProposal(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="proposal-details">
                <div className="detail-section">
                  <h3>Description</h3>
                  <p>{selectedProposal.description}</p>
                </div>

                <div className="detail-section">
                  <h3>Proposal Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Proposal ID:</span>
                      <span className="detail-value">#{selectedProposal.proposalId}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Category:</span>
                      <span className="detail-value">{selectedProposal.category}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Status:</span>
                      <span className={`detail-value status-${selectedProposal.status.toLowerCase()}`}>
                        {selectedProposal.status}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Proposer:</span>
                      <span className="detail-value monospace">{selectedProposal.proposer}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Created:</span>
                      <span className="detail-value">{formatDate(selectedProposal.createdAt)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Voting Ends:</span>
                      <span className="detail-value">{formatDate(selectedProposal.votingEnds)}</span>
                    </div>
                    <div className="detail-item full-width">
                      <span className="detail-label">Documentation:</span>
                      <a
                        href={`https://ipfs.io/ipfs/${selectedProposal.ipfsHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="detail-link"
                      >
                        View on IPFS →
                      </a>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Voting Results</h3>
                  <div className="voting-details">
                    <div className="vote-row">
                      <span className="vote-label">For:</span>
                      <span className="vote-value">{formatVotes(selectedProposal.votesFor)} votes</span>
                    </div>
                    <div className="vote-row">
                      <span className="vote-label">Against:</span>
                      <span className="vote-value">{formatVotes(selectedProposal.votesAgainst)} votes</span>
                    </div>
                    <div className="vote-row">
                      <span className="vote-label">Abstain:</span>
                      <span className="vote-value">{formatVotes(selectedProposal.votesAbstain)} votes</span>
                    </div>
                    <div className="vote-row">
                      <span className="vote-label">Quorum:</span>
                      <span className="vote-value">{formatVotes(selectedProposal.quorum)} required</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {selectedProposal.status === 'Active' && (
                <>
                  <button className="button-success">Vote For</button>
                  <button className="button-danger">Vote Against</button>
                  <button className="button-secondary">Abstain</button>
                </>
              )}
              {selectedProposal.status === 'Executed' && (
                <button className="button-secondary">View Execution</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Proposal Modal */}
      {showCreateProposal && (
        <div className="modal-overlay" onClick={() => setShowCreateProposal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Proposal</h2>
              <button className="modal-close" onClick={() => setShowCreateProposal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <form className="create-proposal-form">
                <div className="form-group">
                  <label>Proposal Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Brief, descriptive title"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select className="form-control" required>
                    <option value="">Select Category</option>
                    <option>General</option>
                    <option>Partner Addition</option>
                    <option>Asset Bridge</option>
                    <option>Treasury</option>
                    <option>Governance</option>
                    <option>Emergency</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    className="form-control"
                    rows="5"
                    placeholder="Detailed description of the proposal"
                    required
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>IPFS Documentation Hash *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Qm..."
                    required
                  />
                  <small className="form-hint">
                    Upload detailed proposal documentation to IPFS
                  </small>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="button-secondary" onClick={() => setShowCreateProposal(false)}>
                Cancel
              </button>
              <button className="button-primary">Create Proposal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovernancePanel;
