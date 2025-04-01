import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useAssetGovernance } from '@/hooks/useAssetGovernance';
import { useWallet } from '@/hooks/useWallet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { Loader2, Vote, Wallet } from 'lucide-react';

export const AssetGovernance = () => {
  const { id } = useParams();
  const { walletAddress, isLoading: isWalletLoading } = useWallet();
  const { 
    votingPower, 
    activeProposals, 
    proposalTitle, 
    setProposalTitle, 
    proposalDescription, 
    setProposalDescription, 
    createProposal, 
    voteOnProposal, 
    isLoading 
  } = useAssetGovernance(Number(id));
  
  const handleCreateProposal = async () => {
    if (!proposalTitle || !proposalDescription) return;
    await createProposal(proposalTitle, proposalDescription);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>การกำกับดูแลสินทรัพย์</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">ที่อยู่ Wallet</p>
              <p className="text-sm font-mono">
                {isWalletLoading ? (
                  <Loader2 className="animate-spin" />
                ) : walletAddress ? (
                  `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                ) : (
                  'ไม่ได้เชื่อมต่อ Wallet'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Vote className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">อำนาจในการโหวต</p>
              <p className="text-2xl font-bold">
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  `${Number(votingPower).toLocaleString('th-TH')}`
                )}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">หัวข้อข้อเสนอ</label>
            <Input
              value={proposalTitle}
              onChange={(e) => setProposalTitle(e.target.value)}
              placeholder="ระบุหัวข้อข้อเสนอ"
              disabled={isLoading || !walletAddress}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">รายละเอียดข้อเสนอ</label>
            <Input
              value={proposalDescription}
              onChange={(e) => setProposalDescription(e.target.value)}
              placeholder="ระบุรายละเอียดข้อเสนอ"
              disabled={isLoading || !walletAddress}
            />
          </div>
          
          <LoadingButton
            onClick={handleCreateProposal}
            isLoading={isLoading}
            disabled={!proposalTitle || !proposalDescription || !walletAddress}
          >
            สร้างข้อเสนอ
          </LoadingButton>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">ข้อเสนอที่กำลังดำเนินการ</h3>
            {activeProposals.map((proposal) => (
              <Card key={proposal.id}>
                <CardHeader>
                  <CardTitle>{proposal.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{proposal.description}</p>
                  <div className="flex space-x-2">
                    <LoadingButton
                      onClick={() => voteOnProposal(proposal.id, true)}
                      isLoading={isLoading}
                      disabled={proposal.hasVoted || !walletAddress}
                    >
                      เห็นด้วย
                    </LoadingButton>
                    <LoadingButton
                      onClick={() => voteOnProposal(proposal.id, false)}
                      isLoading={isLoading}
                      disabled={proposal.hasVoted || !walletAddress}
                      variant="destructive"
                    >
                      ไม่เห็นด้วย
                    </LoadingButton>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}; 