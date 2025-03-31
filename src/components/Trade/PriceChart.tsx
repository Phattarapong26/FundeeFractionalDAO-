import { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, ChartLine } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { getTradeHistory } from '@/lib/contract/tradeContract';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

interface PriceChartProps {
  assetId: number;
  className?: string;
}

interface ChartData {
  timestamp: number;
  price: number;
  date: string;
}

const PriceChart = ({ assetId, className }: PriceChartProps) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1d' | '1w' | '1m' | 'all'>('all');
  const { contract } = useWeb3();

  useEffect(() => {
    const fetchTradeHistory = async () => {
      if (!contract || !assetId) return;
      
      try {
        setLoading(true);
        const history = await getTradeHistory(contract, assetId);
        
        // Sort trades by timestamp (oldest to newest for chart)
        history.sort((a, b) => a.timestamp - b.timestamp);
        
        // Format data for chart
        const formattedData = history.map(trade => ({
          timestamp: trade.timestamp,
          price: trade.price,
          date: new Date(trade.timestamp * 1000).toLocaleString(),
        }));
        
        setChartData(formattedData);
      } catch (error) {
        console.error("Error fetching trade history for chart:", error);
        toast.error("Failed to load price chart data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTradeHistory();
  }, [contract, assetId]);

  // Filter data based on selected time range
  const filteredData = useMemo(() => {
    if (chartData.length === 0) return [];
    
    const now = Math.floor(Date.now() / 1000);
    
    switch (timeRange) {
      case '1d':
        return chartData.filter(data => data.timestamp > now - 86400);
      case '1w':
        return chartData.filter(data => data.timestamp > now - 604800);
      case '1m':
        return chartData.filter(data => data.timestamp > now - 2592000);
      case 'all':
      default:
        return chartData;
    }
  }, [chartData, timeRange]);

  // Calculate current price change
  const priceChange = useMemo(() => {
    if (filteredData.length < 2) return 0;
    
    const oldestPrice = filteredData[0].price;
    const latestPrice = filteredData[filteredData.length - 1].price;
    
    return ((latestPrice - oldestPrice) / oldestPrice) * 100;
  }, [filteredData]);

  // Config for the chart
  const chartConfig = {
    price: {
      label: "Price",
      theme: {
        light: "#3b82f6",
        dark: "#60a5fa",
      },
    },
  };

  if (loading) {
    return (
      <Card className={cn("h-[300px] w-full", className)}>
        <CardHeader>
          <CardTitle>Price History</CardTitle>
        </CardHeader>
        <CardContent className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className={cn("h-[300px] w-full", className)}>
        <CardHeader>
          <CardTitle>Price History</CardTitle>
        </CardHeader>
        <CardContent className="flex h-full flex-col items-center justify-center text-muted-foreground">
          <ChartLine className="h-10 w-10 mb-2 text-gray-300" />
          <p>No price data available</p>
          <p className="text-sm">Trade history will appear here after orders are matched</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("h-[300px] w-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Price History</CardTitle>
          <div className="flex gap-1">
            <Button 
              variant={timeRange === '1d' ? "default" : "outline"} 
              size="sm"
              onClick={() => setTimeRange('1d')}
              className="h-7 text-xs"
            >
              1D
            </Button>
            <Button 
              variant={timeRange === '1w' ? "default" : "outline"} 
              size="sm"
              onClick={() => setTimeRange('1w')}
              className="h-7 text-xs"
            >
              1W
            </Button>
            <Button 
              variant={timeRange === '1m' ? "default" : "outline"} 
              size="sm"
              onClick={() => setTimeRange('1m')}
              className="h-7 text-xs"
            >
              1M
            </Button>
            <Button 
              variant={timeRange === 'all' ? "default" : "outline"} 
              size="sm"
              onClick={() => setTimeRange('all')}
              className="h-7 text-xs"
            >
              All
            </Button>
          </div>
        </div>
        {filteredData.length > 0 && (
          <div className="flex items-baseline mt-1">
            <span className="text-2xl font-bold">{filteredData[filteredData.length - 1].price.toFixed(4)} ETH</span>
            <span className={cn("ml-2 text-sm font-medium", 
              priceChange >= 0 ? "text-green-500" : "text-red-500")}>
              {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)}%
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="px-2 pb-2">
        <div className="h-[200px] w-full">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={filteredData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(timestamp) => {
                    const date = new Date(timestamp * 1000);
                    return timeRange === '1d' 
                      ? date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                      : date.toLocaleDateString([], {month: 'short', day: 'numeric'});
                  }}
                  fontSize={10}
                  tickMargin={5}
                  minTickGap={50}
                />
                <YAxis 
                  domain={['dataMin', 'dataMax']} 
                  fontSize={10}
                  tickFormatter={(value) => {
                    return typeof value === 'number' ? value.toFixed(3) : value;
                  }}
                  width={45}
                  tickMargin={5}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Time
                              </span>
                              <span className="font-bold text-xs">
                                {new Date(payload[0].payload.timestamp * 1000).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Price
                              </span>
                              <span className="font-bold text-xs">
                                {typeof payload[0].value === 'number' 
                                  ? payload[0].value.toFixed(4) 
                                  : payload[0].value} ETH
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  name="Price"
                  stroke="var(--color-price)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceChart;
