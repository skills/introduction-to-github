// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title LightworkerServiceRegistry
 * @notice On-chain registry for tracking and rewarding lightworker contributions
 * @dev Implements real-time service tracking with blockchain transparency
 */
contract LightworkerServiceRegistry is Ownable, ReentrancyGuard {
    
    // Service type enumeration
    enum ServiceType {
        CONTENT_CREATION,
        HEALING_SESSION,
        COMMUNITY_MODERATION,
        TEACHING,
        GOVERNANCE_PARTICIPATION,
        TECHNICAL_CONTRIBUTION,
        ATTUNEMENT_SESSION,
        EVENT_HOSTING,
        MENTORING,
        DOCUMENTATION
    }
    
    // Service record structure
    struct ServiceRecord {
        address lightworker;
        ServiceType serviceType;
        uint256 timestamp;
        uint256 impactScore;
        bytes32 verificationHash;
        bool verified;
        uint256 rewardAmount;
        string metadataURI;
    }
    
    // Lightworker statistics
    struct LightworkerStats {
        uint256 totalServices;
        uint256 totalImpactScore;
        uint256 totalRewardsEarned;
        uint256 currentStreak;
        uint256 longestStreak;
        uint256 lastContributionDate;
        uint256 joinedTimestamp;
        bool isActive;
    }
    
    // State variables
    mapping(address => ServiceRecord[]) public serviceHistory;
    mapping(address => LightworkerStats) public lightworkerStats;
    mapping(address => uint256) public totalImpactScore;
    mapping(address => uint256) public totalRewardsEarned;
    mapping(address => mapping(ServiceType => uint256)) public serviceTypeCount;
    
    mapping(bytes32 => bool) public verifiedHashes;
    mapping(address => bool) public isVerifier;
    
    address[] public allLightworkers;
    mapping(address => bool) private isRegistered;
    
    IERC20 public rewardToken;
    uint256 public baseRewardRate = 10; // Base tokens per impact point
    
    uint256 public totalServicesRecorded;
    uint256 public totalImpactGenerated;
    
    // Events
    event ServiceRecorded(
        address indexed lightworker,
        ServiceType indexed serviceType,
        uint256 impactScore,
        uint256 timestamp,
        bytes32 verificationHash
    );
    
    event ServiceVerified(
        address indexed lightworker,
        uint256 indexed serviceIndex,
        address indexed verifier
    );
    
    event RewardDistributed(
        address indexed lightworker,
        uint256 amount,
        uint256 totalEarned
    );
    
    event StreakUpdated(
        address indexed lightworker,
        uint256 currentStreak,
        uint256 longestStreak
    );
    
    event LightworkerRegistered(
        address indexed lightworker,
        uint256 timestamp
    );
    
    // Constructor
    constructor(address _rewardToken) {
        rewardToken = IERC20(_rewardToken);
        isVerifier[msg.sender] = true;
    }
    
    /**
     * @notice Register as a lightworker
     */
    function registerLightworker() external {
        require(!isRegistered[msg.sender], "Already registered");
        
        isRegistered[msg.sender] = true;
        allLightworkers.push(msg.sender);
        
        lightworkerStats[msg.sender] = LightworkerStats({
            totalServices: 0,
            totalImpactScore: 0,
            totalRewardsEarned: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastContributionDate: 0,
            joinedTimestamp: block.timestamp,
            isActive: true
        });
        
        emit LightworkerRegistered(msg.sender, block.timestamp);
    }
    
    /**
     * @notice Record a new service contribution
     * @param lightworker Address of the lightworker
     * @param serviceType Type of service provided
     * @param impactScore Calculated impact score
     * @param verificationHash Hash for verification
     * @param metadataURI URI to additional metadata
     */
    function recordService(
        address lightworker,
        ServiceType serviceType,
        uint256 impactScore,
        bytes32 verificationHash,
        string memory metadataURI
    ) external returns (uint256) {
        require(isVerifier[msg.sender] || msg.sender == owner(), "Not authorized");
        require(isRegistered[lightworker], "Lightworker not registered");
        require(!verifiedHashes[verificationHash], "Hash already used");
        
        // Create service record
        ServiceRecord memory newRecord = ServiceRecord({
            lightworker: lightworker,
            serviceType: serviceType,
            timestamp: block.timestamp,
            impactScore: impactScore,
            verificationHash: verificationHash,
            verified: false,
            rewardAmount: 0,
            metadataURI: metadataURI
        });
        
        serviceHistory[lightworker].push(newRecord);
        uint256 serviceIndex = serviceHistory[lightworker].length - 1;
        
        // Update statistics
        LightworkerStats storage stats = lightworkerStats[lightworker];
        stats.totalServices++;
        stats.totalImpactScore += impactScore;
        
        totalImpactScore[lightworker] += impactScore;
        serviceTypeCount[lightworker][serviceType]++;
        
        // Update streak
        _updateStreak(lightworker);
        
        totalServicesRecorded++;
        totalImpactGenerated += impactScore;
        verifiedHashes[verificationHash] = true;
        
        emit ServiceRecorded(
            lightworker,
            serviceType,
            impactScore,
            block.timestamp,
            verificationHash
        );
        
        return serviceIndex;
    }
    
    /**
     * @notice Verify a service record
     * @param lightworker Address of the lightworker
     * @param serviceIndex Index of the service to verify
     */
    function verifyService(address lightworker, uint256 serviceIndex) 
        external 
    {
        require(isVerifier[msg.sender], "Not a verifier");
        require(
            serviceIndex < serviceHistory[lightworker].length,
            "Invalid service index"
        );
        
        ServiceRecord storage record = serviceHistory[lightworker][serviceIndex];
        require(!record.verified, "Already verified");
        
        record.verified = true;
        
        // Calculate and distribute reward
        uint256 rewardAmount = record.impactScore * baseRewardRate;
        record.rewardAmount = rewardAmount;
        
        lightworkerStats[lightworker].totalRewardsEarned += rewardAmount;
        totalRewardsEarned[lightworker] += rewardAmount;
        
        // Transfer reward tokens
        if (rewardToken.balanceOf(address(this)) >= rewardAmount) {
            rewardToken.transfer(lightworker, rewardAmount);
            
            emit RewardDistributed(
                lightworker,
                rewardAmount,
                totalRewardsEarned[lightworker]
            );
        }
        
        emit ServiceVerified(lightworker, serviceIndex, msg.sender);
    }
    
    /**
     * @notice Update lightworker streak
     * @param lightworker Address to update streak for
     */
    function _updateStreak(address lightworker) private {
        LightworkerStats storage stats = lightworkerStats[lightworker];
        
        uint256 daysSinceLastContribution = 0;
        if (stats.lastContributionDate > 0) {
            daysSinceLastContribution = 
                (block.timestamp - stats.lastContributionDate) / 1 days;
        }
        
        if (daysSinceLastContribution == 0) {
            // Same day, maintain streak
            return;
        } else if (daysSinceLastContribution == 1) {
            // Next day, increment streak
            stats.currentStreak++;
            if (stats.currentStreak > stats.longestStreak) {
                stats.longestStreak = stats.currentStreak;
            }
        } else {
            // Streak broken
            stats.currentStreak = 1;
        }
        
        stats.lastContributionDate = block.timestamp;
        
        emit StreakUpdated(
            lightworker,
            stats.currentStreak,
            stats.longestStreak
        );
    }
    
    /**
     * @notice Get lightworker's complete service history
     * @param lightworker Address to query
     */
    function getServiceHistory(address lightworker) 
        external 
        view 
        returns (ServiceRecord[] memory) 
    {
        return serviceHistory[lightworker];
    }
    
    /**
     * @notice Get lightworker statistics
     * @param lightworker Address to query
     */
    function getLightworkerStats(address lightworker)
        external
        view
        returns (LightworkerStats memory)
    {
        return lightworkerStats[lightworker];
    }
    
    /**
     * @notice Calculate real-time ranking
     * @param lightworker Address to check rank for
     */
    function getLightworkerRank(address lightworker) 
        external 
        view 
        returns (uint256 rank, uint256 score) 
    {
        score = totalImpactScore[lightworker];
        rank = 1;
        
        for (uint256 i = 0; i < allLightworkers.length; i++) {
            if (totalImpactScore[allLightworkers[i]] > score) {
                rank++;
            }
        }
        
        return (rank, score);
    }
    
    /**
     * @notice Get top N lightworkers by impact score
     * @param count Number of top lightworkers to return
     */
    function getTopLightworkers(uint256 count) 
        external 
        view 
        returns (address[] memory, uint256[] memory) 
    {
        require(count <= allLightworkers.length, "Count exceeds total");
        
        address[] memory topAddresses = new address[](count);
        uint256[] memory topScores = new uint256[](count);
        
        // Simple sorting for top N (optimize for production)
        for (uint256 i = 0; i < count; i++) {
            uint256 maxScore = 0;
            address maxAddress;
            
            for (uint256 j = 0; j < allLightworkers.length; j++) {
                address current = allLightworkers[j];
                uint256 currentScore = totalImpactScore[current];
                
                // Check if already in top list
                bool alreadyAdded = false;
                for (uint256 k = 0; k < i; k++) {
                    if (topAddresses[k] == current) {
                        alreadyAdded = true;
                        break;
                    }
                }
                
                if (!alreadyAdded && currentScore > maxScore) {
                    maxScore = currentScore;
                    maxAddress = current;
                }
            }
            
            topAddresses[i] = maxAddress;
            topScores[i] = maxScore;
        }
        
        return (topAddresses, topScores);
    }
    
    /**
     * @notice Add a verifier
     * @param verifier Address to grant verifier role
     */
    function addVerifier(address verifier) external onlyOwner {
        isVerifier[verifier] = true;
    }
    
    /**
     * @notice Remove a verifier
     * @param verifier Address to revoke verifier role
     */
    function removeVerifier(address verifier) external onlyOwner {
        isVerifier[verifier] = false;
    }
    
    /**
     * @notice Update base reward rate
     * @param newRate New base reward rate
     */
    function updateBaseRewardRate(uint256 newRate) external onlyOwner {
        baseRewardRate = newRate;
    }
    
    /**
     * @notice Get total number of registered lightworkers
     */
    function getTotalLightworkers() external view returns (uint256) {
        return allLightworkers.length;
    }
    
    /**
     * @notice Get ecosystem statistics
     */
    function getEcosystemStats() 
        external 
        view 
        returns (
            uint256 totalLightworkers,
            uint256 totalServices,
            uint256 totalImpact,
            uint256 totalRewards
        ) 
    {
        uint256 totalRewardsSum = 0;
        for (uint256 i = 0; i < allLightworkers.length; i++) {
            totalRewardsSum += totalRewardsEarned[allLightworkers[i]];
        }
        
        return (
            allLightworkers.length,
            totalServicesRecorded,
            totalImpactGenerated,
            totalRewardsSum
        );
    }
}
