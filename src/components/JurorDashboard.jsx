import React, { useState } from 'react';
import StakingPanel from './StakingPanel';
import '../styles/components.css';

const JurorDashboard = ({ account, jurorInfo, tokenBalance, onStake, onUnstake }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const renderOverview = () => (
    <div className="overview-panel">
      <h3>Juror Status</h3>
      <div className="status-indicator">
        <div className={`status-badge ${jurorInfo.isActive ? 'active' : 'inactive'}`}>
          {jurorInfo.isActive ? 'Active Juror' : 'Inactive'}
        </div>
      </div>
      
      <div className="stats-container">
        <div className="stat-item">
          <h4>Staked Amount</h4>
          <p>{parseFloat(jurorInfo.stakedAmount).toFixed(2)} GRULL</p>
        </div>
        
        <div className="stat-item">
          <h4>Reputation Score</h4>
          <p>{jurorInfo.reputation}</p>
        </div>
        
        <div className="stat-item">
          <h4>Last Activity</h4>
          <p>{jurorInfo.lastActivityTimestamp.toLocaleDateString()}</p>
        </div>
      </div>
      
      <div className="wallet-info">
        <h3>Wallet</h3>
        <p><strong>Address:</strong> {account}</p>
        <p><strong>Available Balance:</strong> {parseFloat(tokenBalance).toFixed(2)} GRULL</p>
      </div>
    </div>
  );
  
  return (
    <div className="juror-dashboard">
      <h2>Juror Dashboard</h2>
      
      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''} 
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'staking' ? 'active' : ''} 
          onClick={() => setActiveTab('staking')}
        >
          Staking
        </button>
      </div>
      
      <div className="dashboard-content">
        {activeTab === 'overview' ? (
          renderOverview()
        ) : (
          <StakingPanel 
            tokenBalance={tokenBalance}
            stakedAmount={jurorInfo.stakedAmount}
            onStake={onStake}
            onUnstake={onUnstake}
          />
        )}
      </div>
    </div>
  );
};

export default JurorDashboard;
