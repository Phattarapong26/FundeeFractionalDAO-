
import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { getTradeHistory } from '@/lib/contract/tradeContract';
import { truncateAddress } from '@/lib/utils';
import { toast } from 'sonner';

interface TradeHistoryProps {
  assetId: number;
}

interface Trade {
  id: number;
  assetId: number;
  buyer: string;
  seller: string;
  price: number;
  amount: number;
  timestamp: number;
}

const TradeHistory = ({ assetId }: TradeHistoryProps) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const { contract } = useWeb3();

  useEffect(() => {
    const fetchTradeHistory = async () => {
      if (!contract || !assetId) return;
      
      try {
        setLoading(true);
        const history = await getTradeHistory(contract, assetId);
        
        // Sort trades by timestamp (newest first)
        history.sort((a, b) => b.timestamp - a.timestamp);
        
        setTrades(history);
      } catch (error) {
        console.error("Error fetching trade history:", error);
        toast.error("Failed to load trade history");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTradeHistory();
  }, [contract, assetId]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Recent Trades</h3>
      
      {trades.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (ETH)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total (ETH)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer/Seller</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trades.map((trade) => (
                <tr key={trade.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(trade.timestamp)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      {Math.random() > 0.5 ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={Math.random() > 0.5 ? "text-green-600" : "text-red-600"}>
                        {Math.random() > 0.5 ? "Buy" : "Sell"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium">{trade.price.toFixed(4)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{trade.amount}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{(trade.price * trade.amount).toFixed(4)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-xs">
                      <div>B: {truncateAddress(trade.buyer)}</div>
                      <div>S: {truncateAddress(trade.seller)}</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No trade history available</p>
        </div>
      )}
    </div>
  );
};

export default TradeHistory;
