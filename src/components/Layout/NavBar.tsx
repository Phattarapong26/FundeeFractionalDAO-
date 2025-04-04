import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Wallet, 
  User, 
  LogOut, 
  ChevronDown, 
  BarChart2, 
  Store, 
  Home, 
  ShieldCheck, 
  BarChart,
  Coins,
  LineChart,
  Shield
} from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { truncateAddress } from '@/lib/utils';
import { useTransactions } from '@/hooks/useTransactions';
import Logo from '@/components/Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { account, connectWallet, disconnectWallet, isConnecting } = useWeb3();
  const { clearTransactions } = useTransactions();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDisconnect = () => {
    disconnectWallet();
    clearTransactions();
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Marketplace', path: '/marketplace', icon: Store },
    { name: 'Trade', path: '/trade', icon: BarChart },
    { name: 'Dashboard', path: '/dashboard', icon: BarChart2 },
    { name: 'Governance', path: '/governance', icon: ShieldCheck }
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 ${
        scrolled ? 'glass soft-shadow' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <NavLink to="/" className="flex items-center">
            <Logo />
          </NavLink>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `relative px-1 py-2 text-base font-medium transition-colors duration-200 flex items-center gap-2 ${
                    isActive ? 'text-dao' : 'text-gray-600 hover:text-gray-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} />
                    {item.name}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-dao"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {account ? (
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100">
                    <User size={16} className="text-gray-600" />
                    <span className="text-sm font-medium">{truncateAddress(account)}</span>
                  </div>
                  <ChevronDown size={16} className="text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => handleNavigate('/dashboard')}>
                  <BarChart2 size={16} className="mr-2" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigate('/marketplace')}>
                  <Store size={16} className="mr-2" />
                  Marketplace
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigate('/trade')}>
                  <BarChart size={16} className="mr-2" />
                  Trade
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigate('/governance')}>
                  <ShieldCheck size={16} className="mr-2" />
                  Governance
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  className="text-red-500 focus:text-red-500" 
                  onClick={handleDisconnect}
                >
                  <LogOut size={16} className="mr-2" />
                  Disconnect Wallet
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Button 
            variant="secondary" 
            size="sm" 
            className="flex items-center gap-2 rounded-full px-5 py-2"
            onClick={connectWallet}
            disabled={isConnecting}
          >
            <Wallet size={16} />
            <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
          </Button>
        )}
      </div>
    </motion.header>
  );
};

export default NavBar;
