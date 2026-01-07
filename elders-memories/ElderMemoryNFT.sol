// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ElderMemoryNFT
 * @notice NFT collection for Lyran Council sacred transmissions
 * @dev Implements Elder Memory attributes and activation mechanisms
 */
contract ElderMemoryNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Elder Memory structure
    struct ElderMemory {
        string transmissionName;
        uint256 frequencyHz;
        string mantraCode;
        bytes32 sacredCodeHash;
        uint256 activationTimestamp;
        bool isActivated;
        TransmissionType transmissionType;
        uint8 powerLevel;
    }
    
    enum TransmissionType {
        WISDOM,
        ACTIVATION,
        PROTECTION,
        HEALING
    }
    
    // Mappings
    mapping(uint256 => ElderMemory) public elderMemories;
    mapping(address => uint256[]) public holderMemories;
    mapping(uint256 => bool) public isElderApproved;
    
    // Events
    event MemoryMinted(
        uint256 indexed tokenId,
        address indexed recipient,
        string transmissionName,
        uint256 frequencyHz
    );
    
    event MemoryActivated(
        uint256 indexed tokenId,
        address indexed activator,
        uint256 timestamp
    );
    
    event ElderApprovalGranted(
        uint256 indexed tokenId,
        address indexed elder
    );
    
    // Constructor
    constructor() ERC721("Elder Memory", "ELDER") {}
    
    /**
     * @notice Mint a new Elder Memory NFT
     * @param to Recipient address
     * @param transmissionName Name of the transmission
     * @param frequencyHz Vibrational frequency in Hz
     * @param mantraCode Activation mantra
     * @param transmissionType Type of transmission
     * @param powerLevel Power level (1-100)
     * @param tokenURI Metadata URI
     */
    function mintElderMemory(
        address to,
        string memory transmissionName,
        uint256 frequencyHz,
        string memory mantraCode,
        TransmissionType transmissionType,
        uint8 powerLevel,
        string memory tokenURI
    ) public onlyOwner returns (uint256) {
        require(powerLevel <= 100, "Power level must be <= 100");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        bytes32 sacredHash = keccak256(
            abi.encodePacked(transmissionName, frequencyHz, mantraCode)
        );
        
        elderMemories[tokenId] = ElderMemory({
            transmissionName: transmissionName,
            frequencyHz: frequencyHz,
            mantraCode: mantraCode,
            sacredCodeHash: sacredHash,
            activationTimestamp: 0,
            isActivated: false,
            transmissionType: transmissionType,
            powerLevel: powerLevel
        });
        
        holderMemories[to].push(tokenId);
        
        emit MemoryMinted(tokenId, to, transmissionName, frequencyHz);
        
        return tokenId;
    }
    
    /**
     * @notice Activate an Elder Memory NFT with the correct mantra
     * @param tokenId Token ID to activate
     * @param mantra Mantra code for activation
     */
    function activateMemory(uint256 tokenId, string memory mantra) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(!elderMemories[tokenId].isActivated, "Already activated");
        
        bytes32 providedHash = keccak256(
            abi.encodePacked(
                elderMemories[tokenId].transmissionName,
                elderMemories[tokenId].frequencyHz,
                mantra
            )
        );
        
        require(
            providedHash == elderMemories[tokenId].sacredCodeHash,
            "Incorrect mantra"
        );
        
        elderMemories[tokenId].isActivated = true;
        elderMemories[tokenId].activationTimestamp = block.timestamp;
        
        emit MemoryActivated(tokenId, msg.sender, block.timestamp);
    }
    
    /**
     * @notice Grant elder approval for a transmission
     * @param tokenId Token ID to approve
     */
    function grantElderApproval(uint256 tokenId) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        isElderApproved[tokenId] = true;
        
        emit ElderApprovalGranted(tokenId, msg.sender);
    }
    
    /**
     * @notice Get Elder Memory data for a token
     * @param tokenId Token ID to query
     */
    function getElderMemory(uint256 tokenId) 
        external 
        view 
        returns (ElderMemory memory) 
    {
        require(_exists(tokenId), "Token does not exist");
        return elderMemories[tokenId];
    }
    
    /**
     * @notice Get all Elder Memories held by an address
     * @param holder Address to query
     */
    function getHolderMemories(address holder) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return holderMemories[holder];
    }
    
    /**
     * @notice Get activation status
     * @param tokenId Token ID to check
     */
    function isMemoryActivated(uint256 tokenId) 
        external 
        view 
        returns (bool) 
    {
        require(_exists(tokenId), "Token does not exist");
        return elderMemories[tokenId].isActivated;
    }
    
    // Override required functions
    function _burn(uint256 tokenId) 
        internal 
        override(ERC721, ERC721URIStorage) 
    {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
