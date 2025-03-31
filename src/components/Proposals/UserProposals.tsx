
import { motion } from 'framer-motion';
import { FileText, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProposals, Proposal } from '@/lib/contract/contract';
import { useWeb3 } from '@/hooks/useWeb3';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const UserProposals = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const { account, contract } = useWeb3();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProposals = async () => {
      if (!contract || !account) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const allProposals = await getProposals(contract);
        // Filter proposals created by the current user
        const userProposals = allProposals.filter(
          proposal => proposal.creator.toLowerCase() === account.toLowerCase()
        );
        setProposals(userProposals);
      } catch (error) {
        console.error("Error fetching user proposals:", error);
        toast.error("Failed to load your proposals");
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, [contract, account]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-xl p-6 shadow-sm"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </motion.div>
    );
  }

  // Calculate total value of proposals
  const totalProposalValue = proposals.reduce((total, proposal) => {
    // This would be replaced with actual blockchain data calculation
    // For now, using a random value for demonstration
    const mockValue = Number(proposal.id) * 1000;
    return total + mockValue;
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl p-6 shadow-sm"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-full">
            <FileText className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold">Your Proposals</h3>
        </div>
        
        {proposals.length > 0 && (
          <div className="text-sm font-medium text-purple-600">
            Total Value: ${totalProposalValue.toLocaleString()}
          </div>
        )}
      </div>

      {proposals.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">You haven't created any proposals yet</p>
          <Button 
            onClick={() => navigate('/create-proposal')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Create a Proposal
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <div 
              key={proposal.id.toString()} 
              className="border border-gray-100 rounded-lg p-4 hover:border-purple-200 cursor-pointer"
              onClick={() => navigate(`/proposal/${proposal.id}`)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{proposal.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">{proposal.description}</p>
                </div>
                {proposal.imageUrl && (
                  <img 
                    src={proposal.imageUrl} 
                    alt={proposal.title}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="text-xs text-gray-500">
                  {proposal.executed ? 'Executed' : 'Pending'}
                </div>
                <div className="flex gap-2">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    Yes: {Number(proposal.yesVotes)}
                  </span>
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                    No: {Number(proposal.noVotes)}
                  </span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <p>Estimated Value: ${Number(proposal.id) * 1000}</p>
                <p>Current Investment: ${Number(proposal.id) * 750}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
