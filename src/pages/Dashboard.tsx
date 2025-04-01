import { motion } from 'framer-motion';
import { useWeb3 } from '@/hooks/useWeb3';
import PageLayout from '@/components/Layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserSharesCard } from '@/components/UserShares/UserSharesCard';
import { UserProposals } from '@/components/Proposals/UserProposals';
import { TransactionsList } from '@/components/Transactions/TransactionsList';
import { UserInvestments } from '@/components/Investments/UserInvestments';
import { PlatformTokenInfo } from '@/components/Platform/PlatformTokenInfo';
import { InvestmentChart } from '@/components/Dashboard/InvestmentChart';
import { DashboardStats } from '@/components/Dashboard/DashboardStats';
import { useNavigate } from 'react-router-dom';
import { Building2, Coins, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRewards } from '@/hooks/useRewards';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { account, connectWallet } = useWeb3();
  const navigate = useNavigate();
  const { rewards, isLoading: rewardsLoading } = useRewards();

  return (
    <PageLayout className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Track your investments, monitor your share ownership, and manage your fractional assets.
          </p>
        </motion.div>

        {!account ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center bg-white p-10 rounded-xl shadow-sm"
          >
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Connect your wallet to view your dashboard and manage your investments.
            </p>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={connectWallet}
            >
              Connect Wallet
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Coins className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">รางวัลที่ได้รับ</p>
                      <p className="text-2xl font-bold">
                        {rewardsLoading ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          `${Number(rewards?.total || 0).toLocaleString('th-TH')} ETH`
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="investments">Investments</TabsTrigger>
                <TabsTrigger value="proposals">Proposals</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="rewards">Rewards</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <DashboardStats />
                <InvestmentChart />
                <UserSharesCard />
              </TabsContent>

              <TabsContent value="investments">
                <UserInvestments />
              </TabsContent>

              <TabsContent value="proposals">
                <UserProposals />
              </TabsContent>

              <TabsContent value="transactions">
                <TransactionsList />
              </TabsContent>

              <TabsContent value="rewards">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Rewards History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {rewardsLoading ? (
                        <div className="flex items-center justify-center h-32">
                          <Loader2 className="animate-spin" />
                        </div>
                      ) : rewards?.history?.length > 0 ? (
                        <div className="space-y-4">
                          {rewards.history.map((reward, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div>
                                <p className="font-medium">{reward.type}</p>
                                <p className="text-sm text-gray-500">{reward.timestamp}</p>
                              </div>
                              <p className="font-mono">{reward.amount} ETH</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-gray-500">No rewards history found</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default Dashboard;
