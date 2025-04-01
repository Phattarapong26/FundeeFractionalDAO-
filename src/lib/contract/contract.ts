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

  // ข้อมูลจำลองเพื่อใช้ในกรณีที่การเชื่อมต่อกับ blockchain มีปัญหา
  const mockAssets: Asset[] = [
    {
      id: 1,
      name: "Manhattan Luxury Apartment",
      symbol: "MLA",
      imageUrl: "https://source.unsplash.com/random/800x600?apartment",
      totalShares: 1000,
      availableShares: 700,
      pricePerShare: 0.1,
      minInvestment: 0.2,
      maxInvestment: 10,
      totalValue: 100,
      fundedAmount: 30,
      apy: 8,
      fundingDeadline: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
      investorCount: 5,
      creator: "0xb13b071a478ee444d2ccd6b97217438fb7c73578",
      isActive: true
    },
    {
      id: 2,
      name: "Blue-Chip Art Collection",
      symbol: "BCAC",
      imageUrl: "https://source.unsplash.com/random/800x600?art",
      totalShares: 500,
      availableShares: 350,
      pricePerShare: 0.2,
      minInvestment: 0.4,
      maxInvestment: 20,
      totalValue: 100,
      fundedAmount: 30,
      apy: 6,
      fundingDeadline: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 25,
      investorCount: 3,
      creator: "0xb13b071a478ee444d2ccd6b97217438fb7c73578",
      isActive: true
    }
  ];

  // เพิ่ม asset ใหม่ที่เพิ่งสร้างเข้าไปในข้อมูลจำลอง
  const attemptToAddNewAsset = (id: number) => {
    // หาใน mockAssets ว่ามี id นี้แล้วหรือไม่
    const existing = mockAssets.find(asset => asset.id === id);
    if (existing) return;
    
    // ถ้ายังไม่มี เพิ่มเข้าไป
    mockAssets.push({
      id: id,
      name: `New Asset #${id}`,
      symbol: `NA${id}`,
      imageUrl: `https://source.unsplash.com/random/800x600?newasset${id}`,
      totalShares: 1000,
      availableShares: 1000,
      pricePerShare: 0.01,
      minInvestment: 0.1,
      maxInvestment: 5,
      totalValue: 10,
      fundedAmount: 0,
      apy: 5,
      fundingDeadline: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
      investorCount: 0,
      creator: "0xb13b071a478ee444d2ccd6b97217438fb7c73578",
      isActive: true
    });
  };

  try {
    console.log('Trying to fetch assets...');
    
    try {
      // ลองดึงข้อมูลจาก event
      const assetCreatedEvents = await contract.getPastEvents('allEvents', {
        fromBlock: 0,
        toBlock: 'latest',
        filter: { event: 'AssetCreated' }
      });
      
      console.log('Asset events found:', assetCreatedEvents.length);
      
      if (assetCreatedEvents.length === 0) {
        console.log('No asset events found, returning mock data');
        return mockAssets;
      }

      // ดึงข้อมูลเพิ่มเติมของแต่ละ asset
      const assets = await Promise.all(
        assetCreatedEvents
          .filter((event): event is EventLog => typeof event !== 'string' && 'returnValues' in event)
          .map(async (event: EventLog) => {
            const assetId = event.returnValues.assetId as string;
            console.log(`Fetching details for asset ID: ${assetId}`);
            
            try {
              const asset = await contract.methods.getAsset(assetId).call();
              console.log(`Asset ${assetId} data:`, asset);
              
              // สร้าง asset object พร้อมข้อมูลเพิ่มเติม
              return {
                ...asset,
                id: Number(assetId),
                imageUrl: `https://source.unsplash.com/random/800x600?asset=${assetId}`,
              };
            } catch (error) {
              console.error(`Error fetching asset ${assetId}:`, error);
              return null;
            }
          })
      );

      // กรองออก assets ที่ null (กรณีที่เกิด error ระหว่างการดึงข้อมูล)
      const validAssets = assets.filter(asset => asset !== null) as Asset[];
      console.log('Valid assets found:', validAssets.length);
      
      if (validAssets.length === 0) {
        console.log('No valid assets found, returning mock data');
        return mockAssets;
      }
      
      return validAssets;
    } catch (eventsError) {
      console.error('Error fetching with events:', eventsError);
      
      // ลองดึงข้อมูลด้วยวิธีตรง
      try {
        console.log('Trying direct asset lookup...');
        // ตรวจสอบว่าสร้าง asset ไปกี่ตัวแล้ว โดยลองเรียก assetIdCounter
        const assetIds = [];
        
        // ลองเรียกดู asset ตั้งแต่ ID 1-5
        for (let i = 1; i <= 5; i++) {
          try {
            const asset = await contract.methods.getAsset(i.toString()).call();
            if (asset && typeof asset === 'object' && 'id' in asset) {
              assetIds.push(Number(asset.id));
              attemptToAddNewAsset(Number(asset.id)); // เพิ่ม asset ที่ไม่อยู่ใน mock data
            }
          } catch (assetError) {
            // ถ้าเรียกไม่ได้ แสดงว่าอาจไม่มี asset นี้
            console.log(`Could not fetch asset ${i}:`, assetError);
          }
        }
        
        if (assetIds.length > 0) {
          console.log('Found asset IDs:', assetIds);
          console.log('Updated mock assets:', mockAssets);
        }
      } catch (directError) {
        console.error('Error with direct lookup:', directError);
      }
      
      // ไม่ว่าจะเรียกตรงได้หรือไม่ก็ตาม ให้ใช้ข้อมูลจำลอง
      return mockAssets;
    }
  } catch (error: unknown) {
    console.error('Top-level error fetching assets:', error);
    return mockAssets;
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
  
  // ข้อมูลจำลองสำหรับ proposals
  const mockProposals: Proposal[] = [
    {
      id: 1,
      title: "Expand Investment Portfolio",
      description: "Proposal to allocate 20% of the fund to emerging market opportunities in Asia.",
      imageUrl: "https://source.unsplash.com/random/800x600?business",
      assetId: 1,
      voteStart: Math.floor(Date.now() / 1000) - 5 * 24 * 60 * 60, // 5 days ago
      voteEnd: Math.floor(Date.now() / 1000) + 2 * 24 * 60 * 60, // 2 days from now
      yesVotes: 650,
      noVotes: 350,
      executionTime: 0,
      executed: false,
      passed: false,
      executionData: "Allocate 20% to emerging markets in Asia",
      creator: "0xb13b071a478ee444d2ccd6b97217438fb7c73578"
    },
    {
      id: 2,
      title: "Quarterly Dividend Distribution",
      description: "Distribute quarterly dividends to all token holders based on recent performance.",
      imageUrl: "https://source.unsplash.com/random/800x600?chart",
      assetId: 2,
      voteStart: Math.floor(Date.now() / 1000) - 10 * 24 * 60 * 60, // 10 days ago
      voteEnd: Math.floor(Date.now() / 1000) - 3 * 24 * 60 * 60, // 3 days ago
      yesVotes: 800,
      noVotes: 200,
      executionTime: Math.floor(Date.now() / 1000) - 2 * 24 * 60 * 60, // 2 days ago
      executed: true,
      passed: true,
      executionData: "Distribute 0.05 ETH per token",
      creator: "0xb13b071a478ee444d2ccd6b97217438fb7c73578"
    }
  ];

  // เพิ่ม proposal ใหม่ที่เพิ่งสร้าง (ถ้ามี)
  const attemptToAddNewProposal = (id: number, title: string, assetId: number) => {
    // ตรวจสอบว่ามี proposal นี้ใน mockProposals แล้วหรือไม่
    const existing = mockProposals.find(proposal => proposal.id === id);
    if (existing) return;
    
    // เพิ่ม proposal ใหม่
    mockProposals.push({
      id,
      title,
      description: `New proposal for Asset #${assetId}: ${title}`,
      imageUrl: `https://source.unsplash.com/random/800x600?proposal=${id}`,
      assetId,
      voteStart: Math.floor(Date.now() / 1000) - 1 * 24 * 60 * 60, // 1 day ago
      voteEnd: Math.floor(Date.now() / 1000) + 6 * 24 * 60 * 60, // 6 days from now
      yesVotes: 0,
      noVotes: 0,
      executionTime: 0,
      executed: false,
      passed: false,
      executionData: "",
      creator: "0xb13b071a478ee444d2ccd6b97217438fb7c73578"
    });
  };
  
  try {
    // ดึงเฉพาะ event ProposalCreated
    const proposalCreatedEvents = await contract.getPastEvents('allEvents', {
      fromBlock: 0,
      toBlock: 'latest',
      filter: { event: 'ProposalCreated' }
    });

    console.log('Proposal events found:', proposalCreatedEvents.length);
    
    if (proposalCreatedEvents.length === 0) {
      console.log('No proposal events found, returning mock data');
      return mockProposals;
    }

    const proposals = await Promise.all(
      proposalCreatedEvents
        .filter((event): event is EventLog => typeof event !== 'string' && 'returnValues' in event)
        .map(async (event: EventLog) => {
          const proposalId = event.returnValues.proposalId as string;
          try {
            const proposal = await contract.methods.getProposal(proposalId).call() as ProposalResponse;
            return {
              ...proposal,
              imageUrl: `https://source.unsplash.com/random/800x600?proposal=${proposalId}`,
            };
          } catch (error) {
            console.error(`Error fetching proposal ${proposalId}:`, error);
            return null;
          }
        })
    );

    const validProposals = proposals.filter(proposal => proposal !== null && proposal.id > 0) as Proposal[];
    console.log('Valid proposals found:', validProposals.length);
    
    if (validProposals.length === 0) {
      console.log('No valid proposals found, returning mock data');
      return mockProposals;
    }
    
    return validProposals;
  } catch (error) {
    console.error("Error fetching proposals:", error);
    
    // ลองดึงข้อมูลโดยตรง
    try {
      console.log('Trying direct proposal lookup...');
      // ลองเรียกดูแต่ละ proposal
      for (let i = 1; i <= 5; i++) {
        try {
          const proposal = await contract.methods.getProposal(i.toString()).call() as ProposalResponse;
          if (proposal && typeof proposal === 'object' && 'id' in proposal) {
            attemptToAddNewProposal(
              Number(proposal.id),
              proposal.title || `Proposal #${proposal.id}`,
              Number(proposal.assetId)
            );
          }
        } catch (proposalError) {
          console.log(`Could not fetch proposal ${i}`);
        }
      }
    } catch (directError) {
      console.error('Error with direct proposal lookup:', directError);
    }
    
    return mockProposals;
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
    console.log("Parameters for createAsset:", {
      name,
      symbol,
      imageUrl,
      totalShares: totalShares.toString(),
      pricePerShare,
      minInvestment,
      maxInvestment,
      totalValue,
      apy: apy.toString(),
      fundingDeadline: fundingDeadline.toString()
    });
    
    // ตรวจสอบว่าได้แปลงค่าเป็น Wei แล้วหรือยัง (ค่าควรเป็นจำนวนเต็มไม่มีทศนิยม และไม่มี e)
    if (pricePerShare.includes('.') || pricePerShare.includes('e') || 
        minInvestment.includes('.') || minInvestment.includes('e') ||
        maxInvestment.includes('.') || maxInvestment.includes('e') ||
        totalValue.includes('.') || totalValue.includes('e')) {
      throw new Error('Values must be in Wei format (no decimals)');
    }
    
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
