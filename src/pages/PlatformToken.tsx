import { motion } from 'framer-motion';
import { PlatformTokenInfo } from '@/components/Platform/PlatformTokenInfo';
import PageLayout from '@/components/Layout/PageLayout';

const PlatformToken = () => {
  return (
    <PageLayout className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-4">FUNDFA Token</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Token สำหรับใช้ในแพลตฟอร์ม สามารถใช้ซื้อขายและจ่ายค่าธรรมเนียมได้
          </p>
        </motion.div>

        <PlatformTokenInfo />
      </div>
    </PageLayout>
  );
};

export default PlatformToken; 