
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import PageLayout from '@/components/Layout/PageLayout';
import { Button } from '@/components/ui/button';
import { ProposalDetails as ProposalDetailsComponent } from '@/components/Proposals/ProposalDetails';
import { useWeb3 } from '@/hooks/useWeb3';
import { getProposals, Proposal } from '@/lib/contract/contract';
import { toast } from 'sonner';

const ProposalDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const { contract } = useWeb3();
  const navigate = useNavigate();

  const fetchProposal = async () => {
    if (!contract || !id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const proposals = await getProposals(contract);
      const foundProposal = proposals.find(p => p.id.toString() === id);

      if (foundProposal) {
        setProposal(foundProposal);
      } else {
        toast.error('Proposal not found');
        navigate('/governance');
      }
    } catch (error) {
      console.error('Error fetching proposal:', error);
      toast.error('Failed to load proposal details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposal();
  }, [contract, id]);

  return (
    <PageLayout className="bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/governance')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Governance
          </Button>
          <h1 className="text-3xl font-bold">Proposal Details</h1>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          </div>
        ) : proposal ? (
          <ProposalDetailsComponent proposal={proposal} onVoted={fetchProposal} />
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Proposal not found</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default ProposalDetailsPage;
