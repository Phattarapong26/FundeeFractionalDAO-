import { motion } from 'framer-motion';
import { RewardsInfo } from '@/components/Rewards/RewardsInfo';
import PageLayout from '@/components/Layout/PageLayout';

const Rewards = () => {
  return (
    <PageLayout className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-4">Rewards & Dividends</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            ดูรายได้จากการลงทุนของคุณ รวมถึงประวัติการได้รับ rewards และ dividends
          </p>
        </motion.div>

        <RewardsInfo />
      </div>
    </PageLayout>
  );
};

export default Rewards; 