import React, { useState } from 'react';
import '../styles/components.css';

const StakingPanel = ({ tokenBalance, stakedAmount, onStake, onUnstake }) => {
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [stakeError, setStakeError] = useState('');
  const [unstakeError, setUnstakeError] = useState('');
  
  const handleStakeAmountChange = (e) => {
    setStakeAmount(e.target.value);
    setStakeError('');
  };
  
  const handleUnstakeAmountChange = (e) => {
    setUnstakeAmount(e.target.value);
    setUnstakeError('');
  };
  
  const handleSetMaxStake = () => {
    setStakeAmount(tokenBalance);
    setStakeError('');
  };
  
  const handleSetMaxUnstake = () => {
    setUnstakeAmount(stakedAmount);
    setUnstakeError('');
  };
  
  const validateStake = () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setStakeError('Please enter a valid amount');
      return false;
    }
    
    if (parseFloat(stakeAmount) > parseFloat(tokenBalance)) {
      setStakeError('Amount exceeds your balance');
      return false;
    }
    
    return true;
  };
  
  const validateUnstake = () => {
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      setUnstakeError('Please enter a valid amount');
      return false;
    }
    
    if (parseFloat(unstakeAmount) > parseFloat(stakedAmount)) {
      setUnstakeError('Amount exceeds your staked tokens');
      return false;
    }
    
    return true;
  };
  
  const handleStake = (e) => {
    e.preventDefault();
    if (validateStake()) {
      onStake(stakeAmount);
      setStakeAmount('');
    }
  };
  
  const handleUnstake = (e) => {
    e.preventDefault();
    if (validateUnstake()) {
      onUnstake(unstakeAmount);
      setUnstakeAmount('');
    }
  };
  
  return (
    <div className="staking-panel">
      <div className="staking-info">
        <div className="info-box">
          <h3>Available Balance</h3>
          <p>{parseFloat(tokenBalance).toFixed(2)} GRULL</p>
        </div>
        <div className="info-box">
          <h3>Currently Staked</h3>
          <p>{parseFloat(stakedAmount).toFixed(2)} GRULL</p>
        </div>
      </div>
      
      <div className="staking-actions">
        <div className="action-card">
          <h3>Stake Tokens</h3>
          <form onSubmit={handleStake} className="action-form">
            <div className="form-group">
              <label htmlFor="stakeAmount">Amount to Stake</label>
              <div className="input-with-max">
                <input
                  type="number"
                  id="stakeAmount"
                  value={stakeAmount}
                  onChange={handleStakeAmountChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                <button 
                  type="button" 
                  className="max-button" 
                  onClick={handleSetMaxStake}
                >
                  MAX
                </button>
              </div>
              {stakeError && <div className="error-message">{stakeError}</div>}
            </div>
            
            <button 
              type="submit" 
              disabled={parseFloat(tokenBalance) <= 0}
            >
              Stake Tokens
            </button>
          </form>
        </div>
        
        <div className="action-card">
          <h3>Unstake Tokens</h3>
          <form onSubmit={handleUnstake} className="action-form">
            <div className="form-group">
              <label htmlFor="unstakeAmount">Amount to Unstake</label>
              <div className="input-with-max">
                <input
                  type="number"
                  id="unstakeAmount"
                  value={unstakeAmount}
                  onChange={handleUnstakeAmountChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                <button 
                  type="button" 
                  className="max-button" 
                  onClick={handleSetMaxUnstake}
                >
                  MAX
                </button>
              </div>
              {unstakeError && <div className="error-message">{unstakeError}</div>}
            </div>
            
            <button 
              type="submit" 
              disabled={parseFloat(stakedAmount) <= 0}
            >
              Unstake Tokens
            </button>
          </form>
        </div>
      </div>
      
      <div className="staking-info-panel">
        <h3>Staking Information</h3>
        <div className="info-content">
          <p>
            <strong>What is staking?</strong> Staking your GRULL tokens allows you to participate as a juror in the arbitration system.
          </p>
          <p>
            <strong>Rewards:</strong> As a juror, you'll earn fees from disputes you help resolve. The more tokens you stake, the higher your chances of being selected for disputes.
          </p>
          <p>
            <strong>Risks:</strong> If you vote against the majority in a dispute, a portion of your staked tokens may be slashed as a penalty.
          </p>
          <p>
            <strong>Minimum Stake:</strong> You need to stake at least 100 GRULL tokens to be eligible as a juror.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StakingPanel;
