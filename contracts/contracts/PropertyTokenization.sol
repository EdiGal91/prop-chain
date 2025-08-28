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
        bytes32 propertyIdHash; // Hash of off-chain property identifier (gas efficient)
        address owner;          // Property owner address
        uint256 totalSupply;    // Total tokens minted for this property
        bool exists;            // Whether property is registered
    }
    
    // Mappings
    mapping(uint256 => Property) public properties;
    mapping(bytes32 => uint256) public propertyHashToTokenId;
    mapping(uint256 => string) private _tokenNames;
    
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
     * @param title Property title for token naming
     * @param amount Number of tokens to mint
     */
    function tokenizeProperty(
        string memory propertyId,
        string memory title,
        uint256 amount
    ) external returns (uint256 tokenId) {
        require(bytes(propertyId).length > 0, "Property ID cannot be empty");
        require(bytes(title).length > 0, "Property title cannot be empty");
        require(amount > 0, "Amount must be greater than 0");
        
        // Hash the property ID for gas efficiency
        bytes32 propertyHash = keccak256(abi.encodePacked(propertyId));
        require(propertyHashToTokenId[propertyHash] == 0, "Property already registered");
        
        // Create new token ID
        tokenId = _currentTokenId++;
        
        // Register the property
        properties[tokenId] = Property({
            propertyIdHash: propertyHash,
            owner: msg.sender,
            totalSupply: amount,
            exists: true
        });
        
        // Store token name and mapping
        _tokenNames[tokenId] = string(abi.encodePacked("PropChain - ", title));
        propertyHashToTokenId[propertyHash] = tokenId;
        
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
     * @dev Returns the name of the token collection
     */
    function name() public pure returns (string memory) {
        return "PropChain Properties";
    }

    /**
     * @dev Returns the name of a specific token
     * @param tokenId The token ID
     */
    function name(uint256 tokenId) public view returns (string memory) {
        require(properties[tokenId].exists, "Property not registered");
        return _tokenNames[tokenId];
    }

    /**
     * @dev Get property token ID by property ID (for frontend convenience)
     * @param propertyId The off-chain property identifier
     */
    function getTokenIdByPropertyId(string memory propertyId) external view returns (uint256) {
        bytes32 propertyHash = keccak256(abi.encodePacked(propertyId));
        uint256 tokenId = propertyHashToTokenId[propertyHash];
        require(tokenId != 0, "Property not found");
        return tokenId;
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
