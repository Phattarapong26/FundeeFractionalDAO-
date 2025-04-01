import { useState, useEffect } from 'react';
import { useWeb3 } from './useWeb3';
import { toast } from 'sonner';
import { Web3 } from 'web3';

interface AssetValuationData {
  currentValue: string;
  historicalValues: string[];
  isLoading: boolean;
  updateValue: (newValue: number) => Promise<void>;
  getHistoricalValues: () => Promise<void>;
}

export const useAssetValuation = (assetId: number): AssetValuationData => {
  const [currentValue, setCurrentValue] = useState('0');
  const [historicalValues, setHistoricalValues] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { contract } = useWeb3();
  const web3 = new Web3();
  
  const getCurrentValue = async () => {
    if (!contract) return;
    
    try {
      const valueWei = await contract.methods.getAssetValue(assetId).call();
      setCurrentValue(web3.utils.fromWei(valueWei, 'ether'));
    } catch (error) {
      console.error("Error fetching asset value:", error);
      toast.error("ไม่สามารถดึงมูลค่าสินทรัพย์ได้");
    }
  };
  
  const getHistoricalValues = async () => {
    if (!contract) return;
    
    try {
      const values = await contract.methods.getAssetValueHistory(assetId).call();
      setHistoricalValues(values.map((value: string) => web3.utils.fromWei(value, 'ether')));
    } catch (error) {
      console.error("Error fetching historical values:", error);
      toast.error("ไม่สามารถดึงประวัติมูลค่าสินทรัพย์ได้");
    }
  };
  
  useEffect(() => {
    if (contract) {
      getCurrentValue();
      getHistoricalValues();
    }
  }, [contract, assetId]);
  
  const updateValue = async (newValue: number) => {
    if (!contract) {
      toast.error("กรุณาเชื่อมต่อวอลเล็ตก่อน");
      return;
    }
    
    if (newValue <= 0) {
      toast.error("มูลค่าต้องมากกว่า 0");
      return;
    }
    
    setIsLoading(true);
    try {
      const valueWei = web3.utils.toWei(newValue.toString(), 'ether');
      await contract.methods.updateAssetValue(assetId, valueWei).send({
        from: contract.defaultAccount,
        gas: 3000000
      });
      
      toast.success("อัปเดตมูลค่าสินทรัพย์สำเร็จ");
      await getCurrentValue();
      await getHistoricalValues();
    } catch (error) {
      console.error("Error updating asset value:", error);
      toast.error("อัปเดตมูลค่าสินทรัพย์ไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    currentValue,
    historicalValues,
    isLoading,
    updateValue,
    getHistoricalValues
  };
}; 