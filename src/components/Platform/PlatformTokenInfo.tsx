import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Coins, ArrowRight, ExternalLink, AlertCircle } from 'lucide-react';
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

export const PlatformTokenInfo = () => {
  const [totalSupply, setTotalSupply] = useState<number>(1000000);
  const [tokenPrice, setTokenPrice] = useState<number>(0.05);
  const [votingPower, setVotingPower] = useState<number>(0);
  const { account } = useWeb3();
  const { balance: tokenBalance, tokenAddress } = usePlatformToken();
  const { hasPaidFee, isLoading: feeStatusLoading, payWithETH, payWithToken } = useFeeStatus();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!account) return;
    
    // Calculate voting power based on token balance (e.g., 1 token = 1 vote)
    const calculatedVotingPower = (tokenBalance / totalSupply) * 100;
    setVotingPower(calculatedVotingPower);
  }, [account, tokenBalance, totalSupply]);
  
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
    </motion.div>
  );
};
