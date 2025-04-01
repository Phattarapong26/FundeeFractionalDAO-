import { useState, useEffect } from 'react';
import { useWeb3 } from './useWeb3';
import { toast } from 'sonner';
import { Web3 } from 'web3';

interface AssetTradingData {
  price: string;
  volume: string;
  isLoading: boolean;
  buyAsset: (shares: number) => Promise<void>;
  getPrice: () => Promise<void>;
  getVolume: () => Promise<void>;
}

export const useAssetTrading = (assetId: number): AssetTradingData => {
  const [price, setPrice] = useState('0');
  const [volume, setVolume] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  
  const { contract } = useWeb3();
  const web3 = new Web3();
  
  const getPrice = async () => {
    if (!contract) return;
    
    try {
      const priceWei = await contract.methods.getAssetPrice(assetId).call();
      setPrice(web3.utils.fromWei(priceWei, 'ether'));
    } catch (error) {
      console.error("Error fetching asset price:", error);
      toast.error("ไม่สามารถดึงราคาสินทรัพย์ได้");
    }
  };
  
  const getVolume = async () => {
    if (!contract) return;
    
    try {
      const volumeWei = await contract.methods.getAssetVolume(assetId).call();
      setVolume(web3.utils.fromWei(volumeWei, 'ether'));
    } catch (error) {
      console.error("Error fetching asset volume:", error);
      toast.error("ไม่สามารถดึงปริมาณการซื้อขายได้");
    }
  };
  
  useEffect(() => {
    if (contract) {
      getPrice();
      getVolume();
    }
  }, [contract, assetId]);
  
  const buyAsset = async (shares: number) => {
    if (!contract) {
      toast.error("กรุณาเชื่อมต่อวอลเล็ตก่อน");
      return;
    }
    
    if (shares <= 0) {
      toast.error("จำนวนส่วนต้องมากกว่า 0");
      return;
    }
    
    setIsLoading(true);
    try {
      const sharesWei = web3.utils.toWei(shares.toString(), 'ether');
      await contract.methods.buyAsset(assetId, sharesWei).send({
        from: contract.defaultAccount,
        gas: 3000000
      });
      
      toast.success("ซื้อสินทรัพย์สำเร็จ");
      await getPrice();
      await getVolume();
    } catch (error) {
      console.error("Error buying asset:", error);
      toast.error("ซื้อสินทรัพย์ไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    price,
    volume,
    isLoading,
    buyAsset,
    getPrice,
    getVolume
  };
}; 