import { useState, useEffect } from 'react';
import { useWeb3 } from '@/hooks/useWeb3';
import { getPlatformTokenContract, getTokenBalance } from '@/lib/contract/platformToken';
import { toast } from 'sonner';

export interface PlatformTokenData {
  balance: number;
  loading: boolean;
  buyTokens: (amount: string) => Promise<void>;
  refetch: () => Promise<void>;
  tokenAddress: string;
}

export const usePlatformToken = (): PlatformTokenData => {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const { account, web3 } = useWeb3();

  const fetchBalance = async () => {
    if (!web3 || !account) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const tokenContract = getPlatformTokenContract(web3);
      
      if (!tokenContract) {
        console.error("Failed to initialize token contract");
        setLoading(false);
        return;
      }

      const tokenBalance = await getTokenBalance(tokenContract, account);
      setBalance(Number(tokenBalance));
    } catch (error) {
      console.error("Error fetching token balance:", error);
      toast.error("Failed to fetch token balance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [web3, account]);

  const buyTokens = async (ethAmount: string) => {
    if (!web3 || !account) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setLoading(true);
      const tokenContract = getPlatformTokenContract(web3);
      
      if (!tokenContract) {
        toast.error("Failed to initialize token contract");
        return;
      }

      const weiAmount = web3.utils.toWei(ethAmount, 'ether');
      
      await tokenContract.methods.buyTokens().send({
        from: account,
        value: weiAmount,
        gas: 200000
      });
      
      toast.success("Tokens purchased successfully");
      await fetchBalance();
    } catch (error) {
      console.error("Error buying tokens:", error);
      toast.error(`Failed to buy tokens: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    balance,
    loading,
    buyTokens,
    refetch: fetchBalance,
    tokenAddress: ''
  };
};
