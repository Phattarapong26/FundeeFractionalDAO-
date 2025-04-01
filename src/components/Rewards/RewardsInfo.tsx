import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Coins, Gift, ArrowUpDown, Loader2, Calendar } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useRewards } from '@/hooks/useRewards';
import { formatNumber } from '@/lib/utils';
import { toast } from 'sonner';

interface RewardHistory {
  id: number;
  amount: string;
  timestamp: number;
  type: 'reward' | 'dividend';
  assetId: number;
}

interface DividendHistory {
  id: number;
  amount: string;
  timestamp: number;
  assetId: number;
  totalShares: string;
}

export const RewardsInfo = () => {
  const { account } = useWeb3();
  const { 
    totalRewards, 
    availableRewards, 
    totalDividends, 
    availableDividends, 
    isLoading, 
    claimRewards, 
    claimDividends,
    getRewardHistory,
    getDividendHistory
  } = useRewards();
  
  const [rewardHistory, setRewardHistory] = useState<RewardHistory[]>([]);
  const [dividendHistory, setDividendHistory] = useState<DividendHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  useEffect(() => {
    if (!account) return;
    
    const fetchHistory = async () => {
      setHistoryLoading(true);
      try {
        const [rewards, dividends] = await Promise.all([
          getRewardHistory(),
          getDividendHistory()
        ]);
        setRewardHistory(rewards);
        setDividendHistory(dividends);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setHistoryLoading(false);
      }
    };
    
    fetchHistory();
  }, [account]);
  
  const handleClaimRewards = async () => {
    if (!availableRewards || Number(availableRewards) <= 0) {
      toast.error("ไม่มี rewards ที่สามารถถอนได้");
      return;
    }
    
    await claimRewards();
  };
  
  const handleClaimDividends = async () => {
    if (!availableDividends || Number(availableDividends) <= 0) {
      toast.error("ไม่มี dividends ที่สามารถถอนได้");
      return;
    }
    
    await claimDividends();
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
            <div className="bg-green-100 p-2 rounded-full">
              <Gift className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle>Rewards & Dividends</CardTitle>
              <CardDescription>รายได้จากการลงทุนของคุณ</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Rewards ทั้งหมด</p>
              <p className="text-2xl font-bold">{formatNumber(totalRewards)} ETH</p>
              <p className="text-xs text-gray-500">ยอดที่ถอนได้: {formatNumber(availableRewards)} ETH</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Dividends ทั้งหมด</p>
              <p className="text-2xl font-bold">{formatNumber(totalDividends)} ETH</p>
              <p className="text-xs text-gray-500">ยอดที่ถอนได้: {formatNumber(availableDividends)} ETH</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              className="flex items-center gap-2"
              onClick={handleClaimRewards}
              disabled={isLoading || !availableRewards || Number(availableRewards) <= 0}
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> กำลังประมวลผล...</>
              ) : (
                <>
                  <Coins className="w-4 h-4" />
                  ถอน Rewards
                </>
              )}
            </Button>
            
            <Button 
              className="flex items-center gap-2"
              onClick={handleClaimDividends}
              disabled={isLoading || !availableDividends || Number(availableDividends) <= 0}
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> กำลังประมวลผล...</>
              ) : (
                <>
                  <ArrowUpDown className="w-4 h-4" />
                  ถอน Dividends
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            ประวัติ Rewards
          </CardTitle>
          <CardDescription>
            ประวัติการได้รับ rewards และ dividends
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {rewardHistory.map((reward) => (
                <div key={reward.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {reward.type === 'reward' ? 'Reward' : 'Dividend'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(reward.timestamp * 1000).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                  <p className="font-medium">{formatNumber(reward.amount)} ETH</p>
                </div>
              ))}
              
              {rewardHistory.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  ไม่มีประวัติ rewards หรือ dividends
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}; 