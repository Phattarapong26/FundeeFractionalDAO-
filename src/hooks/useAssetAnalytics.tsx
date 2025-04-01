import { useState, useEffect } from 'react';
import { useWeb3 } from './useWeb3';
import { toast } from 'sonner';
import { Web3 } from 'web3';

interface AnalyticsData {
  totalValue: string;
  totalShares: string;
  totalHolders: number;
  tradingVolume: string;
  trades: {
    id: number;
    buyer: string;
    seller: string;
    amount: string;
    price: string;
    timestamp: string;
  }[];
  orders: {
    id: number;
    trader: string;
    amount: string;
    price: string;
    isBuyOrder: boolean;
    timestamp: string;
    isActive: boolean;
  }[];
  isLoading: boolean;
  getAnalytics: () => Promise<void>;
}

export const useAssetAnalytics = (assetId: number): AnalyticsData => {
  const [totalValue, setTotalValue] = useState('0');
  const [totalShares, setTotalShares] = useState('0');
  const [totalHolders, setTotalHolders] = useState(0);
  const [tradingVolume, setTradingVolume] = useState('0');
  const [trades, setTrades] = useState<{
    id: number;
    buyer: string;
    seller: string;
    amount: string;
    price: string;
    timestamp: string;
  }[]>([]);
  const [orders, setOrders] = useState<{
    id: number;
    trader: string;
    amount: string;
    price: string;
    isBuyOrder: boolean;
    timestamp: string;
    isActive: boolean;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { contract } = useWeb3();
  const web3 = new Web3();
  
  const getAnalytics = async () => {
    if (!contract) return;
    
    setIsLoading(true);
    try {
      const [
        asset,
        tradesCount,
        ordersCount
      ] = await Promise.all([
        contract.methods.getAsset(assetId).call(),
        contract.methods.tradeIdCounter().call(),
        contract.methods.orderIdCounter().call()
      ]);
      
      setTotalValue(web3.utils.fromWei(asset.totalValue, 'ether'));
      setTotalShares(web3.utils.fromWei(asset.totalShares, 'ether'));
      setTotalHolders(Number(asset.investorCount));
      
      // ดึงข้อมูล trades
      const tradesData = [];
      for (let i = 1; i < Number(tradesCount); i++) {
        const trade = await contract.methods.trades(i).call();
        if (Number(trade.assetId) === assetId) {
          tradesData.push({
            id: Number(trade.id),
            buyer: trade.buyer,
            seller: trade.seller,
            amount: web3.utils.fromWei(trade.amount, 'ether'),
            price: web3.utils.fromWei(trade.price, 'ether'),
            timestamp: new Date(Number(trade.timestamp) * 1000).toLocaleString('th-TH')
          });
        }
      }
      setTrades(tradesData);
      
      // คำนวณปริมาณการซื้อขาย
      const volume = tradesData.reduce((acc, trade) => acc + Number(trade.amount), 0);
      setTradingVolume(volume.toString());
      
      // ดึงข้อมูล orders
      const ordersData = [];
      for (let i = 1; i < Number(ordersCount); i++) {
        const order = await contract.methods.orders(i).call();
        if (Number(order.assetId) === assetId) {
          ordersData.push({
            id: Number(order.id),
            trader: order.trader,
            amount: web3.utils.fromWei(order.amount, 'ether'),
            price: web3.utils.fromWei(order.price, 'ether'),
            isBuyOrder: order.isBuyOrder,
            timestamp: new Date(Number(order.timestamp) * 1000).toLocaleString('th-TH'),
            isActive: order.isActive
          });
        }
      }
      setOrders(ordersData);
      
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("ไม่สามารถดึงข้อมูลการวิเคราะห์ได้");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (contract) {
      getAnalytics();
    }
  }, [contract, assetId]);
  
  return {
    totalValue,
    totalShares,
    totalHolders,
    tradingVolume,
    trades,
    orders,
    isLoading,
    getAnalytics
  };
}; 