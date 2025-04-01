import { useState, useEffect } from 'react';
import { useWeb3 } from './useWeb3';
import { toast } from 'sonner';
import { Web3 } from 'web3';

interface AssetManagementData {
  assetValue: string;
  totalShares: string;
  availableShares: string;
  isLoading: boolean;
  updateAssetValue: (newValue: string) => Promise<void>;
  sellAsset: (shares: number) => Promise<void>;
  getSaleHistory: () => Promise<SaleHistory[]>;
}

interface SaleHistory {
  id: number;
  shares: string;
  price: string;
  timestamp: number;
  buyer: string;
}

export const useAssetManagement = (assetId: number): AssetManagementData => {
  const [assetValue, setAssetValue] = useState('0');
  const [totalShares, setTotalShares] = useState('0');
  const [availableShares, setAvailableShares] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  
  const { contract } = useWeb3();
  const web3 = new Web3();
  
  const fetchAssetData = async () => {
    if (!contract) return;
    
    try {
      // ดึงมูลค่าสินทรัพย์
      const valueWei = await contract.methods.getAssetValue(assetId).call();
      setAssetValue(web3.utils.fromWei(valueWei, 'ether'));
      
      // ดึงจำนวนส่วนทั้งหมด
      const sharesWei = await contract.methods.getTotalShares(assetId).call();
      setTotalShares(web3.utils.fromWei(sharesWei, 'ether'));
      
      // ดึงจำนวนส่วนที่ขายได้
      const availableWei = await contract.methods.getAvailableShares(assetId).call();
      setAvailableShares(web3.utils.fromWei(availableWei, 'ether'));
    } catch (error) {
      console.error("Error fetching asset data:", error);
      toast.error("ไม่สามารถดึงข้อมูลสินทรัพย์ได้");
    }
  };
  
  useEffect(() => {
    if (contract) {
      fetchAssetData();
    }
  }, [contract, assetId]);
  
  const updateAssetValue = async (newValue: string) => {
    if (!contract) {
      toast.error("กรุณาเชื่อมต่อวอลเล็ตก่อน");
      return;
    }
    
    setIsLoading(true);
    try {
      const valueWei = web3.utils.toWei(newValue, 'ether');
      await contract.methods.updateAssetValue(assetId, valueWei).send({
        from: contract.defaultAccount,
        gas: 3000000
      });
      
      toast.success("อัปเดตมูลค่าสินทรัพย์สำเร็จ");
      await fetchAssetData();
    } catch (error) {
      console.error("Error updating asset value:", error);
      toast.error("อัปเดตมูลค่าสินทรัพย์ไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };
  
  const sellAsset = async (shares: number) => {
    if (!contract) {
      toast.error("กรุณาเชื่อมต่อวอลเล็ตก่อน");
      return;
    }
    
    if (shares <= 0) {
      toast.error("จำนวนส่วนต้องมากกว่า 0");
      return;
    }
    
    if (Number(availableShares) < shares) {
      toast.error("จำนวนส่วนไม่เพียงพอ");
      return;
    }
    
    setIsLoading(true);
    try {
      const sharesWei = web3.utils.toWei(shares.toString(), 'ether');
      await contract.methods.sellAsset(assetId, sharesWei).send({
        from: contract.defaultAccount,
        gas: 3000000
      });
      
      toast.success("ขายสินทรัพย์สำเร็จ");
      await fetchAssetData();
    } catch (error) {
      console.error("Error selling asset:", error);
      toast.error("ขายสินทรัพย์ไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };
  
  const getSaleHistory = async (): Promise<SaleHistory[]> => {
    if (!contract) return [];
    
    try {
      const history = await contract.methods.getAssetSaleHistory(assetId).call();
      return history.map((item: any) => ({
        id: Number(item.id),
        shares: web3.utils.fromWei(item.shares, 'ether'),
        price: web3.utils.fromWei(item.price, 'ether'),
        timestamp: Number(item.timestamp),
        buyer: item.buyer
      }));
    } catch (error) {
      console.error("Error fetching sale history:", error);
      toast.error("ไม่สามารถดึงประวัติการขายสินทรัพย์ได้");
      return [];
    }
  };
  
  return {
    assetValue,
    totalShares,
    availableShares,
    isLoading,
    updateAssetValue,
    sellAsset,
    getSaleHistory
  };
}; 