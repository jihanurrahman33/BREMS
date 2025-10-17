// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract RealEstateToken is ERC20, Ownable, Pausable {
    uint256 public constant INITIAL_SUPPLY = 1000000 * 10**18; // 1 million tokens
    uint256 public constant REWARD_RATE = 100 * 10**18; // 100 tokens per investment
    
    mapping(address => bool) public authorizedMinters;
    mapping(address => uint256) public lastRewardTime;
    
    event RewardDistributed(address indexed user, uint256 amount);
    event MinterAuthorized(address indexed minter);
    event MinterRevoked(address indexed minter);
    
    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        _;
    }
    
    constructor() ERC20("Real Estate Crowdfunding Token", "RECT") Ownable() {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    function mint(address to, uint256 amount) external onlyAuthorizedMinter {
        _mint(to, amount);
    }
    
    function distributeReward(address user) external onlyAuthorizedMinter {
        require(block.timestamp >= lastRewardTime[user] + 1 days, "Reward already distributed today");
        
        lastRewardTime[user] = block.timestamp;
        _mint(user, REWARD_RATE);
        
        emit RewardDistributed(user, REWARD_RATE);
    }
    
    function authorizeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
        emit MinterAuthorized(minter);
    }
    
    function revokeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
        emit MinterRevoked(minter);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }
} 