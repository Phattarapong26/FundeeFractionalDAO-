import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { getContract } from '@/lib/contract/contract';

// รองรับทั้ง Mainnet และ Holesky Testnet
const SUPPORTED_NETWORKS = {
  '1': 'Ethereum Mainnet',
  '17000': 'Holesky Testnet'
};

interface Web3ContextType {
  account: string | null;
  web3: any;
  contract: any;
  connectWallet: () => Promise<boolean>;
  disconnectWallet: () => void;
  isConnecting: boolean;
  networkId: string | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [web3, setWeb3] = useState<any>(null);
  const [contract, setContract] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [networkId, setNetworkId] = useState<string | null>(null);

  const checkNetwork = async () => {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setNetworkId(chainId);
      
      if (!SUPPORTED_NETWORKS[chainId]) {
        toast.error(`กรุณาเชื่อมต่อกับเครือข่ายที่รองรับ: ${Object.values(SUPPORTED_NETWORKS).join(', ')}`);
        return false;
      }
      
      toast.success(`เชื่อมต่อกับ ${SUPPORTED_NETWORKS[chainId]} สำเร็จ`);
      return true;
    } catch (error) {
      console.error('Error checking network:', error);
      toast.error('ไม่สามารถตรวจสอบเครือข่ายได้');
      return false;
    }
  };

  const initializeWeb3 = async (accounts: string[]) => {
    try {
      const Web3 = (await import('web3')).default;
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      
      const contractInstance = getContract(web3Instance);
      if (!contractInstance) {
        throw new Error('ไม่สามารถเชื่อมต่อกับ Smart Contract ได้');
      }
      setContract(contractInstance);
      
      console.log("Web3 and contract initialized with account:", accounts[0]);
      return true;
    } catch (error) {
      console.error("Failed to initialize Web3:", error);
      toast.error('ไม่สามารถเชื่อมต่อกับ Smart Contract ได้');
      return false;
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            const isCorrectNetwork = await checkNetwork();
            if (!isCorrectNetwork) return;

            setAccount(accounts[0]);
            await initializeWeb3(accounts);
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      }
    };

    checkConnection();

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length > 0) {
        const isCorrectNetwork = await checkNetwork();
        if (!isCorrectNetwork) return;

        setAccount(accounts[0]);
        await initializeWeb3(accounts);
      } else {
        setAccount(null);
        setWeb3(null);
        setContract(null);
        setNetworkId(null);
        toast.info('Wallet disconnected');
      }
    };

    const handleChainChanged = async () => {
      const isCorrectNetwork = await checkNetwork();
      if (!isCorrectNetwork) {
        window.location.reload();
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const connectWallet = async (): Promise<boolean> => {
    if (!window.ethereum) {
      toast.error('กรุณาติดตั้ง MetaMask หรือ Wallet อื่นๆ');
      return false;
    }

    setIsConnecting(true);
    try {
      // ขอสิทธิ์การเข้าถึงบัญชี
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts && accounts.length > 0) {
        const isCorrectNetwork = await checkNetwork();
        if (!isCorrectNetwork) {
          setIsConnecting(false);
          return false;
        }

        setAccount(accounts[0]);
        const success = await initializeWeb3(accounts);
        setIsConnecting(false);
        return success;
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        toast.error('คุณได้ปฏิเสธการเชื่อมต่อ Wallet');
      } else {
        toast.error('ไม่สามารถเชื่อมต่อ Wallet ได้');
      }
    }
    setIsConnecting(false);
    return false;
  };

  const disconnectWallet = () => {
    setAccount(null);
    setWeb3(null);
    setContract(null);
    setNetworkId(null);
    toast.info('Wallet disconnected');
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        web3,
        contract,
        connectWallet,
        disconnectWallet,
        isConnecting,
        networkId,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
