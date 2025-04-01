import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coins, TrendingUp, Calendar, History } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { formatNumber } from '@/lib/utils';
import { toast } from 'sonner';

interface RewardHistory {
  assetId: number;
  assetName: string;
  amount: number;
  timestamp: number;
  type: 'reward' | 'dividend';
}

export const RewardsDashboard = () => {
  const [rewards, setRewards] = useState<RewardHistory[]>([]);
  const [totalRewards, setTotalRewards] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { account, contract } = useWeb3();
  const navigate = useNavigate();

  useEffect(() => {
    if (!account || !contract) return;
    fetchRewards();
  }, [account, contract]);

  const fetchRewards = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement contract calls to fetch rewards history
      // This is a placeholder for demonstration
      const mockRewards: RewardHistory[] = [
        {
          assetId: 1,
          assetName: "Sample Asset 1",
          amount: 0.05,
          timestamp: Date.now() - 86400000,
          type: 'reward'
        },
        {
          assetId: 2,
          assetName: "Sample Asset 2",
          amount: 0.1,
          timestamp: Date.now() - 172800000,
          type: 'dividend'
        }
      ];
      
      setRewards(mockRewards);
      setTotalRewards(mockRewards.reduce((sum, reward) => sum + reward.amount, 0));
    } catch (error) {
      console.error("Error fetching rewards:", error);
      toast.error("Failed to fetch rewards history");
    } finally {
      setIsLoading(false);
    }
  };

  if (!account) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center bg-white p-10 rounded-xl shadow-sm"
      >
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-gray-600 mb-6">
          Connect your wallet to view your rewards and dividends.
        </p>
        <Button onClick={() => navigate('/connect')}>
          Connect Wallet
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle>Total Rewards</CardTitle>
                <CardDescription>Lifetime earnings from investments</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(totalRewards)} ETH</div>
            <Progress value={75} className="mt-4" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Next Reward</CardTitle>
                <CardDescription>Estimated next reward distribution</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24h</div>
            <p className="text-sm text-gray-500">Based on your current investments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <Coins className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle>APY</CardTitle>
                <CardDescription>Average annual percentage yield</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8.5%</div>
            <p className="text-sm text-gray-500">Across all your investments</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-full">
              <History className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <CardTitle>Rewards History</CardTitle>
              <CardDescription>Your recent rewards and dividends</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading rewards history...</div>
          ) : rewards.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No rewards history found
            </div>
          ) : (
            <div className="space-y-4">
              {rewards.map((reward, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{reward.assetName}</h4>
                    <p className="text-sm text-gray-500">
                      {reward.type === 'reward' ? 'Reward' : 'Dividend'} •{' '}
                      {new Date(reward.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatNumber(reward.amount)} ETH</p>
                    <p className="text-sm text-gray-500">
                      {reward.type === 'reward' ? 'APY Reward' : 'Dividend Payment'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}; 