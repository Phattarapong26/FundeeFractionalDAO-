import { useState, useEffect } from 'react';
import { useWeb3 } from '@/hooks/useWeb3';
import { toast } from 'sonner';

export const useWallet = () => {
  const { contract, account } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    const checkWallet = async () => {
      if (!account) {
        setWalletAddress(null);
        return;
      }

      try {
        setIsLoading(true);
        setWalletAddress(account);
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการตรวจสอบ wallet:', error);
        toast.error('ไม่สามารถตรวจสอบ wallet ได้');
      } finally {
        setIsLoading(false);
      }
    };

    checkWallet();
  }, [account]);

  return {
    walletAddress,
    isLoading,
    isConnected: !!walletAddress
  };
}; 