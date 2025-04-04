import React from 'react';
import '../styles/components.css';

const Header = ({ account, tokenBalance, onNavigate, currentView }) => {
  // Truncate the account address for display
  const truncatedAccount = account 
    ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}`
    : '';
  
  return (
    <header className="header">
      <div className="logo">
        <h1>GRULL Arbitration System</h1>
      </div>
      
      <nav className="navigation">
        <button 
          className={currentView === 'dashboard' ? 'active' : ''} 
          onClick={() => onNavigate('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={currentView === 'disputes' ? 'active' : ''} 
          onClick={() => onNavigate('disputes')}
        >
          My Disputes
        </button>
        <button 
          className={currentView === 'createDispute' ? 'active' : ''} 
          onClick={() => onNavigate('createDispute')}
        >
          Create Dispute
        </button>
      </nav>
      
      <div className="account-info">
        <div className="token-balance">
          <span>{parseFloat(tokenBalance).toFixed(2)} GRULL</span>
        </div>
        <div className="account-address">
          <span>{truncatedAccount}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
