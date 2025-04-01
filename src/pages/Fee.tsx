import { motion } from 'framer-motion';
import { FeeInfo } from '@/components/Fee/FeeInfo';
import { PageLayout } from '@/components/Layout/PageLayout';

export const Fee = () => {
  return (
    <PageLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold mb-2">ค่าธรรมเนียม</h1>
          <p className="text-gray-500">
            จ่ายค่าธรรมเนียมเพื่อใช้งานระบบและดูประวัติการจ่ายค่าธรรมเนียมของคุณ
          </p>
        </motion.div>
        
        <FeeInfo />
      </div>
    </PageLayout>
  );
}; 