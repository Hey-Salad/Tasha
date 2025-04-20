// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FoodWasteToken {
    // Token details
    string public name = "Food Waste Reduction Token";
    string public symbol = "FWT";
    uint8 public decimals = 18;
    uint256 public totalSupply = 0;
    
    // Owner address
    address public owner;
    
    // Mapping of address to token balance
    mapping(address => uint256) public balanceOf;
    
    // Mapping to track waste reduction contributions by address
    mapping(address => uint256) public wasteReductionContributions;
    
    // Emission rate: tokens per unit of food waste reduced
    uint256 public emissionRate = 10;
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event WasteReductionLogged(address indexed user, uint256 amount, string actionType);
    
    constructor() {
        owner = msg.sender;
        // Mint initial supply to the owner
        _mint(owner, 1000000 * 10**decimals);
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    function _mint(address to, uint256 amount) internal {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    /**
     * @dev Logs a food waste reduction activity and rewards the user
     * @param wasteAmount Amount of food waste reduced (in grams)
     * @param actionType Type of waste reduction action (e.g., "donation", "efficient-delivery", "used-before-expiry")
     */
    function logWasteReduction(uint256 wasteAmount, string memory actionType) external {
        require(wasteAmount > 0, "Amount must be greater than 0");
        
        // Calculate tokens to reward
        uint256 tokensToReward = wasteAmount * emissionRate / 1000; // Tokens per kg of waste reduced
        
        // Update user's contribution record
        wasteReductionContributions[msg.sender] += wasteAmount;
        
        // Mint tokens to the user
        _mint(msg.sender, tokensToReward * 10**decimals);
        
        // Emit event
        emit WasteReductionLogged(msg.sender, wasteAmount, actionType);
    }
    
    /**
     * @dev Updates the emission rate (only owner)
     * @param newRate New emission rate (tokens per kg)
     */
    function setEmissionRate(uint256 newRate) external onlyOwner {
        emissionRate = newRate;
    }
    
    /**
     * @dev Gets the total waste reduction contribution of a user
     * @param user Address of the user
     * @return Total waste reduction in grams
     */
    function getUserContribution(address user) external view returns (uint256) {
        return wasteReductionContributions[user];
    }
}