import React, { useState, useEffect } from 'react';
import VotingPanel from './VotingPanel';
import '../styles/components.css';

const DisputeDetails = ({ dispute, account, onCastVote, onBack }) => {
  const [hasVoted, setHasVoted] = useState(false);
  const [userVote, setUserVote] = useState(null);
  
  useEffect(() => {
    // Check if user has already voted (this would typically be retrieved from the contract)
    // For this example, we'll just simulate it
    if (dispute && dispute.isJuror) {
      // This is simplified - in a real app, you'd check the contract
      setHasVoted(false);
    }
  }, [dispute]);
  
  if (!dispute) {
    return <div className="loading">Loading dispute details...</div>;
  }
  
  const handleVote = (voteForCreator) => {
    onCastVote(dispute.id, voteForCreator);
    setHasVoted(true);
    setUserVote(voteForCreator);
  };
  
  const getDisputeResult = () => {
    if (!dispute.resolved) return null;
    
    const creatorWon = dispute.votesForCreator > dispute.votesForRespondent;
    return (
      <div className={`dispute-result ${creatorWon ? 'creator-won' : 'respondent-won'}`}>
        <h3>Dispute Resolved</h3>
        <p>
          <strong>Winner:</strong> {creatorWon ? 'Creator' : 'Respondent'}
        </p>
        <p>
          <strong>Vote Count:</strong> {dispute.votesForCreator} for Creator, {dispute.votesForRespondent} for Respondent
        </p>
      </div>
    );
  };
  
  const isUserJuror = dispute.isJuror;
  const canVote = isUserJuror && !hasVoted && !dispute.resolved && dispute.jurorSelectionComplete;
  
  return (
    <div className="dispute-details">
      <div className="details-header">
        <button className="btn-back" onClick={onBack}>← Back to Disputes</button>
        <h2>Dispute #{dispute.id}</h2>
      </div>
      
      <div className="dispute-info">
        <div className="info-section">
          <h3>Dispute Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Status:</label>
              <span className={`status-badge ${dispute.resolved ? 'status-resolved' : 'status-active'}`}>
                {dispute.resolved ? 'Resolved' : 'Active'}
              </span>
            </div>
            
            <div className="info-item">
              <label>Creator:</label>
              <span className="address">{dispute.creator}</span>
            </div>
            
            <div className="info-item">
              <label>Respondent:</label>
              <span className="address">{dispute.respondent}</span>
            </div>
            
            <div className="info-item">
              <label>Arbitration Fee:</label>
              <span>{dispute.fee} ETH</span>
            </div>
            
            <div className="info-item">
              <label>Juror Count:</label>
              <span>{dispute.jurorCount}</span>
            </div>
            
            <div className="info-item">
              <label>Your Role:</label>
              <span>
                {dispute.isCreator ? 'Creator' : 
                 dispute.isRespondent ? 'Respondent' : 
                 dispute.isJuror ? 'Juror' : 'Observer'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="description-section">
          <h3>Description</h3>
          <div className="dispute-description">
            {dispute.description}
          </div>
        </div>
        
        {dispute.jurorSelectionComplete && (
          <div className="voting-section">
            <h3>Voting</h3>
            {dispute.resolved ? (
              getDisputeResult()
            ) : (
              <>
                <div className="vote-count">
                  <div className="vote-item">
                    <span className="vote-label">For Creator:</span>
                    <span className="vote-value">{dispute.votesForCreator}</span>
                  </div>
                  <div className="vote-item">
                    <span className="vote-label">For Respondent:</span>
                    <span className="vote-value">{dispute.votesForRespondent}</span>
                  </div>
                </div>
                
                {canVote && (
                  <VotingPanel onVote={handleVote} />
                )}
                
                {isUserJuror && hasVoted && !dispute.resolved && (
                  <div className="user-vote">
                    <p>You have voted for the {userVote ? 'Creator' : 'Respondent'}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        
        {dispute.jurorSelectionComplete && dispute.selectedJurors && (
          <div className="jurors-section">
            <h3>Selected Jurors</h3>
            <ul className="juror-list">
              {dispute.selectedJurors.map((juror, index) => (
                <li key={index} className={juror.toLowerCase() === account.toLowerCase() ? 'current-user' : ''}>
                  {juror}
                  {juror.toLowerCase() === account.toLowerCase() && ' (You)'}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisputeDetails;
