import { useState, useEffect } from 'react';
import { useWeb3 } from './useWeb3';
import { toast } from 'sonner';
import { Web3 } from 'web3';

interface GovernanceData {
  votingPower: string;
  activeProposals: {
    id: number;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    status: string;
    votes: {
      yes: string;
      no: string;
    };
  }[];
  isLoading: boolean;
  createProposal: (title: string, description: string, endTime: number) => Promise<void>;
  vote: (proposalId: number, support: boolean) => Promise<void>;
  getProposals: () => Promise<void>;
}

export const useAssetGovernance = (assetId: number): GovernanceData => {
  const [votingPower, setVotingPower] = useState('0');
  const [activeProposals, setActiveProposals] = useState<{
    id: number;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    status: string;
    votes: {
      yes: string;
      no: string;
    };
  }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { contract } = useWeb3();
  const web3 = new Web3();
  
  const getVotingPower = async () => {
    if (!contract) return;
    
    try {
      const power = await contract.methods.getVotingPower(assetId).call();
      setVotingPower(web3.utils.fromWei(power, 'ether'));
    } catch (error) {
      console.error("Error fetching voting power:", error);
      toast.error("ไม่สามารถดึงอำนาจการโหวตได้");
    }
  };
  
  const getProposals = async () => {
    if (!contract) return;
    
    try {
      const proposals = await contract.methods.getProposals(assetId).call();
      setActiveProposals(proposals.map((proposal: any) => ({
        id: Number(proposal.id),
        title: proposal.title,
        description: proposal.description,
        startTime: new Date(Number(proposal.startTime) * 1000).toLocaleString('th-TH'),
        endTime: new Date(Number(proposal.endTime) * 1000).toLocaleString('th-TH'),
        status: proposal.status,
        votes: {
          yes: web3.utils.fromWei(proposal.votes.yes, 'ether'),
          no: web3.utils.fromWei(proposal.votes.no, 'ether')
        }
      })));
    } catch (error) {
      console.error("Error fetching proposals:", error);
      toast.error("ไม่สามารถดึงข้อเสนอได้");
    }
  };
  
  useEffect(() => {
    if (contract) {
      getVotingPower();
      getProposals();
    }
  }, [contract, assetId]);
  
  const createProposal = async (title: string, description: string, endTime: number) => {
    if (!contract) {
      toast.error("กรุณาเชื่อมต่อวอลเล็ตก่อน");
      return;
    }
    
    if (!title || !description) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    
    if (endTime <= Math.floor(Date.now() / 1000)) {
      toast.error("เวลาสิ้นสุดต้องมากกว่าปัจจุบัน");
      return;
    }
    
    setIsLoading(true);
    try {
      await contract.methods.createProposal(assetId, title, description, endTime).send({
        from: contract.defaultAccount,
        gas: 3000000
      });
      
      toast.success("สร้างข้อเสนอสำเร็จ");
      await getProposals();
    } catch (error) {
      console.error("Error creating proposal:", error);
      toast.error("สร้างข้อเสนอไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };
  
  const vote = async (proposalId: number, support: boolean) => {
    if (!contract) {
      toast.error("กรุณาเชื่อมต่อวอลเล็ตก่อน");
      return;
    }
    
    setIsLoading(true);
    try {
      await contract.methods.vote(assetId, proposalId, support).send({
        from: contract.defaultAccount,
        gas: 3000000
      });
      
      toast.success("โหวตสำเร็จ");
      await getProposals();
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("โหวตไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    votingPower,
    activeProposals,
    isLoading,
    createProposal,
    vote,
    getProposals
  };
}; 