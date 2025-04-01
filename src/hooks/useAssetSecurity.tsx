import { useState, useEffect } from 'react';
import { useWeb3 } from './useWeb3';
import { toast } from 'sonner';
import { Web3 } from 'web3';

interface SecurityData {
  securityLevel: string;
  securitySettings: {
    requireApproval: boolean;
    maxTransactionAmount: string;
    cooldownPeriod: number;
    whitelistEnabled: boolean;
  };
  whitelistedAddresses: string[];
  isLoading: boolean;
  updateSecuritySettings: (settings: {
    requireApproval: boolean;
    maxTransactionAmount: number;
    cooldownPeriod: number;
    whitelistEnabled: boolean;
  }) => Promise<void>;
  addToWhitelist: (address: string) => Promise<void>;
  removeFromWhitelist: (address: string) => Promise<void>;
  getSecurityHistory: () => Promise<void>;
}

export const useAssetSecurity = (assetId: number): SecurityData => {
  const [securityLevel, setSecurityLevel] = useState('Low');
  const [securitySettings, setSecuritySettings] = useState({
    requireApproval: false,
    maxTransactionAmount: '0',
    cooldownPeriod: 0,
    whitelistEnabled: false
  });
  const [whitelistedAddresses, setWhitelistedAddresses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { contract } = useWeb3();
  const web3 = new Web3();
  
  const getSecuritySettings = async () => {
    if (!contract) return;
    
    try {
      const settings = await contract.methods.getSecuritySettings(assetId).call();
      setSecuritySettings({
        requireApproval: settings.requireApproval,
        maxTransactionAmount: web3.utils.fromWei(settings.maxTransactionAmount, 'ether'),
        cooldownPeriod: Number(settings.cooldownPeriod),
        whitelistEnabled: settings.whitelistEnabled
      });
      
      // คำนวณระดับความปลอดภัย
      const level = calculateSecurityLevel(settings);
      setSecurityLevel(level);
    } catch (error) {
      console.error("Error fetching security settings:", error);
      toast.error("ไม่สามารถดึงการตั้งค่าความปลอดภัยได้");
    }
  };
  
  const getWhitelist = async () => {
    if (!contract) return;
    
    try {
      const addresses = await contract.methods.getWhitelist(assetId).call();
      setWhitelistedAddresses(addresses);
    } catch (error) {
      console.error("Error fetching whitelist:", error);
      toast.error("ไม่สามารถดึงรายชื่อที่อนุญาตได้");
    }
  };
  
  useEffect(() => {
    if (contract) {
      getSecuritySettings();
      getWhitelist();
    }
  }, [contract, assetId]);
  
  const calculateSecurityLevel = (settings: any): string => {
    let score = 0;
    
    if (settings.requireApproval) score += 2;
    if (Number(settings.maxTransactionAmount) > 0) score += 2;
    if (Number(settings.cooldownPeriod) > 0) score += 1;
    if (settings.whitelistEnabled) score += 2;
    
    if (score >= 6) return 'High';
    if (score >= 3) return 'Medium';
    return 'Low';
  };
  
  const updateSecuritySettings = async (settings: {
    requireApproval: boolean;
    maxTransactionAmount: number;
    cooldownPeriod: number;
    whitelistEnabled: boolean;
  }) => {
    if (!contract) {
      toast.error("กรุณาเชื่อมต่อวอลเล็ตก่อน");
      return;
    }
    
    setIsLoading(true);
    try {
      const maxAmountWei = web3.utils.toWei(settings.maxTransactionAmount.toString(), 'ether');
      await contract.methods.updateSecuritySettings(
        assetId,
        settings.requireApproval,
        maxAmountWei,
        settings.cooldownPeriod,
        settings.whitelistEnabled
      ).send({
        from: contract.defaultAccount,
        gas: 3000000
      });
      
      toast.success("อัปเดตการตั้งค่าความปลอดภัยสำเร็จ");
      await getSecuritySettings();
    } catch (error) {
      console.error("Error updating security settings:", error);
      toast.error("อัปเดตการตั้งค่าความปลอดภัยไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };
  
  const addToWhitelist = async (address: string) => {
    if (!contract) {
      toast.error("กรุณาเชื่อมต่อวอลเล็ตก่อน");
      return;
    }
    
    if (!web3.utils.isAddress(address)) {
      toast.error("ที่อยู่ไม่ถูกต้อง");
      return;
    }
    
    setIsLoading(true);
    try {
      await contract.methods.addToWhitelist(assetId, address).send({
        from: contract.defaultAccount,
        gas: 3000000
      });
      
      toast.success("เพิ่มที่อยู่ในรายชื่อที่อนุญาตสำเร็จ");
      await getWhitelist();
    } catch (error) {
      console.error("Error adding to whitelist:", error);
      toast.error("เพิ่มที่อยู่ในรายชื่อที่อนุญาตไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };
  
  const removeFromWhitelist = async (address: string) => {
    if (!contract) {
      toast.error("กรุณาเชื่อมต่อวอลเล็ตก่อน");
      return;
    }
    
    setIsLoading(true);
    try {
      await contract.methods.removeFromWhitelist(assetId, address).send({
        from: contract.defaultAccount,
        gas: 3000000
      });
      
      toast.success("ลบที่อยู่จากรายชื่อที่อนุญาตสำเร็จ");
      await getWhitelist();
    } catch (error) {
      console.error("Error removing from whitelist:", error);
      toast.error("ลบที่อยู่จากรายชื่อที่อนุญาตไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    securityLevel,
    securitySettings,
    whitelistedAddresses,
    isLoading,
    updateSecuritySettings,
    addToWhitelist,
    removeFromWhitelist
  };
}; 