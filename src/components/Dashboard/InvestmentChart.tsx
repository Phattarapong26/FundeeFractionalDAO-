
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useWeb3 } from '@/hooks/useWeb3';
import { formatNumber } from '@/lib/utils';

interface ChartData {
  name: string;
  investmentValue: number;
  returnsValue: number;
}

export const InvestmentChart = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const { account } = useWeb3();
  
  useEffect(() => {
    // In a real application, this would fetch actual data from blockchain or API
    // For demonstration, we're generating mock data
    const generateMockData = () => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
      const mockData: ChartData[] = [];
      
      let investmentBase = 5000;
      let returnsBase = 5000;
      
      for (const month of months) {
        // Simulate some random growth or decline
        investmentBase = investmentBase + (Math.random() * 1000 - 200);
        returnsBase = returnsBase * (1 + (Math.random() * 0.05));
        
        mockData.push({
          name: month,
          investmentValue: Math.round(investmentBase),
          returnsValue: Math.round(returnsBase),
        });
      }
      
      setChartData(mockData);
    };
    
    if (account) {
      generateMockData();
    }
  }, [account]);
  
  if (!account || chartData.length === 0) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Investment Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis 
                  tickFormatter={(value) => `$${formatNumber(value, 0)}`}
                />
                <Tooltip 
                  formatter={(value) => [`$${formatNumber(value as number, 0)}`, undefined]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="investmentValue"
                  name="Investment Value"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="returnsValue"
                  name="Returns Value"
                  stroke="#82ca9d"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
