import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Calendar, 
  Users, 
  BarChart4, 
  ClipboardCheck,
  AlertCircle,
  FileText,
  ArrowLeft,
  Loader2,
  User,
  Plus
} from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { Asset, purchaseShares } from '@/lib/contract/contract';
import { toast } from 'sonner';
import PageLayout from '@/components/Layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { truncateAddress } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatEthValue, formatTokenValue } from '@/lib/utils';

const AssetDetails = () => {
  const { id } = useParams();
  const { account, contract } = useWeb3();
  const navigate = useNavigate();
  
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [investOpen, setInvestOpen] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState(1);
  const [isInvesting, setIsInvesting] = useState(false);
  
  useEffect(() => {
    const fetchAsset = async () => {
      if (!contract || !id) return;
      
      try {
        setLoading(true);
        const assetData = await contract.methods.getAsset(parseInt(id)).call();
        setAsset(assetData);
      } catch (error) {
        console.error("Error fetching asset:", error);
        toast.error("Failed to load asset details");
        navigate('/marketplace');
      } finally {
        setLoading(false);
      }
    };

    if (contract) {
      fetchAsset();
    }
  }, [contract, id, navigate]);

  const handleInvestClick = () => {
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    setInvestOpen(true);
    setInvestmentAmount(1);
  };
  
  const handleInvestConfirm = async () => {
    if (!account || !contract || !asset) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    try {
      setIsInvesting(true);
      
      const totalCost = (Number(asset.pricePerShare) * investmentAmount).toString();
      await purchaseShares(
        contract,
        asset.id,
        investmentAmount,
        totalCost,
        account
      );
      
      toast.success(`Successfully purchased ${investmentAmount} shares!`);
      setInvestOpen(false);
      
      // Refresh asset data
      const updatedAsset = await contract.methods.getAsset(parseInt(id as string)).call();
      setAsset(updatedAsset);
    } catch (error) {
      console.error("Investment error:", error);
      toast.error(`Failed to complete investment: ${error.message || 'Unknown error'}`);
    } finally {
      setIsInvesting(false);
    }
  };
  
  const formatDeadline = (timestamp: number) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString();
  };
  
  const calculateProgress = (asset: Asset) => {
    return (Number(asset.fundedAmount) / Number(asset.totalShares)) * 100;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Address copied to clipboard");
  };
  
  if (loading) {
    return (
      <PageLayout className="bg-gray-50">
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 size={48} className="animate-spin text-blue-600" />
        </div>
      </PageLayout>
    );
  }
  
  if (!asset) {
    return (
      <PageLayout className="bg-gray-50">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold mb-4">Asset Not Found</h1>
          <p className="text-gray-600 mb-8">
            The asset you are looking for does not exist or has been removed.
          </p>
          <Button 
            onClick={() => navigate('/marketplace')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Marketplace
          </Button>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate('/marketplace')}
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Marketplace
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-sm p-6 mb-6"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold">{asset.name}</h1>
                  <p className="text-gray-500">{asset.symbol}</p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  asset.isActive 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {asset.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Asset Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <DollarSign size={16} className="text-green-500 mr-2" />
                      <span className="font-medium">{formatEthValue(asset.pricePerShare)}</span>
                      <span className="text-gray-500 ml-1">per share</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <BarChart4 size={16} className="text-blue-500 mr-2" />
                      <span className="font-medium">{Number(asset.apy) / 100}%</span>
                      <span className="text-gray-500 ml-1">annual yield</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Calendar size={16} className="text-orange-500 mr-2" />
                      <span className="font-medium">Ends {formatDeadline(asset.fundingDeadline)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Users size={16} className="text-purple-500 mr-2" />
                      <span className="font-medium">{asset.investorCount.toString()}</span>
                      <span className="text-gray-500 ml-1">investors</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Investment Metrics</h3>
                  <div className="space-y-3">
                    <div className="text-sm flex justify-between">
                      <span className="text-gray-600">Total Shares:</span>
                      <span className="font-medium">{Number(asset.totalShares)}</span>
                    </div>
                    
                    <div className="text-sm flex justify-between">
                      <span className="text-gray-600">Available Shares:</span>
                      <span className="font-medium">{Number(asset.availableShares)}</span>
                    </div>
                    
                    <div className="text-sm flex justify-between">
                      <span className="text-gray-600">Min Investment:</span>
                      <span className="font-medium">{formatEthValue(asset.minInvestment)}</span>
                    </div>
                    
                    <div className="text-sm flex justify-between">
                      <span className="text-gray-600">Max Investment:</span>
                      <span className="font-medium">{formatEthValue(asset.maxInvestment)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Funding Progress</h3>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span className="font-medium">{calculateProgress(asset).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full rounded-full" 
                      style={{ width: `${calculateProgress(asset)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {formatTokenValue(asset.fundedAmount)} / {formatTokenValue(asset.totalShares)} shares sold
                  </span>
                  <span className="text-gray-600">
                    {formatEthValue(Number(asset.fundedAmount) * Number(asset.pricePerShare))} / {formatEthValue(asset.totalValue)} raised
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Asset Creator</h3>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                    <User size={16} className="text-blue-600" />
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium mr-2">{truncateAddress(asset.creator)}</span>
                    <button 
                      onClick={() => copyToClipboard(asset.creator)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <ClipboardCheck size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <Tabs defaultValue="details">
                <TabsList className="w-full border-b p-0">
                  <TabsTrigger 
                    value="details" 
                    className="flex-1 rounded-none data-[state=active]:border-b-2 border-blue-600 py-3"
                  >
                    Asset Details
                  </TabsTrigger>
                  <TabsTrigger 
                    value="proposals" 
                    className="flex-1 rounded-none data-[state=active]:border-b-2 border-blue-600 py-3"
                  >
                    Proposals
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">About This Asset</h3>
                      <p className="text-gray-600">
                        {asset.imageUrl ? `Information about ${asset.name}` : 'No detailed description available for this asset.'}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Investment Strategy</h3>
                      <p className="text-gray-600">
                        This asset offers a {Number(asset.apy) / 100}% annual yield through a combination of appreciation and income generation.
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="proposals" className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Related Proposals</h3>
                    <Button 
                      variant="outline"
                      className="text-blue-600"
                      onClick={() => navigate('/create-proposal')}
                    >
                      <Plus size={16} className="mr-2" />
                      New Proposal
                    </Button>
                  </div>
                  
                  <div className="text-center py-8">
                    <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold mb-2">No Proposals Yet</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      There are no proposals related to this asset yet. Create one to suggest changes or improvements.
                    </p>
                    <Button 
                      onClick={() => navigate('/governance')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      View Governance
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
          
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Invest in {asset.name}</CardTitle>
                  <CardDescription>Purchase shares in this tokenized asset</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-md space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Price per share:</span>
                      <span className="font-medium">{formatEthValue(asset.pricePerShare)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Available shares:</span>
                      <span className="font-medium">{Number(asset.availableShares)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Annual yield:</span>
                      <span className="font-medium text-green-600">{Number(asset.apy) / 100}%</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-b border-gray-100 py-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Funding deadline:</span>
                      <span className="font-medium">{formatDeadline(asset.fundingDeadline)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Investment range:</span>
                      <span className="font-medium">
                        {formatEthValue(asset.minInvestment)} - {formatEthValue(asset.maxInvestment)}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleInvestClick}
                    disabled={Number(asset.availableShares) === 0 || !asset.isActive}
                  >
                    {Number(asset.availableShares) === 0 ? 'Sold Out' : 'Invest Now'}
                  </Button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    By investing, you agree to the terms and conditions of the DAO.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
      
      <Dialog open={investOpen} onOpenChange={setInvestOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invest in {asset.name}</DialogTitle>
            <DialogDescription>
              Purchase shares in this tokenized asset
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Available Shares</p>
                <p className="font-medium">{Number(asset.availableShares)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Price Per Share</p>
                <p className="font-medium">{formatEthValue(asset.pricePerShare)}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Number of Shares</p>
              <input
                type="number"
                min="1"
                max={Number(asset.availableShares)}
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Math.max(1, Math.min(Number(e.target.value), Number(asset.availableShares))))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex justify-between text-sm mb-2">
                <span>Cost per share:</span>
                <span>{formatEthValue(asset.pricePerShare)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total cost:</span>
                <span>{formatEthValue(Number(asset.pricePerShare) * investmentAmount)}</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              <p>Investment Limits:</p>
              <p>Min: {formatEthValue(asset.minInvestment)} - Max: {formatEthValue(asset.maxInvestment)}</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setInvestOpen(false)}
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
    </PageLayout>
  );
};

export default AssetDetails;
