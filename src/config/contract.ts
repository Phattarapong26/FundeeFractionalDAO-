import { AbiItem } from 'web3-utils';

export const CONTRACT_ADDRESS = '0x98E1c5867F2eb7036309E30c021E2ACD3Bb81172';

export const CONTRACT_ABI: AbiItem[] = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "assetId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "symbol",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "totalShares",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "pricePerShare",
        "type": "uint256"
      }
    ],
    "name": "AssetCreated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "assetId",
        "type": "uint256"
      }
    ],
    "name": "getAsset",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "symbol",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "imageUrl",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "totalShares",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "availableShares",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "pricePerShare",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "minInvestment",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "maxInvestment",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalValue",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "fundedAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "apy",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "fundingDeadline",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "investorCount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAssets",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserInvestments",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "assetId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "status",
            "type": "string"
          }
        ],
        "internalType": "struct FractionalDAO.Investment[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "assetId",
        "type": "uint256"
      }
    ],
    "name": "getRewards",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "totalRewards",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "pendingRewards",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lastClaimed",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "assetId",
        "type": "uint256"
      }
    ],
    "name": "getSecuritySettings",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "securityLevel",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "requiredApprovals",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "maxTransactionsPerDay",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "transactionCooldown",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "whitelistEnabled",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "assetId",
        "type": "uint256"
      }
    ],
    "name": "getTradingStats",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "currentPrice",
        "type": "uint256"
      },
      {
        "internalType": "int256",
        "name": "priceChange24h",
        "type": "int256"
      },
      {
        "internalType": "uint256",
        "name": "volume24h",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "transactions24h",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "assetId",
        "type": "uint256"
      }
    ],
    "name": "getVotingStats",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "totalHolders",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "activeVoters",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalVotes",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "proposalCount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "assetId",
        "type": "uint256"
      }
    ],
    "name": "getAnalytics",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "volume24h",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "transactions24h",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "averagePrice",
        "type": "uint256"
      },
      {
        "internalType": "int256",
        "name": "priceChange24h",
        "type": "int256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]; 