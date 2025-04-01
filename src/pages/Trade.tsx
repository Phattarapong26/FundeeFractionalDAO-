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
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ChevronRight,
  RefreshCw,
  Users,
  Activity,
  TrendingUp
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { useWeb3 } from '@/hooks/useWeb3';
import { useAssets } from '@/hooks/useAssets';
import { useFeeStatus } from '@/hooks/useFeeStatus';
import { useAssetAnalytics } from '@/hooks/useAssetAnalytics';
import { createTradeOrder, matchOrders, cancelOrder, getBestPrices } from '@/lib/contract/tradeContract';
import TradeOrderbook from '@/components/Trade/TradeOrderbook';
import TradeHistory from '@/components/Trade/TradeHistory';
import ActiveOrders from '@/components/Trade/ActiveOrders';
import PriceChart from '@/components/Trade/PriceChart';
import { truncateAddress, formatNumber, formatEthValue, formatTokenValue } from '@/lib/utils';
import { FeePaymentModal } from '@/components/Platform/FeePaymentModal';

const PriceInfoCard = ({ label, value, change, positive }) => {
  return (
    <div className="bg-gray-50 p-3 rounded">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-lg font-bold">{value}</div>
      {change && (
        <div className={`text-xs mt-1 ${positive ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </div>
      )}
    </div>
  );
};

const OrderRow = ({ price, shares, type }) => {
  const color = type === 'buy' ? 'text-green-600' : 'text-red-600';
  const bgColor = type === 'buy' ? 'bg-green-50' : 'bg-red-50';
  const icon = type === 'buy' ? (
    <ArrowUp className="w-3 h-3" />
  ) : (
    <ArrowDown className="w-3 h-3" />
  );

  return (
    <div className={`flex justify-between items-center p-2 rounded ${bgColor}`}>
      <div className={`flex items-center gap-1 ${color}`}>
        {icon}
        <span className="font-medium">${price}</span>
      </div>
      <div className="text-sm">{shares} shares</div>
    </div>
  );
};

const TradeRow = ({ trade }) => {
  const timeString = new Date(trade.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
  const dateString = new Date(trade.timestamp).toLocaleDateString([], {
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="grid grid-cols-4 text-sm py-2 border-b border-gray-100 last:border-0">
      <div>
        <div className="font-medium">${trade.price}</div>
        <div className="text-xs text-gray-500">{trade.shares} shares</div>
      </div>
      <div className="col-span-2">
        <div className="font-medium truncate">{trade.buyer}</div>
        <div className="text-xs text-gray-500 truncate">{trade.seller}</div>
      </div>
      <div className="text-right">
        <div>{timeString}</div>
        <div className="text-xs text-gray-500">{dateString}</div>
      </div>
    </div>
  );
};

const Trade = () => {
  const { id } = useParams();
  const { 
    priceHistory = [], 
    volumeHistory = [], 
    holderHistory = [], 
    tradingActivity = [], 
    isLoading: analyticsLoading 
  } = useAssetAnalytics(Number(id));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [tradeType, setTradeType] = useState('buy');
  const [orderPrice, setOrderPrice] = useState('');
  const [orderAmount, setOrderAmount] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showTradeDialog, setShowTradeDialog] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [bestPrices, setBestPrices] = useState({ bestBuyPrice: 0, bestSellPrice: 0 });
  
  const { assets, loading } = useAssets();
  const { account, contract, web3, connectWallet } = useWeb3();
  const { hasPaidFee, isLoading: feeStatusLoading, payWithETH, payWithToken, refetch } = useFeeStatus();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (selectedAsset && contract) {
      fetchBestPrices();
      fetchUserBalance();
    }
  }, [selectedAsset, contract]);

  const fetchBestPrices = async () => {
    try {
      const prices = await getBestPrices(contract, selectedAsset.id);
      setBestPrices(prices);
    } catch (error) {
      console.error("Error fetching best prices:", error);
    }
  };

  const fetchUserBalance = async () => {
    try {
      const balance = await contract.methods.getUserShares(account, selectedAsset.id).call();
      setUserBalance(Number(balance) / 1e18);
    } catch (error) {
      console.error("Error fetching user balance:", error);
    }
  };

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
      toast.error("กรุณาเชื่อมต่อวอลเล็ตก่อน");
      return;
    }
    
    if (!selectedAsset) {
      toast.error("กรุณาเลือกสินทรัพย์ที่ต้องการซื้อขาย");
      return;
    }
    
    if (!orderPrice || !orderAmount) {
      toast.error("กรุณากรอกราคาและจำนวน");
      return;
    }

    const price = parseFloat(orderPrice);
    const amount = parseFloat(orderAmount);
    
    // ตรวจสอบยอดคงเหลือ
    if (tradeType === 'sell' && amount > userBalance) {
      toast.error("ยอดคงเหลือไม่เพียงพอ");
      return;
    }
    
    // ตรวจสอบค่าธรรมเนียม
    if (!hasPaidFee) {
      toast.error("กรุณาจ่ายค่าธรรมเนียมก่อน");
      return;
    }
    
    setIsPlacingOrder(true);
    
    try {
      await createTradeOrder(
        contract,
        selectedAsset.id,
        tradeType === 'buy',
        price,
        amount,
        account
      );
      
      toast.success(`สร้างคำสั่ง${tradeType === 'buy' ? 'ซื้อ' : 'ขาย'}สำเร็จ`);
      
      setOrderPrice('');
      setOrderAmount('');
      setShowTradeDialog(false);
      
      await matchOrders(contract, selectedAsset.id, account);
      await fetchBestPrices();
      await fetchUserBalance();
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(`สร้างคำสั่งไม่สำเร็จ: ${error.message || 'ไม่ทราบสาเหตุ'}`);
    } finally {
      setIsPlacingOrder(false);
    }
  };
  
  return (
    <PageLayout className="min-h-screen flex flex-col">
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Secondary Market</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Last updated: 1 min ago</span>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">ราคาปัจจุบัน</p>
                    <p className="text-2xl font-bold">
                      {analyticsLoading ? (
                        <Loader2 className="animate-spin" />
                      ) : priceHistory.length > 0 ? (
                        `${Number(priceHistory[priceHistory.length - 1].price).toLocaleString('th-TH')} ETH`
                      ) : (
                        '0 ETH'
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">ปริมาณการซื้อขาย 24 ชม.</p>
                    <p className="text-2xl font-bold">
                      {analyticsLoading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        `${Number(volumeHistory[volumeHistory.length - 1]?.volume || 0).toLocaleString('th-TH')} ETH`
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">จำนวนผู้ถือหุ้น</p>
                    <p className="text-2xl font-bold">
                      {analyticsLoading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        holderHistory[holderHistory.length - 1]?.holders || 0
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">ธุรกรรม 24 ชม.</p>
                    <p className="text-2xl font-bold">
                      {analyticsLoading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        tradingActivity[0]?.count || 0
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{selectedAsset?.name || 'Select an Asset'}</CardTitle>
                      <CardDescription>Current market activity</CardDescription>
                    </div>
                    <Select 
                      value={selectedAsset?.id.toString()} 
                      onValueChange={(value) => {
                        const asset = approvedAssets.find(a => a.id.toString() === value);
                        if (asset) setSelectedAsset(asset);
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select asset" />
                      </SelectTrigger>
                      <SelectContent>
                        {approvedAssets.map(asset => (
                          <SelectItem key={asset.id} value={asset.id.toString()}>
                            {asset.name} ({asset.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <PriceChart assetId={selectedAsset?.id} />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <PriceInfoCard
                      label="Current Price"
                      value={selectedAsset ? `${formatEthValue(selectedAsset.pricePerShare)} ETH` : '-'}
                      change="+2.5%"
                      positive={true}
                    />
                    <PriceInfoCard
                      label="24h Low"
                      value="0.0242 ETH"
                      change=""
                      positive={false}
                    />
                    <PriceInfoCard
                      label="24h High"
                      value="0.0251 ETH"
                      change=""
                      positive={false}
                    />
                    <PriceInfoCard
                      label="24h Volume"
                      value="152 shares"
                      change="+12.4%"
                      positive={true}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Order Book</CardTitle>
                </CardHeader>
                <CardContent>
                  <TradeOrderbook assetId={selectedAsset?.id} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Trades</CardTitle>
                </CardHeader>
                <CardContent>
                  <TradeHistory assetId={selectedAsset?.id} />
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Trade</CardTitle>
                </CardHeader>
                <CardContent>
                  {!hasPaidFee && (
                    <Alert variant="warning" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>ต้องชำระค่าธรรมเนียมก่อน</AlertTitle>
                      <AlertDescription className="flex justify-between items-center flex-wrap">
                        <span>คุณต้องชำระค่าธรรมเนียมการทำธุรกรรมครั้งเดียวเพื่อใช้แพลตฟอร์ม</span>
                        <FeePaymentModal 
                          onFeePaid={() => refetch()} 
                          trigger={<Button size="sm" variant="outline" className="mt-2 sm:mt-0">ชำระค่าธรรมเนียม</Button>}
                        />
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Tabs defaultValue="buy" value={tradeType} onValueChange={setTradeType}>
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="buy">Buy</TabsTrigger>
                      <TabsTrigger value="sell">Sell</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="buy">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">Asset</label>
                          <Select 
                            value={selectedAsset?.id.toString()} 
                            onValueChange={(value) => {
                              const asset = approvedAssets.find(a => a.id.toString() === value);
                              if (asset) setSelectedAsset(asset);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select asset" />
                            </SelectTrigger>
                            <SelectContent>
                              {approvedAssets.map(asset => (
                                <SelectItem key={asset.id} value={asset.id.toString()}>
                                  {asset.name} ({asset.symbol})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Price per Share</label>
                          <Input 
                            value={orderPrice}
                            onChange={(e) => setOrderPrice(e.target.value)}
                            placeholder="0.0000"
                          />
                          <div className="flex justify-between text-xs mt-1">
                            <span className="text-gray-500">Market: {selectedAsset ? formatEthValue(selectedAsset.pricePerShare) : '0.0000'} ETH</span>
                            <button 
                              className="text-blue-600"
                              onClick={() => setOrderPrice(selectedAsset ? (Number(selectedAsset.pricePerShare) / 1e18).toString() : '')}
                            >
                              Use Market Price
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Amount (Shares)</label>
                          <Input 
                            type="number" 
                            value={orderAmount}
                            onChange={(e) => setOrderAmount(e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        
                        <div className="pt-2 pb-4 border-t border-b border-gray-100">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm">Total Cost</span>
                            <span className="font-medium">{calculateTotal()} ETH</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Platform Fee (1%)</span>
                            <span className="font-medium">{(calculateTotal() * 0.01).toFixed(4)} ETH</span>
                          </div>
                        </div>
                        
                        {hasPaidFee ? (
                          <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={handlePlaceOrder}
                            disabled={isPlacingOrder || !account || !selectedAsset}
                          >
                            {isPlacingOrder ? (
                              <><Loader2 size={16} className="mr-2 animate-spin" /> กำลังประมวลผล...</>
                            ) : (
                              'ซื้อหุ้น'
                            )}
                          </Button>
                        ) : (
                          <FeePaymentModal 
                            onFeePaid={() => refetch()} 
                            trigger={
                              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                ชำระค่าธรรมเนียมเพื่อซื้อหุ้น
                              </Button>
                            }
                          />
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="sell">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">Asset</label>
                          <Select 
                            value={selectedAsset?.id.toString()} 
                            onValueChange={(value) => {
                              const asset = approvedAssets.find(a => a.id.toString() === value);
                              if (asset) setSelectedAsset(asset);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select asset" />
                            </SelectTrigger>
                            <SelectContent>
                              {approvedAssets.map(asset => (
                                <SelectItem key={asset.id} value={asset.id.toString()}>
                                  {asset.name} ({asset.symbol})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="text-xs mt-1 text-gray-500">
                            Your balance: {selectedAsset ? formatTokenValue(userBalance) : '0'} shares
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Price per Share</label>
                          <Input 
                            value={orderPrice}
                            onChange={(e) => setOrderPrice(e.target.value)}
                            placeholder="0.0000"
                          />
                          <div className="flex justify-between text-xs mt-1">
                            <span className="text-gray-500">Market: {selectedAsset ? formatEthValue(selectedAsset.pricePerShare) : '0.0000'} ETH</span>
                            <button 
                              className="text-blue-600"
                              onClick={() => setOrderPrice(selectedAsset ? (Number(selectedAsset.pricePerShare) / 1e18).toString() : '')}
                            >
                              Use Market Price
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Amount (Shares)</label>
                          <Input 
                            type="number" 
                            value={orderAmount}
                            onChange={(e) => setOrderAmount(e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        
                        <div className="pt-2 pb-4 border-t border-b border-gray-100">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm">Total Proceeds</span>
                            <span className="font-medium">{calculateTotal()} ETH</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Platform Fee (1%)</span>
                            <span className="font-medium">{(calculateTotal() * 0.01).toFixed(4)} ETH</span>
                          </div>
                        </div>
                        
                        {hasPaidFee ? (
                          <Button 
                            className="w-full bg-red-600 hover:bg-red-700"
                            onClick={handlePlaceOrder}
                            disabled={isPlacingOrder || !account || !selectedAsset}
                          >
                            {isPlacingOrder ? (
                              <><Loader2 size={16} className="mr-2 animate-spin" /> กำลังประมวลผล...</>
                            ) : (
                              'ขายหุ้น'
                            )}
                          </Button>
                        ) : (
                          <FeePaymentModal 
                            onFeePaid={() => refetch()} 
                            trigger={
                              <Button className="w-full bg-red-600 hover:bg-red-700">
                                ชำระค่าธรรมเนียมเพื่อขายหุ้น
                              </Button>
                            }
                          />
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </PageLayout>
  );
};

export default Trade;
