import { useState, useEffect } from 'react';
import { useWeb3 } from './useWeb3';
import { getContract } from '@/lib/contract/contract';

interface Asset {
  id: string;
  name: string;
  symbol: string;
  totalSupply: string;
  owner: string;
  description: string;
  imageUrl: string;
  createdAt: number;
}

export const useAsset = (id: string | undefined) => {
  const { web3, contract } = useWeb3();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAsset = async () => {
      if (!id || !contract) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const assetData = await contract.methods.getAsset(id).call();
        
        setAsset({
          id,
          name: assetData.name,
          symbol: assetData.symbol,
          totalSupply: assetData.totalSupply,
          owner: assetData.owner,
          description: assetData.description,
          imageUrl: assetData.imageUrl,
          createdAt: parseInt(assetData.createdAt)
        });
      } catch (err) {
        console.error('Error fetching asset:', err);
        setError('ไม่สามารถดึงข้อมูลสินทรัพย์ได้');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAsset();
  }, [id, contract]);

  return { asset, isLoading, error };
}; 