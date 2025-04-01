import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit2, History, TrendingUp, DollarSign } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { formatNumber } from '@/lib/utils';
import { toast } from 'sonner';

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

export const AssetManagement = ({ assetId, assetName, currentValue }: { assetId: number; assetName: string; currentValue: number }) => {
  const [newValue, setNewValue] = useState<string>('');
  const [saleValue, setSaleValue] = useState<string>('');
  const [saleHistory, setSaleHistory] = useState<AssetSaleHistory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isSelling, setIsSelling] = useState<boolean>(false);
  const { account, contract, web3 } = useWeb3();
  const navigate = useNavigate();

  useEffect(() => {
    if (!contract || !account) return;
    fetchSaleHistory();
  }, [contract, account]);

  const fetchSaleHistory = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement contract calls to fetch sale history
      // This is a placeholder for demonstration
      const mockHistory: AssetSaleHistory[] = [
        {
          assetId: 1,
          assetName: "Sample Asset 1",
          saleValue: 10,
          timestamp: Date.now() - 86400000,
          distributionDetails: [
            {
              address: "0x123...abc",
              shares: 100,
              amount: 5
            },
            {
              address: "0x456...def",
              shares: 200,
              amount: 10
            }
          ]
        }
      ];
      
      setSaleHistory(mockHistory);
    } catch (error) {
      console.error("Error fetching sale history:", error);
      toast.error("Failed to fetch sale history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateValue = async () => {
    if (!contract || !account || !web3) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsUpdating(true);
      const weiValue = web3.utils.toWei(newValue, 'ether');
      // TODO: Implement contract call to update asset value
      await contract.methods.updateAssetValue(assetId, weiValue).send({ from: account });
      toast.success("Asset value updated successfully");
      navigate(0); // Refresh page
    } catch (error) {
      console.error("Error updating asset value:", error);
      toast.error("Failed to update asset value");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSellAsset = async () => {
    if (!contract || !account || !web3) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsSelling(true);
      const weiValue = web3.utils.toWei(saleValue, 'ether');
      // TODO: Implement contract call to sell asset
      await contract.methods.sellAsset(assetId).send({ 
        from: account,
        value: weiValue
      });
      toast.success("Asset sold successfully");
      navigate(0); // Refresh page
    } catch (error) {
      console.error("Error selling asset:", error);
      toast.error("Failed to sell asset");
    } finally {
      setIsSelling(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Edit2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Update Asset Value</CardTitle>
                <CardDescription>Update the current value of the asset</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Current Value</p>
                <p className="text-2xl font-bold">{formatNumber(currentValue)} ETH</p>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Enter new value in ETH"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleUpdateValue}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Updating...' : 'Update'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-full">
                <DollarSign className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <CardTitle>Sell Asset</CardTitle>
                <CardDescription>Sell the entire asset and distribute proceeds</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Current Value</p>
                <p className="text-2xl font-bold">{formatNumber(currentValue)} ETH</p>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Enter sale value in ETH"
                  value={saleValue}
                  onChange={(e) => setSaleValue(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSellAsset}
                  disabled={isSelling}
                  variant="destructive"
                >
                  {isSelling ? 'Selling...' : 'Sell Asset'}
                </Button>
              </div>
            </div>
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
              <CardTitle>Sale History</CardTitle>
              <CardDescription>History of asset sales and distributions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading sale history...</div>
          ) : saleHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No sale history found
            </div>
          ) : (
            <div className="space-y-6">
              {saleHistory.map((sale, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-medium">{sale.assetName}</h4>
                      <p className="text-sm text-gray-500">
                        Sold on {new Date(sale.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatNumber(sale.saleValue)} ETH</p>
                      <p className="text-sm text-gray-500">Total Sale Value</p>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium mb-2">Distribution Details</h5>
                    <div className="space-y-2">
                      {sale.distributionDetails.map((detail, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {detail.address} ({detail.shares} shares)
                          </span>
                          <span className="font-medium">{formatNumber(detail.amount)} ETH</span>
                        </div>
                      ))}
                    </div>
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