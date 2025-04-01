import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWeb3 } from '@/hooks/useWeb3';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { formatEther } from 'web3-utils';

interface FeeHistory {
  feeType: string;
  amount: string;
  timestamp: number;
}

export const FeeInfo = () => {
  const { contract, account } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [fees, setFees] = useState({
    assetCreationFee: '0',
    tradingFee: '0',
    votingFee: '0'
  });
  const [feeHistory, setFeeHistory] = useState<FeeHistory[]>([]);

  // ดึงข้อมูลค่าธรรมเนียมจาก Smart Contract
  const fetchFees = async () => {
    if (!contract) return;

    try {
      const [assetCreationFee, tradingFee, votingFee] = await Promise.all([
        contract.methods.getAssetCreationFee().call(),
        contract.methods.getTradingFeePercentage().call(),
        contract.methods.getVotingFee().call()
      ]);

      setFees({
        assetCreationFee: formatEther(assetCreationFee),
        tradingFee: (Number(tradingFee) / 100).toString(), // แปลงจาก basis points เป็น %
        votingFee: formatEther(votingFee)
      });
    } catch (error) {
      console.error("Error fetching fees:", error);
      toast.error("ไม่สามารถดึงข้อมูลค่าธรรมเนียมได้");
    }
  };

  // ดึงประวัติการจ่ายค่าธรรมเนียม
  const fetchFeeHistory = async () => {
    if (!contract || !account) return;

    try {
      const events = await contract.getPastEvents('FeePaid', {
        filter: { payer: account },
        fromBlock: 0,
        toBlock: 'latest'
      });

      const history = events.map(event => ({
        feeType: event.returnValues.feeType,
        amount: formatEther(event.returnValues.amount),
        timestamp: Number(event.returnValues.timestamp) * 1000 // แปลงเป็น milliseconds
      }));

      setFeeHistory(history);
    } catch (error) {
      console.error("Error fetching fee history:", error);
      toast.error("ไม่สามารถดึงประวัติค่าธรรมเนียมได้");
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsFetching(true);
      await Promise.all([fetchFees(), fetchFeeHistory()]);
      setIsFetching(false);
    };

    init();
  }, [contract, account]);

  const handlePayFee = async () => {
    if (!contract || !account) {
      toast.error("กรุณาเชื่อมต่อวอลเล็ตก่อน");
      return;
    }

    setIsLoading(true);
    try {
      // Get fee amount
      const feeAmount = await contract.methods.getFeeAmount().call();
      
      // Estimate gas
      const gasEstimate = await contract.methods.payFee().estimateGas({ 
        from: account,
        value: feeAmount 
      });

      // Check balance
      const balance = await contract.web3.eth.getBalance(account);
      if (Number(balance) < Number(feeAmount)) {
        toast.error("ยอดเงินในวอลเล็ตไม่เพียงพอ");
        return;
      }

      // Send transaction
      await contract.methods.payFee().send({ 
        from: account, 
        value: feeAmount,
        gas: Math.round(gasEstimate * 1.2) // Add 20% buffer
      });

      // Refresh fee history
      await fetchFeeHistory();

      toast.success("จ่ายค่าธรรมเนียมสำเร็จ");
    } catch (error: any) {
      console.error("Error paying fee:", error);
      if (error.code === 4001) {
        toast.error("คุณได้ยกเลิกการทำรายการ");
      } else if (error.message.includes("gas")) {
        toast.error("ค่าแก๊สไม่เพียงพอ");
      } else {
        toast.error("ไม่สามารถจ่ายค่าธรรมเนียมได้");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>ค่าธรรมเนียมปัจจุบัน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">ค่าธรรมเนียมการสร้างสินทรัพย์</span>
              <span className="font-medium">{fees.assetCreationFee} ETH</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">ค่าธรรมเนียมการซื้อขาย</span>
              <span className="font-medium">{fees.tradingFee}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">ค่าธรรมเนียมการโหวต</span>
              <span className="font-medium">{fees.votingFee} ETH</span>
            </div>
            <Button 
              onClick={handlePayFee} 
              disabled={isLoading || !account}
              className="w-full mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังทำรายการ...
                </>
              ) : (
                'จ่ายค่าธรรมเนียม'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ประวัติการจ่ายค่าธรรมเนียม</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feeHistory.length === 0 ? (
              <p className="text-center text-gray-500">ไม่พบประวัติการจ่ายค่าธรรมเนียม</p>
            ) : (
              feeHistory.map((fee, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{fee.feeType}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(fee.timestamp).toLocaleString('th-TH')}
                    </p>
                  </div>
                  <p className="font-mono">{fee.amount} ETH</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 