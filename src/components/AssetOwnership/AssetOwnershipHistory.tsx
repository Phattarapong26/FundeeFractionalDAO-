import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { History, Loader2, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAssetOwnershipHistory } from '@/hooks/useAssetOwnershipHistory';
import { formatNumber } from '@/lib/utils';
import { useParams } from 'react-router-dom';

export const AssetOwnershipHistory = () => {
  const { id } = useParams<{ id: string }>();
  const { history, isLoading, getHistory } = useAssetOwnershipHistory();
  
  useEffect(() => {
    if (id) {
      getHistory(Number(id));
    }
  }, [id]);
  
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <ArrowUpRight className="w-5 h-5 text-green-500" />;
      case 'sale':
        return <ArrowDownRight className="w-5 h-5 text-red-500" />;
      case 'transfer':
        return <ArrowRight className="w-5 h-5 text-blue-500" />;
      default:
        return <History className="w-5 h-5 text-gray-500" />;
    }
  };
  
  const getTransactionText = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'ซื้อ';
      case 'sale':
        return 'ขาย';
      case 'transfer':
        return 'โอน';
      default:
        return 'ธุรกรรม';
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            ประวัติความเป็นเจ้าของ
          </CardTitle>
          <CardDescription>
            ประวัติการซื้อ ขาย และโอนความเป็นเจ้าของสินทรัพย์
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(item.type)}
                    <div>
                      <p className="font-medium">
                        {getTransactionText(item.type)} {formatNumber(item.shares)} ส่วน
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(item.timestamp * 1000).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {item.owner.slice(0, 6)}...{item.owner.slice(-4)}
                  </p>
                </div>
              ))}
              
              {history.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  ไม่มีประวัติความเป็นเจ้าของสินทรัพย์
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}; 