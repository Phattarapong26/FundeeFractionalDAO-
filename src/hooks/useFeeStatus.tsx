import { useState, useEffect } from 'react';
import { useWeb3 } from '@/hooks/useWeb3';
import { checkFeeStatus, payFeeWithETH, payFeeWithToken } from '@/lib/contract/contract';
import { CONTRACT_ADDRESS } from '@/config/contract';
import { approveTokenSpending, PLATFORM_TOKEN_ADDRESS } from '@/lib/contract/platformToken';
import { ERC20ABI } from '@/lib/contract/erc20Abi';
import { toast } from 'sonner';

export interface FeeStatusData {
  hasPaidFee: boolean;
  isLoading: boolean;
  payWithETH: () => Promise<boolean>;
  payWithToken: () => Promise<boolean>;
  refetch: () => Promise<void>;
}

export const useFeeStatus = (): FeeStatusData => {
  const [hasPaidFee, setHasPaidFee] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { web3, account, contract } = useWeb3();

  const fetchFeeStatus = async () => {
    if (!contract || !account) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const feeStatus = await checkFeeStatus(contract, account);
      setHasPaidFee(feeStatus);
    } catch (error) {
      console.error("Error checking fee status:", error);
      toast.error("Failed to check fee status");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeStatus();
  }, [contract, account]);

  const payWithETH = async (): Promise<boolean> => {
    if (!contract || !account) {
      toast.error("Wallet not connected");
      return false;
    }

    try {
      setIsLoading(true);
      await payFeeWithETH(contract, account);
      
      toast.success("Fee paid successfully with ETH");
      await fetchFeeStatus();
      return true;
    } catch (error) {
      console.error("Error paying fee with ETH:", error);
      toast.error("Failed to pay fee with ETH");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const payWithToken = async (): Promise<boolean> => {
    if (!contract || !account || !web3) {
      toast.error("Wallet not connected");
      return false;
    }

    try {
      setIsLoading(true);
      
      // First approve the token transfer
      const tokenContract = new web3.eth.Contract(
        ERC20ABI,
        PLATFORM_TOKEN_ADDRESS
      );
      
      // Get TOKEN_FEE value (0.022 ether equivalent in smallest units)
      const tokenFee = web3.utils.toWei('0.022', 'ether');
      
      // Approve spending
      await approveTokenSpending(tokenContract, CONTRACT_ADDRESS, tokenFee, account);
      
      // Pay the fee with token
      await payFeeWithToken(contract, account);
      
      toast.success("Fee paid successfully with platform tokens");
      await fetchFeeStatus();
      return true;
    } catch (error) {
      console.error("Error paying fee with token:", error);
      toast.error("Failed to pay fee with platform tokens");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    hasPaidFee,
    isLoading,
    payWithETH,
    payWithToken,
    refetch: fetchFeeStatus
  };
};
