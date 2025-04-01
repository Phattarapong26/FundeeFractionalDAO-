import { FractionalDAOAbi } from './abi';

export const CONTRACT_ADDRESS = '0x98E1c5867F2eb7036309E30c021E2ACD3Bb81172';

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

export const getContract = (provider: any) => {
  if (!provider) return null;
  return new provider.eth.Contract(FractionalDAOAbi, CONTRACT_ADDRESS);
};

export const getAssets = async (contract: any) => {
  if (!contract) return [];
  
  try {
    // ดึงข้อมูลจาก event logs
    const assetCreatedEvents = await contract.getPastEvents('AssetCreated', {
      fromBlock: 0,
      toBlock: 'latest'
    });

    const assets = await Promise.all(
      assetCreatedEvents.map(async (event: any) => {
        const assetId = event.returnValues.assetId;
        const asset = await contract.methods.getAsset(assetId).call();
        return {
          ...asset,
          imageUrl: `https://source.unsplash.com/random/800x600?asset=${assetId}`,
        };
      })
    );

    return assets.filter(asset => asset.id > 0);
  } catch (error) {
    console.error("Error fetching assets:", error);
    return [];
  }
};

export const getProposals = async (contract: any) => {
  if (!contract) return [];
  
  try {
    // ดึงข้อมูลจาก event logs
    const proposalCreatedEvents = await contract.getPastEvents('ProposalCreated', {
      fromBlock: 0,
      toBlock: 'latest'
    });

    const proposals = await Promise.all(
      proposalCreatedEvents.map(async (event: any) => {
        const proposalId = event.returnValues.proposalId;
        const proposal = await contract.methods.getProposal(proposalId).call();
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

export const getAssetOwnershipHistory = async (contract: any, assetId: number) => {
  if (!contract || !assetId) return [];
  
  try {
    // ดึงข้อมูลจาก event logs
    const transferEvents = await contract.getPastEvents('Transfer', {
      fromBlock: 0,
      toBlock: 'latest',
      filter: { assetId }
    });

    return transferEvents.map((event: any) => ({
      owner: event.returnValues.to,
      shares: Number(event.returnValues.amount),
      timestamp: Number(event.returnValues.timestamp)
    }));
  } catch (error) {
    console.error("Error fetching asset ownership history:", error);
    return [];
  }
};

export const getUserShares = async (contract: any, address: string) => {
  if (!contract || !address) return 0;
  
  try {
    return await contract.methods.getUserShares(address).call();
  } catch (error) {
    console.error("Error fetching user shares:", error);
    return 0;
  }
};

export const checkFeeStatus = async (contract: any, address: string) => {
  if (!contract || !address) return false;
  
  try {
    return await contract.methods.hasPaidVoteGas(address).call();
  } catch (error) {
    console.error("Error checking fee status:", error);
    return false;
  }
};

export const payFeeWithETH = async (contract: any, from: string) => {
  if (!contract) throw new Error('Contract not initialized');
  
  try {
    const ethFeeValue = "50000000000000000"; // 0.05 ETH as per contract
    return await contract.methods.payFeeWithETH().send({
      from,
      value: ethFeeValue,
      gas: 300000
    });
  } catch (error) {
    console.error("Error paying ETH fee:", error);
    throw error;
  }
};

export const payFeeWithToken = async (contract: any, from: string) => {
  if (!contract) throw new Error('Contract not initialized');
  
  try {
    return await contract.methods.payFeeWithToken().send({
      from,
      gas: 300000
    });
  } catch (error) {
    console.error("Error paying token fee:", error);
    throw error;
  }
};

export const purchaseShares = async (contract: any, assetId: number, amount: number, value: string, from: string) => {
  if (!contract) throw new Error('Contract not initialized');
  
  try {
    return await contract.methods.purchaseShares(assetId, amount).send({
      from,
      value,
      gas: 3000000
    });
  } catch (error) {
    console.error("Error purchasing shares:", error);
    throw error;
  }
};

export const sellShares = async (contract: any, assetId: number, amount: number, from: string) => {
  if (!contract) throw new Error('Contract not initialized');
  
  try {
    return await contract.methods.sellShares(assetId, amount).send({
      from,
      gas: 3000000
    });
  } catch (error) {
    console.error("Error selling shares:", error);
    throw error;
  }
};

export const createProposal = async (
  contract: any,
  assetId: number,
  title: string,
  description: string,
  imageUrl: string,
  executionData: string,
  from: string
) => {
  if (!contract) throw new Error('Contract not initialized');
  
  try {
    return await contract.methods.createProposal(
      assetId,
      title,
      description,
      imageUrl,
      executionData
    ).send({
      from,
      gas: 3000000
    });
  } catch (error) {
    console.error("Error creating proposal:", error);
    throw error;
  }
};

export const castVote = async (contract: any, proposalId: number, support: boolean, from: string) => {
  if (!contract) throw new Error('Contract not initialized');
  
  try {
    return await contract.methods.castVote(proposalId, support).send({
      from,
      gas: 3000000
    });
  } catch (error) {
    console.error("Error casting vote:", error);
    throw error;
  }
};

export const executeProposal = async (contract: any, proposalId: number, from: string) => {
  if (!contract) throw new Error('Contract not initialized');
  
  try {
    return await contract.methods.executeProposal(proposalId).send({
      from,
      gas: 3000000
    });
  } catch (error) {
    console.error("Error executing proposal:", error);
    throw error;
  }
};

export const fractionalizeAsset = async (
  contract: any,
  name: string,
  symbol: string,
  imageUrl: string,
  totalShares: number,
  pricePerShare: number,
  minInvestment: number,
  maxInvestment: number,
  totalValue: number,
  apy: number,
  fundingDeadline: number,
  from: string
) => {
  if (!contract) throw new Error('Contract not initialized');
  
  try {
    return await contract.methods.createAsset(
      name,
      symbol,
      imageUrl,
      totalShares,
      pricePerShare,
      minInvestment,
      maxInvestment,
      totalValue,
      apy,
      fundingDeadline
    ).send({
      from,
      gas: 3000000
    });
  } catch (error) {
    console.error("Error fractionalizing asset:", error);
    throw error;
  }
};

export const distributeRewards = async (contract: any, assetId: number, from: string) => {
  if (!contract) throw new Error('Contract not initialized');
  
  try {
    return await contract.methods.distributeRewards(assetId).send({
      from,
      gas: 3000000
    });
  } catch (error) {
    console.error("Error distributing rewards:", error);
    throw error;
  }
};

export const distributeDividends = async (contract: any, assetId: number, amount: string, from: string) => {
  if (!contract) throw new Error('Contract not initialized');
  
  try {
    return await contract.methods.distributeDividends(assetId).send({
      from,
      value: amount,
      gas: 3000000
    });
  } catch (error) {
    console.error("Error distributing dividends:", error);
    throw error;
  }
};

export const sellAsset = async (contract: any, assetId: number, saleAmount: string, from: string) => {
  if (!contract) throw new Error('Contract not initialized');
  
  try {
    return await contract.methods.sellAsset(assetId).send({
      from,
      value: saleAmount,
      gas: 3000000
    });
  } catch (error) {
    console.error("Error selling asset:", error);
    throw error;
  }
};

export const updateAssetValue = async (contract: any, assetId: number, newValue: number, from: string) => {
  if (!contract) throw new Error('Contract not initialized');
  
  try {
    return await contract.methods.updateAssetValue(assetId, newValue).send({
      from,
      gas: 3000000
    });
  } catch (error) {
    console.error("Error updating asset value:", error);
    throw error;
  }
};

export const getRewardInfo = async (contract: any, assetId: number) => {
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
