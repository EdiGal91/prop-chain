// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

/**
 * @title PropertyTokenization
 * @dev ERC-1155 contract for tokenizing real estate properties
 * Each property gets a unique token ID and can be minted in specified quantities
 */
contract PropertyTokenization is ERC1155 {
    
    // Property information structure
    struct Property {
        string propertyId;      // Off-chain property identifier (from backend)
        address owner;          // Property owner address
        uint256 totalSupply;    // Total tokens minted for this property
        bool exists;            // Whether property is registered
    }
    
    // Mappings
    mapping(uint256 => Property) public properties;
    mapping(string => uint256) public propertyIdToTokenId;
    
    // State variables
    uint256 private _currentTokenId;
    
    // Events
    event PropertyTokenized(
        uint256 indexed tokenId,
        string indexed propertyId,
        address indexed owner,
        uint256 amount
    );
    
    constructor() ERC1155("") {
        _currentTokenId = 1; // Start token IDs from 1
    }
    
    /**
     * @dev Tokenize a property (register and mint tokens in one transaction)
     * @param propertyId The off-chain property identifier
     * @param amount Number of tokens to mint
     */
    function tokenizeProperty(
        string memory propertyId,
        uint256 amount
    ) external returns (uint256 tokenId) {
        require(bytes(propertyId).length > 0, "Property ID cannot be empty");
        require(propertyIdToTokenId[propertyId] == 0, "Property already registered");
        require(amount > 0, "Amount must be greater than 0");
        
        // Create new token ID
        tokenId = _currentTokenId++;
        
        // Register the property
        properties[tokenId] = Property({
            propertyId: propertyId,
            owner: msg.sender,
            totalSupply: amount,
            exists: true
        });
        
        propertyIdToTokenId[propertyId] = tokenId;
        
        // Mint tokens to the property owner
        _mint(msg.sender, tokenId, amount, "");
        
        emit PropertyTokenized(tokenId, propertyId, msg.sender, amount);
        
        return tokenId;
    }
    
    /**
     * @dev Get property information by token ID
     */
    function getProperty(uint256 tokenId) external view returns (Property memory) {
        require(properties[tokenId].exists, "Property not registered");
        return properties[tokenId];
    }
    
    /**
     * @dev Get property token ID by off-chain property ID
     */
    function getTokenIdByPropertyId(string memory propertyId) external view returns (uint256) {
        uint256 tokenId = propertyIdToTokenId[propertyId];
        require(tokenId != 0, "Property not found");
        return tokenId;
    }
    
    /**
     * @dev Get token balance for a property
     */
    function getTokenBalance(address account, uint256 tokenId) external view returns (uint256) {
        return balanceOf(account, tokenId);
    }
    
    /**
     * @dev Override URI function to return empty string (no metadata management)
     */
    function uri(uint256) public pure override returns (string memory) {
        return "";
    }
    
    /**
     * @dev Get current token ID counter
     */
    function getCurrentTokenId() external view returns (uint256) {
        return _currentTokenId;
    }
    
    /**
     * @dev Check if property exists
     */
    function propertyExists(uint256 tokenId) external view returns (bool) {
        return properties[tokenId].exists;
    }
}
