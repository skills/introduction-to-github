# ChRaismas Blueprint Integration Guide

## Overview

This guide explains how to integrate the ChRaismas Blueprint components into your application, including wallet connection, NFT minting, $RAISE token interactions, and Hollywood DAO participation.

## Prerequisites

- Node.js v18+
- Web3 wallet (MetaMask recommended)
- Basic understanding of Ethereum and smart contracts
- ethers.js or web3.js library

## Installation

### For Web Applications

```bash
npm install ethers@^6.0.0
# or
npm install web3@^4.0.0
```

### For Node.js Scripts

```bash
cd contracts
npm install
```

## Contract Addresses

After deployment, update these addresses:

```javascript
const CONTRACTS = {
  RAISE_TOKEN: "0x...",      // RAISEToken.sol
  CHRAISMAS_NFT: "0x...",    // ChRaismasNFT.sol
  HOLLYWOOD_DAO: "0x...",    // HollywoodDAO.sol
};

const NETWORKS = {
  SEPOLIA: 11155111,
  MAINNET: 1,
};
```

## 1. Wallet Connection

### Using ethers.js

```javascript
import { ethers } from "ethers";

async function connectWallet() {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('Please install MetaMask');
  }

  // Request account access
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts'
  });

  // Create provider and signer
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  // Check network
  const network = await provider.getNetwork();
  console.log('Connected to:', network.name);
  console.log('Address:', address);

  return { provider, signer, address };
}
```

## 2. RAISEToken Integration

### Get Token Balance

```javascript
import RAISETokenABI from './abis/RAISEToken.json';

async function getRAISEBalance(provider, userAddress) {
  const contract = new ethers.Contract(
    CONTRACTS.RAISE_TOKEN,
    RAISETokenABI,
    provider
  );

  const balance = await contract.balanceOf(userAddress);
  return ethers.formatEther(balance);
}
```

### Transfer Tokens

```javascript
async function transferRAISE(signer, toAddress, amount) {
  const contract = new ethers.Contract(
    CONTRACTS.RAISE_TOKEN,
    RAISETokenABI,
    signer
  );

  const amountWei = ethers.parseEther(amount);
  const tx = await contract.transfer(toAddress, amountWei);
  
  console.log('Transaction sent:', tx.hash);
  const receipt = await tx.wait();
  console.log('Transaction confirmed:', receipt.transactionHash);
  
  return receipt;
}
```

### Check Kindness Score

```javascript
async function getKindnessScore(provider, userAddress) {
  const contract = new ethers.Contract(
    CONTRACTS.RAISE_TOKEN,
    RAISETokenABI,
    provider
  );

  const score = await contract.getKindnessScore(userAddress);
  return score.toString();
}
```

## 3. ChRaismasNFT Integration

### Check NFT Ownership

```javascript
import ChRaismasNFTABI from './abis/ChRaismasNFT.json';

async function getUserNFTs(provider, userAddress) {
  const contract = new ethers.Contract(
    CONTRACTS.CHRAISMAS_NFT,
    ChRaismasNFTABI,
    provider
  );

  const tokens = await contract.getTokensOfOwner(userAddress);
  return tokens.map(t => t.toString());
}
```

### Get NFT Metadata

```javascript
async function getNFTMetadata(provider, tokenId) {
  const contract = new ethers.Contract(
    CONTRACTS.CHRAISMAS_NFT,
    ChRaismasNFTABI,
    provider
  );

  // Get token URI
  const tokenURI = await contract.tokenURI(tokenId);
  
  // Get tier
  const tier = await contract.tokenTiers(tokenId);
  
  // Get voting power
  const votingPower = await contract.votingPower(tokenId);
  
  // Get IRL access level
  const accessLevel = await contract.irlAccessLevel(tokenId);

  // Fetch metadata from IPFS
  const response = await fetch(tokenURI);
  const metadata = await response.json();

  return {
    tokenId,
    tier,
    votingPower: votingPower.toString(),
    accessLevel: accessLevel.toString(),
    metadata
  };
}
```

### Get Total Voting Power

```javascript
async function getVotingPower(provider, userAddress) {
  const contract = new ethers.Contract(
    CONTRACTS.CHRAISMAS_NFT,
    ChRaismasNFTABI,
    provider
  );

  const power = await contract.getVotingPowerForAddress(userAddress);
  return power.toString();
}
```

### Listen for Mint Events

