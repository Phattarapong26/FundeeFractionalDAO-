import { useState, useEffect } from 'react';
import { useWeb3 } from './useWeb3';
import { toast } from 'sonner';
import { Web3 } from 'web3';

interface PlatformTokenData {
  balance: string;
  price: string;
  totalSupply: string;
  isLoading: boolean;
  buyTokens: (amount: number) => Promise<void>;
  payFeeWithToken: (amount: number) => Promise<void>;
}

export const usePlatformToken = (): PlatformTokenData => {
  const [balance, setBalance] = useState('0');
  const [price, setPrice] = useState('0');
  const [totalSupply, setTotalSupply] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  
  const { account, contract } = useWeb3();
  const web3 = new Web3();
  
  const fetchTokenData = async () => {
    if (!contract || !account) return;
    
    try {
      // ดึงยอดคงเหลือ
      const balanceWei = await contract.methods.getPlatformTokenBalance(account).call();
      setBalance(web3.utils.fromWei(balanceWei, 'ether'));
      
      // ดึงราคา token
      const priceWei = await contract.methods.getPlatformTokenPrice().call();
      setPrice(web3.utils.fromWei(priceWei, 'ether'));
      
      // ดึงจำนวน token ทั้งหมด
      const supplyWei = await contract.methods.getPlatformTokenTotalSupply().call();
      setTotalSupply(web3.utils.fromWei(supplyWei, 'ether'));
    } catch (error) {
      console.error("Error fetching platform token data:", error);
      toast.error("ไม่สามารถดึงข้อมูล token ได้");
    }
  };
  
  useEffect(() => {
    if (contract && account) {
      fetchTokenData();
    }
  }, [contract, account]);
  
  const buyTokens = async (amount: number) => {
    if (!contract || !account) {
      toast.error("กรุณาเชื่อมต่อวอลเล็ตก่อน");
      return;
    }
    
    setIsLoading(true);
    try {
      const weiAmount = web3.utils.toWei(amount.toString(), 'ether');
      const priceWei = await contract.methods.getPlatformTokenPrice().call();
      const totalCost = Number(weiAmount) * Number(priceWei);
      
      await contract.methods.buyPlatformTokens(weiAmount).send({
        from: account,
        value: totalCost.toString(),
        gas: 3000000
      });
      
      toast.success("ซื้อ token สำเร็จ");
      await fetchTokenData();
    } catch (error) {
      console.error("Error buying platform tokens:", error);
      toast.error("ซื้อ token ไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };
  
  const payFeeWithToken = async (amount: number) => {
    if (!contract || !account) {
      toast.error("กรุณาเชื่อมต่อวอลเล็ตก่อน");
      return;
    }
    
    setIsLoading(true);
    try {
      const weiAmount = web3.utils.toWei(amount.toString(), 'ether');
      
      await contract.methods.payFeeWithToken(weiAmount).send({
        from: account,
        gas: 3000000
      });
      
      toast.success("จ่ายค่าธรรมเนียมสำเร็จ");
      await fetchTokenData();
    } catch (error) {
      console.error("Error paying fee with token:", error);
      toast.error("จ่ายค่าธรรมเนียมไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    balance,
    price,
    totalSupply,
    isLoading,
    buyTokens,
    payFeeWithToken
  };
};
