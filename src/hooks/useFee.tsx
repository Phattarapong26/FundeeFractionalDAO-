import { useState, useEffect } from 'react';
import { useWeb3 } from './useWeb3';
import { toast } from 'sonner';
import { Web3 } from 'web3';

interface FeeData {
  feeAmount: string;
  feeStatus: boolean;
  isLoading: boolean;
  payFee: () => Promise<void>;
  getFeeHistory: () => Promise<FeeHistory[]>;
}

interface FeeHistory {
  id: number;
  amount: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}

export const useFee = (): FeeData => {
  const [feeAmount, setFeeAmount] = useState('0');
  const [feeStatus, setFeeStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { account, contract } = useWeb3();
  const web3 = new Web3();
  
  const fetchFeeData = async () => {
    if (!contract || !account) return;
    
    try {
      // ดึงจำนวนค่าธรรมเนียม
      const amountWei = await contract.methods.getFeeAmount().call();
      setFeeAmount(web3.utils.fromWei(amountWei, 'ether'));
      
      // ดึงสถานะการจ่ายค่าธรรมเนียม
      const status = await contract.methods.getFeeStatus(account).call();
      setFeeStatus(status);
    } catch (error) {
      console.error("Error fetching fee data:", error);
      toast.error("ไม่สามารถดึงข้อมูลค่าธรรมเนียมได้");
    }
  };
  
  useEffect(() => {
    if (contract && account) {
      fetchFeeData();
    }
  }, [contract, account]);
  
  const payFee = async () => {
    if (!contract || !account) {
      toast.error("กรุณาเชื่อมต่อวอลเล็ตก่อน");
      return;
    }
    
    if (feeStatus) {
      toast.error("คุณได้จ่ายค่าธรรมเนียมแล้ว");
      return;
    }
    
    setIsLoading(true);
    try {
      await contract.methods.payFee().send({
        from: account,
        gas: 3000000
      });
      
      toast.success("จ่ายค่าธรรมเนียมสำเร็จ");
      await fetchFeeData();
    } catch (error) {
      console.error("Error paying fee:", error);
      toast.error("จ่ายค่าธรรมเนียมไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };
  
  const getFeeHistory = async (): Promise<FeeHistory[]> => {
    if (!contract || !account) return [];
    
    try {
      const history = await contract.methods.getFeeHistory(account).call();
      return history.map((item: any) => ({
        id: Number(item.id),
        amount: web3.utils.fromWei(item.amount, 'ether'),
        timestamp: Number(item.timestamp),
        status: item.status
      }));
    } catch (error) {
      console.error("Error fetching fee history:", error);
      toast.error("ไม่สามารถดึงประวัติการจ่ายค่าธรรมเนียมได้");
      return [];
    }
  };
  
  return {
    feeAmount,
    feeStatus,
    isLoading,
    payFee,
    getFeeHistory
  };
}; 