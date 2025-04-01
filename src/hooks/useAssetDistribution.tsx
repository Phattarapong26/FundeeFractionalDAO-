import { useState, useEffect } from 'react';
import { useWeb3 } from './useWeb3';
import { toast } from 'sonner';
import { Web3 } from 'web3';

interface DistributionData {
  totalShares: string;
  availableShares: string;
  distributionHistory: {
    address: string;
    shares: string;
    timestamp: string;
  }[];
  isLoading: boolean;
  distributeShares: (recipient: string, shares: number) => Promise<void>;
  getDistributionHistory: () => Promise<void>;
}

export const useAssetDistribution = (assetId: number): DistributionData => {
  const [totalShares, setTotalShares] = useState('0');
  const [availableShares, setAvailableShares] = useState('0');
  const [distributionHistory, setDistributionHistory] = useState<{
    address: string;
    shares: string;
    timestamp: string;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { contract } = useWeb3();
  const web3 = new Web3();
  
  const getShares = async () => {
    if (!contract) return;
    
    try {
      const [total, available] = await Promise.all([
        contract.methods.getTotalShares(assetId).call(),
        contract.methods.getAvailableShares(assetId).call()
      ]);
      
      setTotalShares(web3.utils.fromWei(total, 'ether'));
      setAvailableShares(web3.utils.fromWei(available, 'ether'));
    } catch (error) {
      console.error("Error fetching shares:", error);
      toast.error("ไม่สามารถดึงข้อมูลหุ้นได้");
    }
  };
  
  const getDistributionHistory = async () => {
    if (!contract) return;
    
    try {
      const history = await contract.methods.getDistributionHistory(assetId).call();
      setDistributionHistory(history.map((item: any) => ({
        address: item.recipient,
        shares: web3.utils.fromWei(item.shares, 'ether'),
        timestamp: new Date(Number(item.timestamp) * 1000).toLocaleString('th-TH')
      })));
    } catch (error) {
      console.error("Error fetching distribution history:", error);
      toast.error("ไม่สามารถดึงประวัติการกระจายหุ้นได้");
    }
  };
  
  useEffect(() => {
    if (contract) {
      getShares();
      getDistributionHistory();
    }
  }, [contract, assetId]);
  
  const distributeShares = async (recipient: string, shares: number) => {
    if (!contract) {
      toast.error("กรุณาเชื่อมต่อวอลเล็ตก่อน");
      return;
    }
    
    if (!web3.utils.isAddress(recipient)) {
      toast.error("ที่อยู่ผู้รับไม่ถูกต้อง");
      return;
    }
    
    if (shares <= 0) {
      toast.error("จำนวนหุ้นต้องมากกว่า 0");
      return;
    }
    
    setIsLoading(true);
    try {
      const sharesWei = web3.utils.toWei(shares.toString(), 'ether');
      await contract.methods.distributeShares(assetId, recipient, sharesWei).send({
        from: contract.defaultAccount,
        gas: 3000000
      });
      
      toast.success("กระจายหุ้นสำเร็จ");
      await getShares();
      await getDistributionHistory();
    } catch (error) {
      console.error("Error distributing shares:", error);
      toast.error("กระจายหุ้นไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    totalShares,
    availableShares,
    distributionHistory,
    isLoading,
    distributeShares,
    getDistributionHistory
  };
}; 