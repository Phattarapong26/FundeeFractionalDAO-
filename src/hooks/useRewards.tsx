import { useState, useEffect } from 'react';
import { useWeb3 } from './useWeb3';
import { toast } from 'sonner';
import { Web3 } from 'web3';
import { getContract } from '@/lib/contract/contract';

interface RewardData {
  totalRewards: string;
  pendingRewards: string;
  lastClaimed: number;
}

interface RewardHistory {
  id: number;
  amount: string;
  timestamp: number;
  type: 'reward' | 'dividend';
  assetId: number;
}

interface DividendHistory {
  id: number;
  amount: string;
  timestamp: number;
  assetId: number;
  totalShares: string;
}

export const useRewards = (id: string | undefined) => {
  const { web3, contract } = useWeb3();
  const [rewards, setRewards] = useState<RewardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRewards = async () => {
      if (!id || !contract) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // ตรวจสอบว่ามีฟังก์ชัน getRewards หรือไม่
        if (typeof contract.methods.getRewards !== 'function') {
          throw new Error('ไม่พบฟังก์ชัน getRewards ใน Smart Contract');
        }

        const rewardData = await contract.methods.getRewards(id).call();
        
        setRewards({
          totalRewards: rewardData.totalRewards || '0',
          pendingRewards: rewardData.pendingRewards || '0',
          lastClaimed: parseInt(rewardData.lastClaimed || '0')
        });
      } catch (err) {
        console.error('Error fetching reward data:', err);
        setError('ไม่สามารถดึงข้อมูลรางวัลได้');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRewards();
  }, [id, contract]);

  return { rewards, isLoading, error };
};

export const useRewardsOld = (): RewardData => {
  const [totalRewards, setTotalRewards] = useState('0');
  const [availableRewards, setAvailableRewards] = useState('0');
  const [totalDividends, setTotalDividends] = useState('0');
  const [availableDividends, setAvailableDividends] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  
  const { account, contract } = useWeb3();
  const web3 = new Web3();
  
  const fetchRewardData = async () => {
    if (!contract || !account) return;
    
    try {
      // ดึงยอด rewards ทั้งหมด
      const totalRewardsWei = await contract.methods.getTotalRewards(account).call();
      setTotalRewards(web3.utils.fromWei(totalRewardsWei, 'ether'));
      
      // ดึงยอด rewards ที่สามารถถอนได้
      const availableRewardsWei = await contract.methods.getAvailableRewards(account).call();
      setAvailableRewards(web3.utils.fromWei(availableRewardsWei, 'ether'));
      
      // ดึงยอด dividends ทั้งหมด
      const totalDividendsWei = await contract.methods.getTotalDividends(account).call();
      setTotalDividends(web3.utils.fromWei(totalDividendsWei, 'ether'));
      
      // ดึงยอด dividends ที่สามารถถอนได้
      const availableDividendsWei = await contract.methods.getAvailableDividends(account).call();
      setAvailableDividends(web3.utils.fromWei(availableDividendsWei, 'ether'));
    } catch (error) {
      console.error("Error fetching reward data:", error);
      toast.error("ไม่สามารถดึงข้อมูล rewards ได้");
    }
  };
  
  useEffect(() => {
    if (contract && account) {
      fetchRewardData();
    }
  }, [contract, account]);
  
  const claimRewards = async () => {
    if (!contract || !account) {
      toast.error("กรุณาเชื่อมต่อวอลเล็ตก่อน");
      return;
    }
    
    setIsLoading(true);
    try {
      await contract.methods.claimRewards().send({
        from: account,
        gas: 3000000
      });
      
      toast.success("ถอน rewards สำเร็จ");
      await fetchRewardData();
    } catch (error) {
      console.error("Error claiming rewards:", error);
      toast.error("ถอน rewards ไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };
  
  const claimDividends = async () => {
    if (!contract || !account) {
      toast.error("กรุณาเชื่อมต่อวอลเล็ตก่อน");
      return;
    }
    
    setIsLoading(true);
    try {
      await contract.methods.claimDividends().send({
        from: account,
        gas: 3000000
      });
      
      toast.success("ถอน dividends สำเร็จ");
      await fetchRewardData();
    } catch (error) {
      console.error("Error claiming dividends:", error);
      toast.error("ถอน dividends ไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };
  
  const getRewardHistory = async (): Promise<RewardHistory[]> => {
    if (!contract || !account) return [];
    
    try {
      const history = await contract.methods.getRewardHistory(account).call();
      return history.map((item: any) => ({
        id: Number(item.id),
        amount: web3.utils.fromWei(item.amount, 'ether'),
        timestamp: Number(item.timestamp),
        type: item.type,
        assetId: Number(item.assetId)
      }));
    } catch (error) {
      console.error("Error fetching reward history:", error);
      toast.error("ไม่สามารถดึงประวัติ rewards ได้");
      return [];
    }
  };
  
  const getDividendHistory = async (): Promise<DividendHistory[]> => {
    if (!contract || !account) return [];
    
    try {
      const history = await contract.methods.getDividendHistory(account).call();
      return history.map((item: any) => ({
        id: Number(item.id),
        amount: web3.utils.fromWei(item.amount, 'ether'),
        timestamp: Number(item.timestamp),
        assetId: Number(item.assetId),
        totalShares: web3.utils.fromWei(item.totalShares, 'ether')
      }));
    } catch (error) {
      console.error("Error fetching dividend history:", error);
      toast.error("ไม่สามารถดึงประวัติ dividends ได้");
      return [];
    }
  };
  
  return {
    totalRewards,
    availableRewards,
    totalDividends,
    availableDividends,
    isLoading,
    claimRewards,
    claimDividends,
    getRewardHistory,
    getDividendHistory
  };
}; 