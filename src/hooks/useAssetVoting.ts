import { useState, useEffect } from 'react';
import { useWeb3 } from './useWeb3';
import { getContract } from '@/lib/contract/contract';

interface VotingStats {
  totalHolders: number;
  activeVoters: number;
  totalVotes: number;
  proposalCount: number;
}

export const useAssetVoting = (id: string | undefined) => {
  const { web3, contract } = useWeb3();
  const [votingStats, setVotingStats] = useState<VotingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVotingStats = async () => {
      if (!id || !contract) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const stats = await contract.methods.getVotingStats(id).call();
        
        setVotingStats({
          totalHolders: parseInt(stats.totalHolders),
          activeVoters: parseInt(stats.activeVoters),
          totalVotes: parseInt(stats.totalVotes),
          proposalCount: parseInt(stats.proposalCount)
        });
      } catch (err) {
        console.error('Error fetching voting stats:', err);
        setError('ไม่สามารถดึงข้อมูลการลงคะแนนได้');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVotingStats();
  }, [id, contract]);

  return { votingStats, isLoading, error };
}; 