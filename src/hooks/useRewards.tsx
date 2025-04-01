import { useState, useEffect } from 'react';
import { useWeb3 } from '@/hooks/useWeb3';
import { toast } from 'sonner';

interface RewardData {
  totalRewards: number;
  nextReward: number;
  apy: number;
  rewardsHistory: RewardHistory[];
  isLoading: boolean;
  distributeRewards: (assetId: number) => Promise<void>;
  distributeDividends: (assetId: number, amount: string) => Promise<void>;
  refetch: () => Promise<void>;
}

interface RewardHistory {
  assetId: number;
  assetName: string;
  amount: number;
  timestamp: number;
  type: 'reward' | 'dividend';
}

export const useRewards = (): RewardData => {
  const [totalRewards, setTotalRewards] = useState<number>(0);
  const [nextReward, setNextReward] = useState<number>(0);
  const [apy, setApy] = useState<number>(0);
  const [rewardsHistory, setRewardsHistory] = useState<RewardHistory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { account, contract, web3 } = useWeb3();

  const fetchRewardsData = async () => {
    if (!contract || !account) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // TODO: Implement actual contract calls
      // This is a placeholder for demonstration
      const mockData = {
        totalRewards: 0.5,
        nextReward: 0.05,
        apy: 8.5,
        rewardsHistory: [
          {
            assetId: 1,
            assetName: "Sample Asset 1",
            amount: 0.05,
            timestamp: Date.now() - 86400000,
            type: 'reward'
          },
          {
            assetId: 2,
            assetName: "Sample Asset 2",
            amount: 0.1,
            timestamp: Date.now() - 172800000,
            type: 'dividend'
          }
        ]
      };

      setTotalRewards(mockData.totalRewards);
      setNextReward(mockData.nextReward);
      setApy(mockData.apy);
      setRewardsHistory(mockData.rewardsHistory);
    } catch (error) {
      console.error("Error fetching rewards data:", error);
      toast.error("Failed to fetch rewards data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRewardsData();
  }, [contract, account]);

  const distributeRewards = async (assetId: number) => {
    if (!contract || !account) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsLoading(true);
      // TODO: Implement contract call to distribute rewards
      await contract.methods.distributeRewards(assetId).send({ from: account });
      toast.success("Rewards distributed successfully");
      await fetchRewardsData();
    } catch (error) {
      console.error("Error distributing rewards:", error);
      toast.error("Failed to distribute rewards");
    } finally {
      setIsLoading(false);
    }
  };

  const distributeDividends = async (assetId: number, amount: string) => {
    if (!contract || !account || !web3) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsLoading(true);
      const weiAmount = web3.utils.toWei(amount, 'ether');
      // TODO: Implement contract call to distribute dividends
      await contract.methods.distributeDividends(assetId).send({ 
        from: account,
        value: weiAmount
      });
      toast.success("Dividends distributed successfully");
      await fetchRewardsData();
    } catch (error) {
      console.error("Error distributing dividends:", error);
      toast.error("Failed to distribute dividends");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    totalRewards,
    nextReward,
    apy,
    rewardsHistory,
    isLoading,
    distributeRewards,
    distributeDividends,
    refetch: fetchRewardsData
  };
}; 