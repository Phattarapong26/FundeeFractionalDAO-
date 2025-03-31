
import { useState, useEffect } from 'react';
import { useWeb3 } from '@/hooks/useWeb3';
import { getRewardInfo, distributeRewards, distributeDividends, RewardInfo } from '@/lib/contract/contract';
import { toast } from 'sonner';

export interface AssetRewardsData {
  rewardInfo: RewardInfo | null;
  isLoading: boolean;
  distributeRewards: () => Promise<void>;
  distributeDividends: (amount: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useAssetRewards = (assetId: number): AssetRewardsData => {
  const [rewardInfo, setRewardInfo] = useState<RewardInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { account, contract } = useWeb3();

  const fetchRewardInfo = async () => {
    if (!contract || !account || !assetId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const info = await getRewardInfo(contract, assetId);
      setRewardInfo(info);
    } catch (error) {
      console.error("Error fetching reward info:", error);
      toast.error("Failed to fetch reward information");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRewardInfo();
  }, [contract, account, assetId]);

  const handleDistributeRewards = async () => {
    if (!contract || !account || !assetId) {
      toast.error("Wallet not connected or asset not selected");
      return;
    }

    try {
      setIsLoading(true);
      await distributeRewards(contract, assetId, account);
      toast.success("Rewards distributed successfully");
      await fetchRewardInfo();
    } catch (error) {
      console.error("Error distributing rewards:", error);
      toast.error(`Failed to distribute rewards: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDistributeDividends = async (amount: string) => {
    if (!contract || !account || !assetId) {
      toast.error("Wallet not connected or asset not selected");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setIsLoading(true);
      const weiAmount = contract.web3.utils.toWei(amount, 'ether');
      await distributeDividends(contract, assetId, weiAmount, account);
      toast.success("Dividends distributed successfully");
      await fetchRewardInfo();
    } catch (error) {
      console.error("Error distributing dividends:", error);
      toast.error(`Failed to distribute dividends: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    rewardInfo,
    isLoading,
    distributeRewards: handleDistributeRewards,
    distributeDividends: handleDistributeDividends,
    refetch: fetchRewardInfo
  };
};
