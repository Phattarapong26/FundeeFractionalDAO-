
import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useWeb3 } from '@/hooks/useWeb3';
import { sellAsset, updateAssetValue } from '@/lib/contract/contract';
import { toast } from 'sonner';
import { formatTokenValue } from '@/lib/utils';

interface AssetSaleCardProps {
  assetId: number;
  assetName: string;
  currentValue: number;
  isCreator: boolean;
  assetSold: boolean;
  onAssetSold: () => void;
}

export const AssetSaleCard = ({ 
  assetId, 
  assetName, 
  currentValue, 
  isCreator,
  assetSold,
  onAssetSold 
}: AssetSaleCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [saleAmount, setSaleAmount] = useState('');
  const [newValue, setNewValue] = useState('');
  const [showSellDialog, setShowSellDialog] = useState(false);
  const { account, contract, web3 } = useWeb3();

  const handleSellAsset = async () => {
    if (!contract || !account || !assetId) {
      toast.error("Wallet not connected or asset not selected");
      return;
    }

    if (!saleAmount || parseFloat(saleAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setIsLoading(true);
      const weiAmount = web3.utils.toWei(saleAmount, 'ether');
      await sellAsset(contract, assetId, weiAmount, account);
      toast.success(`Asset ${assetName} sold successfully for ${saleAmount} ETH`);
      setShowSellDialog(false);
      onAssetSold();
    } catch (error) {
      console.error("Error selling asset:", error);
      toast.error(`Failed to sell asset: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateValue = async () => {
    if (!contract || !account || !assetId) {
      toast.error("Wallet not connected or asset not selected");
      return;
    }

    if (!newValue || parseFloat(newValue) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setIsLoading(true);
      const weiValue = web3.utils.toWei(newValue, 'ether');
      await updateAssetValue(contract, assetId, weiValue, account);
      toast.success(`Asset value updated to ${newValue} ETH`);
      setNewValue('');
    } catch (error) {
      console.error("Error updating asset value:", error);
      toast.error(`Failed to update asset value: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
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
            <div className="bg-green-100 p-2 rounded-full">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle>Asset Management</CardTitle>
              <CardDescription>Manage and sell {assetName}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {assetSold ? (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Asset Sold</AlertTitle>
              <AlertDescription>
                This asset has been sold and is no longer available for management.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Current Asset Value</p>
                  <p className="text-xl font-semibold">
                    {formatTokenValue(currentValue)} ETH
                  </p>
                </div>
              </div>

              {isCreator && (
                <div className="space-y-4">
                  <h4 className="font-medium">Asset Management Options</h4>
                  
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Update Asset Value</p>
                      <div className="flex gap-4">
                        <div className="flex-grow">
                          <Input
                            type="number"
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                            placeholder="New value in ETH"
                            min="0.001"
                            step="0.001"
                          />
                        </div>
                        <Button 
                          onClick={handleUpdateValue}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>Update</>
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm font-medium mb-2">Sell Entire Asset</p>
                      <Button 
                        variant="destructive"
                        onClick={() => setShowSellDialog(true)}
                        disabled={isLoading}
                        className="w-full"
                      >
                        Sell Asset
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">
                        This will sell the entire asset and distribute proceeds to all shareholders
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!isCreator && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Creator Only</AlertTitle>
                  <AlertDescription>
                    Only the asset creator can update values or sell the entire asset.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showSellDialog} onOpenChange={setShowSellDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sell Entire Asset</DialogTitle>
            <DialogDescription>
              This will sell {assetName} and distribute proceeds to all shareholders based on their ownership percentage.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Sale Amount (ETH)</label>
              <Input
                type="number"
                value={saleAmount}
                onChange={(e) => setSaleAmount(e.target.value)}
                placeholder="0.00"
                min="0.001"
                step="0.001"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the total sale amount that will be distributed to all shareholders
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSellDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleSellAsset}
              disabled={isLoading || !saleAmount}
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
              ) : (
                <>Confirm Sale</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
