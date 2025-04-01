import { useState, useEffect } from 'react';
import { useWeb3 } from './useWeb3';
import { getContract } from '@/lib/contract/contract';

interface SecuritySettings {
  securityLevel: number;
  requiredApprovals: number;
  maxTransactionsPerDay: number;
  transactionCooldown: number;
  whitelistEnabled: boolean;
}

export const useAssetSecurity = (id: string | undefined) => {
  const { web3, contract } = useWeb3();
  const [securityLevel, setSecurityLevel] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSecurityLevel = async () => {
      if (!id || !contract) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const settings = await contract.methods.getSecuritySettings(id).call();
        setSecurityLevel(parseInt(settings.securityLevel));
      } catch (err) {
        console.error('Error fetching security level:', err);
        setError('ไม่สามารถดึงข้อมูลระดับความปลอดภัยได้');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSecurityLevel();
  }, [id, contract]);

  return { securityLevel, isLoading, error };
}; 