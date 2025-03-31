
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { getOrderbook, fillOrder } from '@/lib/contract/tradeContract';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useFeeStatus } from '@/hooks/useFeeStatus';

interface TradeOrderbookProps {
  assetId: number;
}

interface Order {
  id: number;
  assetId: number;
  seller: string;
  price: number;
  amount: number;
  isBuyOrder: boolean;
  isActive: boolean;
}

const TradeOrderbook = ({ assetId }: TradeOrderbookProps) => {
  const [buyOrders, setBuyOrders] = useState<Order[]>([]);
  const [sellOrders, setSellOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState<{[key: number]: boolean}>({});
  const { contract, account } = useWeb3();
  const { hasPaidFee } = useFeeStatus();

  useEffect(() => {
    const fetchOrderbook = async () => {
      if (!assetId) return;
      
      try {
        setLoading(true);
        const orders = await getOrderbook(contract, assetId);
        
        const buys = orders.filter(order => order.isBuyOrder && order.isActive);
        const sells = orders.filter(order => !order.isBuyOrder && order.isActive);
        
        // Sort buy orders by price (descending)
        buys.sort((a, b) => b.price - a.price);
        
        // Sort sell orders by price (ascending)
        sells.sort((a, b) => a.price - b.price);
        
        setBuyOrders(buys);
        setSellOrders(sells);
      } catch (error) {
        console.error("Error fetching orderbook:", error);
        toast.error("Failed to load orderbook");
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderbook();
    
    // Set up interval to refresh every 30 seconds
    const interval = setInterval(fetchOrderbook, 30000);
    
    return () => clearInterval(interval);
  }, [contract, assetId]);

  const handleFillOrder = async (order: Order) => {
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    if (!contract) {
      toast.error("Contract not initialized. Please reconnect your wallet.");
      return;
    }
    
    if (!hasPaidFee) {
      toast.error("You need to pay the transaction fee first");
      return;
    }
    
    setProcessingOrder(prev => ({ ...prev, [order.id]: true }));
    
    try {
      await fillOrder(contract, order.id, order.amount, account);
      toast.success(`Order filled successfully!`);
      
      // Refresh the orderbook
      const orders = await getOrderbook(contract, assetId);
      
      const buys = orders.filter(order => order.isBuyOrder && order.isActive);
      const sells = orders.filter(order => !order.isBuyOrder && order.isActive);
      
      // Sort buy orders by price (descending)
      buys.sort((a, b) => b.price - a.price);
      
      // Sort sell orders by price (ascending)
      sells.sort((a, b) => a.price - b.price);
      
      setBuyOrders(buys);
      setSellOrders(sells);
    } catch (error) {
      console.error("Error filling order:", error);
      toast.error(`Failed to fill order: ${error.message || 'Unknown error'}`);
    } finally {
      setProcessingOrder(prev => ({ ...prev, [order.id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Buy Orders */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-green-600">Buy Orders</h3>
        
        {buyOrders.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (ETH)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total (ETH)</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {buyOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-green-600 font-medium">{order.price.toFixed(4)}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{order.amount}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{(order.price * order.amount).toFixed(4)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      {account && order.seller.toLowerCase() !== account.toLowerCase() && (
                        <Button 
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleFillOrder(order)}
                          disabled={processingOrder[order.id] || !hasPaidFee}
                        >
                          {processingOrder[order.id] ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            "Sell"
                          )}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No buy orders available</p>
          </div>
        )}
      </div>
      
      {/* Sell Orders */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-red-600">Sell Orders</h3>
        
        {sellOrders.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (ETH)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total (ETH)</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sellOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-red-600 font-medium">{order.price.toFixed(4)}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{order.amount}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{(order.price * order.amount).toFixed(4)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      {account && order.seller.toLowerCase() !== account.toLowerCase() && (
                        <Button 
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleFillOrder(order)}
                          disabled={processingOrder[order.id] || !hasPaidFee}
                        >
                          {processingOrder[order.id] ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            "Buy"
                          )}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No sell orders available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeOrderbook;
