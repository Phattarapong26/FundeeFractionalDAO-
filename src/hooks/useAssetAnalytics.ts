import { useState, useEffect } from 'react';
import { useWeb3 } from './useWeb3';
import { getContract } from '@/lib/contract/contract';

interface Analytics {
  volume24h: number;
  transactions24h: number;
  averagePrice: number;
  priceChange24h: number;
}

export const useAssetAnalytics = (id: string | undefined) => {
  const { web3, contract } = useWeb3();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!id || !contract) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await contract.methods.getAnalytics(id).call();
        
        setAnalytics({
          volume24h: parseFloat(data.volume24h),
          transactions24h: parseInt(data.transactions24h),
          averagePrice: parseFloat(data.averagePrice),
          priceChange24h: parseFloat(data.priceChange24h)
        });
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('ไม่สามารถดึงข้อมูลการวิเคราะห์ได้');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [id, contract]);

  return { analytics, isLoading, error };
}; 