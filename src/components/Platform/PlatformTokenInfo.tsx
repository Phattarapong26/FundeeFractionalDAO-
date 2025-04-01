import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Coins, ArrowRight, ExternalLink, AlertCircle, ArrowUpDown, Loader2 } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { formatNumber } from '@/lib/utils';
import { usePlatformToken } from '@/hooks/usePlatformToken';
import { PLATFORM_TOKEN_ADDRESS } from '@/lib/contract/platformToken';
import { useFeeStatus } from '@/hooks/useFeeStatus';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export const PlatformTokenInfo = () => {
  const [totalSupply, setTotalSupply] = useState<number>(1000000);
  const [tokenPrice, setTokenPrice] = useState<number>(0.05);
  const [votingPower, setVotingPower] = useState<number>(0);
  const { account } = useWeb3();
  const { balance: tokenBalance, tokenAddress, price, totalSupply: platformTotalSupply, isLoading, buyTokens, payFeeWithToken } = usePlatformToken();
  const { hasPaidFee, isLoading: feeStatusLoading, payWithETH, payWithToken } = useFeeStatus();
  const navigate = useNavigate();
  const [buyAmount, setBuyAmount] = useState('');
  
  useEffect(() => {
    if (!account) return;
    
    // Calculate voting power based on token balance (e.g., 1 token = 1 vote)
    const calculatedVotingPower = (tokenBalance / totalSupply) * 100;
    setVotingPower(calculatedVotingPower);
  }, [account, tokenBalance, totalSupply]);
  
  const handleBuyTokens = async () => {
    if (!buyAmount || isNaN(Number(buyAmount)) || Number(buyAmount) <= 0) {
      toast.error("กรุณากรอกจำนวน token ที่ต้องการซื้อ");
      return;
    }
    
    await buyTokens(Number(buyAmount));
    setBuyAmount('');
  };
  
  const handlePayFee = async () => {
    if (!tokenBalance || Number(tokenBalance) <= 0) {
      toast.error("ยอด token ไม่เพียงพอ");
      return;
    }
    
    await payFeeWithToken(Number(tokenBalance));
  };
  
  if (!account) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-full">
              <Coins className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle>Platform Tokens (FUNDFA)</CardTitle>
              <CardDescription>Your governance power on the platform</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!hasPaidFee && (
            <Alert variant="warning" className="mb-4">
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
        
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Your Balance</p>
              <p className="text-2xl font-bold">{formatNumber(tokenBalance)} FUNDFA</p>
              <p className="text-xs text-gray-500">≈ ${formatNumber(tokenBalance * tokenPrice, 2)}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Token Price</p>
              <p className="text-2xl font-bold">${tokenPrice.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Last updated today</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Voting Power</p>
              <p className="text-2xl font-bold">{votingPower.toFixed(2)}%</p>
              <p className="text-xs text-gray-500">Of total governance power</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Your Share of Total Supply</span>
                <span>{(tokenBalance / totalSupply * 100).toFixed(2)}%</span>
              </div>
              <Progress value={(tokenBalance / totalSupply) * 100} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {formatNumber(tokenBalance)} of {formatNumber(totalSupply)} total tokens
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3 justify-end">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => navigate('/token-marketplace')}
              >
                Buy More Tokens <ArrowRight className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => navigate('/trade')}
              >
                Trade Tokens <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5" />
            ซื้อ Token
          </CardTitle>
          <CardDescription>
            ซื้อ FUNDFA token ด้วย ETH
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">จำนวน FUNDFA ที่ต้องการซื้อ</label>
              <Input
                type="number"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                placeholder="0"
                disabled={isLoading}
              />
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">ราคารวม</span>
              <span className="font-medium">
                {buyAmount && !isNaN(Number(buyAmount)) && Number(buyAmount) > 0
                  ? `${(Number(buyAmount) * Number(price)).toLocaleString()} ETH`
                  : '0 ETH'}
              </span>
            </div>
            
            <Button
              className="w-full"
              onClick={handleBuyTokens}
              disabled={isLoading || !buyAmount || isNaN(Number(buyAmount)) || Number(buyAmount) <= 0}
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> กำลังประมวลผล...</>
              ) : (
                'ซื้อ Token'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>จ่ายค่าธรรมเนียมด้วย FUNDFA</CardTitle>
          <CardDescription>
            ใช้ FUNDFA token จ่ายค่าธรรมเนียมการทำธุรกรรม
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">ยอด FUNDFA ที่ใช้จ่าย</span>
              <span className="font-medium">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  `${Number(tokenBalance).toLocaleString()} FUNDFA`
                )}
              </span>
            </div>
            
            <Button
              className="w-full"
              onClick={handlePayFee}
              disabled={isLoading || !tokenBalance || Number(tokenBalance) <= 0}
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> กำลังประมวลผล...</>
              ) : (
                'จ่ายค่าธรรมเนียม'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