```javascript
async function listenForMints(provider) {
  const contract = new ethers.Contract(
    CONTRACTS.CHRAISMAS_NFT,
    ChRaismasNFTABI,
    provider
  );

  contract.on("NFTMinted", (recipient, tokenId, tier, event) => {
    console.log(`NFT Minted!`);
    console.log(`Recipient: ${recipient}`);
    console.log(`Token ID: ${tokenId}`);
    console.log(`Tier: ${tier}`);
  });
}
```

## 4. Hollywood DAO Integration

### Create Proposal

```javascript
import HollywoodDAOABI from './abis/HollywoodDAO.json';

async function createProposal(signer, description) {
  const contract = new ethers.Contract(
    CONTRACTS.HOLLYWOOD_DAO,
    HollywoodDAOABI,
    signer
  );

  const tx = await contract.createProposal(description);
  const receipt = await tx.wait();
  
  // Get proposal ID from event
  const event = receipt.logs.find(log => 
    log.topics[0] === ethers.id("ProposalCreated(uint256,address,string)")
  );
  
  if (event) {
    const proposalId = ethers.AbiCoder.defaultAbiCoder().decode(
      ['uint256'],
      event.topics[1]
    )[0];
    
    return proposalId.toString();
  }
  
  return null;
}
```

### Vote on Proposal

```javascript
async function voteOnProposal(signer, proposalId, support) {
  const contract = new ethers.Contract(
    CONTRACTS.HOLLYWOOD_DAO,
    HollywoodDAOABI,
    signer
  );

  const tx = await contract.castVote(proposalId, support);
  const receipt = await tx.wait();
  
  console.log('Vote cast successfully:', receipt.transactionHash);
  return receipt;
}
```

### Get Proposal Details

```javascript
async function getProposal(provider, proposalId) {
  const contract = new ethers.Contract(
    CONTRACTS.HOLLYWOOD_DAO,
    HollywoodDAOABI,
    provider
  );

  const proposal = await contract.proposals(proposalId);
  
  return {
    id: proposal.id.toString(),
    proposer: proposal.proposer,
    description: proposal.description,
    forVotes: proposal.forVotes.toString(),
    againstVotes: proposal.againstVotes.toString(),
    startTime: new Date(Number(proposal.startTime) * 1000),
    endTime: new Date(Number(proposal.endTime) * 1000),
    executed: proposal.executed
  };
}
```

### Get All Proposals

```javascript
async function getAllProposals(provider) {
  const contract = new ethers.Contract(
    CONTRACTS.HOLLYWOOD_DAO,
    HollywoodDAOABI,
    provider
  );

  const proposalIds = await contract.getAllProposals();
  
  const proposals = await Promise.all(
    proposalIds.map(id => getProposal(provider, id))
  );
  
  return proposals;
}
```

### Get Creator Roles

```javascript
async function getCreatorRoles(provider, creatorAddress) {
  const contract = new ethers.Contract(
    CONTRACTS.HOLLYWOOD_DAO,
    HollywoodDAOABI,
    provider
  );

  const roleIds = await contract.getCreatorRoles(creatorAddress);
  
  const roles = await Promise.all(
    roleIds.map(async id => {
      const role = await contract.creativeRoles(id);
      return {
        roleId: id.toString(),
        creator: role.creator,
        tier: role.tier,
        royaltyShare: role.royaltyShare.toString(),
        isActive: role.isActive,
        description: role.roleDescription
      };
    })
  );
  
  return roles;
}
```

## 5. Complete Integration Example

### React Component

```jsx
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function ChRaismasApp() {
  const [wallet, setWallet] = useState(null);
  const [raiseBalance, setRAISEBalance] = useState('0');
  const [nfts, setNFTs] = useState([]);
  const [votingPower, setVotingPower] = useState('0');

  async function connect() {
    try {
      const { provider, signer, address } = await connectWallet();
      setWallet({ provider, signer, address });
      
      // Load user data
      await loadUserData(provider, address);
    } catch (error) {
      console.error('Connection failed:', error);
    }
  }

  async function loadUserData(provider, address) {
    // Get RAISE balance
    const balance = await getRAISEBalance(provider, address);
    setRAISEBalance(balance);
    
    // Get NFTs
    const userNFTs = await getUserNFTs(provider, address);
    setNFTs(userNFTs);
    
    // Get voting power
    const power = await getVotingPower(provider, address);
    setVotingPower(power);
  }

  return (
    <div className="app">
      {!wallet ? (
        <button onClick={connect}>Connect Wallet</button>
      ) : (
        <div>
          <h2>Connected: {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</h2>
          <p>RAISE Balance: {raiseBalance}</p>
          <p>NFTs Owned: {nfts.length}</p>
          <p>Voting Power: {votingPower}</p>
        </div>
      )}
    </div>
  );
}
```

