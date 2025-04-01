import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWeb3 } from '@/hooks/useWeb3';
import { toast } from 'sonner';

export const FeeInfo = () => {
  const { contract, account } = useWeb3();

  const handlePayFee = async () => {
    if (!contract || !account) {
      toast.error("กรุณาเชื่อมต่อวอลเล็ตก่อน");
      return;
    }

    try {
      const feeAmount = await contract.methods.getFeeAmount().call();
      await contract.methods.payFee().send({ from: account, value: feeAmount });
      toast.success("จ่ายค่าธรรมเนียมสำเร็จ");
    } catch (error) {
      console.error("Error paying fee:", error);
      toast.error("ไม่สามารถจ่ายค่าธรรมเนียมได้");
    }
  };

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
              <span className="font-medium">0.01 ETH</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">ค่าธรรมเนียมการซื้อขาย</span>
              <span className="font-medium">0.5%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">ค่าธรรมเนียมการโหวต</span>
              <span className="font-medium">0.001 ETH</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ประวัติการจ่ายค่าธรรมเนียม</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <div>
                <p className="font-medium">ค่าธรรมเนียมการสร้างสินทรัพย์</p>
                <p className="text-sm text-gray-500">2024-03-31 15:30</p>
              </div>
              <p className="font-mono">0.01 ETH</p>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <div>
                <p className="font-medium">ค่าธรรมเนียมการโหวต</p>
                <p className="text-sm text-gray-500">2024-03-31 14:20</p>
              </div>
              <p className="font-mono">0.001 ETH</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 