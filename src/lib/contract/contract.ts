import { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/config/contract';
import Web3 from 'web3';

// กำหนด type สำหรับ contract
type FractionalDAOContract = Contract<typeof CONTRACT_ABI>;

// กำหนด type สำหรับ event
interface EventLog {
  event: string;
  address: string;
  topics: string[];
  data: string;
  returnValues: {
    [key: string]: string | number | boolean;
  };
}

// กำหนด type สำหรับ event names
type EventName = 'ProposalCreated' | 'Transfer' | 'allEvents' | 'ALLEVENTS' | 'AssetCreated';

// กำหนด type สำหรับ proposal
interface ProposalResponse {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  assetId: number;
  voteStart: number;
  voteEnd: number;
  yesVotes: number;
  noVotes: number;
  executionTime: number;
  executed: boolean;
  passed: boolean;
  executionData: string;
  creator: string;
}

export interface Asset {
  id: number;
  name: string;
  symbol: string;
  imageUrl: string;
  totalShares: number;
  availableShares: number;
  pricePerShare: number;
  minInvestment: number;
  maxInvestment: number;
  totalValue: number;
  fundedAmount: number;
  apy: number;
  fundingDeadline: number;
  investorCount: number;
  creator: string;
  isActive: boolean;
}

export interface Proposal {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  assetId: number;
  voteStart: number;
  voteEnd: number;
  yesVotes: number;
  noVotes: number;
  executionTime: number;
  executed: boolean;
  passed: boolean;
  executionData: string;
  creator: string;
}

export interface RewardInfo {
  lastRewardTimestamp: number;
  totalRewardsPaid: number;
  assetTotalValue: number;
  assetSold: boolean;
}

export const getContract = (web3: Web3): FractionalDAOContract | null => {
  try {
    if (!web3) {
      console.error('Web3 is not initialized');
      return null;
    }

    return new web3.eth.Contract(CONTRACT_ABI as AbiItem[], CONTRACT_ADDRESS);
  } catch (error) {
    console.error('Error creating contract instance:', error);
    return null;
  }
};

export const getAssets = async (contract: FractionalDAOContract | null) => {
  if (!contract) {
    throw new Error('Contract is not initialized');
  }

  try {
    // ดึงข้อมูล assets จาก event AssetCreated
    const assetCreatedEvents = await contract.getPastEvents('allEvents', {
      fromBlock: 0,
      toBlock: 'latest',
      filter: { event: 'AssetCreated' }
    });

    // ดึงข้อมูลเพิ่มเติมของแต่ละ asset
    const assets = await Promise.all(
      assetCreatedEvents
        .filter((event): event is EventLog => typeof event !== 'string' && 'returnValues' in event)
        .map(async (event: EventLog) => {
          const assetId = event.returnValues.assetId as string;
          const asset = await contract.methods.getAsset(assetId).call();
          return {
            ...asset,
            id: Number(assetId),
            imageUrl: `https://source.unsplash.com/random/800x600?asset=${assetId}`,
          };
        })
    );

    return assets;
  } catch (error: unknown) {
    console.error('Error fetching assets:', error);
    if (error instanceof Error && error.message.includes('Internal JSON-RPC error')) {
      throw new Error('Network connection error. Please try again.');
    }
    throw error;
  }
};

export const getAsset = async (contract: FractionalDAOContract | null, id: string) => {
  if (!contract) {
    throw new Error('Contract is not initialized');
  }

  try {
    const asset = await contract.methods.getAsset(id).call();
    return asset;
  } catch (error: unknown) {
    console.error('Error fetching asset:', error);
    if (error instanceof Error && error.message.includes('Internal JSON-RPC error')) {
      throw new Error('Network connection error. Please try again.');
    }
    throw error;
  }
};

export const getProposals = async (contract: FractionalDAOContract | null) => {
  if (!contract) return [];
  
  try {
    // ดึงเฉพาะ event ProposalCreated
    const proposalCreatedEvents = await contract.getPastEvents('allEvents', {
      fromBlock: 0,
      toBlock: 'latest',
      filter: { event: 'ProposalCreated' }
    });

    const proposals = await Promise.all(
      proposalCreatedEvents
        .filter((event): event is EventLog => typeof event !== 'string' && 'returnValues' in event)
        .map(async (event: EventLog) => {
          const proposalId = event.returnValues.proposalId as string;
          const proposal = await contract.methods.getProposal(proposalId).call() as ProposalResponse;
          return {
            ...proposal,
            imageUrl: `https://source.unsplash.com/random/800x600?proposal=${proposalId}`,
          };
        })
    );

    return proposals.filter(proposal => proposal.id > 0);
  } catch (error) {
    console.error("Error fetching proposals:", error);
    return [];
  }
};

export const getAssetOwnershipHistory = async (contract: FractionalDAOContract | null, assetId: number) => {
  if (!contract || !assetId) return [];
  
  try {
    const transferEvents = await contract.getPastEvents('allEvents', {
      fromBlock: 0,
      toBlock: 'latest',
      filter: { event: 'Transfer', assetId }
    });

    return transferEvents
      .filter((event): event is EventLog => typeof event !== 'string' && 'returnValues' in event)
      .map((event: EventLog) => ({
        owner: event.returnValues.to as string,
        shares: Number(event.returnValues.amount),
        timestamp: Number(event.returnValues.timestamp)
      }));
  } catch (error) {
    console.error("Error fetching asset ownership history:", error);
    return [];
  }
};

export const getUserShares = async (contract: FractionalDAOContract | null, address: string) => {
  if (!contract || !address) return '0';
  
  try {
    return await contract.methods.getUserShares(address).call();
  } catch (error) {
    console.error("Error fetching user shares:", error);
    return '0';
  }
};

export const checkFeeStatus = async (contract: FractionalDAOContract | null, address: string) => {
  if (!contract || !address) return false;
  
  try {
    return await contract.methods.hasPaidVoteGas(address).call();
  } catch (error) {
    console.error("Error checking fee status:", error);
    return false;
  }
};

export const payFeeWithETH = async (contract: FractionalDAOContract | null, from: string) => {
  if (!contract) throw new Error('Contract is not initialized');
  
  try {
    const ethFeeValue = "50000000000000000"; // 0.05 ETH as per contract
    return await contract.methods.payFeeWithETH().send({
      from,
      value: ethFeeValue,
      gas: "300000"
    });
  } catch (error) {
    console.error("Error paying ETH fee:", error);
    throw error;
  }
};

export const payFeeWithToken = async (contract: FractionalDAOContract | null, from: string) => {
  if (!contract) throw new Error('Contract is not initialized');
  
  try {
    return await contract.methods.payFeeWithToken().send({
      from,
      gas: "300000"
    });
  } catch (error) {
    console.error("Error paying token fee:", error);
    throw error;
  }
};

export const purchaseShares = async (
  contract: FractionalDAOContract | null, 
  assetId: number, 
  amount: number, 
  value: string, 
  from: string
) => {
  if (!contract) throw new Error('Contract is not initialized');
  
  try {
    return await contract.methods.purchaseShares(assetId.toString(), amount.toString()).send({
      from,
      value,
      gas: "3000000"
    });
  } catch (error) {
    console.error("Error purchasing shares:", error);
    throw error;
  }
};

export const sellShares = async (
  contract: FractionalDAOContract | null, 
  assetId: number, 
  amount: number, 
  from: string
) => {
  if (!contract) throw new Error('Contract is not initialized');
  
  try {
    return await contract.methods.sellShares(assetId.toString(), amount.toString()).send({
      from,
      gas: "3000000"
    });
  } catch (error) {
    console.error("Error selling shares:", error);
    throw error;
  }
};

export const createProposal = async (
  contract: FractionalDAOContract | null,
  assetId: number,
  title: string,
  description: string,
  imageUrl: string,
  executionData: string,
  from: string
) => {
  if (!contract) throw new Error('Contract is not initialized');
  
  try {
    return await contract.methods.createProposal(
      assetId.toString(),
      title,
      description,
      imageUrl,
      executionData
    ).send({
      from,
      gas: "3000000"
    });
  } catch (error) {
    console.error("Error creating proposal:", error);
    throw error;
  }
};

export const castVote = async (
  contract: FractionalDAOContract | null, 
  proposalId: number, 
  support: boolean, 
  from: string
) => {
  if (!contract) throw new Error('Contract is not initialized');
  
  try {
    return await contract.methods.castVote(proposalId.toString(), support).send({
      from,
      gas: "3000000"
    });
  } catch (error) {
    console.error("Error casting vote:", error);
    throw error;
  }
};

export const executeProposal = async (
  contract: FractionalDAOContract | null, 
  proposalId: number, 
  from: string
) => {
  if (!contract) throw new Error('Contract is not initialized');
  
  try {
    return await contract.methods.executeProposal(proposalId.toString()).send({
      from,
      gas: "3000000"
    });
  } catch (error) {
    console.error("Error executing proposal:", error);
    throw error;
  }
};

export const fractionalizeAsset = async (
  contract: FractionalDAOContract | null,
  name: string,
  symbol: string,
  imageUrl: string,
  totalShares: number,
  pricePerShare: string,
  minInvestment: string,
  maxInvestment: string,
  totalValue: string,
  apy: number,
  fundingDeadline: number,
  from: string
) => {
  if (!contract) throw new Error('Contract is not initialized');
  
  try {
    return await contract.methods.createAsset(
      name,
      symbol,
      imageUrl,
      totalShares.toString(),
      pricePerShare,
      minInvestment,
      maxInvestment,
      totalValue,
      apy.toString(),
      fundingDeadline.toString()
    ).send({
      from,
      gas: "3000000"
    });
  } catch (error) {
    console.error("Error fractionalizing asset:", error);
    throw error;
  }
};

export const distributeRewards = async (
  contract: FractionalDAOContract | null, 
  assetId: number, 
  from: string
) => {
  if (!contract) throw new Error('Contract is not initialized');
  
  try {
    return await contract.methods.distributeRewards(assetId.toString()).send({
      from,
      gas: "3000000"
    });
  } catch (error) {
    console.error("Error distributing rewards:", error);
    throw error;
  }
};

export const distributeDividends = async (
  contract: FractionalDAOContract | null, 
  assetId: number, 
  amount: string, 
  from: string
) => {
  if (!contract) throw new Error('Contract is not initialized');
  
  try {
    return await contract.methods.distributeDividends(assetId.toString()).send({
      from,
      value: amount,
      gas: "3000000"
    });
  } catch (error) {
    console.error("Error distributing dividends:", error);
    throw error;
  }
};

export const sellAsset = async (
  contract: FractionalDAOContract | null, 
  assetId: number, 
  saleAmount: string, 
  from: string
) => {
  if (!contract) throw new Error('Contract is not initialized');
  
  try {
    return await contract.methods.sellAsset(assetId.toString()).send({
      from,
      value: saleAmount,
      gas: "3000000"
    });
  } catch (error) {
    console.error("Error selling asset:", error);
    throw error;
  }
};

export const updateAssetValue = async (
  contract: FractionalDAOContract | null, 
  assetId: number, 
  newValue: number, 
  from: string
) => {
  if (!contract) throw new Error('Contract is not initialized');
  
  try {
    return await contract.methods.updateAssetValue(assetId.toString(), newValue.toString()).send({
      from,
      gas: "3000000"
    });
  } catch (error) {
    console.error("Error updating asset value:", error);
    throw error;
  }
};

export const getRewardInfo = async (contract: FractionalDAOContract | null, assetId: number) => {
  if (!contract) return null;
  
  try {
    const [lastRewardTimestamp, totalRewardsPaid, assetTotalValue, assetSold] = await Promise.all([
      contract.methods.getLastRewardTimestamp(assetId).call(),
      contract.methods.getTotalRewardsPaid(assetId).call(),
      contract.methods.assetTotalValue(assetId).call(),
      contract.methods.assetSold(assetId).call()
    ]);
    
    return {
      lastRewardTimestamp: Number(lastRewardTimestamp),
      totalRewardsPaid: Number(totalRewardsPaid),
      assetTotalValue: Number(assetTotalValue),
      assetSold: assetSold
    };
  } catch (error) {
    console.error("Error fetching reward info:", error);
    return null;
  }
};

export const createOrder = async (
  contract: FractionalDAOContract | null,
  assetId: number,
  amount: number,
  price: number,
  isBuyOrder: boolean,
  from: string
) => {
  if (!contract) throw new Error('Contract is not initialized');
  
  try {
    return await contract.methods.createOrder(
      assetId.toString(),
      amount.toString(),
      price.toString(),
      isBuyOrder
    ).send({
      from,
      value: isBuyOrder ? (amount * price).toString() : '0',
      gas: "3000000"
    });
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

export const fillOrder = async (
  contract: FractionalDAOContract | null, 
  orderId: number, 
  from: string
) => {
  if (!contract) throw new Error('Contract is not initialized');
  
  try {
    return await contract.methods.fillOrder(orderId.toString()).send({
      from,
      gas: "3000000"
    });
  } catch (error) {
    console.error("Error filling order:", error);
    throw error;
  }
};

export const cancelOrder = async (
  contract: FractionalDAOContract | null, 
  orderId: number, 
  from: string
) => {
  if (!contract) throw new Error('Contract is not initialized');
  
  try {
    return await contract.methods.cancelOrder(orderId.toString()).send({
      from,
      gas: "3000000"
    });
  } catch (error) {
    console.error("Error canceling order:", error);
    throw error;
  }
};

export const getBestPrices = async (
  contract: FractionalDAOContract | null, 
  assetId: number
) => {
  if (!contract) throw new Error('Contract is not initialized');
  
  try {
    return await contract.methods.getBestPrices(assetId.toString()).call();
  } catch (error) {
    console.error("Error getting best prices:", error);
    throw error;
  }
};

export const updateAssetStatus = async (
  contract: FractionalDAOContract | null, 
  assetId: number, 
  isActive: boolean, 
  from: string
) => {
  if (!contract) throw new Error('Contract is not initialized');
  
  try {
    return await contract.methods.updateAssetStatus(assetId.toString(), isActive).send({
      from,
      gas: "3000000"
    });
  } catch (error) {
    console.error("Error updating asset status:", error);
    throw error;
  }
};

export const getAssetInvestors = async (
  contract: FractionalDAOContract | null, 
  assetId: number
) => {
  if (!contract) throw new Error('Contract is not initialized');
  
  try {
    return await contract.methods.getAssetInvestors(assetId.toString()).call();
  } catch (error) {
    console.error("Error getting asset investors:", error);
    throw error;
  }
};

export const getLastRewardTimestamp = async (
  contract: FractionalDAOContract | null, 
  assetId: number
) => {
  if (!contract) throw new Error('Contract is not initialized');
  
  try {
    return await contract.methods.getLastRewardTimestamp(assetId.toString()).call();
  } catch (error) {
    console.error("Error getting last reward timestamp:", error);
    throw error;
  }
};

export const withdrawFunds = async (
  contract: FractionalDAOContract | null, 
  from: string
) => {
  if (!contract) throw new Error('Contract is not initialized');
  
  try {
    return await contract.methods.withdrawFunds().send({
      from,
      gas: "3000000"
    });
  } catch (error) {
    console.error("Error withdrawing funds:", error);
    throw error;
  }
};
