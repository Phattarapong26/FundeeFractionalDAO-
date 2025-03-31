import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  Calendar, 
  Users, 
  BarChart4, 
  Wallet, 
  Search,
  ArrowRight,
  X,
  Loader2
} from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { purchaseShares } from '@/lib/contract/contract';
import { toast } from 'sonner';
import PageLayout from '@/components/Layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { truncateAddress } from '@/lib/utils';
import { useAssets } from '@/hooks/useAssets';
import { Asset } from '@/lib/contract/contract';
import { formatEthValue } from '@/lib/utils';

const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState<number>(1);
  const [isInvesting, setIsInvesting] = useState(false);
  
  const { account, contract, connectWallet } = useWeb3();
  const { assets, loading } = useAssets();
  const navigate = useNavigate();
  
  // Filter assets based on search query
  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Calculate total cost
  const calculateTotalCost = (asset: Asset, amount: number) => {
    return Number(asset.pricePerShare) * amount;
  };
  
  // Handle opening investment dialog
  const handleInvestClick = (asset: Asset) => {
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    setSelectedAsset(asset);
    setInvestmentAmount(1); // Reset amount
  };
  
  // Handle investment confirmation
  const handleInvestConfirm = async () => {
    if (!account || !contract || !selectedAsset) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    try {
      setIsInvesting(true);
      
      const totalCost = calculateTotalCost(selectedAsset, investmentAmount).toString();
      await purchaseShares(
        contract,
        selectedAsset.id,
        investmentAmount,
        totalCost,
        account
      );
      
      toast.success(`Successfully purchased ${investmentAmount} shares!`);
      setSelectedAsset(null); // Close dialog
    } catch (error) {
      console.error("Investment error:", error);
      toast.error(`Failed to complete investment: ${error.message || 'Unknown error'}`);
    } finally {
      setIsInvesting(false);
    }
  };
  
  // Format deadline date
  const formatDeadline = (timestamp: number) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString();
  };
  
  // Calculate funding progress percentage
  const calculateProgress = (asset: Asset) => {
    return (Number(asset.fundedAmount) / Number(asset.totalShares)) * 100;
  };
  
  return (
    <PageLayout className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-3xl font-bold mb-4">Asset Marketplace</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Explore and invest in tokenized real-world assets. Gain fractional ownership in premium assets with minimal investment.
          </p>
        </motion.div>
        
        {/* Search and filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search assets by name or symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </motion.div>
        
        {/* Asset list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-20">
              <Loader2 size={48} className="animate-spin text-blue-600" />
            </div>
          ) : filteredAssets.length > 0 ? (
            filteredAssets.map(asset => (
              <motion.div
                key={asset.id.toString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{asset.name}</h3>
                      <p className="text-sm text-gray-500">{asset.symbol}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                      {asset.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center text-sm">
                      <DollarSign size={16} className="text-green-500 mr-1.5" />
                      <span className="font-medium">{formatEthValue(asset.pricePerShare)}</span>
                      <span className="text-gray-500 ml-1">per share</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <BarChart4 size={16} className="text-blue-500 mr-1.5" />
                      <span className="font-medium">{Number(asset.apy) / 100}%</span>
                      <span className="text-gray-500 ml-1">annual yield</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Calendar size={16} className="text-orange-500 mr-1.5" />
                      <span className="font-medium">Ends {formatDeadline(asset.fundingDeadline)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Users size={16} className="text-purple-500 mr-1.5" />
                      <span className="font-medium">{asset.investorCount.toString()}</span>
                      <span className="text-gray-500 ml-1">investors</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Funding Progress</span>
                      <span className="font-medium">
                        {calculateProgress(asset).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full rounded-full" 
                        style={{ width: `${calculateProgress(asset)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1 text-gray-500">
                      <span>
                        {Number(asset.fundedAmount)} / {Number(asset.totalShares)} shares
                      </span>
                      <span>
                        {Number(asset.fundedAmount) * Number(asset.pricePerShare) / 1e18} / {Number(asset.totalValue) / 1e18} ETH
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      onClick={() => navigate(`/asset/${asset.id}`)}
                    >
                      Details
                    </Button>
                    <Button
                      variant="default"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleInvestClick(asset)}
                      disabled={Number(asset.availableShares) === 0 || !asset.isActive}
                    >
                      {Number(asset.availableShares) === 0 ? 'Sold Out' : 'Invest Now'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <X size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2">No Assets Found</h3>
              <p className="text-gray-500 mb-6">
                There are currently no assets matching your search criteria.
              </p>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
        
        {/* Investment Dialog */}
        <Dialog open={!!selectedAsset} onOpenChange={(open) => !open && setSelectedAsset(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Invest in {selectedAsset?.name}</DialogTitle>
              <DialogDescription>
                Purchase shares in this tokenized asset
              </DialogDescription>
            </DialogHeader>
            
            {selectedAsset && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Available Shares</p>
                    <p className="font-medium">{Number(selectedAsset.availableShares)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Price Per Share</p>
                    <p className="font-medium">{formatEthValue(selectedAsset.pricePerShare)}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Number of Shares</p>
                  <input
                    type="number"
                    min="1"
                    max={Number(selectedAsset.availableShares)}
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(Math.max(1, Math.min(Number(e.target.value), Number(selectedAsset.availableShares))))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Cost per share:</span>
                    <span>{formatEthValue(selectedAsset.pricePerShare)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total cost:</span>
                    <span>{formatEthValue(calculateTotalCost(selectedAsset, investmentAmount))}</span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500">
                  <p>Investment Limits:</p>
                  <p>Min: {Number(selectedAsset.minInvestment) / 1e18} ETH - Max: {Number(selectedAsset.maxInvestment) / 1e18} ETH</p>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setSelectedAsset(null)}
              >
                Cancel
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700" 
                onClick={handleInvestConfirm}
                disabled={isInvesting || !account}
              >
                {isInvesting ? (
                  <><Loader2 size={16} className="mr-2 animate-spin" /> Processing...</>
                ) : (
                  'Confirm Investment'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
};

export default Marketplace;
