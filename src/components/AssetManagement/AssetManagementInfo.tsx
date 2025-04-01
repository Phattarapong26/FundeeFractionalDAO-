import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Building2, DollarSign, Loader2, History, ArrowUpDown } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAssetManagement } from '@/hooks/useAssetManagement';
import { formatNumber } from '@/lib/utils';
import { toast } from 'sonner';

interface SaleHistory {
  id: number;
  amount: string;
  price: string;
  timestamp: number;
  buyer: string;
}

interface AssetManagementInfoProps {
  assetId: number;
}

export const AssetManagementInfo = ({ assetId }: AssetManagementInfoProps) => {
  const { account } = useWeb3();
  const { 
    assetValue, 
    totalShares, 
    availableShares, 
    isLoading, 
    updateAssetValue, 
    sellAsset,
    getSaleHistory
  } = useAssetManagement(assetId);
  
  const [newValue, setNewValue] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [saleHistory, setSaleHistory] = useState<SaleHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  useEffect(() => {
    if (!account) return;
    
    const fetchHistory = async () => {
      setHistoryLoading(true);
      try {
        const history = await getSaleHistory();
        setSaleHistory(history);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setHistoryLoading(false);
      }
    };
    
    fetchHistory();
  }, [account]);
  
  const handleUpdateValue = async () => {
    if (!newValue || Number(newValue) <= 0) {
      toast.error("กรุณากรอกมูลค่าที่ถูกต้อง");
      return;
    }
    
    await updateAssetValue(newValue);
    setNewValue('');
  };
  
  const handleSellAsset = async () => {
    if (!sellAmount || !sellPrice || Number(sellAmount) <= 0 || Number(sellPrice) <= 0) {
      toast.error("กรุณากรอกจำนวนและราคาที่ถูกต้อง");
      return;
    }
    
    await sellAsset(sellAmount, sellPrice);
    setSellAmount('');
    setSellPrice('');
  };
  
  if (!account) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>จัดการสินทรัพย์</CardTitle>
              <CardDescription>อัปเดตมูลค่าและขายสินทรัพย์</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">มูลค่าสินทรัพย์</p>
              <p className="text-2xl font-bold">{formatNumber(assetValue)} ETH</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">จำนวนหุ้นทั้งหมด</p>
              <p className="text-2xl font-bold">{formatNumber(totalShares)} หุ้น</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">จำนวนหุ้นที่ขายได้</p>
              <p className="text-2xl font-bold">{formatNumber(availableShares)} หุ้น</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label>อัปเดตมูลค่าสินทรัพย์</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="มูลค่าใหม่ (ETH)"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleUpdateValue}
                  disabled={isLoading || !newValue}
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> กำลังประมวลผล...</>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-2" />
                      อัปเดต
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div>
              <Label>ขายสินทรัพย์</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                <Input
                  type="number"
                  placeholder="จำนวนหุ้น"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  disabled={isLoading}
                />
                <Input
                  type="number"
                  placeholder="ราคาต่อหุ้น (ETH)"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button 
                className="w-full"
                onClick={handleSellAsset}
                disabled={isLoading || !sellAmount || !sellPrice}
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> กำลังประมวลผล...</>
                ) : (
                  <>
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    ขายสินทรัพย์
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            ประวัติการขาย
          </CardTitle>
          <CardDescription>
            ประวัติการขายสินทรัพย์ทั้งหมด
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {saleHistory.map((sale) => (
                <div key={sale.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      ขาย {formatNumber(sale.amount)} หุ้น
                    </p>
                    <p className="text-sm text-gray-500">
                      ราคา {formatNumber(sale.price)} ETH ต่อหุ้น
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(sale.timestamp * 1000).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                  <p className="font-medium">
                    {formatNumber(Number(sale.amount) * Number(sale.price))} ETH
                  </p>
                </div>
              ))}
              
              {saleHistory.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  ไม่มีประวัติการขาย
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}; 