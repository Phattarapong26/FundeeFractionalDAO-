import { FractionalDAOAbi } from './abi';
import { Web3 } from 'web3';

// Enhanced mock data structure for testing
const mockOrderbook = [
  { id: 1, assetId: 1, seller: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', price: 0.1, amount: 10, isBuyOrder: true, isActive: true },
  { id: 2, assetId: 1, seller: '0x3A2e8D690f1BF6997D6E9eB66755e3D36eF32119', price: 0.12, amount: 5, isBuyOrder: false, isActive: true },
  { id: 3, assetId: 1, seller: '0x9876CdEF1234567890AbCdEf1234567890aBcDeF', price: 0.09, amount: 8, isBuyOrder: true, isActive: true },
  { id: 4, assetId: 1, seller: '0xAbCd1234Ef5678901234567890AbCdEf12345678', price: 0.13, amount: 3, isBuyOrder: false, isActive: true },
  { id: 5, assetId: 2, seller: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', price: 0.05, amount: 20, isBuyOrder: true, isActive: true },
  { id: 6, assetId: 2, seller: '0x3A2e8D690f1BF6997D6E9eB66755e3D36eF32119', price: 0.06, amount: 15, isBuyOrder: false, isActive: true },
  { id: 7, assetId: 3, seller: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', price: 0.15, amount: 12, isBuyOrder: true, isActive: true },
  { id: 8, assetId: 3, seller: '0x3A2e8D690f1BF6997D6E9eB66755e3D36eF32119', price: 0.17, amount: 7, isBuyOrder: false, isActive: true },
  { id: 9, assetId: 4, seller: '0x9876CdEF1234567890AbCdEf1234567890aBcDeF', price: 0.03, amount: 30, isBuyOrder: true, isActive: true },
  { id: 10, assetId: 4, seller: '0xAbCd1234Ef5678901234567890AbCdEf12345678', price: 0.04, amount: 25, isBuyOrder: false, isActive: true },
];

const mockTradeHistory = [
  { id: 1, assetId: 1, buyer: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', seller: '0x3A2e8D690f1BF6997D6E9eB66755e3D36eF32119', price: 0.11, amount: 7, timestamp: Math.floor(Date.now() / 1000) - 3600 },
  { id: 2, assetId: 1, buyer: '0x9876CdEF1234567890AbCdEf1234567890aBcDeF', seller: '0xAbCd1234Ef5678901234567890AbCdEf12345678', price: 0.10, amount: 5, timestamp: Math.floor(Date.now() / 1000) - 7200 },
  { id: 3, assetId: 1, buyer: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', seller: '0xAbCd1234Ef5678901234567890AbCdEf12345678', price: 0.12, amount: 3, timestamp: Math.floor(Date.now() / 1000) - 10800 },
  { id: 4, assetId: 2, buyer: '0x3A2e8D690f1BF6997D6E9eB66755e3D36eF32119', seller: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', price: 0.05, amount: 10, timestamp: Math.floor(Date.now() / 1000) - 14400 },
  { id: 5, assetId: 3, buyer: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', seller: '0x3A2e8D690f1BF6997D6E9eB66755e3D36eF32119', price: 0.16, amount: 4, timestamp: Math.floor(Date.now() / 1000) - 21600 },
  { id: 6, assetId: 4, buyer: '0x9876CdEF1234567890AbCdEf1234567890aBcDeF', seller: '0xAbCd1234Ef5678901234567890AbCdEf12345678', price: 0.035, amount: 15, timestamp: Math.floor(Date.now() / 1000) - 28800 },
];

/**
 * Checks if contract is properly initialized
 * @param contract The initialized smart contract instance
 * @returns Boolean indicating if contract is valid
 */
const checkContract = (contract: any) => {
  if (!contract) {
    console.error("Contract not initialized in tradeContract function");
    throw new Error("Contract not initialized");
  }
  return true;
};

/**
 * Get the orderbook for a specific asset
 * @param contract The initialized smart contract instance
 * @param assetId The ID of the asset to get orders for
 * @returns Array of orders for the specified asset
 */
export const getOrderbook = async (contract: any, assetId: number) => {
  if (!contract) {
    console.warn("Contract not initialized in getOrderbook");
    return [];
  }
  
  try {
    const orders = await contract.methods.getOrdersByAsset(assetId).call();
    return orders.map((order: any) => ({
      id: Number(order.id),
      assetId: Number(order.assetId),
      seller: order.trader,
      price: Number(order.price) / 1e18,
      amount: Number(order.amount) / 1e18,
      isBuyOrder: order.isBuyOrder,
      isActive: order.isActive
    }));
  } catch (error) {
    console.error("Error in getOrderbook:", error);
    return [];
  }
};

/**
 * Get trade history for a specific asset
 * @param contract The initialized smart contract instance
 * @param assetId The ID of the asset to get trade history for
 * @returns Array of historical trades for the specified asset
 */
export const getTradeHistory = async (contract: any, assetId: number) => {
  if (!contract) {
    console.warn("Contract not initialized in getTradeHistory");
    return [];
  }
  
  try {
    const trades = await contract.methods.getTradesByAsset(assetId).call();
    return trades.map((trade: any) => ({
      id: Number(trade.id),
      assetId: Number(trade.assetId),
      buyer: trade.buyer,
      seller: trade.seller,
      price: Number(trade.price) / 1e18,
      amount: Number(trade.amount) / 1e18,
      timestamp: Number(trade.timestamp)
    }));
  } catch (error) {
    console.error("Error in getTradeHistory:", error);
    return [];
  }
};

/**
 * Get all orders placed by a specific user for a specific asset
 * @param contract The initialized smart contract instance
 * @param userAddress The user's wallet address
 * @param assetId The ID of the asset to get orders for
 * @returns Array of user's orders for the specified asset
 */
export const getUserOrders = async (contract: any, userAddress: string, assetId: number) => {
  if (!contract) {
    console.warn("Contract not initialized in getUserOrders");
    return [];
  }
  
  if (!userAddress) {
    console.warn("User address not provided in getUserOrders");
    return [];
  }
  
  try {
    // In a real implementation, this would call a contract method like:
    // return await contract.methods.getUserOrders(userAddress, assetId).call();
    
    // For demo purposes, returning filtered mock data
    return mockOrderbook.filter(
      order => order.seller.toLowerCase() === userAddress.toLowerCase() && order.assetId === assetId && order.isActive
    );
  } catch (error) {
    console.error("Error in getUserOrders:", error);
    return [];
  }
};

/**
 * Create a new trade order (buy or sell)
 * @param contract The initialized smart contract instance
 * @param assetId The ID of the asset to trade
 * @param isBuyOrder Whether this is a buy order (true) or sell order (false)
 * @param price The price per token in ETH
 * @param amount The number of tokens to buy or sell
 * @param from The user's wallet address
 * @returns Transaction receipt
 */
export const createTradeOrder = async (
  contract: any,
  assetId: number,
  isBuyOrder: boolean,
  price: number,
  amount: number,
  from: string
) => {
  checkContract(contract);
  
  if (!from) throw new Error("User address not provided");
  
  try {
    console.log("Creating trade order with parameters:", {
      assetId,
      isBuyOrder,
      price,
      amount,
      from
    });
    
    const web3 = new Web3();
    const weiPrice = web3.utils.toWei(price.toString(), 'ether');
    const weiAmount = web3.utils.toWei(amount.toString(), 'ether');
    
    if (isBuyOrder) {
      const totalCost = price * amount;
      const weiTotalCost = web3.utils.toWei(totalCost.toString(), 'ether');
      const fee = weiTotalCost * 0.01; // ค่าธรรมเนียม 1%
      
      return await contract.methods.createOrder(
        assetId,
        weiAmount,
        weiPrice,
        true
      ).send({
        from,
        value: weiTotalCost + fee,
        gas: 3000000
      });
    } else {
      const totalValue = price * amount;
      const weiTotalValue = web3.utils.toWei(totalValue.toString(), 'ether');
      const fee = weiTotalValue * 0.01; // ค่าธรรมเนียม 1%
      
      return await contract.methods.createOrder(
        assetId,
        weiAmount,
        weiPrice,
        false
      ).send({
        from,
        value: fee,
        gas: 3000000
      });
    }
  } catch (error) {
    console.error("Error in createTradeOrder:", error);
    throw error;
  }
};

/**
 * Attempts to match orders automatically for an asset
 * @param contract The initialized smart contract instance
 * @param assetId The ID of the asset to match orders for
 * @param from The user's wallet address
 * @returns Transaction receipt
 */
export const matchOrders = async (contract: any, assetId: number, from: string) => {
  if (!contract) {
    console.error("Contract not initialized in matchOrders");
    throw new Error("Contract not initialized");
  }
  
  try {
    return await contract.methods.matchOrders(assetId).send({
      from,
      gas: 3000000
    });
  } catch (error) {
    console.error("Error in matchOrders:", error);
    throw error;
  }
};

/**
 * Cancel an existing order
 * @param contract The initialized smart contract instance
 * @param orderId The ID of the order to cancel
 * @param from The user's wallet address (must be the order creator)
 * @returns Transaction receipt
 */
export const cancelOrder = async (contract: any, orderId: number, from: string) => {
  if (!contract) {
    console.error("Contract not initialized in cancelOrder");
    throw new Error("Contract not initialized");
  }
  
  // In a real implementation, this would call a contract method like:
  // return await contract.methods.cancelOrder(orderId).send({
  //   from,
  //   gas: 3000000
  // });
  
  // For demo purposes, simulating a delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Update the order status (for demo only)
  const orderIndex = mockOrderbook.findIndex(order => order.id === orderId);
  if (orderIndex !== -1) {
    // Check if user is the order creator
    if (mockOrderbook[orderIndex].seller.toLowerCase() !== from.toLowerCase()) {
      throw new Error('Only the order creator can cancel an order');
    }
    
    mockOrderbook[orderIndex].isActive = false;
  } else {
    throw new Error('Order not found');
  }
  
  return { 
    transactionHash: '0x' + Math.random().toString(16).substring(2, 42),
    status: 1 
  };
};

/**
 * Fill a specific order directly
 * @param contract The initialized smart contract instance
 * @param orderId The ID of the order to fill
 * @param amount The amount to fill (can be partial)
 * @param from The user's wallet address
 * @returns Transaction receipt
 */
export const fillOrder = async (contract: any, orderId: number, amount: number, from: string) => {
  if (!contract) {
    console.error("Contract not initialized in fillOrder");
    throw new Error("Contract not initialized");
  }
  
  try {
    const web3 = new Web3();
    const weiAmount = web3.utils.toWei(amount.toString(), 'ether');
    
    // ดึงข้อมูล order ก่อน
    const order = await contract.methods.getOrder(orderId).call();
    
    if (order.isBuyOrder) {
      // กรณีเติมคำสั่งซื้อ
      return await contract.methods.fillBuyOrder(orderId, weiAmount).send({
        from,
        gas: 3000000
      });
    } else {
      // กรณีเติมคำสั่งขาย ต้องส่ง ETH ไปด้วย
      const totalCost = Number(order.price) * amount;
      const weiTotalCost = web3.utils.toWei(totalCost.toString(), 'ether');
      
      return await contract.methods.fillSellOrder(orderId, weiAmount).send({
        from,
        value: weiTotalCost,
        gas: 3000000
      });
    }
  } catch (error) {
    console.error("Error in fillOrder:", error);
    throw error;
  }
};

/**
 * Get the current best price for an asset
 * @param contract The initialized smart contract instance
 * @param assetId The ID of the asset
 * @returns Object with best buy and sell prices
 */
export const getBestPrices = async (contract: any, assetId: number) => {
  if (!contract) {
    console.error("Contract not initialized in getBestPrices");
    throw new Error("Contract not initialized");
  }
  
  try {
    const orders = await contract.methods.getOrdersByAsset(assetId).call();
    
    // กรองคำสั่งซื้อและขาย
    const buyOrders = orders.filter((order: any) => order.isBuyOrder);
    const sellOrders = orders.filter((order: any) => !order.isBuyOrder);
    
    // หาราคาซื้อสูงสุด
    const bestBuyPrice = buyOrders.length > 0
      ? Math.max(...buyOrders.map((order: any) => Number(order.price)))
      : 0;
    
    // หาราคาขายต่ำสุด
    const bestSellPrice = sellOrders.length > 0
      ? Math.min(...sellOrders.map((order: any) => Number(order.price)))
      : 0;
    
    return {
      bestBuyPrice: bestBuyPrice / 1e18, // แปลงจาก Wei เป็น ETH
      bestSellPrice: bestSellPrice / 1e18
    };
  } catch (error) {
    console.error("Error in getBestPrices:", error);
    throw error;
  }
};
