
import { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';

export type TransactionStatus = 'pending' | 'success' | 'failed';

export interface Transaction {
  id: string;
  hash: string;
  description: string;
  status: TransactionStatus;
  timestamp: number;
}

interface TransactionsContextType {
  transactions: Transaction[];
  addTransaction: (hash: string, description: string) => void;
  updateTransaction: (hash: string, status: TransactionStatus) => void;
  clearTransactions: () => void;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const addTransaction = (hash: string, description: string) => {
    const newTransaction: Transaction = {
      id: `tx-${Date.now()}`,
      hash,
      description,
      status: 'pending',
      timestamp: Date.now(),
    };
    
    setTransactions((prev) => [newTransaction, ...prev]);
    toast.info(`Transaction submitted: ${description}`);
  };

  const updateTransaction = (hash: string, status: TransactionStatus) => {
    setTransactions((prev) => 
      prev.map((tx) => {
        if (tx.hash === hash) {
          if (status === 'success') {
            toast.success(`Transaction successful: ${tx.description}`);
          } else if (status === 'failed') {
            toast.error(`Transaction failed: ${tx.description}`);
          }
          return { ...tx, status };
        }
        return tx;
      })
    );
  };

  const clearTransactions = () => {
    setTransactions([]);
  };

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        clearTransactions,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
};
