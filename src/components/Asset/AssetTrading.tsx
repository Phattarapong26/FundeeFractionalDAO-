import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useAssetTrading } from '@/hooks/useAssetTrading';
import { useWallet } from '@/hooks/useWallet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { Loader2, TrendingUp, DollarSign, Wallet } from 'lucide-react';

export const AssetTrading = () => {
  const { id } = useParams();
  const { walletAddress, isLoading: isWalletLoading } = useWallet();
  const { 
    currentPrice, 
    tradingVolume, 
    buyAmount, 
    setBuyAmount, 
    buyAsset, 
    isLoading 
  } = useAssetTrading(Number(id));
  
  const handleBuyAsset = async () => {
    if (!buyAmount || Number(buyAmount) <= 0) return;
    await buyAsset(Number(buyAmount));
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>การซื้อขายสินทรัพย์</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">ที่อยู่ Wallet</p>
              <p className="text-sm font-mono">
                {isWalletLoading ? (
                  <Loader2 className="animate-spin" />
                ) : walletAddress ? (
                  `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                ) : (
                  'ไม่ได้เชื่อมต่อ Wallet'
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">ราคาปัจจุบัน</p>
                <p className="text-2xl font-bold">
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    `${Number(currentPrice).toLocaleString('th-TH')} ETH`
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">ปริมาณการซื้อขาย</p>
                <p className="text-2xl font-bold">
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    `${Number(tradingVolume).toLocaleString('th-TH')} ETH`
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">จำนวนที่ต้องการซื้อ</label>
            <div className="flex space-x-2">
              <Input
                type="number"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                placeholder="ระบุจำนวน"
                disabled={isLoading || !walletAddress}
              />
              <LoadingButton
                onClick={handleBuyAsset}
                isLoading={isLoading}
                disabled={!buyAmount || Number(buyAmount) <= 0 || !walletAddress}
              >
                ซื้อสินทรัพย์
              </LoadingButton>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}; 