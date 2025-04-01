import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Vote, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ArrowRight,
  Plus,
  FileText,
  Search,
  Loader2
} from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { castVote, executeProposal } from '@/lib/contract/contract';
import { toast } from 'sonner';
import PageLayout from '@/components/Layout/PageLayout';
import { Button } from '@/components/ui/button';
import { truncateAddress } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Proposal } from '@/lib/contract/contract';
import { useProposals } from '@/hooks/useProposals';

const Governance = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [assetFilter, setAssetFilter] = useState('all');
  const [votingInProgress, setVotingInProgress] = useState<{[key: number]: boolean}>({});
  const [executingInProgress, setExecutingInProgress] = useState<{[key: number]: boolean}>({});
  const { account, contract } = useWeb3();
  const navigate = useNavigate();
  
  // ใช้ useProposals hook
  const { proposals, loading, error, refreshProposals } = useProposals();
  
  const assets = [
    { id: 'all', name: 'All Assets' },
    { id: '1', name: 'Manhattan Luxury Apartment' },
    { id: '2', name: 'Blue-Chip Art Collection' },
    { id: '3', name: 'Napa Valley Vineyard' },
    { id: '4', name: 'Vintage Watch Collection' },
    { id: '5', name: 'Downtown Office Building' },
  ];

  useEffect(() => {
    // โหลดข้อมูลเมื่อเข้าหน้านี้โดยใช้ refreshProposals จาก hook
    refreshProposals();
  }, []);

  const handleCreateProposal = () => {
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    navigate('/create-proposal');
  };

  const handleVote = async (proposalId: number, support: boolean) => {
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!contract) {
      toast.error("Contract not initialized");
      return;
    }

    try {
      setVotingInProgress(prev => ({ ...prev, [proposalId]: true }));
      await castVote(contract, proposalId, support, account);
      toast.success(`Vote ${support ? 'YES' : 'NO'} cast successfully`);
      
      // โหลดข้อมูลใหม่
      refreshProposals();
    } catch (error) {
      console.error("Error casting vote:", error);
      toast.error(`Failed to cast vote: ${error.message || 'Unknown error'}`);
    } finally {
      setVotingInProgress(prev => ({ ...prev, [proposalId]: false }));
    }
  };

  const handleExecute = async (proposalId: number) => {
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!contract) {
      toast.error("Contract not initialized");
      return;
    }

    try {
      setExecutingInProgress(prev => ({ ...prev, [proposalId]: true }));
      await executeProposal(contract, proposalId, account);
      toast.success("Proposal executed successfully");
      
      // โหลดข้อมูลใหม่
      refreshProposals();
    } catch (error) {
      console.error("Error executing proposal:", error);
      toast.error(`Failed to execute proposal: ${error.message || 'Unknown error'}`);
    } finally {
      setExecutingInProgress(prev => ({ ...prev, [proposalId]: false }));
    }
  };
  
  // Filter proposals based on search query and asset filter
  const filteredProposals = proposals
    .filter(proposal => 
      (assetFilter === 'all' || proposal.assetId.toString() === assetFilter) &&
      (searchQuery === '' || 
       proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
       proposal.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  
  // Split proposals by status
  // Active proposals have not been executed yet and their voting period has not ended
  const activeProposals = filteredProposals.filter(p => 
    !p.executed && Number(p.voteEnd) * 1000 > Date.now()
  );
  
  // Passed proposals have not been executed yet, but their voting period has ended and they have more yes votes than no votes
  const passedProposals = filteredProposals.filter(p => 
    !p.executed && Number(p.voteEnd) * 1000 <= Date.now() && Number(p.yesVotes) > Number(p.noVotes)
  );
  
  // Rejected proposals have not been executed, their voting period has ended, and they have more no votes than yes votes
  const rejectedProposals = filteredProposals.filter(p => 
    !p.executed && Number(p.voteEnd) * 1000 <= Date.now() && Number(p.yesVotes) <= Number(p.noVotes)
  );
  
  // Check if a user has voted on a proposal
  const hasUserVoted = async (proposalId: number) => {
    if (!account || !contract) return false;
    try {
      return await contract.methods.hasVoted(proposalId, account).call();
    } catch (error) {
      console.error("Error checking if user has voted:", error);
      return false;
    }
  };
  
  const ProposalCard = ({ proposal }) => {
    const [expanded, setExpanded] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);
    const [userVote, setUserVote] = useState<boolean | null>(null);
    
    useEffect(() => {
      const checkVote = async () => {
        if (account && contract) {
          const voted = await hasUserVoted(proposal.id);
          setHasVoted(voted);
          // Note: This is simplified. In a real app, you'd need to store the actual vote (yes/no)
          // You could use events or another contract method to get this information
          setUserVote(voted ? Number(proposal.yesVotes) > Number(proposal.noVotes) : null);
        }
      };
      
      checkVote();
    }, [proposal.id, account, contract]);
    
    // Calculate time remaining in days
    const calculateDaysLeft = () => {
      const now = Date.now();
      const end = Number(proposal.voteEnd) * 1000; // Convert to milliseconds
      const diff = end - now;
      return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };
    
    // Calculate vote percentages
    const totalVotes = Number(proposal.yesVotes) + Number(proposal.noVotes);
    const yesPercentage = totalVotes > 0 ? (Number(proposal.yesVotes) / totalVotes) * 100 : 0;
    const noPercentage = totalVotes > 0 ? (Number(proposal.noVotes) / totalVotes) * 100 : 0;
    
    // Determine if the proposal is active, passed, or rejected
    const isActive = !proposal.executed && Number(proposal.voteEnd) * 1000 > Date.now();
    const isPassed = !proposal.executed && Number(proposal.voteEnd) * 1000 <= Date.now() && Number(proposal.yesVotes) > Number(proposal.noVotes);
    const isRejected = !proposal.executed && Number(proposal.voteEnd) * 1000 <= Date.now() && Number(proposal.yesVotes) <= Number(proposal.noVotes);
    const isExecuted = proposal.executed;
    
    const daysLeft = calculateDaysLeft();
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-xl p-6 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold">{proposal.title}</h3>
              {isActive && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">Active</span>
              )}
              {isPassed && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Passed</span>
              )}
              {isRejected && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">Rejected</span>
              )}
              {isExecuted && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">Executed</span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Asset ID: {proposal.assetId.toString()}
              {assets.find(a => a.id === proposal.assetId.toString())?.name && 
                ` - ${assets.find(a => a.id === proposal.assetId.toString())?.name}`}
            </p>
          </div>
          {isActive && (
            <div className="flex items-center mt-2 md:mt-0">
              <Clock size={16} className="text-orange-500 mr-1.5" />
              <span className="text-sm text-orange-500 font-medium">{daysLeft} days left</span>
            </div>
          )}
        </div>
        
        <p className="text-gray-600 mb-6">{proposal.description}</p>
        
        <div className="space-y-3 mb-6">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Yes Votes</span>
              <span className="font-medium">{yesPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-green-500 h-full rounded-full" 
                style={{ width: `${yesPercentage}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>No Votes</span>
              <span className="font-medium">{noPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-red-500 h-full rounded-full" 
                style={{ width: `${noPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {isActive && (
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <Vote size={16} className="text-blue-600 mr-1.5" />
              <span className="text-sm">
                {hasVoted
                  ? `You voted ${userVote ? '✓ Yes' : '✗ No'}`
                  : 'You have not voted yet'}
              </span>
            </div>
            {!hasVoted ? (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800 border-green-200"
                  disabled={votingInProgress[proposal.id]}
                  onClick={() => handleVote(proposal.id, true)}
                >
                  {votingInProgress[proposal.id] ? (
                    <><Loader2 size={16} className="mr-2 animate-spin" /> Voting...</>
                  ) : (
                    'Vote Yes'
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800 border-red-200"
                  disabled={votingInProgress[proposal.id]}
                  onClick={() => handleVote(proposal.id, false)}
                >
                  {votingInProgress[proposal.id] ? (
                    <><Loader2 size={16} className="mr-2 animate-spin" /> Voting...</>
                  ) : (
                    'Vote No'
                  )}
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline"
                onClick={() => setExpanded(!expanded)} 
              >
                {expanded ? 'Show Less' : 'Show More'}
              </Button>
            )}
          </div>
        )}
        
        {isPassed && (
          <div className="flex justify-end mt-4">
            <Button
              variant="default"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={executingInProgress[proposal.id]}
              onClick={() => handleExecute(proposal.id)}
            >
              {executingInProgress[proposal.id] ? (
                <><Loader2 size={16} className="mr-2 animate-spin" /> Executing...</>
              ) : (
                'Execute Proposal'
              )}
            </Button>
          </div>
        )}
        
        {(isRejected || isExecuted || expanded) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-6 pt-6 border-t border-gray-100"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <p className="text-sm text-gray-500">Created By</p>
                <p className="font-medium">{truncateAddress(proposal.creator || '0x0000000000000000000000000000000000000000')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Voting Period</p>
                <p className="font-medium">
                  {new Date(Number(proposal.voteStart) * 1000).toLocaleDateString()} - 
                  {new Date(Number(proposal.voteEnd) * 1000).toLocaleDateString()}
                </p>
              </div>
              {isExecuted && (
                <div>
                  <p className="text-sm text-gray-500">Executed On</p>
                  <p className="font-medium">{new Date(Number(proposal.executionTime) * 1000).toLocaleDateString()}</p>
                </div>
              )}
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Execution Data</p>
                <p className="font-medium break-words">{proposal.executionData}</p>
              </div>
            </div>
            
            {isExecuted && (
              <Button variant="outline" className="mt-4">View Transaction</Button>
            )}
          </motion.div>
        )}
      </motion.div>
    );
  };
  
  return (
    <PageLayout className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-3xl font-bold mb-4">Governance</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Participate in decentralized governance by voting on proposals and shaping the future of your assets.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 bg-white p-6 rounded-xl shadow-sm"
        >
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="flex-grow relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search proposals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            
            <div className="flex gap-4">
              <div className="relative min-w-[250px]">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <select
                  value={assetFilter}
                  onChange={(e) => setAssetFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  {assets.map(asset => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleCreateProposal}
              >
                <Plus size={18} />
                <span>New Proposal</span>
              </Button>
            </div>
          </div>
        </motion.div>
        
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span>Active ({activeProposals.length})</span>
            </TabsTrigger>
            <TabsTrigger value="passed" className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>Passed ({passedProposals.length})</span>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircle size={16} />
              <span>Rejected ({rejectedProposals.length})</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 size={48} className="animate-spin text-blue-600" />
                </div>
              ) : activeProposals.length > 0 ? (
                activeProposals.map(proposal => (
                  <ProposalCard key={proposal.id} proposal={proposal} />
                ))
              ) : (
                <div className="text-center py-20 bg-white rounded-xl">
                  <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold mb-2">No Active Proposals</h3>
                  <p className="text-gray-500 mb-6">
                    There are currently no active proposals for voting.
                  </p>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleCreateProposal}
                  >
                    Create New Proposal
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="passed">
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 size={48} className="animate-spin text-blue-600" />
                </div>
              ) : passedProposals.length > 0 ? (
                passedProposals.map(proposal => (
                  <ProposalCard key={proposal.id} proposal={proposal} />
                ))
              ) : (
                <div className="text-center py-20 bg-white rounded-xl">
                  <CheckCircle2 size={48} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold mb-2">No Passed Proposals</h3>
                  <p className="text-gray-500">
                    There are currently no proposals that have passed.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="rejected">
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 size={48} className="animate-spin text-blue-600" />
                </div>
              ) : rejectedProposals.length > 0 ? (
                rejectedProposals.map(proposal => (
                  <ProposalCard key={proposal.id} proposal={proposal} />
                ))
              ) : (
                <div className="text-center py-20 bg-white rounded-xl">
                  <XCircle size={48} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold mb-2">No Rejected Proposals</h3>
                  <p className="text-gray-500">
                    There are currently no proposals that have been rejected.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default Governance;
