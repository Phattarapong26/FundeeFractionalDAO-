import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Toaster } from '@/components/ui/sonner';
import { Web3Provider } from '@/hooks/useWeb3';
import { TransactionsProvider } from '@/hooks/useTransactions';

// Pages
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import AssetDetails from './pages/AssetDetails';
import Governance from './pages/Governance';
import ProposalDetails from './pages/ProposalDetails';
import CreateProposal from './pages/CreateProposal';
import TokenMarketplace from './pages/TokenMarketplace';
import CreateAsset from './pages/CreateAsset';
import Trade from './pages/Trade';
import Rewards from './pages/Rewards';
import { Fee } from './pages/Fee';
import SecuritySettings from './pages/SecuritySettings';
import Whitelist from './pages/Whitelist';
import Analytics from './pages/Analytics';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Web3Provider>
      <TransactionsProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/asset/:id" element={<AssetDetails />} />
            <Route path="/governance" element={<Governance />} />
            <Route path="/proposal/:id" element={<ProposalDetails />} />
            <Route path="/create-proposal" element={<CreateProposal />} />
            <Route path="/token-marketplace" element={<TokenMarketplace />} />
            <Route path="/create-asset" element={<CreateAsset />} />
            <Route path="/trade" element={<Trade />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/fee" element={<Fee />} />
            <Route path="/security-settings" element={<SecuritySettings />} />
            <Route path="/whitelist" element={<Whitelist />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </TransactionsProvider>
    </Web3Provider>
  );
}

export default App;
