// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./GrullToken.sol";

contract JurorStaking is Ownable {
    GrullToken public grullToken;
    
    struct Juror {
        uint256 stakedAmount;
        uint256 lastStakeTimestamp;
        bool isActive;
    }
    
    // Minimum stake required to become a juror
    uint256 public minimumStake = 100 * 10**18; // 100 GRLL tokens
    
    // Maximum effective stake (for diminishing returns)
    uint256 public maxEffectiveStake = 10000 * 10**18; // 10,000 GRLL tokens
    
    mapping(address => Juror) public jurors;
    address[] public jurorAddresses;
    
    // Events
    event Staked(address indexed juror, uint256 amount);
    event Unstaked(address indexed juror, uint256 amount);
    
    constructor(address _tokenAddress) Ownable(msg.sender) {
        grullToken = GrullToken(_tokenAddress);
    }
    
    function stake(uint256 amount) external {
        require(amount > 0, "Cannot stake 0 tokens");
        require(grullToken.transferFrom(msg.sender, address(this), amount), "Token transfer failed");
        
        if (!jurors[msg.sender].isActive) {
            jurors[msg.sender] = Juror({
                stakedAmount: amount,
                lastStakeTimestamp: block.timestamp,
                isActive: true
            });
            jurorAddresses.push(msg.sender);
        } else {
            jurors[msg.sender].stakedAmount += amount;
            jurors[msg.sender].lastStakeTimestamp = block.timestamp;
        }
        
        emit Staked(msg.sender, amount);
    }
    
    function unstake(uint256 amount) external {
        require(jurors[msg.sender].isActive, "Not an active juror");
        require(jurors[msg.sender].stakedAmount >= amount, "Insufficient staked amount");
        
        jurors[msg.sender].stakedAmount -= amount;
        jurors[msg.sender].lastStakeTimestamp = block.timestamp;
        
        if (jurors[msg.sender].stakedAmount < minimumStake) {
            jurors[msg.sender].isActive = false;
        }
        
        require(grullToken.transfer(msg.sender, amount), "Token transfer failed");
        emit Unstaked(msg.sender, amount);
    }
    
    // Calculate effective stake with diminishing returns
    function getEffectiveStake(address juror) public view returns (uint256) {
        if (!jurors[juror].isActive) return 0;
        
        uint256 rawStake = jurors[juror].stakedAmount;
        if (rawStake <= minimumStake) return rawStake;
        
        // Apply diminishing returns for stakes above minimum
        uint256 excessStake = rawStake - minimumStake;
        uint256 diminishedExcess = excessStake / 2; // 50% effectiveness for excess tokens
        
        return minimumStake + diminishedExcess;
    }
    
    // Get all active jurors
    function getActiveJurors() external view returns (address[] memory) {
        uint256 activeCount = 0;
        
        // First, count active jurors
        for (uint256 i = 0; i < jurorAddresses.length; i++) {
            if (jurors[jurorAddresses[i]].isActive) {
                activeCount++;
            }
        }
        
        // Create array of active jurors
        address[] memory activeJurors = new address[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < jurorAddresses.length; i++) {
            if (jurors[jurorAddresses[i]].isActive) {
                activeJurors[currentIndex] = jurorAddresses[i];
                currentIndex++;
            }
        }
        
        return activeJurors;
    }
}
