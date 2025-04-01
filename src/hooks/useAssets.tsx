import { useState, useEffect, useCallback } from 'react';
import { Asset, getAssets } from '@/lib/contract/contract';
import { useWeb3 } from '@/hooks/useWeb3';
import { toast } from 'sonner';

export interface AssetData {
  assets: Asset[];
  loading: boolean;
  refetch: () => Promise<void>;
  getAssetById: (id: number) => Asset | undefined;
}

export const useAssets = (): AssetData => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const { contract } = useWeb3();

  const fetchAssets = useCallback(async () => {
    if (!contract) return;
    
    try {
      console.log("Fetching assets from contract...");
      setLoading(true);
      const fetchedAssets = await getAssets(contract);
      console.log("Fetched assets:", fetchedAssets);
      setAssets(fetchedAssets);
    } catch (error) {
      console.error("Error fetching assets:", error);
      toast.error("Failed to load assets");
    } finally {
      setLoading(false);
    }
  }, [contract]);

  useEffect(() => {
    if (contract) {
      fetchAssets();
    } else {
      setLoading(false);
    }
  }, [contract, fetchAssets]);

  const getAssetById = (id: number): Asset | undefined => {
    return assets.find(asset => Number(asset.id) === id);
  };

  return {
    assets,
    loading,
    refetch: fetchAssets,
    getAssetById
  };
};
