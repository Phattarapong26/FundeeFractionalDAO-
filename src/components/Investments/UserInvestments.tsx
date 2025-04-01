import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, BarChart3, Clock, DollarSign, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatNumber, formatEthValue, formatDate } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { EthValue } from '@/components/ui/eth-value';

interface Investment {
  id: number;
  name: string;
  symbol: string;
  shares: number;
  value: number;
  purchaseDate: Date;
  apy: number;
}

interface UserInvestmentsProps {
  investments: Investment[];
  loading: boolean;
}

export const UserInvestments: React.FC<UserInvestmentsProps> = ({ investments, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!investments || investments.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-300" />
        <h3 className="mt-4 text-lg font-medium">No investments yet</h3>
        <p className="mt-2 text-sm text-gray-500">
          Start investing in assets to see them here
        </p>
        <Button 
          className="mt-4"
          onClick={() => navigate('/marketplace')}
        >
          Browse Marketplace
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {investments.map((investment) => (
        <motion.div
          key={investment.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{investment.name}</CardTitle>
                  <p className="text-sm text-gray-500">{investment.symbol}</p>
                </div>
                <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                  {investment.apy}% APY
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Shares</p>
                    <p className="font-medium">{formatNumber(investment.shares)}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Value</p>
                    <p className="font-medium">
                      <EthValue value={investment.value} />
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Purchase Date</p>
                    <p className="font-medium">{formatDate(investment.purchaseDate)}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mr-2"
                  onClick={() => navigate(`/asset/${investment.id}`)}
                >
                  View Details
                </Button>
                <Button 
                  size="sm"
                  onClick={() => navigate(`/trade?asset=${investment.id}`)}
                >
                  Trade
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
