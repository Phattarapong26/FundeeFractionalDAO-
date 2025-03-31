
import { useState, useEffect } from 'react';
import { useWeb3 } from '@/hooks/useWeb3';
import { getUserShares } from '@/lib/contract/contract';
import { toast } from 'sonner';

export interface UserSharesData {
  totalShares: number;
  loading: boolean;
  refetch: () => Promise<void>;
}

export const useUserShares = (): UserSharesData => {
  const [totalShares, setTotalShares] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const { account, contract } = useWeb3();

  const fetchUserShares = async () => {
    if (!contract || !account) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const shares = await getUserShares(contract, account);
      setTotalShares(Number(shares));
    } catch (error) {
      console.error("Error fetching user shares:", error);
      toast.error("Failed to load your shares");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserShares();
  }, [contract, account]);

  return {
    totalShares,
    loading,
    refetch: fetchUserShares
  };
};
