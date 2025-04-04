import React, { useState } from 'react';
import '../styles/components.css';

const DisputeCreation = ({ onCreateDispute }) => {
  const [respondentAddress, setRespondentAddress] = useState('');
  const [description, setDescription] = useState('');
  const [fee, setFee] = useState('0.01');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!respondentAddress) {
      newErrors.respondentAddress = 'Respondent address is required';
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(respondentAddress)) {
      newErrors.respondentAddress = 'Invalid Ethereum address';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!fee || isNaN(parseFloat(fee)) || parseFloat(fee) <= 0) {
      newErrors.fee = 'Fee must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onCreateDispute(respondentAddress, description, fee);
    }
  };

  return (
    <div className="dispute-creation">
      <h2>Create New Dispute</h2>
      
      <form onSubmit={handleSubmit} className="dispute-form">
        <div className="form-group">
          <label htmlFor="respondentAddress">Respondent Address</label>
          <input
            type="text"
            id="respondentAddress"
            value={respondentAddress}
            onChange={(e) => setRespondentAddress(e.target.value)}
            placeholder="0x..."
            className={errors.respondentAddress ? 'error' : ''}
          />
          {errors.respondentAddress && <div className="error-message">{errors.respondentAddress}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Dispute Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the dispute in detail..."
            rows="5"
            className={errors.description ? 'error' : ''}
          ></textarea>
          {errors.description && <div className="error-message">{errors.description}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="fee">Arbitration Fee (ETH)</label>
          <input
            type="number"
            id="fee"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            step="0.001"
            min="0.001"
            className={errors.fee ? 'error' : ''}
          />
          {errors.fee && <div className="error-message">{errors.fee}</div>}
          <small>This fee will be distributed to jurors who resolve your dispute.</small>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn-primary">Create Dispute</button>
        </div>
      </form>
    </div>
  );
};

export default DisputeCreation;
