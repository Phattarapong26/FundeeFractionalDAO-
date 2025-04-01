import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useAssetSecurity } from '@/hooks/useAssetSecurity';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { Loader2, Shield, Lock, AlertTriangle } from 'lucide-react';

export default function SecuritySettings() {
  const { id } = useParams();
  const { 
    securityLevel, 
    securitySettings, 
    updateSecuritySettings, 
    isLoading 
  } = useAssetSecurity(Number(id));

  const handleUpdateSettings = async () => {
    await updateSecuritySettings(securitySettings);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 text-blue-500" />
            การตั้งค่าความปลอดภัย
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">ระดับความปลอดภัย</p>
              <p className={`text-2xl font-bold ${
                securityLevel === 'high' ? 'text-green-500' :
                securityLevel === 'medium' ? 'text-yellow-500' :
                'text-red-500'
              }`}>
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  securityLevel === 'high' ? 'สูง' :
                  securityLevel === 'medium' ? 'ปานกลาง' :
                  'ต่ำ'
                )}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">จำนวนการอนุมัติที่จำเป็น</label>
              <Input
                type="number"
                value={securitySettings.requiredApprovals}
                onChange={(e) => securitySettings.requiredApprovals = Number(e.target.value)}
                placeholder="ระบุจำนวน"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="text-sm font-medium">จำนวนธุรกรรมสูงสุดต่อวัน</label>
              <Input
                type="number"
                value={securitySettings.maxTransactionsPerDay}
                onChange={(e) => securitySettings.maxTransactionsPerDay = Number(e.target.value)}
                placeholder="ระบุจำนวน"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="text-sm font-medium">ระยะเวลารอคอยระหว่างธุรกรรม (วินาที)</label>
              <Input
                type="number"
                value={securitySettings.transactionCooldown}
                onChange={(e) => securitySettings.transactionCooldown = Number(e.target.value)}
                placeholder="ระบุจำนวน"
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={securitySettings.whitelistEnabled}
                onChange={(e) => securitySettings.whitelistEnabled = e.target.checked}
                disabled={isLoading}
              />
              <label className="text-sm font-medium">เปิดใช้งาน Whitelist</label>
            </div>
          </div>

          <LoadingButton
            onClick={handleUpdateSettings}
            isLoading={isLoading}
            disabled={!securitySettings.requiredApprovals || !securitySettings.maxTransactionsPerDay || !securitySettings.transactionCooldown}
          >
            บันทึกการตั้งค่า
          </LoadingButton>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-1" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">คำแนะนำ</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>• ตั้งค่าจำนวนการอนุมัติให้เหมาะสมกับขนาดของสินทรัพย์</p>
                  <p>• กำหนดระยะเวลารอคอยเพื่อป้องกันการโจมตี</p>
                  <p>• เปิดใช้งาน Whitelist สำหรับผู้ถือหุ้นที่เชื่อถือได้</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 