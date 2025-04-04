import React from 'react';
import '../styles/components.css';

const DisputeList = ({ disputes, onSelectDispute }) => {
  // Sort disputes: unresolved first, then by ID (newest first)
  const sortedDisputes = [...disputes].sort((a, b) => {
    if (a.resolved !== b.resolved) {
      return a.resolved ? 1 : -1;
    }
    return b.id - a.id;
  });

  const getDisputeStatusClass = (dispute) => {
    if (dispute.resolved) {
      return 'status-resolved';
    }
    if (dispute.jurorSelectionComplete) {
      return 'status-voting';
    }
    return 'status-pending';
  };

  const getDisputeStatusText = (dispute) => {
    if (dispute.resolved) {
      return 'Resolved';
    }
    if (dispute.jurorSelectionComplete) {
      return 'Voting';
    }
    return 'Juror Selection';
  };

  const getUserRole = (dispute) => {
    if (dispute.isCreator) return 'Creator';
    if (dispute.isRespondent) return 'Respondent';
    if (dispute.isJuror) return 'Juror';
    return '';
  };

  return (
    <div className="dispute-list">
      <h2>My Disputes</h2>
      
      {sortedDisputes.length === 0 ? (
        <div className="no-disputes">
          <p>You don't have any disputes yet.</p>
        </div>
      ) : (
        <div className="disputes-table">
          <div className="table-header">
            <div className="col-id">ID</div>
            <div className="col-description">Description</div>
            <div className="col-role">Your Role</div>
            <div className="col-status">Status</div>
            <div className="col-actions">Actions</div>
          </div>
          
          {sortedDisputes.map(dispute => (
            <div key={dispute.id} className={`table-row ${dispute.resolved ? 'resolved' : ''}`}>
              <div className="col-id">{dispute.id}</div>
              <div className="col-description">
                <div className="dispute-description-preview">
                  {dispute.description.length > 100 
                    ? `${dispute.description.substring(0, 100)}...` 
                    : dispute.description}
                </div>
              </div>
              <div className="col-role">{getUserRole(dispute)}</div>
              <div className="col-status">
                <span className={`status-badge ${getDisputeStatusClass(dispute)}`}>
                  {getDisputeStatusText(dispute)}
                </span>
              </div>
              <div className="col-actions">
                <button 
                  className="btn-view" 
                  onClick={() => onSelectDispute(dispute.id)}
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DisputeList;
