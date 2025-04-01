import { useState, useEffect } from 'react';
import { Proposal, getProposals } from '@/lib/contract/contract';
import { useWeb3 } from './useWeb3';
import { toast } from 'sonner';

export const useProposals = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { contract } = useWeb3();

  const fetchProposals = async () => {
    if (!contract) {
      setLoading(false);
      setError('Contract is not initialized');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Fetching proposals...");
      
      const fetchedProposals = await getProposals(contract);
      console.log("Proposals fetched successfully:", fetchedProposals.length);
      
      setProposals(fetchedProposals);
    } catch (err) {
      console.error("Error in useProposals hook:", err);
      setError('Failed to load proposals');
      toast.error("Could not load proposals. Using available data instead.");
      
      // ใช้ข้อมูลจาก localStorage ถ้ามี
      try {
        const savedProposals = localStorage.getItem('mockProposals');
        if (savedProposals) {
          const parsedProposals = JSON.parse(savedProposals);
          console.log("Using saved proposals from localStorage:", parsedProposals.length);
          setProposals(parsedProposals);
        }
      } catch (storageError) {
        console.error("Error reading from localStorage:", storageError);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [contract]);

  const refreshProposals = () => {
    fetchProposals();
  };

  return { proposals, loading, error, refreshProposals };
}; 