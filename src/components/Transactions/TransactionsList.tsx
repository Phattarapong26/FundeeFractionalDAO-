
import { motion } from 'framer-motion';
import { ExternalLink, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useTransactions, TransactionStatus } from '@/hooks/useTransactions';
import { formatDistanceToNow } from 'date-fns';

interface TransactionsListProps {
  showAll?: boolean;
}

export const TransactionsList = ({ showAll = false }: TransactionsListProps) => {
  const { transactions } = useTransactions();

  if (transactions.length === 0) {
    return null;
  }

  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
    }
  };

  // Limit the number of transactions to display unless showAll is true
  const displayedTransactions = showAll ? transactions : transactions.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl p-6 shadow-sm mb-8"
    >
      <h3 className="text-lg font-semibold mb-4">
        {showAll ? "All Transactions" : "Recent Transactions"}
      </h3>
      <div className={`space-y-3 ${showAll ? '' : 'max-h-60 overflow-auto'}`}>
        {displayedTransactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(tx.status)}
              <div>
                <p className="text-sm font-medium">{tx.description}</p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
            <a
              href={`https://etherscan.io/tx/${tx.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
