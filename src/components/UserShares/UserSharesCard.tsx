
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWeb3 } from '@/hooks/useWeb3';
import { useUserShares } from '@/hooks/useUserShares';
import { sellShares } from '@/lib/contract/contract';
import { toast } from 'sonner';
import { useAssets } from '@/hooks/useAssets';
import { formatNumber } from '@/lib/utils';

export const UserSharesCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [sellAmount, setSellAmount] = useState(1);
  const { totalShares, loading, refetch } = useUserShares();
  const { assets, loading: assetsLoading } = useAssets();
  const { account, contract } = useWeb3();

  const handleSellShares = async () => {
    if (!contract || !account) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!selectedAssetId) {
      toast.error('Please select an asset');
      return;
    }

    if (sellAmount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    try {
      setIsLoading(true);
      await sellShares(contract, parseInt(selectedAssetId), sellAmount, account);
      toast.success(`Successfully sold ${sellAmount} shares`);
      refetch();
    } catch (error) {
      console.error('Error selling shares:', error);
      toast.error(`Failed to sell shares: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl p-6 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-blue-100 p-2 rounded-full">
          <Wallet className="h-5 w-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold">Your Shares</h3>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Total Shares</p>
            <p className="text-3xl font-bold text-blue-700">{formatNumber(totalShares)}</p>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Sell Shares</h4>
            
            <div>
              <label htmlFor="asset-select" className="block text-sm font-medium text-gray-700 mb-1">
                Select Asset
              </label>
              <select
                id="asset-select"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                disabled={assetsLoading}
              >
                <option value="">Select an asset</option>
                {assets.map((asset) => (
                  <option key={asset.id.toString()} value={asset.id.toString()}>
                    {asset.name} ({asset.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sell-amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount to Sell
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="sell-amount"
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(parseInt(e.target.value) || 0)}
                />
                <div className="flex gap-1">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSellAmount(prev => Math.max(1, prev - 1))}
                    className="h-9 w-9 p-0"
                  >
                    -
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSellAmount(prev => prev + 1)}
                    className="h-9 w-9 p-0"
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            <Button
              className="w-full"
              disabled={isLoading || !account || !selectedAssetId || sellAmount <= 0}
              onClick={handleSellShares}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowDown className="mr-2 h-4 w-4" />
                  Sell Shares
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
