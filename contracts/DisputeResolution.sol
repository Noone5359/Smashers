// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./JurorStaking.sol";
import "./GrullToken.sol";

contract DisputeResolution {
    JurorStaking public jurorStaking;
    GrullToken public grullToken;
    uint256 public disputeFee = 50 * 10**18; // 50 GRLL tokens
    uint256 public numberOfJurorsPerDispute = 3;
    uint256 public votingPeriod = 2 days;
    
    // Dispute statuses
    enum DisputeStatus { Pending, InProgress, Resolved }
    
    // Dispute struct
    struct Dispute {
        address creator;
        string evidence;
        uint256 createdAt;
        DisputeStatus status;
        address[] jurors;
        mapping(address => bool) hasVoted;
        mapping(address => bool) vote; // true = in favor of creator, false = against
        uint256 votesInFavor;
        uint256 votesAgainst;
        uint256 endTime;
        bool resolved;
        bool ruling; // Final ruling: true = in favor of creator, false = against
    }
    
    uint256 public disputeCount;
    mapping(uint256 => Dispute) public disputes;
    
    // Events
    event DisputeCreated(uint256 indexed disputeId, address indexed creator, string evidence);
    event JurorsAssigned(uint256 indexed disputeId, address[] jurors);
    event VoteCast(uint256 indexed disputeId, address indexed juror, bool vote);
    event DisputeResolved(uint256 indexed disputeId, bool ruling);
    
    constructor(address _jurorStakingAddress, address _tokenAddress) {
        jurorStaking = JurorStaking(_jurorStakingAddress);
        grullToken = GrullToken(_tokenAddress);
    }
    
    function createDispute(string calldata evidence) external {
        require(grullToken.transferFrom(msg.sender, address(this), disputeFee), "Token transfer failed");
        
        uint256 disputeId = disputeCount++;
        Dispute storage dispute = disputes[disputeId];
        
        dispute.creator = msg.sender;
        dispute.evidence = evidence;
        dispute.createdAt = block.timestamp;
        dispute.status = DisputeStatus.Pending;
        dispute.resolved = false;
        
        emit DisputeCreated(disputeId, msg.sender, evidence);
        
        // Assign jurors to this dispute
        assignJurors(disputeId);
    }
    
    function assignJurors(uint256 disputeId) internal {
        Dispute storage dispute = disputes[disputeId];
        require(dispute.status == DisputeStatus.Pending, "Dispute must be pending");
        
        address[] memory activeJurors = jurorStaking.getActiveJurors();
        require(activeJurors.length >= numberOfJurorsPerDispute, "Not enough active jurors");
        
        // Weighted random selection based on effective stakes
        address[] memory selectedJurors = new address[](numberOfJurorsPerDispute);
        
        // Create a copy of activeJurors that we can modify
        address[] memory availableJurors = new address[](activeJurors.length);
        uint256[] memory stakeTotals = new uint256[](activeJurors.length);
        uint256 totalEffectiveStake = 0;
        
        // Copy active jurors to available jurors
        for (uint256 i = 0; i < activeJurors.length; i++) {
            availableJurors[i] = activeJurors[i];
        }
        
        // Calculate total effective stake
        for (uint256 i = 0; i < availableJurors.length; i++) {
            uint256 effectiveStake = jurorStaking.getEffectiveStake(availableJurors[i]);
            totalEffectiveStake += effectiveStake;
            stakeTotals[i] = totalEffectiveStake;
        }
        
        // Select jurors
        for (uint256 i = 0; i < numberOfJurorsPerDispute && availableJurors.length > 0; i++) {
            // Generate pseudo-random number (in a real implementation, use a better randomness source)
            uint256 randomValue = uint256(keccak256(abi.encodePacked(block.timestamp, i, disputeId))) % totalEffectiveStake;
            
            // Find the juror corresponding to this random value
            for (uint256 j = 0; j < availableJurors.length; j++) {
                if (randomValue < stakeTotals[j]) {
                    selectedJurors[i] = availableJurors[j];
                    
                    // Remove selected juror from the pool to avoid duplicates
                    // by replacing it with the last element and reducing the array length
                    uint256 selectedJurorStake = jurorStaking.getEffectiveStake(availableJurors[j]);
                    totalEffectiveStake -= selectedJurorStake;
                    
                    // Swap with the last element and adjust the stakes
                    if (j < availableJurors.length - 1) {
                        availableJurors[j] = availableJurors[availableJurors.length - 1];
                        stakeTotals[j] = stakeTotals[availableJurors.length - 1];
                    }
                    
                    // Reduce the array size (conceptually)
                    // We can't actually resize memory arrays, so we'll just keep track of the new length
                    uint256 newLength = availableJurors.length - 1;
                    
                    // Create new arrays with the reduced size
                    address[] memory newAvailableJurors = new address[](newLength);
                    uint256[] memory newStakeTotals = new uint256[](newLength);
                    
                    for (uint256 k = 0; k < newLength; k++) {
                        newAvailableJurors[k] = availableJurors[k];
                        newStakeTotals[k] = stakeTotals[k];
                    }
                    
                    availableJurors = newAvailableJurors;
                    stakeTotals = newStakeTotals;
                    
                    break;
                }
            }
        }
        
        // Assign selected jurors to dispute
        dispute.jurors = selectedJurors;
        dispute.status = DisputeStatus.InProgress;
        dispute.endTime = block.timestamp + votingPeriod;
        
        emit JurorsAssigned(disputeId, selectedJurors);
    }
    
    function castVote(uint256 disputeId, bool voteInFavor) external {
        Dispute storage dispute = disputes[disputeId];
        
        // Check if caller is a selected juror
        bool isSelectedJuror = false;
        for (uint256 i = 0; i < dispute.jurors.length; i++) {
            if (dispute.jurors[i] == msg.sender) {
                isSelectedJuror = true;
                break;
            }
        }
        
        require(isSelectedJuror, "Not a selected juror for this dispute");
        require(dispute.status == DisputeStatus.InProgress, "Dispute not in progress");
        require(!dispute.hasVoted[msg.sender], "Already voted");
        require(block.timestamp < dispute.endTime, "Voting period has ended");
        
        dispute.vote[msg.sender] = voteInFavor;
        dispute.hasVoted[msg.sender] = true;
        
        if (voteInFavor) {
            dispute.votesInFavor++;
        } else {
            dispute.votesAgainst++;
        }
        
        emit VoteCast(disputeId, msg.sender, voteInFavor);
        
        // Check if all jurors have voted or if voting period has ended
        if (dispute.votesInFavor + dispute.votesAgainst == dispute.jurors.length) {
            resolveDispute(disputeId);
        }
    }
    
    function resolveDispute(uint256 disputeId) public {
        Dispute storage dispute = disputes[disputeId];
        
        require(dispute.status == DisputeStatus.InProgress, "Dispute not in progress");
        require(!dispute.resolved, "Dispute already resolved");
        require(block.timestamp >= dispute.endTime || 
                dispute.votesInFavor + dispute.votesAgainst == dispute.jurors.length, 
                "Voting still in progress");
        
        dispute.status = DisputeStatus.Resolved;
        dispute.resolved = true;
        
        // Determine the ruling
        if (dispute.votesInFavor > dispute.votesAgainst) {
            dispute.ruling = true; // In favor of creator
        } else {
            dispute.ruling = false; // Against creator
        }
        
        // Distribute rewards and penalties
        distributeRewardsAndPenalties(disputeId);
        
        emit DisputeResolved(disputeId, dispute.ruling);
    }
    
    function distributeRewardsAndPenalties(uint256 disputeId) internal {
        Dispute storage dispute = disputes[disputeId];
        
        // Calculate fee per juror
        uint256 feePerJuror = disputeFee / dispute.jurors.length;
        
        for (uint256 i = 0; i < dispute.jurors.length; i++) {
            address juror = dispute.jurors[i];
            
            // Skip jurors who didn't vote
            if (!dispute.hasVoted[juror]) continue;
            
            bool votedWithMajority = dispute.vote[juror] == dispute.ruling;
            
            if (votedWithMajority) {
                // Reward jurors who voted with the majority
                grullToken.transfer(juror, feePerJuror);
            } else {
                // Penalize jurors who voted against the majority
                // In a real implementation, you would slash tokens here
                // For this simple example, they just don't receive the fee
            }
        }
    }
}
