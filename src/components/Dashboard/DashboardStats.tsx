import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Users, DollarSign, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatNumber, formatTokenValue } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useAsset } from '@/hooks/useAsset';
import { useAssetSecurity } from '@/hooks/useAssetSecurity';
import { useAssetTrading } from '@/hooks/useAssetTrading';
import { useAssetVoting } from '@/hooks/useAssetVoting';
import { useAssetAnalytics } from '@/hooks/useAssetAnalytics';
import { useWeb3 } from '@/hooks/useWeb3';
import { Progress } from '@/components/ui/progress';
import { Loader2, TrendingDown, Shield, Coins, BarChart } from 'lucide-react';

interface DashboardStatsProps {
  totalAssets: number;
  totalUsers: number;
  totalValue: number;
  tradingVolume: number;
}

export const DashboardStats = () => {
  const { id } = useParams<{ id: string }>();
  const { account } = useWeb3();
  const { asset, isLoading: isLoadingAsset } = useAsset(id);
  const { securityLevel, isLoading: isLoadingSecurity } = useAssetSecurity(id);
  const { tradingStats, isLoading: isLoadingTrading } = useAssetTrading(id);
  const { votingStats, isLoading: isLoadingVoting } = useAssetVoting(id);
  const { analytics, isLoading: isLoadingAnalytics } = useAssetAnalytics(id);

  const isLoading = isLoadingAsset || isLoadingSecurity || isLoadingTrading || isLoadingVoting || isLoadingAnalytics;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="text-center text-muted-foreground">
        ไม่พบข้อมูลสินทรัพย์
      </div>
    );
  }

  const formatPercentage = (value: number | undefined) => {
    if (value === undefined) return '0%';
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatValue = (value: number | undefined) => {
    if (value === undefined) return '0';
    return formatNumber(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Security Level */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-medium">ระดับความปลอดภัย</h3>
          </div>
          <span className="text-sm font-medium">{securityLevel || '0'}</span>
        </div>
        <Progress value={securityLevel || 0} className="mt-2" />
      </Card>

      {/* Trading Stats */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-medium">ราคาปัจจุบัน</h3>
          </div>
          <span className="text-sm font-medium">
            {formatValue(tradingStats?.currentPrice)} ETH
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className={`text-sm ${tradingStats?.priceChange24h && tradingStats.priceChange24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {tradingStats?.priceChange24h && tradingStats.priceChange24h > 0 ? (
              <TrendingUp className="w-4 h-4 inline" />
            ) : (
              <TrendingDown className="w-4 h-4 inline" />
            )}
            {formatPercentage(tradingStats?.priceChange24h)}
          </span>
          <span className="text-sm text-muted-foreground">
            (24h)
          </span>
        </div>
      </Card>

      {/* Voting Stats */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-medium">ผู้ถือครอง</h3>
          </div>
          <span className="text-sm font-medium">
            {formatValue(votingStats?.totalHolders)}
          </span>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          {formatValue(votingStats?.activeVoters)} คนที่ลงคะแนน
        </div>
      </Card>

      {/* Analytics Stats */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-medium">ปริมาณการซื้อขาย</h3>
          </div>
          <span className="text-sm font-medium">
            {formatValue(analytics?.volume24h)} ETH
          </span>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          {formatValue(analytics?.transactions24h)} ธุรกรรม
        </div>
      </Card>
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
