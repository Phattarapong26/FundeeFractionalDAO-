import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  ArrowUpDown, 
  DollarSign, 
  ShoppingCart, 
  Tag, 
  List, 
  ArrowDownUp,
  Loader2,
  Info,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import PageLayout from '@/components/Layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { useWeb3 } from '@/hooks/useWeb3';
import { useAssets } from '@/hooks/useAssets';
import { useFeeStatus } from '@/hooks/useFeeStatus';
import { createTradeOrder, matchOrders, cancelOrder } from '@/lib/contract/tradeContract';
import TradeOrderbook from '@/components/Trade/TradeOrderbook';
import TradeHistory from '@/components/Trade/TradeHistory';
import ActiveOrders from '@/components/Trade/ActiveOrders';
import PriceChart from '@/components/Trade/PriceChart';
import { truncateAddress, formatNumber, formatEthValue, formatTokenValue } from '@/lib/utils';

const Trade = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [tradeType, setTradeType] = useState('buy');
  const [orderPrice, setOrderPrice] = useState('');
  const [orderAmount, setOrderAmount] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showTradeDialog, setShowTradeDialog] = useState(false);
  
  const { assets, loading } = useAssets();
  const { account, contract, web3, connectWallet } = useWeb3();
  const { hasPaidFee, isLoading: feeStatusLoading, payWithETH, payWithToken } = useFeeStatus();
  const navigate = useNavigate();
  
  const platformToken = {
    id: 999,
    name: "Platform Token",
    symbol: "FUNDFA",
    imageUrl: "https://source.unsplash.com/random/800x600?token",
    totalShares: 1000000,
    availableShares: 500000,
    pricePerShare: 50000000000000000,
    minInvestment: 1,
    maxInvestment: 1000,
    totalValue: 50000000000000000000,
    fundedAmount: 25000000000000000000,
    apy: 0,
    fundingDeadline: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    investorCount: 120,
    creator: "0x52815d5db5822C11F467eC00db57fC2e403D5c7B",
    isActive: true
  };
  
  const approvedAssets = [...assets.filter(asset => 
    asset.isActive && 
    (asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()))
  )];
  
  if (!searchQuery || 
      "platform token".includes(searchQuery.toLowerCase()) || 
      "fundfa".includes(searchQuery.toLowerCase())) {
    approvedAssets.push(platformToken);
  }

  const calculateTotal = () => {
    if (!orderPrice || !orderAmount) return 0;
    return parseFloat(orderPrice) * parseFloat(orderAmount);
  };
  
  const handlePlaceOrder = async () => {
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    if (!selectedAsset) {
      toast.error("Please select an asset to trade");
      return;
    }
    
    if (!orderPrice || !orderAmount) {
      toast.error("Please enter both price and amount");
      return;
    }
    
    // Verify contract is initialized
    if (!contract) {
      toast.error("Contract not initialized. Please reconnect your wallet.");
      console.error("Contract not initialized in handlePlaceOrder");
      return;
    }
    
    // Check fee status
    if (!hasPaidFee) {
      toast.error("You need to pay the transaction fee first");
      return;
    }
    
    setIsPlacingOrder(true);
    
    try {
      console.log("Creating trade order with contract:", contract ? "Initialized" : "Not initialized");
      
      await createTradeOrder(
        contract,
        selectedAsset.id,
        tradeType === 'buy',
        parseFloat(orderPrice),
        parseFloat(orderAmount),
        account
      );
      
      toast.success(`Successfully placed ${tradeType} order for ${orderAmount} shares`);
      
      setOrderPrice('');
      setOrderAmount('');
      setShowTradeDialog(false);
      
      await matchOrders(contract, selectedAsset.id, account);
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(`Failed to place order: ${error.message || 'Unknown error'}`);
    } finally {
      setIsPlacingOrder(false);
    }
  };
  
  return (
    <PageLayout className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-4">Token Trading Platform</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Trade tokens from approved assets. Create buy or sell orders at your desired price, or fulfill existing orders.
          </p>
        </motion.div>
        
        {!account && (
          <Alert variant="warning" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Wallet not connected</AlertTitle>
            <AlertDescription>
              Please connect your wallet to access trading features.
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={connectWallet}
                >
                  Connect Wallet
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {account && !hasPaidFee && (
          <Alert variant="warning" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Transaction fee required</AlertTitle>
            <AlertDescription>
              You need to pay a one-time fee to perform transactions on the platform.
              <div className="mt-2 flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => payWithETH()}
                  disabled={feeStatusLoading}
                >
                  Pay with ETH
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => payWithToken()}
                  disabled={feeStatusLoading}
                >
                  Pay with FUNDFA
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 bg-white p-6 rounded-xl shadow-sm"
        >
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="flex-grow relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search assets by name or symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                if (!account) {
                  connectWallet();
                } else if (!selectedAsset) {
                  toast.error("Please select an asset first");
                } else if (!hasPaidFee) {
                  toast.error("You need to pay the transaction fee first");
                } else {
                  setShowTradeDialog(true);
                }
              }}
            >
              <ShoppingCart size={18} className="mr-2" />
              Place Order
            </Button>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {loading ? (
            <div className="col-span-full flex justify-center py-20">
              <Loader2 size={48} className="animate-spin text-blue-600" />
            </div>
          ) : approvedAssets.length > 0 ? (
            approvedAssets.map(asset => (
              <motion.div
                key={asset.id.toString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                  selectedAsset?.id === asset.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedAsset(asset)}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold">{asset.name}</h3>
                      <p className="text-sm text-gray-500">{asset.symbol}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      asset.id === 999 ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {asset.id === 999 ? 'Platform Token' : 'Trading'}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm">
                      <DollarSign size={16} className="text-green-500 mr-1.5" />
                      <span className="font-medium">{formatEthValue(asset.pricePerShare)}</span>
                      <span className="text-gray-500 ml-1">per share</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Tag size={16} className="text-purple-500 mr-1.5" />
                      <span className="font-medium">{formatTokenValue(asset.totalShares)}</span>
                      <span className="text-gray-500 ml-1">total shares</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <List size={16} className="text-orange-500 mr-1.5" />
                      <span className="font-medium">{asset.investorCount.toString()}</span>
                      <span className="text-gray-500 ml-1">investors</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (asset.id === 999) {
                        navigate('/token-marketplace');
                      } else {
                        navigate(`/asset/${asset.id}`);
                      }
                    }}
                  >
                    {asset.id === 999 ? 'View Token Details' : 'View Asset Details'}
                  </Button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-white rounded-xl">
              <Info size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2">No Approved Assets</h3>
              <p className="text-gray-500 mb-6">
                There are currently no approved assets available for trading.
              </p>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate('/marketplace')}
              >
                Explore Marketplace
              </Button>
            </div>
          )}
        </div>
        
        {selectedAsset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden mb-12"
          >
            <div className="p-6 border-b">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">{selectedAsset.name} ({selectedAsset.symbol})</h2>
                  <p className="text-sm text-gray-500">Created by {truncateAddress(selectedAsset.creator)}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Current Market Price</p>
                    <p className="text-xl font-semibold">{Number(selectedAsset.pricePerShare) / 1e18} ETH</p>
                  </div>
                  
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setShowTradeDialog(true)}
                  >
                    Trade Now
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-b">
              <PriceChart assetId={selectedAsset.id} />
            </div>
            
            <div className="p-6">
              <Tabs defaultValue="orderbook">
                <TabsList className="mb-6">
                  <TabsTrigger value="orderbook" className="flex items-center gap-2">
                    <ArrowUpDown size={16} />
                    <span>Orderbook</span>
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center gap-2">
                    <ArrowDownUp size={16} />
                    <span>Trade History</span>
                  </TabsTrigger>
                  <TabsTrigger value="myorders" className="flex items-center gap-2">
                    <List size={16} />
                    <span>My Orders</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="orderbook">
                  <TradeOrderbook assetId={selectedAsset.id} />
                </TabsContent>
                
                <TabsContent value="history">
                  <TradeHistory assetId={selectedAsset.id} />
                </TabsContent>
                
                <TabsContent value="myorders">
                  <ActiveOrders 
                    assetId={selectedAsset.id} 
                    onCancelOrder={async (orderId) => {
                      try {
                        await cancelOrder(contract, orderId, account);
                        toast.success("Order cancelled successfully");
                      } catch (error) {
                        toast.error(`Failed to cancel order: ${error.message || 'Unknown error'}`);
                      }
                    }} 
                  />
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        )}
        
        <Dialog open={showTradeDialog} onOpenChange={setShowTradeDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Place a Trade Order</DialogTitle>
              <DialogDescription>
                {selectedAsset ? `Create an order to buy or sell ${selectedAsset.name} tokens` : 'Select an asset first'}
              </DialogDescription>
            </DialogHeader>
            
            {selectedAsset && (
              <div className="space-y-4 py-4">
                <RadioGroup value={tradeType} onValueChange={setTradeType} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="buy" id="buy" />
                    <Label htmlFor="buy" className="font-medium text-green-600">Buy Tokens</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sell" id="sell" />
                    <Label htmlFor="sell" className="font-medium text-red-600">Sell Tokens</Label>
                  </div>
                </RadioGroup>
                
                <Separator />
                
                <div>
                  <Label htmlFor="price">Price per Token (ETH)</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                      id="price"
                      type="number"
                      step="0.0001"
                      min="0.0001"
                      value={orderPrice}
                      onChange={(e) => setOrderPrice(e.target.value)}
                      className="pl-10"
                      placeholder="0.0000"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="amount">Number of Tokens</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    step="1"
                    value={orderAmount}
                    onChange={(e) => setOrderAmount(e.target.value)}
                    placeholder="0"
                  />
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Total {tradeType === 'buy' ? 'Cost' : 'Proceeds'}:</span>
                    <span className="font-medium">{calculateTotal()} ETH</span>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowTradeDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                className={tradeType === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || !account || !selectedAsset || !hasPaidFee}
              >
                {isPlacingOrder ? (
                  <><Loader2 size={16} className="mr-2 animate-spin" /> Processing...</>
                ) : (
                  `Place ${tradeType === 'buy' ? 'Buy' : 'Sell'} Order`
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
};

export default Trade;
