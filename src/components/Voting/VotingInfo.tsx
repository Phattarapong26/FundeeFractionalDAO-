import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Vote, Loader2, History, Plus, CheckCircle, XCircle } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useVoting } from '@/hooks/useVoting';
import { formatNumber } from '@/lib/utils';
import { toast } from 'sonner';

interface VotingHistory {
  id: number;
  proposalId: number;
  voter: string;
  support: boolean;
  weight: string;
  timestamp: number;
}

export const VotingInfo = () => {
  const { account } = useWeb3();
  const { 
    votingWeight, 
    activeProposals, 
    isLoading, 
    createProposal, 
    vote,
    getVotingHistory
  } = useVoting();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [endTime, setEndTime] = useState('');
  const [votingHistory, setVotingHistory] = useState<VotingHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  useEffect(() => {
    if (!account) return;
    
    const fetchHistory = async () => {
      setHistoryLoading(true);
      try {
        const history = await getVotingHistory();
        setVotingHistory(history);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setHistoryLoading(false);
      }
    };
    
    fetchHistory();
  }, [account]);
  
  const handleCreateProposal = async () => {
    if (!title || !description || !endTime) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    
    const endTimestamp = Math.floor(new Date(endTime).getTime() / 1000);
    if (endTimestamp <= Math.floor(Date.now() / 1000)) {
      toast.error("เวลาสิ้นสุดต้องมากกว่าเวลาปัจจุบัน");
      return;
    }
    
    await createProposal(title, description, endTimestamp);
    setTitle('');
    setDescription('');
    setEndTime('');
  };
  
  const handleVote = async (proposalId: number, support: boolean) => {
    await vote(proposalId, support);
  };
  
  if (!account) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-full">
              <Vote className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle>ระบบโหวต</CardTitle>
              <CardDescription>สร้างข้อเสนอและโหวตในระบบ</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-1">น้ำหนักการโหวตของคุณ</p>
            <p className="text-2xl font-bold">{formatNumber(votingWeight)} FUNDFA</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label>สร้างข้อเสนอใหม่</Label>
              <div className="space-y-2">
                <Input
                  placeholder="หัวข้อ"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isLoading}
                />
                <Textarea
                  placeholder="รายละเอียด"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                />
                <Input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={isLoading}
                />
                <Button 
                  className="w-full"
                  onClick={handleCreateProposal}
                  disabled={isLoading || !title || !description || !endTime}
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> กำลังประมวลผล...</>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      สร้างข้อเสนอ
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>ข้อเสนอที่กำลังดำเนินการ</CardTitle>
          <CardDescription>
            รายการข้อเสนอที่กำลังเปิดให้โหวต
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {activeProposals.map((proposal) => (
                <div key={proposal.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{proposal.title}</h3>
                      <p className="text-sm text-gray-500">
                        สร้างโดย: {proposal.creator.slice(0, 6)}...{proposal.creator.slice(-4)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      proposal.status === 'active' ? 'bg-green-100 text-green-800' :
                      proposal.status === 'ended' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {proposal.status === 'active' ? 'กำลังโหวต' :
                       proposal.status === 'ended' ? 'สิ้นสุดแล้ว' :
                       'ดำเนินการแล้ว'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{proposal.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">โหวตเห็นด้วย</p>
                      <p className="font-medium text-green-600">{formatNumber(proposal.forVotes)} FUNDFA</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">โหวตไม่เห็นด้วย</p>
                      <p className="font-medium text-red-600">{formatNumber(proposal.againstVotes)} FUNDFA</p>
                    </div>
                  </div>
                  
                  {proposal.status === 'active' && (
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1"
                        onClick={() => handleVote(proposal.id, true)}
                        disabled={isLoading}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        เห็นด้วย
                      </Button>
                      <Button 
                        className="flex-1"
                        onClick={() => handleVote(proposal.id, false)}
                        disabled={isLoading}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        ไม่เห็นด้วย
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              
              {activeProposals.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  ไม่มีข้อเสนอที่กำลังดำเนินการ
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            ประวัติการโหวต
          </CardTitle>
          <CardDescription>
            ประวัติการโหวตของคุณ
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {votingHistory.map((vote) => (
                <div key={vote.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      โหวต{vote.support ? 'เห็นด้วย' : 'ไม่เห็นด้วย'}กับข้อเสนอ #{vote.proposalId}
                    </p>
                    <p className="text-sm text-gray-500">
                      น้ำหนัก: {formatNumber(vote.weight)} FUNDFA
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(vote.timestamp * 1000).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                </div>
              ))}
              
              {votingHistory.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  ไม่มีประวัติการโหวต
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}; 