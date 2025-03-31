import { motion } from 'framer-motion';
import { Coins, FileText, Building2, Wallet } from 'lucide-react';

const SmartContractProcess = () => {
  const processes = [
    {
      title: "Asset Tokenization",
      description: "Assets are tokenized on the blockchain with a specified number of shares, price per share, and funding details.",
      icon: <Coins className="w-8 h-8 text-blue-600" />,
      delay: 0.1
    },
    {
      title: "Purchase Shares via Smart Contract",
      description: "Users interact with the smart contract to purchase shares, with funds and ownership managed transparently on the blockchain.",
      icon: <FileText className="w-8 h-8 text-blue-600" />,
      delay: 0.2
    },
    {
      title: "Governance Voting",
      description: "Share owners can create and vote on proposals, with execution automatically triggered via smart contract when approved.",
      icon: <Building2 className="w-8 h-8 text-blue-600" />,
      delay: 0.3
    },
    {
      title: "Smart Dividend Distribution",
      description: "Asset profits are distributed automatically to shareholders proportional to their ownership stake.",
      icon: <Wallet className="w-8 h-8 text-blue-600" />,
      delay: 0.4
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
      {processes.map((process, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: process.delay }}
          viewport={{ once: true }}
          className="card text-center hover:translate-y-[-5px]"
        >
          <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-5">
            {process.icon}
          </div>
          <h3 className="heading-sm mb-3">{process.title}</h3>
          <p className="text-gray-600">{process.description}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default SmartContractProcess;
