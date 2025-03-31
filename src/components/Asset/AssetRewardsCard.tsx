
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, ArrowDown, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAssetRewards } from '@/hooks/useAssetRewards';
import { formatTokenValue, formatNumber, formatDate } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface AssetRewardsCardProps {
  assetId: number;
  assetName: string;
  isCreator: boolean;
}

export const AssetRewardsCard = ({ assetId, assetName, isCreator }: AssetRewardsCardProps) => {
  const [dividendAmount, setDividendAmount] = useState('0.01');
  const { rewardInfo, isLoading, distributeRewards, distributeDividends } = useAssetRewards(assetId);

  if (!assetId) {
    return null;
  }

  const handleDistributeRewards = async () => {
    await distributeRewards();
  };

  const handleDistributeDividends = async () => {
    await distributeDividends(dividendAmount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-6"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-blue-100 p-2 rounded-full">
              <Coins className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>Asset Rewards</CardTitle>
              <CardDescription>Distribute rewards and dividends for {assetName}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <>
              {rewardInfo?.assetSold ? (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Asset Sold</AlertTitle>
                  <AlertDescription>
                    This asset has been sold and is no longer available for rewards or dividends.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Total Rewards Paid</p>
                      <p className="text-xl font-semibold">
                        {rewardInfo ? `${formatTokenValue(rewardInfo.totalRewardsPaid)} ETH` : 'N/A'}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Last Reward Distribution</p>
                      <p className="text-xl font-semibold">
                        {rewardInfo?.lastRewardTimestamp && rewardInfo.lastRewardTimestamp > 0 
                          ? formatDate(new Date(rewardInfo.lastRewardTimestamp * 1000))
                          : 'Never'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Distribute Rewards & Dividends</h4>
                    
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Daily Rewards based on APY</p>
                        <Button 
                          onClick={handleDistributeRewards}
                          disabled={isLoading || !isCreator || !rewardInfo}
                          className="w-full"
                        >
                          {isLoading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                          ) : (
                            <>Distribute Daily Rewards</>
                          )}
                        </Button>
                        {!isCreator && (
                          <p className="text-xs text-gray-500 mt-1">
                            Only the asset creator can distribute rewards
                          </p>
                        )}
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm font-medium mb-2">Distribute Dividends</p>
                        <div className="space-y-2">
                          <div className="flex gap-4">
                            <div className="flex-grow">
                              <Input
                                type="number"
                                value={dividendAmount}
                                onChange={(e) => setDividendAmount(e.target.value)}
                                placeholder="ETH amount"
                                min="0.001"
                                step="0.001"
                              />
                            </div>
                            <Button 
                              onClick={handleDistributeDividends}
                              disabled={isLoading || !isCreator || !rewardInfo}
                            >
                              {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>Distribute</>
                              )}
                            </Button>
                          </div>
                          {!isCreator && (
                            <p className="text-xs text-gray-500">
                              Only the asset creator can distribute dividends
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
