import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './styles/App.css';
// eslint-disable-next-line no-unused-vars
import ArbitrationSystemABI from './contracts/ArbitrationSystem.json';
// eslint-disable-next-line no-unused-vars
import GrullTokenABI from './contracts/GrullToken.json';
import JurorDashboard from './components/JurorDashboard';
import DisputeCreation from './components/DisputeCreation';
import DisputeList from './components/DisputeList';
import DisputeDetails from './components/DisputeDetails';
import Header from './components/Header';
// eslint-disable-next-line no-unused-vars
import { ARBITRATION_SYSTEM_ADDRESS, GRULL_TOKEN_ADDRESS } from './config';

function App() {
  const [account, setAccount] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [arbitrationSystem, setArbitrationSystem] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [grullToken, setGrullToken] = useState(null);
  const [jurorInfo, setJurorInfo] = useState(null);
  const [disputes, setDisputes] = useState([]);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [activeView, setActiveView] = useState('dashboard');
  
  // Add development mode flag
  const DEVELOPMENT_MODE = true;
  
  useEffect(() => {
    const init = async () => {
      try {
        if (window.ethereum) {
          // eslint-disable-next-line no-unused-vars
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          const account = accounts[0];
          setAccount(account);
          
          if (DEVELOPMENT_MODE) {
            // Use mock data instead of real contract calls
            console.log("Using development mode with mock data");
            
            // Mock juror info
            setJurorInfo({
              stakedAmount: "100.0",
              lastActivityTimestamp: new Date(),
              reputation: 100,
              isActive: true
            });
            
            // Mock token balance
            setTokenBalance("1000.0");
            
            // Mock disputes
            setDisputes([
              {
                id: 0,
                creator: "0x1234567890123456789012345678901234567890",
                respondent: "0x0987654321098765432109876543210987654321",
                description: "Sample dispute for testing",
                fee: "0.1",
                resolved: false,
                jurorCount: 5,
                votesForCreator: 2,
                votesForRespondent: 1,
                jurorSelectionComplete: true,
                isCreator: true,
                isRespondent: false,
                isJuror: false
              }
            ]);
            
            setLoading(false);
          } else {
            // Your existing contract initialization code goes here
            // ...
          }
        } else {
          setError('Please install MetaMask to use this application');
          setLoading(false);
        }
      } catch (error) {
        console.error('Initialization error:', error);
        setError('Failed to initialize application: ' + error.message);
        setLoading(false);
      }
    };
    
    init();
    
    // Setup event listeners for MetaMask
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        window.location.reload();
      });
      
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, [DEVELOPMENT_MODE]);
  
  const handleDisputeSelect = (disputeId) => {
    const dispute = disputes.find(d => d.id === disputeId);
    setSelectedDispute(dispute);
    setActiveView('disputeDetails');
  };
  
  const handleCreateDispute = (respondentAddress, description, fee) => {
    if (DEVELOPMENT_MODE) {
      // Mock creating a dispute
      const newDispute = {
        id: disputes.length,
        creator: account,
        respondent: respondentAddress,
        description: description,
        fee: fee,
        resolved: false,
        jurorCount: 5,
        votesForCreator: 0,
        votesForRespondent: 0,
        jurorSelectionComplete: false,
        isCreator: true,
        isRespondent: false,
        isJuror: false
      };
      
      setDisputes([...disputes, newDispute]);
      setActiveView('disputes');
    } else {
      // Real contract interaction would go here
    }
  };
  
  const handleStakeTokens = (amount) => {
    if (DEVELOPMENT_MODE) {
      // Mock staking tokens
      const newStakedAmount = parseFloat(jurorInfo.stakedAmount) + parseFloat(amount);
      setJurorInfo({
        ...jurorInfo,
        stakedAmount: newStakedAmount.toString(),
        isActive: true
      });
      
      const newBalance = parseFloat(tokenBalance) - parseFloat(amount);
      setTokenBalance(newBalance.toString());
    } else {
      // Real contract interaction would go here
    }
  };
  
  const handleUnstakeTokens = (amount) => {
    if (DEVELOPMENT_MODE) {
      // Mock unstaking tokens
      const newStakedAmount = parseFloat(jurorInfo.stakedAmount) - parseFloat(amount);
      setJurorInfo({
        ...jurorInfo,
        stakedAmount: newStakedAmount.toString(),
        isActive: newStakedAmount > 0
      });
      
      const newBalance = parseFloat(tokenBalance) + parseFloat(amount);
      setTokenBalance(newBalance.toString());
    } else {
      // Real contract interaction would go here
    }
  };
  
  const handleCastVote = (disputeId, voteForCreator) => {
    if (DEVELOPMENT_MODE) {
      // Mock casting a vote
      const updatedDisputes = disputes.map(dispute => {
        if (dispute.id === disputeId) {
          return {
            ...dispute,
            votesForCreator: voteForCreator ? dispute.votesForCreator + 1 : dispute.votesForCreator,
            votesForRespondent: voteForCreator ? dispute.votesForRespondent : dispute.votesForRespondent + 1
          };
        }
        return dispute;
      });
      
      setDisputes(updatedDisputes);
      
      if (selectedDispute && selectedDispute.id === disputeId) {
        const updatedDispute = updatedDisputes.find(d => d.id === disputeId);
        setSelectedDispute(updatedDispute);
      }
    } else {
      // Real contract interaction would go here
    }
  };
  
  const renderContent = () => {
    if (loading) {
      return <div className="loading">Loading...</div>;
    }
    
    if (error) {
      return <div className="error">{error}</div>;
    }
    
    switch (activeView) {
      case 'dashboard':
        return (
          <JurorDashboard 
            account={account}
            jurorInfo={jurorInfo}
            tokenBalance={tokenBalance}
            onStake={handleStakeTokens}
            onUnstake={handleUnstakeTokens}
          />
        );
      case 'createDispute':
        return (
          <DisputeCreation 
            onCreateDispute={handleCreateDispute}
          />
        );
      case 'disputes':
        return (
          <DisputeList 
            disputes={disputes}
            onSelectDispute={handleDisputeSelect}
          />
        );
      case 'disputeDetails':
        return (
          <DisputeDetails 
            dispute={selectedDispute}
            account={account}
            onCastVote={handleCastVote}
            onBack={() => setActiveView('disputes')}
          />
        );
      default:
        return <div>Unknown view</div>;
    }
  };
  
  return (
    <div className="app">
      <Header 
        account={account}
        tokenBalance={tokenBalance}
        onNavigate={setActiveView}
        currentView={activeView}
      />
      <main className="content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
