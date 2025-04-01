import { useState, useEffect } from 'react';
import { useWeb3 } from './useWeb3';
import { toast } from 'sonner';
import { Web3 } from 'web3';

interface OwnershipHistory {
  id: number;
  assetId: number;
  owner: string;
  shares: string;
  timestamp: number;
  type: 'purchase' | 'sale' | 'transfer';
}

interface AssetOwnershipHistoryData {
  history: OwnershipHistory[];
  isLoading: boolean;
  getHistory: (assetId: number) => Promise<void>;
}

export const useAssetOwnershipHistory = (): AssetOwnershipHistoryData => {
  const [history, setHistory] = useState<OwnershipHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { contract } = useWeb3();
  const web3 = new Web3();
  
  const getHistory = async (assetId: number) => {
    if (!contract) return;
    
    setIsLoading(true);
    try {
      const historyData = await contract.methods.getAssetOwnershipHistory(assetId).call();
      const formattedHistory = historyData.map((item: any) => ({
        id: Number(item.id),
        assetId: Number(item.assetId),
        owner: item.owner,
        shares: web3.utils.fromWei(item.shares, 'ether'),
        timestamp: Number(item.timestamp),
        type: item.type
      }));
      
      setHistory(formattedHistory);
    } catch (error) {
      console.error("Error fetching ownership history:", error);
      toast.error("ไม่สามารถดึงประวัติความเป็นเจ้าของสินทรัพย์ได้");
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    history,
    isLoading,
    getHistory
  };
}; 