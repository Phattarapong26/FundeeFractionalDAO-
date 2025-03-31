import { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { usePlatformToken } from '@/hooks/usePlatformToken';
import { useFeeStatus } from '@/hooks/useFeeStatus';
import { buyPlatformTokens, getPlatformTokenContract } from '@/lib/contract/platformToken';
import PageLayout from '@/components/Layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FeePaymentModal } from '@/components/Platform/FeePaymentModal';
import { toast } from 'sonner';
import { formatEthValue } from '@/lib/utils';

const TokenMarketplace = () => {
  const [purchaseAmount, setPurchaseAmount] = useState<string>('100');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { account, web3, connectWallet } = useWeb3();
  const { balance, refetch } = usePlatformToken();
  const { hasPaidFee, refetch: refetchFeeStatus } = useFeeStatus();
  
  // Token price in ETH
  const tokenPrice = 0.0001;
  const totalCost = Number(purchaseAmount) * tokenPrice;
  
  const handlePurchase = async () => {
    if (!web3 || !account) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    if (!hasPaidFee) {
      toast.error("You need to pay the transaction fee first");
      return;
    }
    
    if (Number(purchaseAmount) <= 0) {
      toast.error("Please enter a valid amount to purchase");
      return;
    }
    
    try {
      setIsProcessing(true);
      const tokenContract = getPlatformTokenContract(web3);
      
      if (!tokenContract) {
        throw new Error("Failed to initialize token contract");
      }
      
      const valueInWei = web3.utils.toWei(totalCost.toString(), 'ether');
      await buyPlatformTokens(tokenContract, valueInWei, account);
      
      toast.success(`Successfully purchased ${purchaseAmount} FUNDFA tokens!`);
      refetch(); // Refresh the token balance
    } catch (error) {
      console.error("Token purchase error:", error);
      toast.error("Failed to purchase tokens. Please try again.");
    } finally {
      setIsProcessing(false);
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
          <h1 className="text-3xl font-bold mb-4">Token Marketplace</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Purchase platform tokens (FUNDFA) to increase your governance voting power and participate in the DAO.
          </p>
        </motion.div>
        
        {!account ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center bg-white p-10 rounded-xl shadow-sm"
          >
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Connect your wallet to purchase platform tokens and participate in governance.
            </p>
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={connectWallet}
            >
              Connect Wallet
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <Coins className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle>Purchase Platform Tokens</CardTitle>
                      <CardDescription>FUNDFA tokens provide governance voting rights on the platform</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {!hasPaidFee && (
                    <Alert variant="warning" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Transaction fee required</AlertTitle>
                      <AlertDescription className="flex justify-between items-center flex-wrap">
                        <span>You need to pay a one-time fee to perform transactions on the platform.</span>
                        <FeePaymentModal 
                          onFeePaid={refetchFeeStatus} 
                          trigger={<Button size="sm" variant="outline" className="mt-2 sm:mt-0">Pay Fee Now</Button>}
                        />
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Token Amount
                      </label>
                      <div className="flex gap-4 items-center">
                        <Slider
                          value={[Number(purchaseAmount)]}
                          min={1}
                          max={10000}
                          step={1}
                          onValueChange={(value) => setPurchaseAmount(value[0].toString())}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={purchaseAmount}
                          onChange={(e) => setPurchaseAmount(e.target.value)}
                          className="w-24"
                          min={1}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Select the number of tokens you want to purchase</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Price per token:</span>
                        <span>{formatEthValue(tokenPrice * 1e18)}</span>
                      </div>
                      <div className="flex justify-between font-medium text-lg">
                        <span>Total cost:</span>
                        <span>{formatEthValue(totalCost * 1e18)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-between flex-wrap">
                  <p className="text-sm text-gray-500">
                    Tokens will be sent to your connected wallet: {account.substring(0, 6)}...{account.substring(account.length - 4)}
                  </p>
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700 mt-4 sm:mt-0"
                    onClick={handlePurchase}
                    disabled={isProcessing || !hasPaidFee}
                  >
                    {isProcessing ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                    ) : (
                      <><ArrowRight className="mr-2 h-4 w-4" /> Purchase Tokens</>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Your Token Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{balance.toLocaleString()} FUNDFA</div>
                  <p className="text-sm text-gray-600">Current voting power</p>
                  
                  <div className="mt-6 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Token Utility</h4>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li className="flex items-start gap-2">
                          <div className="rounded-full bg-green-100 p-1 mt-0.5">
                            <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span>Weighted voting in governance proposals</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="rounded-full bg-green-100 p-1 mt-0.5">
                            <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span>Access to premium investment opportunities</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="rounded-full bg-green-100 p-1 mt-0.5">
                            <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span>Pay transaction fees at a discount</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default TokenMarketplace;
