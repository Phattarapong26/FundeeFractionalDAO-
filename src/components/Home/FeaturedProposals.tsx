
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getContract, getProposals, Proposal } from '@/lib/contract/contract';
import { useWeb3 } from '@/hooks/useWeb3';

const FeaturedProposals = () => {
  const navigate = useNavigate();
  const [featuredProposals, setFeaturedProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const { web3, contract } = useWeb3();

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        setLoading(true);
        if (!contract) {
          console.log("Contract not initialized");
          return;
        }
        
        const proposals = await getProposals(contract);
        
        // Filter for passed proposals that have been voted on
        const votedProposals = proposals
          .filter(p => Number(p.yesVotes) > 0 || Number(p.noVotes) > 0)
          .sort((a, b) => (Number(b.yesVotes) + Number(b.noVotes)) - (Number(a.yesVotes) + Number(a.noVotes)))
          .slice(0, 3);
        
        setFeaturedProposals(votedProposals);
      } catch (error) {
        console.error("Error fetching featured proposals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, [contract]);

  // Placeholder proposals when no data or loading
  const placeholderProposals = [
    {
      id: 1,
      title: "Renovation of Manhattan Property",
      description: "Proposal to allocate funds for renovations to increase property value and rental income.",
      assetId: 1,
      yesVotes: 68,
      noVotes: 32,
      voteEnd: Date.now() + 2592000000, // 30 days from now
      delay: 0.1
    },
    {
      id: 2,
      title: "Expansion of Vineyard Operations",
      description: "Investment in additional acreage to increase wine production and revenue streams.",
      assetId: 3,
      yesVotes: 75,
      noVotes: 25,
      voteEnd: Date.now() + 1296000000, // 15 days from now
      delay: 0.2
    },
    {
      id: 3,
      title: "Art Collection Exhibition",
      description: "Organizing a touring exhibition to increase the collection's value and generate income.",
      assetId: 2,
      yesVotes: 93,
      noVotes: 7,
      voteEnd: Date.now() + 864000000, // 10 days from now
      delay: 0.3
    }
  ];

  const displayProposals = featuredProposals.length > 0 ? featuredProposals : placeholderProposals;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {displayProposals.map((proposal, index) => {
        const realProposal = 'description' in proposal;
        const totalVotes = realProposal ? 
          Number(proposal.yesVotes) + Number(proposal.noVotes) : 
          proposal.yesVotes + proposal.noVotes;
        
        const yesPercentage = totalVotes > 0 ? 
          (realProposal ? (Number(proposal.yesVotes) / totalVotes) : (proposal.yesVotes / totalVotes)) * 100 : 0;
        
        const noPercentage = totalVotes > 0 ? 
          (realProposal ? (Number(proposal.noVotes) / totalVotes) : (proposal.noVotes / totalVotes)) * 100 : 0;
        
        const remainingTime = new Date(realProposal ? Number(proposal.voteEnd) * 1000 : proposal.voteEnd).getTime() - new Date().getTime();
        const daysRemaining = Math.max(0, Math.floor(remainingTime / (1000 * 60 * 60 * 24)));
        
        return (
          <motion.div
            key={realProposal ? proposal.id.toString() : proposal.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: (typeof proposal.delay === 'number') ? proposal.delay : 0.1 * index }}
            viewport={{ once: true }}
            className="card group overflow-hidden"
          >
            <div className="mb-4">
              <span className="chip bg-blue-100 text-dao mb-2">Proposal #{realProposal ? proposal.id.toString() : proposal.id}</span>
              <h3 className="heading-sm mb-2">{proposal.title}</h3>
              <p className="text-gray-600 mb-4">{realProposal ? proposal.description.substring(0, 100) + '...' : proposal.description}</p>
            </div>
            
            <div className="space-y-3 mb-6">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Yes Votes</span>
                  <span className="font-medium">{yesPercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full rounded-full" style={{ width: `${yesPercentage}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>No Votes</span>
                  <span className="font-medium">{noPercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full rounded-full" style={{ width: `${noPercentage}%` }}></div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-sm text-gray-500 mb-6">
              <span>{daysRemaining} days remaining</span>
              <span>{totalVotes} votes cast</span>
            </div>
            
            <button 
              onClick={() => navigate(`/proposal/${realProposal ? proposal.id.toString() : proposal.id}`)}
              className="btn-primary w-full"
            >
              View Proposal
            </button>
          </motion.div>
        );
      })}
    </div>
  );
};

export default FeaturedProposals;
