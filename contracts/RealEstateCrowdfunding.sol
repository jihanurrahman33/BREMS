// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract RealEstateCrowdfunding is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _propertyIds;
    Counters.Counter private _investmentIds;
    
    struct Property {
        uint256 id;
        address owner;
        string title;
        string description;
        string ipfsHash; // Added IPFS hash for image
        string location;
        uint256 totalValue;
        uint256 minInvestment;
        uint256 maxInvestment;
        uint256 currentFunding;
        uint256 targetFunding;
        uint256 deadline;
        bool isActive;
        bool isFunded;
        bool isCompleted;
        uint256 totalInvestors;
        mapping(address => uint256) investments;
        address[] investors;
    }
    
    struct Investment {
        uint256 id;
        uint256 propertyId;
        address investor;
        uint256 amount;
        uint256 timestamp;
        bool isActive;
    }
    
    mapping(uint256 => Property) public properties;
    mapping(uint256 => Investment) public investments;
    mapping(address => uint256[]) public userInvestments;
    mapping(address => uint256[]) public userProperties;
    
    uint256 public platformFee = 2; // 2% platform fee
    uint256 public totalPlatformFees;
    
    event PropertyCreated(uint256 indexed propertyId, address indexed owner, string title, uint256 targetFunding);
    event InvestmentMade(uint256 indexed investmentId, uint256 indexed propertyId, address indexed investor, uint256 amount);
    event PropertyFunded(uint256 indexed propertyId, uint256 totalFunding);
    event PropertyCompleted(uint256 indexed propertyId, address indexed owner);
    event InvestmentWithdrawn(uint256 indexed investmentId, address indexed investor, uint256 amount);
    
    modifier propertyExists(uint256 _propertyId) {
        require(_propertyId > 0 && _propertyId <= _propertyIds.current(), "Property does not exist");
        _;
    }
    
    modifier propertyActive(uint256 _propertyId) {
        require(properties[_propertyId].isActive, "Property is not active");
        _;
    }
    
    modifier onlyPropertyOwner(uint256 _propertyId) {
        require(properties[_propertyId].owner == msg.sender, "Only property owner can perform this action");
        _;
    }
    
    function createProperty(
        string memory _title,
        string memory _description,
        string memory _ipfsHash,
        string memory _location,
        uint256 _totalValue,
        uint256 _minInvestment,
        uint256 _maxInvestment,
        uint256 _targetFunding,
        uint256 _deadline
    ) external returns (uint256) {
        require(_targetFunding > 0, "Target funding must be greater than 0");
        require(_minInvestment > 0, "Minimum investment must be greater than 0");
        require(_maxInvestment >= _minInvestment, "Max investment must be >= min investment");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(_targetFunding <= _totalValue, "Target funding cannot exceed total value");
        
        _propertyIds.increment();
        uint256 newPropertyId = _propertyIds.current();
        
        Property storage newProperty = properties[newPropertyId];
        newProperty.id = newPropertyId;
        newProperty.owner = msg.sender;
        newProperty.title = _title;
        newProperty.description = _description;
        newProperty.ipfsHash = _ipfsHash;
        newProperty.location = _location;
        newProperty.totalValue = _totalValue;
        newProperty.minInvestment = _minInvestment;
        newProperty.maxInvestment = _maxInvestment;
        newProperty.targetFunding = _targetFunding;
        newProperty.deadline = _deadline;
        newProperty.isActive = true;
        newProperty.isFunded = false;
        newProperty.isCompleted = false;
        newProperty.currentFunding = 0;
        newProperty.totalInvestors = 0;
        
        userProperties[msg.sender].push(newPropertyId);
        
        emit PropertyCreated(newPropertyId, msg.sender, _title, _targetFunding);
        return newPropertyId;
    }
    
    function invest(uint256 _propertyId) external payable nonReentrant propertyExists(_propertyId) propertyActive(_propertyId) {
        Property storage property = properties[_propertyId];
        
        require(block.timestamp < property.deadline, "Funding deadline has passed");
        require(msg.value >= property.minInvestment, "Investment amount is below minimum");
        require(msg.value <= property.maxInvestment, "Investment amount exceeds maximum");
        require(property.currentFunding + msg.value <= property.targetFunding, "Investment would exceed target funding");
        
        // Check if investor already invested
        if (property.investments[msg.sender] == 0) {
            property.investors.push(msg.sender);
            property.totalInvestors++;
        }
        
        property.investments[msg.sender] += msg.value;
        property.currentFunding += msg.value;
        
        _investmentIds.increment();
        uint256 newInvestmentId = _investmentIds.current();
        
        investments[newInvestmentId] = Investment({
            id: newInvestmentId,
            propertyId: _propertyId,
            investor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            isActive: true
        });
        
        userInvestments[msg.sender].push(newInvestmentId);
        
        emit InvestmentMade(newInvestmentId, _propertyId, msg.sender, msg.value);
        
        // Check if property is fully funded
        if (property.currentFunding >= property.targetFunding) {
            property.isFunded = true;
            property.isActive = false;
            emit PropertyFunded(_propertyId, property.currentFunding);
        }
    }
    
    function completeProperty(uint256 _propertyId) external onlyPropertyOwner(_propertyId) {
        Property storage property = properties[_propertyId];
        require(property.isFunded, "Property must be funded to complete");
        require(!property.isCompleted, "Property already completed");
        
        property.isCompleted = true;
        
        // Calculate and transfer platform fee
        uint256 platformFeeAmount = (property.currentFunding * platformFee) / 100;
        totalPlatformFees += platformFeeAmount;
        
        // Transfer remaining funds to property owner
        uint256 ownerAmount = property.currentFunding - platformFeeAmount;
        payable(property.owner).transfer(ownerAmount);
        
        emit PropertyCompleted(_propertyId, property.owner);
    }
    
    function withdrawInvestment(uint256 _investmentId) external nonReentrant {
        Investment storage investment = investments[_investmentId];
        require(investment.investor == msg.sender, "Only investor can withdraw");
        require(investment.isActive, "Investment is not active");
        
        Property storage property = properties[investment.propertyId];
        require(property.isCompleted, "Property must be completed to withdraw");
        
        uint256 userInvestment = property.investments[msg.sender];
        require(userInvestment > 0, "No investment to withdraw");
        
        // Calculate return based on property performance (simplified)
        uint256 returnAmount = userInvestment; // In a real scenario, this would include profits/losses
        
        property.investments[msg.sender] = 0;
        investment.isActive = false;
        
        payable(msg.sender).transfer(returnAmount);
        
        emit InvestmentWithdrawn(_investmentId, msg.sender, returnAmount);
    }
    

    
    function getPropertyInvestors(uint256 _propertyId) external view propertyExists(_propertyId) returns (address[] memory) {
        return properties[_propertyId].investors;
    }
    
    function getUserInvestment(uint256 _propertyId, address _investor) external view propertyExists(_propertyId) returns (uint256) {
        return properties[_propertyId].investments[_investor];
    }
    
    function getUserInvestments(address _user) external view returns (uint256[] memory) {
        return userInvestments[_user];
    }
    
    function getUserProperties(address _user) external view returns (uint256[] memory) {
        return userProperties[_user];
    }
    
    function getTotalProperties() external view returns (uint256) {
        return _propertyIds.current();
    }
    
    function getTotalInvestments() external view returns (uint256) {
        return _investmentIds.current();
    }
    
    function withdrawPlatformFees() external onlyOwner {
        require(totalPlatformFees > 0, "No platform fees to withdraw");
        uint256 amount = totalPlatformFees;
        totalPlatformFees = 0;
        payable(owner()).transfer(amount);
    }
    
    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 10, "Platform fee cannot exceed 10%");
        platformFee = _newFee;
    }
    
    receive() external payable {
        revert("Direct payments not accepted");
    }
} 


 