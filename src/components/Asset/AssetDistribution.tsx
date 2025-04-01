import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useAssetDistribution } from '@/hooks/useAssetDistribution';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { Loader2, Users, DollarSign } from 'lucide-react';

export const AssetDistribution = () => {
  const { id } = useParams();
  const { 
    totalShares, 
    availableShares, 
    distributionHistory, 
    recipientAddress, 
    setRecipientAddress, 
    shareAmount, 
    setShareAmount, 
    distributeShares, 
    isLoading 
  } = useAssetDistribution(Number(id));
  
  const handleDistributeShares = async () => {
    if (!recipientAddress || !shareAmount || Number(shareAmount) <= 0) return;
    await distributeShares(recipientAddress, Number(shareAmount));
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>การกระจายหุ้น</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">จำนวนหุ้นทั้งหมด</p>
                <p className="text-2xl font-bold">
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    `${Number(totalShares).toLocaleString('th-TH')}`
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">หุ้นที่ยังไม่ถูกกระจาย</p>
                <p className="text-2xl font-bold">
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    `${Number(availableShares).toLocaleString('th-TH')}`
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">ที่อยู่ผู้รับ</label>
            <Input
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="ระบุที่อยู่ผู้รับ"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">จำนวนหุ้น</label>
            <div className="flex space-x-2">
              <Input
                type="number"
                value={shareAmount}
                onChange={(e) => setShareAmount(e.target.value)}
                placeholder="ระบุจำนวนหุ้น"
                disabled={isLoading}
              />
              <LoadingButton
                onClick={handleDistributeShares}
                isLoading={isLoading}
                disabled={!recipientAddress || !shareAmount || Number(shareAmount) <= 0}
              >
                กระจายหุ้น
              </LoadingButton>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">เวลา</th>
                  <th className="text-left">ผู้รับ</th>
                  <th className="text-right">จำนวนหุ้น</th>
                </tr>
              </thead>
              <tbody>
                {distributionHistory.map((item) => (
                  <tr key={item.timestamp}>
                    <td>{item.timestamp}</td>
                    <td>{item.recipient.slice(0, 6)}...{item.recipient.slice(-4)}</td>
                    <td className="text-right">{Number(item.amount).toLocaleString('th-TH')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}; 