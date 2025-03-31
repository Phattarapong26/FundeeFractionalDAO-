import { motion } from 'framer-motion';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/Layout/PageLayout';
import SmartContractProcess from '@/components/Home/SmartContractProcess';
import FeaturedProposals from '@/components/Home/FeaturedProposals';
import Founders from '@/components/Home/Founders';

const Index = () => {
  const navigate = useNavigate();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.04, 0.62, 0.23, 0.98] } }
  };

  return (
    <PageLayout>
      <section className="min-h-[90vh] flex flex-col justify-center relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-20 z-10">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={item}>
              <span className="chip bg-blue-100 text-dao mb-6">Decentralized Ownership</span>
            </motion.div>
            
            <motion.h1 variants={item} className="heading-xl mb-6">
              Fractional Ownership
              <br />
              Through <span className="text-dao">DAO Governance</span>
            </motion.h1>
            
            <motion.p variants={item} className="body-lg text-gray-600 mb-10 max-w-3xl mx-auto">
              Own a piece of premium assets collectively, vote on governance decisions, and earn
              passive income through our decentralized platform.
            </motion.p>
            
            <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/marketplace')}
                className="btn-primary"
              >
                Explore Assets
                <ArrowRight size={18} className="ml-2" />
              </button>
              
              <button className="btn-secondary">
                Connect Wallet
                <ArrowRight size={18} className="ml-2" />
              </button>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
        >
          <span className="text-sm text-gray-400 mb-2">Scroll to discover</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ArrowDown size={20} className="text-gray-400" />
          </motion.div>
        </motion.div>

        <div className="absolute top-20 left-10 w-40 h-40 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-60 h-60 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="heading-lg mb-6">How It Works</h2>
            <p className="body-md text-gray-600">
              FractionalDAO leverages smart contracts to enable seamless fractional ownership and democratic governance of assets.
            </p>
          </motion.div>

          <SmartContractProcess />
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="heading-lg mb-6">Featured Proposals</h2>
            <p className="body-md text-gray-600">
              Explore active governance proposals that have received significant community participation.
            </p>
          </motion.div>

          <FeaturedProposals />

          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/governance')}
              className="btn-ghost"
            >
              View All Proposals
              <ArrowRight size={18} className="ml-2" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <span className="chip bg-blue-100 text-dao mb-6">Decentralized Governance</span>
              <h2 className="heading-lg mb-6">
                DAO Governance for Collective Asset Management
              </h2>
              <p className="body-md text-gray-600 mb-6">
                FractionalDAO uses blockchain technology to enable truly democratic ownership and management of valuable assets. As a shareholder, you can:
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Vote on important decisions affecting your assets",
                  "Propose new initiatives and management strategies",
                  "Receive your share of income generated by the assets",
                  "Trade your ownership shares on the marketplace"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-3 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => navigate('/governance')}
                className="btn-primary"
              >
                Learn About Governance
                <ArrowRight size={18} className="ml-2" />
              </button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative z-10 bg-white p-8 rounded-xl soft-shadow">
                <h3 className="heading-sm mb-6">Latest Governance Proposal</h3>
                <span className="chip bg-yellow-100 text-yellow-700 mb-4">Voting Active</span>
                <h4 className="text-xl font-medium mb-2">Renovation of Manhattan Property</h4>
                <p className="text-gray-600 mb-4">
                  Proposal to allocate $500,000 for renovations to increase the property value and rental income.
                </p>
                <div className="space-y-3 mb-6">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Yes Votes</span>
                      <span className="font-medium">68%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full rounded-full" style={{ width: "68%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>No Votes</span>
                      <span className="font-medium">32%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full rounded-full" style={{ width: "32%" }}></div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>29 days remaining</span>
                  <span>256 investors voted</span>
                </div>
              </div>
              
              <div className="absolute top-5 right-5 w-full h-full bg-blue-100 rounded-xl -z-10"></div>
              <div className="absolute top-10 right-10 w-full h-full bg-blue-50 rounded-xl -z-20"></div>
            </motion.div>
          </div>
        </div>
      </section>

      <Founders />

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="heading-lg mb-6">Ready to Join?</h2>
            <p className="body-md text-gray-600 mb-8">
              Start your journey in fractional ownership today with just a few simple steps.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/marketplace')}
                className="btn-primary"
              >
                Explore Marketplace
                <ArrowRight size={18} className="ml-2" />
              </button>
              
              <button className="btn-secondary">
                Learn More
                <ArrowRight size={18} className="ml-2" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Index;
