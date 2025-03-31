
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { getContract } from '@/lib/contract/contract';

interface Web3ContextType {
  account: string | null;
  web3: any;
  contract: any;
  connectWallet: () => Promise<boolean>;
  disconnectWallet: () => void;
  isConnecting: boolean;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [web3, setWeb3] = useState<any>(null);
  const [contract, setContract] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Check if MetaMask is installed
    if (typeof window !== 'undefined' && window.ethereum) {
      // Handle account changes
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          
          // Re-initialize Web3 and contract when account changes
          const initializeWeb3 = async () => {
            try {
              const Web3 = (await import('web3')).default;
              const web3Instance = new Web3(window.ethereum);
              setWeb3(web3Instance);
              
              // Initialize contract with new account
              const contractInstance = getContract(web3Instance);
              setContract(contractInstance);
              
              console.log("Web3 and contract initialized with account:", accounts[0]);
            } catch (error) {
              console.error("Failed to initialize after account change:", error);
            }
          };
          
          initializeWeb3();
          toast.info(`Connected to account: ${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}`);
        } else {
          // User disconnected their wallet
          setAccount(null);
          setWeb3(null);
          setContract(null);
          toast.info('Wallet disconnected');
        }
      };

      // Handle chain changes
      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Check if already connected
      const checkConnection = async () => {
        try {
          const accounts = await window.ethereum?.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            setAccount(accounts[0]);
            
            // Initialize Web3
            const Web3 = (await import('web3')).default;
            const web3Instance = new Web3(window.ethereum);
            setWeb3(web3Instance);
            
            // Initialize contract
            const contractInstance = getContract(web3Instance);
            setContract(contractInstance);
            
            console.log("Initial connection established with account:", accounts[0]);
            console.log("Contract initialized:", contractInstance ? "Yes" : "No");
          }
        } catch (error) {
          console.error('Error checking connection', error);
        }
      };

      checkConnection();

      // Cleanup
      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  const connectWallet = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !window.ethereum) {
      toast.error('MetaMask is not installed. Please install MetaMask to use this application.');
      return false;
    }

    setIsConnecting(true);

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        
        // Initialize Web3
        const Web3 = (await import('web3')).default;
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        
        // Initialize contract
        const contractInstance = getContract(web3Instance);
        if (!contractInstance) {
          throw new Error("Failed to initialize contract");
        }
        
        setContract(contractInstance);
        console.log("Wallet connected and contract initialized:", accounts[0]);
        
        toast.success('Wallet connected successfully!');
        return true;
      } else {
        toast.error('No accounts found. Please check your MetaMask setup.');
        return false;
      }
    } catch (error: any) {
      console.error('Error connecting wallet', error);
      toast.error(`Failed to connect wallet: ${error.message || 'Unknown error'}`);
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setWeb3(null);
    setContract(null);
    toast.info('Wallet disconnected');
    
    // Note: There is no direct way to disconnect a wallet with MetaMask's API
    // The user needs to manually disconnect from the MetaMask UI
    // This function just clears the local state
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        web3,
        contract,
        connectWallet,
        disconnectWallet,
        isConnecting
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
