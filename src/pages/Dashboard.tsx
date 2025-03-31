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

const Dashboard = () => {
  const { account, connectWallet } = useWeb3();
  const navigate = useNavigate();

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
            <DashboardStats 
              totalAssets={0}
              totalUsers={0}
              totalValue={0}
              tradingVolume={0}
            />
            <InvestmentChart />
            
            <Tabs defaultValue="portfolio" className="w-full mt-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="dao">DAO Governance</TabsTrigger>
                <TabsTrigger value="history">Transaction History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="portfolio" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <UserSharesCard />
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-xl p-6 shadow-sm"
                  >
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        variant="outline" 
                        className="flex flex-col items-center justify-center h-24 gap-2 hover:bg-blue-50 transition-colors"
                        onClick={() => navigate('/marketplace')}
                      >
                        <Building2 className="w-6 h-6 text-blue-600" />
                        <span className="text-sm text-gray-600">Browse Investments</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex flex-col items-center justify-center h-24 gap-2 hover:bg-purple-50 transition-colors"
                        onClick={() => navigate('/token-marketplace')}
                      >
                        <Coins className="w-6 h-6 text-purple-600" />
                        <span className="text-sm text-gray-600">Token Market</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex flex-col items-center justify-center h-24 gap-2 hover:bg-green-50 transition-colors"
                        onClick={() => navigate('/create-asset')}
                      >
                        <PlusCircle className="w-6 h-6 text-green-600" />
                        <span className="text-sm text-gray-600">Create Asset</span>
                      </Button>
                    </div>
                  </motion.div>
                </div>
                
                <UserInvestments 
                  investments={[]}
                  loading={false}
                />
                <PlatformTokenInfo />
              </TabsContent>
              
              <TabsContent value="dao" className="mt-6">
                <UserProposals />
                <div className="mt-6">
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700 mt-4"
                    onClick={() => navigate('/create-proposal')}
                  >
                    Create New Proposal
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 mt-4 ml-4"
                    onClick={() => navigate('/governance')}
                  >
                    View All Proposals
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="mt-6">
                <TransactionsList showAll={true} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default Dashboard;
