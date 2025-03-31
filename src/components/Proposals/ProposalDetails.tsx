
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, ExternalLink, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Proposal, castVote, executeProposal } from '@/lib/contract/contract';
import { useWeb3 } from '@/hooks/useWeb3';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTransactions } from '@/hooks/useTransactions';

interface ProposalDetailsProps {
  proposal: Proposal;
  onVoted?: () => void;
}

export const ProposalDetails = ({ proposal, onVoted }: ProposalDetailsProps) => {
  const [isVoting, setIsVoting] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const { account, contract } = useWeb3();
  const navigate = useNavigate();
  const { addTransaction, updateTransaction } = useTransactions();

  const handleVote = async (support: boolean) => {
    if (!contract || !account) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsVoting(true);
    try {
      const tx = await castVote(contract, Number(proposal.id), support, account);
      addTransaction(tx.transactionHash, `Vote ${support ? 'Yes' : 'No'} on proposal: ${proposal.title}`);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        updateTransaction(tx.transactionHash, 'success');
        toast.success(`Successfully voted ${support ? 'Yes' : 'No'}`);
        if (onVoted) onVoted();
      } else {
        updateTransaction(tx.transactionHash, 'failed');
        toast.error('Vote failed');
      }
    } catch (error) {
      console.error('Error casting vote:', error);
      toast.error(`Failed to vote: ${error.message || 'Unknown error'}`);
    } finally {
      setIsVoting(false);
    }
  };

  const handleExecute = async () => {
    if (!contract || !account) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsExecuting(true);
    try {
      const tx = await executeProposal(contract, Number(proposal.id), account);
      addTransaction(tx.transactionHash, `Execute proposal: ${proposal.title}`);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        updateTransaction(tx.transactionHash, 'success');
        toast.success('Proposal executed successfully');
        if (onVoted) onVoted();
      } else {
        updateTransaction(tx.transactionHash, 'failed');
        toast.error('Execution failed');
      }
    } catch (error) {
      console.error('Error executing proposal:', error);
      toast.error(`Failed to execute: ${error.message || 'Unknown error'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const isActive = () => {
    const now = Math.floor(Date.now() / 1000);
    return now >= Number(proposal.voteStart) && now <= Number(proposal.voteEnd);
  };

  const canExecute = () => {
    const now = Math.floor(Date.now() / 1000);
    return !proposal.executed && 
           proposal.passed && 
           now > Number(proposal.voteEnd);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl p-6 shadow-sm mb-6"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold">{proposal.title}</h3>
        {proposal.imageUrl && (
          <a
            href={proposal.imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <span className="mr-1">View Image</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <p className="text-gray-700 whitespace-pre-line">{proposal.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Asset ID</p>
          <p className="font-medium">{proposal.assetId.toString()}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Status</p>
          <div className="flex items-center">
            {proposal.executed ? (
              <span className="flex items-center text-green-600 font-medium">
                <Check className="h-4 w-4 mr-1" /> Executed
              </span>
            ) : isActive() ? (
              <span className="flex items-center text-yellow-600 font-medium">
                <Clock className="h-4 w-4 mr-1" /> Voting Active
              </span>
            ) : (
              <span className="flex items-center text-gray-600 font-medium">
                <Clock className="h-4 w-4 mr-1" /> Voting Ended
              </span>
            )}
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Voting Period</p>
          <p className="font-medium">
            {new Date(Number(proposal.voteStart) * 1000).toLocaleDateString()} - 
            {new Date(Number(proposal.voteEnd) * 1000).toLocaleDateString()}
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Vote Results</p>
          <div className="flex space-x-3">
            <span className="text-green-600 font-medium">Yes: {Number(proposal.yesVotes).toString()}</span>
            <span className="text-red-600 font-medium">No: {Number(proposal.noVotes).toString()}</span>
          </div>
        </div>
      </div>

      {!proposal.executed && isActive() && (
        <div className="border-t pt-4 mt-4">
          <h4 className="font-medium mb-3">Cast Your Vote</h4>
          <div className="flex space-x-4">
            <Button 
              onClick={() => handleVote(true)}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isVoting}
            >
              {isVoting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Vote Yes
            </Button>
            <Button 
              onClick={() => handleVote(false)}
              className="flex-1 bg-red-600 hover:bg-red-700"
              disabled={isVoting}
            >
              {isVoting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              Vote No
            </Button>
          </div>
        </div>
      )}

      {canExecute() && (
        <div className="border-t pt-4 mt-4">
          <Button 
            onClick={handleExecute}
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={isExecuting}
          >
            {isExecuting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Executing...
              </>
            ) : (
              <>
                Execute Proposal
              </>
            )}
          </Button>
        </div>
      )}
    </motion.div>
  );
};
