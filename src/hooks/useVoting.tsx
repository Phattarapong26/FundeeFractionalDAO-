import { useState, useEffect } from 'react';
import { useWeb3 } from './useWeb3';
import { toast } from 'sonner';
import { Web3 } from 'web3';

interface VotingData {
  votingWeight: string;
  activeProposals: Proposal[];
  isLoading: boolean;
  createProposal: (title: string, description: string, endTime: number) => Promise<void>;
  vote: (proposalId: number, support: boolean) => Promise<void>;
  getVotingHistory: () => Promise<VotingHistory[]>;
}

interface Proposal {
  id: number;
  title: string;
  description: string;
  creator: string;
  startTime: number;
  endTime: number;
  forVotes: string;
  againstVotes: string;
  executed: boolean;
  status: 'active' | 'ended' | 'executed';
}

interface VotingHistory {
  id: number;
  proposalId: number;
  voter: string;
  support: boolean;
  weight: string;
  timestamp: number;
}

export const useVoting = (): VotingData => {
  const [votingWeight, setVotingWeight] = useState('0');
  const [activeProposals, setActiveProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { account, contract } = useWeb3();
  const web3 = new Web3();
  
  const fetchVotingData = async () => {
    if (!contract || !account) return;
    
    try {
      // ดึงน้ำหนักการโหวต
      const weightWei = await contract.methods.getVotingWeight(account).call();
      setVotingWeight(web3.utils.fromWei(weightWei, 'ether'));
      
      // ดึงข้อเสนอที่กำลังดำเนินการ
      const proposals = await contract.methods.getActiveProposals().call();
      setActiveProposals(proposals.map((proposal: any) => ({
        id: Number(proposal.id),
        title: proposal.title,
        description: proposal.description,
        creator: proposal.creator,
        startTime: Number(proposal.startTime),
        endTime: Number(proposal.endTime),
        forVotes: web3.utils.fromWei(proposal.forVotes, 'ether'),
        againstVotes: web3.utils.fromWei(proposal.againstVotes, 'ether'),
        executed: proposal.executed,
        status: proposal.executed ? 'executed' : 
                Number(proposal.endTime) < Math.floor(Date.now() / 1000) ? 'ended' : 'active'
      })));
    } catch (error) {
      console.error("Error fetching voting data:", error);
      toast.error("ไม่สามารถดึงข้อมูลการโหวตได้");
    }
  };
  
  useEffect(() => {
    if (contract && account) {
      fetchVotingData();
    }
  }, [contract, account]);
  
  const createProposal = async (title: string, description: string, endTime: number) => {
    if (!contract || !account) {
      toast.error("กรุณาเชื่อมต่อวอลเล็ตก่อน");
      return;
    }
    
    setIsLoading(true);
    try {
      await contract.methods.createProposal(title, description, endTime).send({
        from: account,
        gas: 3000000
      });
      
      toast.success("สร้างข้อเสนอสำเร็จ");
      await fetchVotingData();
    } catch (error) {
      console.error("Error creating proposal:", error);
      toast.error("สร้างข้อเสนอไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };
  
  const vote = async (proposalId: number, support: boolean) => {
    if (!contract || !account) {
      toast.error("กรุณาเชื่อมต่อวอลเล็ตก่อน");
      return;
    }
    
    setIsLoading(true);
    try {
      await contract.methods.vote(proposalId, support).send({
        from: account,
        gas: 3000000
      });
      
      toast.success("โหวตสำเร็จ");
      await fetchVotingData();
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("โหวตไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };
  
  const getVotingHistory = async (): Promise<VotingHistory[]> => {
    if (!contract || !account) return [];
    
    try {
      const history = await contract.methods.getVotingHistory(account).call();
      return history.map((item: any) => ({
        id: Number(item.id),
        proposalId: Number(item.proposalId),
        voter: item.voter,
        support: item.support,
        weight: web3.utils.fromWei(item.weight, 'ether'),
        timestamp: Number(item.timestamp)
      }));
    } catch (error) {
      console.error("Error fetching voting history:", error);
      toast.error("ไม่สามารถดึงประวัติการโหวตได้");
      return [];
    }
  };
  
  return {
    votingWeight,
    activeProposals,
    isLoading,
    createProposal,
    vote,
    getVotingHistory
  };
}; 