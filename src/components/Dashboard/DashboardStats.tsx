
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Users, DollarSign, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatNumber, formatTokenValue } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface DashboardStatsProps {
  totalAssets: number;
  totalUsers: number;
  totalValue: number;
  tradingVolume: number;
}

export const DashboardStats = ({ 
  totalAssets, 
  totalUsers, 
  totalValue, 
  tradingVolume 
}: DashboardStatsProps) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        title="Total Assets" 
        value={formatNumber(totalAssets)}
        icon={<BarChart3 className="h-4 w-4 text-green-500" />}
        description="Total assets in the platform"
        link="/marketplace"
        linkText="View Assets"
      />
      
      <StatCard 
        title="User Count" 
        value={formatNumber(totalUsers)}
        icon={<Users className="h-4 w-4 text-blue-500" />}
        description="Active investors"
        link="/governance"
        linkText="View Governance"
      />
      
      <StatCard 
        title="Total Value (ETH)" 
        value={formatTokenValue(totalValue.toString())}
        icon={<DollarSign className="h-4 w-4 text-purple-500" />}
        description="Total value locked"
        link="/marketplace"
        linkText="Explore"
      />
      
      <StatCard 
        title="Trading Volume (ETH)" 
        value={formatTokenValue(tradingVolume.toString())}
        icon={<TrendingUp className="h-4 w-4 text-orange-500" />}
        description="24h trading volume"
        link="/trade"
        linkText="Trade Now"
      />
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  link: string;
  linkText: string;
}

const StatCard = ({ title, value, icon, description, link, linkText }: StatCardProps) => {
  const navigate = useNavigate();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
            <div className="bg-gray-100 p-1 rounded-full">{icon}</div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </CardContent>
        <CardFooter className="pt-1">
          <Button 
            variant="link" 
            className="px-0 text-sm text-blue-600"
            onClick={() => navigate(link)}
          >
            {linkText}
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
