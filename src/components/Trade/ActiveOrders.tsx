
import { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { getUserOrders } from '@/lib/contract/tradeContract';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ActiveOrdersProps {
  assetId: number;
  onCancelOrder: (orderId: number) => Promise<void>;
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

const ActiveOrders = ({ assetId, onCancelOrder }: ActiveOrdersProps) => {
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState<{[key: number]: boolean}>({});
  const { contract, account } = useWeb3();

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!account) {
        setLoading(false);
        return;
      }
      
      if (!contract) {
        console.warn("Contract not initialized in ActiveOrders component");
        setLoading(false);
        return;
      }
      
      if (!assetId) {
        setLoading(false);
        return;
      }
      
      try {
        console.log("Fetching user orders for account:", account);
        setLoading(true);
        const orders = await getUserOrders(contract, account, assetId);
        
        // Filter for active orders only
        const activeOrders = orders.filter(order => order.isActive);
        
        setUserOrders(activeOrders);
      } catch (error) {
        console.error("Error fetching user orders:", error);
        toast.error("Failed to load your orders");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserOrders();
  }, [contract, account, assetId]);

  const handleCancel = async (orderId: number) => {
    if (!contract) {
      toast.error("Contract not initialized. Please reconnect your wallet.");
      return;
    }
    
    setCancellingOrder(prev => ({ ...prev, [orderId]: true }));
    
    try {
      await onCancelOrder(orderId);
      
      // Remove the cancelled order from the list
      setUserOrders(prev => prev.filter(order => order.id !== orderId));
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order");
    } finally {
      setCancellingOrder(prev => ({ ...prev, [orderId]: false }));
    }
  };

  if (!account) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Please connect your wallet to view your orders</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Your Active Orders</h3>
      
      {userOrders.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (ETH)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total (ETH)</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={order.isBuyOrder ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                      {order.isBuyOrder ? "Buy" : "Sell"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{order.price.toFixed(4)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{order.amount}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{(order.price * order.amount).toFixed(4)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <Button 
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleCancel(order.id)}
                      disabled={cancellingOrder[order.id]}
                    >
                      {cancellingOrder[order.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">You don't have any active orders</p>
        </div>
      )}
    </div>
  );
};

export default ActiveOrders;
