
# FractionalDAO Smart Contracts

This directory contains the Solidity smart contracts for the FractionalDAO platform.

## Contracts

### FractionalDAO.sol

The main contract that handles:

- Asset fractionalization
- Share purchasing and selling
- Proposal creation and voting
- Trading system for secondary market

## Deployment Instructions

1. Install dependencies:
```
npm install @openzeppelin/contracts
```

2. Compile the contracts:
```
npx hardhat compile
```

3. Deploy the contract:
```
npx hardhat run scripts/deploy.js --network <network-name>
```

4. Update the contract address in the frontend code:
```
src/lib/contract/contract.ts - CONTRACT_ADDRESS
src/lib/contract/platformToken.ts - PLATFORM_TOKEN_ADDRESS
```

## Contract Structure

- `PlatformToken`: ERC20 token used for governance
  - Initial supply: 1,000,000,000 tokens
  - Exchange rate: 1 ETH = 1,000 tokens

- `FractionalDAO`: Main contract with all platform functionality

## Key Functions

- `createAsset`: Create a new fractionalized asset
- `purchaseShares`: Buy shares of an asset
- `sellShares`: Sell shares of an asset
- `createProposal`: Create a new governance proposal
- `castVote`: Vote on a proposal
- `executeProposal`: Execute a passed proposal
- `createOrder`: Create a buy/sell order in the marketplace
- `fillOrder`: Fill an existing order
- `cancelOrder`: Cancel an active order

## Event Reference

The contract emits the following events:
- `AssetCreated`
- `SharesPurchased`
- `SharesSold`
- `ProposalCreated`
- `VoteCast`
- `ProposalExecuted`
- `OrderCreated`
- `OrderCancelled`
- `TradeExecuted`
