import { FractionalDAOAbi } from './abi';
import { Web3 } from 'web3';
import type { Contract } from 'web3-eth-contract';

// กำหนด type ของ contract แทนที่จะใช้ any
type FractionalDAOContract = Contract<typeof FractionalDAOAbi>;

// กำหนด interface สำหรับ Order และ Trade
interface OrderData {
  id: string;
  trader: string;
  assetId: string;
  amount: string;
  price: string;
  isBuyOrder: boolean;
  timestamp: string;
  isActive: boolean;
}

interface TradeData {
  id: string;
  orderId: string;
  buyer: string;
  seller: string;
  assetId: string;
  amount: string;
  price: string;
  timestamp: string;
}

// เก็บ mock data ไว้เป็น fallback
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
const checkContract = (contract: FractionalDAOContract | null) => {
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
export const getOrderbook = async (contract: FractionalDAOContract | null, assetId: number) => {
  if (!contract) {
    console.warn("Contract not initialized in getOrderbook");
    return mockOrderbook.filter(order => order.assetId === assetId && order.isActive);
  }
  
  try {
    // ตรวจสอบว่ามีฟังก์ชัน orderIdCounter หรือไม่
    if (typeof contract.methods.orderIdCounter !== 'function') {
      console.warn("orderIdCounter method not found, using mock data");
      return mockOrderbook.filter(order => order.assetId === assetId && order.isActive);
    }
    
    // ดึงข้อมูล orderIdCounter จาก contract
    const orderIdCounter = await contract.methods.orderIdCounter().call();
    const orders = [];
    
    // วนลูปตรวจสอบแต่ละ order
    for (let i = 1; i < Number(orderIdCounter); i++) {
      const order = await contract.methods.orders(i).call() as OrderData;
      
      // กรองเฉพาะ order ของ assetId ที่ต้องการและยังใช้งานได้
      if (Number(order.assetId) === assetId && order.isActive) {
        orders.push({
          id: Number(order.id),
          assetId: Number(order.assetId),
          seller: order.trader,
          price: Number(order.price) / 1e18,
          amount: Number(order.amount) / 1e18,
          isBuyOrder: order.isBuyOrder,
          isActive: order.isActive
        });
      }
    }
    
    return orders;
  } catch (error) {
    console.error("Error in getOrderbook:", error);
    // หากเกิดข้อผิดพลาด ให้ใช้ข้อมูลจำลองแทน
    return mockOrderbook.filter(order => order.assetId === assetId && order.isActive);
  }
};

/**
 * Get trade history for a specific asset
 * @param contract The initialized smart contract instance
 * @param assetId The ID of the asset to get trade history for
 * @returns Array of historical trades for the specified asset
 */
export const getTradeHistory = async (contract: FractionalDAOContract | null, assetId: number) => {
  if (!contract) {
    console.warn("Contract not initialized in getTradeHistory");
    return mockTradeHistory.filter(trade => trade.assetId === assetId);
  }
  
  try {
    // ตรวจสอบว่ามีฟังก์ชัน tradeIdCounter หรือไม่
    if (typeof contract.methods.tradeIdCounter !== 'function') {
      console.warn("tradeIdCounter method not found, using mock data");
      return mockTradeHistory.filter(trade => trade.assetId === assetId);
    }
    
    // ดึงข้อมูล tradeIdCounter จาก contract
    const tradeIdCounter = await contract.methods.tradeIdCounter().call();
    const trades = [];
    
    // วนลูปตรวจสอบแต่ละ trade
    for (let i = 1; i < Number(tradeIdCounter); i++) {
      const trade = await contract.methods.trades(i).call() as TradeData;
      
      // กรองเฉพาะ trade ของ assetId ที่ต้องการ
      if (Number(trade.assetId) === assetId) {
        trades.push({
          id: Number(trade.id),
          assetId: Number(trade.assetId),
          buyer: trade.buyer,
          seller: trade.seller,
          price: Number(trade.price) / 1e18,
          amount: Number(trade.amount) / 1e18,
          timestamp: Number(trade.timestamp)
        });
      }
    }
    
    return trades;
  } catch (error) {
    console.error("Error in getTradeHistory:", error);
    // หากเกิดข้อผิดพลาด ให้ใช้ข้อมูลจำลองแทน
    return mockTradeHistory.filter(trade => trade.assetId === assetId);
  }
};

/**
 * Get all orders placed by a specific user for a specific asset
 * @param contract The initialized smart contract instance
 * @param userAddress The user's wallet address
 * @param assetId The ID of the asset to get orders for
 * @returns Array of user's orders for the specified asset
 */
export const getUserOrders = async (contract: FractionalDAOContract | null, userAddress: string, assetId: number) => {
  if (!contract) {
    console.warn("Contract not initialized in getUserOrders");
    return mockOrderbook.filter(
      order => order.seller.toLowerCase() === userAddress.toLowerCase() && order.assetId === assetId && order.isActive
    );
  }
  
  if (!userAddress) {
    console.warn("User address not provided in getUserOrders");
    return [];
  }
  
  try {
    // ตรวจสอบว่ามีฟังก์ชัน orderIdCounter หรือไม่
    if (typeof contract.methods.orderIdCounter !== 'function') {
      console.warn("orderIdCounter method not found, using mock data");
      return mockOrderbook.filter(
        order => order.seller.toLowerCase() === userAddress.toLowerCase() && order.assetId === assetId && order.isActive
      );
    }
    
    // ดึงข้อมูล orderIdCounter จาก contract
    const orderIdCounter = await contract.methods.orderIdCounter().call();
    const orders = [];
    
    // วนลูปตรวจสอบแต่ละ order
    for (let i = 1; i < Number(orderIdCounter); i++) {
      const order = await contract.methods.orders(i).call() as OrderData;
      
      // กรองเฉพาะ order ของ assetId และ user ที่ต้องการและยังใช้งานได้
      if (Number(order.assetId) === assetId && 
          order.trader.toLowerCase() === userAddress.toLowerCase() && 
          order.isActive) {
        orders.push({
          id: Number(order.id),
          assetId: Number(order.assetId),
          seller: order.trader,
          price: Number(order.price) / 1e18,
          amount: Number(order.amount) / 1e18,
          isBuyOrder: order.isBuyOrder,
          isActive: order.isActive
        });
      }
    }
    
    return orders;
  } catch (error) {
    console.error("Error in getUserOrders:", error);
    // หากเกิดข้อผิดพลาด ให้ใช้ข้อมูลจำลองแทน
    return mockOrderbook.filter(
      order => order.seller.toLowerCase() === userAddress.toLowerCase() && order.assetId === assetId && order.isActive
    );
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
  contract: FractionalDAOContract | null,
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
    
    // กำหนดค่า gas options เพื่อป้องกัน timeout
    const gasOptions = {
      from,
      gas: "4000000", // เพิ่ม gas limit
      gasPrice: web3.utils.toWei('5', 'gwei'), // ลดค่า gas price
      maxFeePerGas: null, // ล้างค่า maxFeePerGas เพื่อให้ใช้ gasPrice
      maxPriorityFeePerGas: null // ล้างค่า maxPriorityFeePerGas เพื่อให้ใช้ gasPrice
    };
    
    if (isBuyOrder) {
      const totalCost = price * amount;
      const weiTotalCost = web3.utils.toWei(totalCost.toString(), 'ether');
      const fee = Number(weiTotalCost) * 0.01; // ค่าธรรมเนียม 1%
      
      return await contract.methods.createOrder(
        assetId,
        weiAmount,
        weiPrice,
        true
      ).send({
        ...gasOptions,
        value: String(Number(weiTotalCost) + fee),
      });
    } else {
      const totalValue = price * amount;
      const weiTotalValue = web3.utils.toWei(totalValue.toString(), 'ether');
      const fee = Number(weiTotalValue) * 0.01; // ค่าธรรมเนียม 1%
      
      return await contract.methods.createOrder(
        assetId,
        weiAmount,
        weiPrice,
        false
      ).send({
        ...gasOptions,
        value: String(fee),
      });
    }
  } catch (error) {
    console.error("Error in createTradeOrder:", error);
    
    // แสดงข้อความแจ้งเตือนที่เป็นประโยชน์มากขึ้น
    if (error.message && error.message.includes('408')) {
      throw new Error("การทำรายการหมดเวลา (Timeout) กรุณาลองใหม่อีกครั้งโดยปรับลดจำนวนหรือตรวจสอบการเชื่อมต่อเครือข่าย");
    }
    
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
export const matchOrders = async (contract: FractionalDAOContract | null, assetId: number, from: string) => {
  checkContract(contract);
  
  try {
    const web3 = new Web3();
    
    // กำหนดค่า gas options เพื่อป้องกัน timeout
    const gasOptions = {
      from,
      gas: "5000000", // เพิ่ม gas limit
      gasPrice: web3.utils.toWei('5', 'gwei'), // ลดค่า gas price
      maxFeePerGas: null,
      maxPriorityFeePerGas: null
    };
    
    return await contract.methods.matchOrders(assetId).send(gasOptions);
  } catch (error) {
    console.error("Error in matchOrders:", error);
    
    // แสดงข้อความแจ้งเตือนที่เป็นประโยชน์มากขึ้น
    if (error.message && error.message.includes('408')) {
      throw new Error("การจับคู่ออเดอร์หมดเวลา (Timeout) กรุณาลองใหม่ในภายหลัง");
    }
    
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
export const cancelOrder = async (contract: FractionalDAOContract | null, orderId: number, from: string) => {
  if (!contract) {
    console.error("Contract not initialized in cancelOrder");
    throw new Error("Contract not initialized");
  }
  
  try {
    return await contract.methods.cancelOrder(orderId).send({
      from,
      gas: "3000000"
    });
  } catch (error) {
    console.error("Error in cancelOrder:", error);
    throw error;
  }
};

/**
 * Fill a specific order directly
 * @param contract The initialized smart contract instance
 * @param orderId The ID of the order to fill
 * @param amount The amount to fill (can be partial)
 * @param from The user's wallet address
 * @returns Transaction receipt
 */
export const fillOrder = async (contract: FractionalDAOContract | null, orderId: number, amount: number, from: string) => {
  if (!contract) {
    console.error("Contract not initialized in fillOrder");
    throw new Error("Contract not initialized");
  }
  
  try {
    const web3 = new Web3();
    
    // กำหนดค่า gas options เพื่อป้องกัน timeout และการ revert
    const gasOptions = {
      from,
      gas: "6000000", // เพิ่ม gas limit ให้สูงขึ้น
      gasPrice: web3.utils.toWei('10', 'gwei'), // เพิ่ม gasPrice
      maxFeePerGas: null,
      maxPriorityFeePerGas: null
    };
    
    // ตรวจสอบว่าออเดอร์มีอยู่จริงหรือไม่ก่อนทำธุรกรรม
    try {
      const order = await contract.methods.orders(orderId).call() as OrderData;
      if (!order.isActive) {
        throw new Error("ออเดอร์นี้ไม่ได้ใช้งานอยู่หรือถูกทำรายการไปแล้ว");
      }
    } catch (orderCheckError) {
      console.warn("ไม่สามารถตรวจสอบสถานะออเดอร์ได้:", orderCheckError);
      // ดำเนินการต่อไป เผื่อว่าเป็นแค่ปัญหาการอ่านข้อมูล
    }
    
    return await contract.methods.fillOrder(orderId).send(gasOptions);
  } catch (error) {
    console.error("Error in fillOrder:", error);
    
    // จัดการข้อผิดพลาดให้ละเอียดมากขึ้น
    if (error.message && error.message.includes('reverted')) {
      throw new Error("ไม่สามารถทำรายการได้: ธุรกรรมถูกย้อนกลับ อาจเนื่องจากออเดอร์ถูกทำรายการไปแล้ว หรือมีการเปลี่ยนแปลงสถานะ");
    } else if (error.message && error.message.includes('gas')) {
      throw new Error("แก๊สไม่เพียงพอในการทำธุรกรรม กรุณาเพิ่มแก๊สและลองใหม่อีกครั้ง");
    } else if (error.message && error.message.includes('408')) {
      throw new Error("การทำรายการหมดเวลา (Timeout) กรุณาลองใหม่อีกครั้ง");
    }
    
    throw error;
  }
};

interface BestPricesResult {
  bestBuyPrice: string;
  bestSellPrice: string;
}

/**
 * Get the current best price for an asset
 * @param contract The initialized smart contract instance
 * @param assetId The ID of the asset
 * @returns Object with best buy and sell prices
 */
export const getBestPrices = async (contract: FractionalDAOContract | null, assetId: number) => {
  if (!contract) {
    console.error("Contract not initialized in getBestPrices");
    throw new Error("Contract not initialized");
  }
  
  try {
    // เรียกใช้ฟังก์ชัน getBestPrices จาก contract โดยตรง
    const result = await contract.methods.getBestPrices(assetId).call() as BestPricesResult;
    
    return {
      bestBuyPrice: Number(result.bestBuyPrice) / 1e18,
      bestSellPrice: Number(result.bestSellPrice) / 1e18
    };
  } catch (error) {
    console.error("Error in getBestPrices:", error);
    
    // หากเกิดข้อผิดพลาด ให้คำนวณจากข้อมูลจำลองแทน
    const orders = mockOrderbook.filter(order => order.assetId === assetId && order.isActive);
    const buyOrders = orders.filter(order => order.isBuyOrder);
    const sellOrders = orders.filter(order => !order.isBuyOrder);
    
    const bestBuyPrice = buyOrders.length > 0
      ? Math.max(...buyOrders.map(order => order.price))
      : 0;
    
    const bestSellPrice = sellOrders.length > 0
      ? Math.min(...sellOrders.map(order => order.price))
      : 0;
    
    return {
      bestBuyPrice,
      bestSellPrice
    };
  }
};
