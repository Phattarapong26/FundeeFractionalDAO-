
import { ERC20ABI } from './erc20Abi';

export const PLATFORM_TOKEN_ADDRESS = '0x7408655dCB1457d63d3EF2Eafa1493AcBB82d711'; // Updated token address

export const getPlatformTokenContract = (web3: any) => {
  if (!web3) return null;
  
  try {
    return new web3.eth.Contract(ERC20ABI, PLATFORM_TOKEN_ADDRESS);
  } catch (error) {
    console.error("Error initializing token contract:", error);
    return null;
  }
};

export const getTokenBalance = async (tokenContract: any, address: string) => {
  if (!tokenContract || !address) return 0;
  
  try {
    return await tokenContract.methods.balanceOf(address).call();
  } catch (error) {
    console.error("Error fetching token balance:", error);
    return 0;
  }
};

export const approveTokenSpending = async (tokenContract: any, spender: string, amount: string, from: string) => {
  if (!tokenContract) throw new Error('Token contract not initialized');
  
  try {
    return await tokenContract.methods.approve(spender, amount).send({
      from,
      gas: 100000
    });
  } catch (error) {
    console.error("Error approving token spending:", error);
    throw error;
  }
};

export const buyPlatformTokens = async (tokenContract: any, value: string, from: string) => {
  if (!tokenContract) throw new Error('Token contract not initialized');
  
  try {
    return await tokenContract.methods.buyTokens().send({
      from,
      value,
      gas: 200000
    });
  } catch (error) {
    console.error("Error buying platform tokens:", error);
    throw error;
  }
};
