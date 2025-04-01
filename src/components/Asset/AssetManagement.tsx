import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit2, History, TrendingUp, DollarSign, PieChart, Settings, Loader2 } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNavigate, useParams } from 'react-router-dom';
import { formatNumber } from '@/lib/utils';
import { toast } from 'sonner';
import { useAssetManagement } from '@/hooks/useAssetManagement';

interface AssetSaleHistory {
  assetId: number;
  assetName: string;
  saleValue: number;
  timestamp: number;
  distributionDetails: {
    address: string;
    shares: number;
    amount: number;
  }[];
}

interface SaleHistory {
  id: number;
  shares: string;
  price: string;
  timestamp: number;
  buyer: string;
}

export const AssetManagement = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    assetValue, 
    totalShares, 
    availableShares, 
    isLoading, 
    updateAssetValue,
    sellAsset,
    getSaleHistory
  } = useAssetManagement(Number(id));
  
  const [newValue, setNewValue] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [saleHistory, setSaleHistory] = useState<SaleHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  useEffect(() => {
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
  }, [id]);
  
  const handleUpdateValue = async () => {
    if (!newValue || Number(newValue) <= 0) {
      toast.error("กรุณากรอกมูลค่าที่ถูกต้อง");
      return;
    }
    
    await updateAssetValue(newValue);
    setNewValue('');
  };
  
  const handleSellAsset = async () => {
    if (!sellAmount || Number(sellAmount) <= 0) {
      toast.error("กรุณากรอกจำนวนส่วนที่ถูกต้อง");
      return;
    }
    
    await sellAsset(Number(sellAmount));
    setSellAmount('');
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            จัดการสินทรัพย์
          </CardTitle>
          <CardDescription>
            อัปเดตมูลค่าและขายสินทรัพย์
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <p className="text-sm text-gray-500">มูลค่าสินทรัพย์</p>
              </div>
              <p className="text-2xl font-bold">{formatNumber(assetValue)} ETH</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <PieChart className="w-5 h-5 text-blue-500" />
                <p className="text-sm text-gray-500">จำนวนส่วนทั้งหมด</p>
              </div>
              <p className="text-2xl font-bold">{formatNumber(totalShares)}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <PieChart className="w-5 h-5 text-orange-500" />
                <p className="text-sm text-gray-500">จำนวนส่วนที่ขายได้</p>
              </div>
              <p className="text-2xl font-bold">{formatNumber(availableShares)}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">อัปเดตมูลค่าสินทรัพย์</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="กรอกมูลค่าใหม่"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleUpdateValue}
                  disabled={isLoading || !newValue}
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> กำลังอัปเดต...</>
                  ) : (
                    'อัปเดตมูลค่า'
                  )}
                </Button>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-2">ขายสินทรัพย์</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="กรอกจำนวนส่วนที่ต้องการขาย"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSellAsset}
                  disabled={isLoading || !sellAmount}
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> กำลังขาย...</>
                  ) : (
                    'ขายสินทรัพย์'
                  )}
                </Button>
              </div>
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
            ประวัติการขายสินทรัพย์
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
                <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      ขาย {formatNumber(sale.shares)} ส่วน
                    </p>
                    <p className="text-sm text-gray-500">
                      ราคา {formatNumber(sale.price)} ETH
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(sale.timestamp * 1000).toLocaleDateString('th-TH')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {sale.buyer.slice(0, 6)}...{sale.buyer.slice(-4)}
                    </p>
                  </div>
                </div>
              ))}
              
              {saleHistory.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  ไม่มีประวัติการขายสินทรัพย์
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}; 