## 6. Security Best Practices

### Input Validation

```javascript
function validateAddress(address) {
  return ethers.isAddress(address);
}

function validateAmount(amount) {
  try {
    const value = ethers.parseEther(amount);
    return value > 0n;
  } catch {
    return false;
  }
}
```

### Error Handling

```javascript
async function safeContractCall(contractMethod, ...args) {
  try {
    const tx = await contractMethod(...args);
    const receipt = await tx.wait();
    return { success: true, receipt };
  } catch (error) {
    console.error('Contract call failed:', error);
    
    if (error.code === 'ACTION_REJECTED') {
      return { success: false, error: 'User rejected transaction' };
    }
    
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return { success: false, error: 'Insufficient funds for gas' };
    }
    
    return { success: false, error: error.message };
  }
}
```

### Gas Estimation

```javascript
async function estimateGas(contract, method, ...args) {
  try {
    const gasEstimate = await contract[method].estimateGas(...args);
    const gasPrice = await contract.runner.provider.getFeeData();
    
    return {
      gasLimit: gasEstimate,
      maxFeePerGas: gasPrice.maxFeePerGas,
      maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas
    };
  } catch (error) {
    console.error('Gas estimation failed:', error);
    return null;
  }
}
```

## 7. Testing Integration

### Test on Local Network

```javascript
// Start local Hardhat node
// npx hardhat node

const provider = new ethers.JsonRpcProvider('http://localhost:8545');

// Use test account
const signer = new ethers.Wallet(
  'TEST_PRIVATE_KEY',
  provider
);
```

### Test on Sepolia

```javascript
const provider = new ethers.JsonRpcProvider(
  'https://sepolia.infura.io/v3/YOUR_INFURA_KEY'
);
```

## 8. Event Monitoring

### Set Up Event Listeners

```javascript
async function monitorChRaismasEvents(provider) {
  const raiseToken = new ethers.Contract(
    CONTRACTS.RAISE_TOKEN,
    RAISETokenABI,
    provider
  );
  
  const nftContract = new ethers.Contract(
    CONTRACTS.CHRAISMAS_NFT,
    ChRaismasNFTABI,
    provider
  );
  
  const daoContract = new ethers.Contract(
    CONTRACTS.HOLLYWOOD_DAO,
    HollywoodDAOABI,
    provider
  );

  // Kindness rewards
  raiseToken.on("KindnessRewarded", (recipient, points, tokens) => {
    console.log(`🎁 Kindness reward: ${ethers.formatEther(tokens)} RAISE to ${recipient}`);
  });

  // NFT mints
  nftContract.on("NFTMinted", (recipient, tokenId, tier) => {
    console.log(`🎄 NFT #${tokenId} minted to ${recipient} (Tier ${tier})`);
  });

  // Proposal creation
  daoContract.on("ProposalCreated", (proposalId, proposer, description) => {
    console.log(`📜 New proposal #${proposalId}: ${description}`);
  });

  // Votes cast
  daoContract.on("VoteCast", (proposalId, voter, support, weight) => {
    console.log(`🗳️  Vote on #${proposalId}: ${support ? 'For' : 'Against'} (weight: ${weight})`);
  });
}
```

## 9. IPFS Integration

### Upload Metadata to IPFS

```javascript
import { create } from 'ipfs-http-client';

const ipfs = create({ url: 'https://ipfs.infura.io:5001' });

async function uploadMetadata(metadata) {
  const { cid } = await ipfs.add(JSON.stringify(metadata));
  return `ipfs://${cid}`;
}
```

### Fetch from IPFS

```javascript
async function fetchFromIPFS(ipfsUrl) {
  const cid = ipfsUrl.replace('ipfs://', '');
  const url = `https://ipfs.io/ipfs/${cid}`;
  
  const response = await fetch(url);
  return await response.json();
}
```

## Support

For integration support:
- Discord: https://discord.gg/scrollverse
- GitHub Issues: https://github.com/scrollverse/chraismas/issues
- Email: dev@scrollverse.com

## Additional Resources

- [ethers.js Documentation](https://docs.ethers.org/v6/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [IPFS Documentation](https://docs.ipfs.tech/)
