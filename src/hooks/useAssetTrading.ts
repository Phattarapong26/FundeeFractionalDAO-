import { useState, useEffect } from 'react';
import { useWeb3 } from './useWeb3';
import { getContract } from '@/lib/contract/contract';

interface TradingStats {
  currentPrice: number;
  priceChange24h: number;
  volume24h: number;
  transactions24h: number;
}

export const useAssetTrading = (id: string | undefined) => {
  const { web3, contract } = useWeb3();
  const [tradingStats, setTradingStats] = useState<TradingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTradingStats = async () => {
      if (!id || !contract) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const stats = await contract.methods.getTradingStats(id).call();
        
        setTradingStats({
          currentPrice: parseFloat(stats.currentPrice),
          priceChange24h: parseFloat(stats.priceChange24h),
          volume24h: parseFloat(stats.volume24h),
          transactions24h: parseInt(stats.transactions24h)
        });
      } catch (err) {
        console.error('Error fetching trading stats:', err);
        setError('ไม่สามารถดึงข้อมูลการซื้อขายได้');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTradingStats();
  }, [id, contract]);

  return { tradingStats, isLoading, error };
}; 