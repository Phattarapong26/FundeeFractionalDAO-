
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import NavBar from './NavBar';
import Footer from './Footer';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

const PageLayout = ({ children, className = '' }: PageLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex-grow pt-24 ${className}`}
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
};

export default PageLayout;
