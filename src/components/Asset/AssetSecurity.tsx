import { motion } from 'framer-motion';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAssetSecurity } from '@/hooks/useAssetSecurity';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2, Shield, Users, Settings } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const AssetSecurity = () => {
  const { id } = useParams();
  const { 
    securityLevel, 
    securitySettings, 
    whitelistedAddresses, 
    isLoading, 
    updateSecuritySettings, 
    addToWhitelist, 
    removeFromWhitelist 
  } = useAssetSecurity(Number(id));
  
  const [newAddress, setNewAddress] = useState('');
  const [maxAmount, setMaxAmount] = useState(securitySettings.maxTransactionAmount);
  const [cooldownPeriod, setCooldownPeriod] = useState(securitySettings.cooldownPeriod);
  
  const handleUpdateSettings = async () => {
    await updateSecuritySettings({
      requireApproval: securitySettings.requireApproval,
      maxTransactionAmount: Number(maxAmount),
      cooldownPeriod: Number(cooldownPeriod),
      whitelistEnabled: securitySettings.whitelistEnabled
    });
  };
  
  const handleAddToWhitelist = async () => {
    if (!newAddress) return;
    await addToWhitelist(newAddress);
    setNewAddress('');
  };
  
  const handleRemoveFromWhitelist = async (address: string) => {
    await removeFromWhitelist(address);
  };
  
  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'High':
        return 'text-green-500';
      case 'Medium':
        return 'text-yellow-500';
      default:
        return 'text-red-500';
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 text-blue-500" />
            ความปลอดภัยของสินทรัพย์
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">ระดับความปลอดภัย</h3>
            <div className={`text-2xl font-bold ${getSecurityLevelColor(securityLevel)}`}>
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                securityLevel
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-500">ต้องการการอนุมัติ</label>
              <Switch
                checked={securitySettings.requireApproval}
                onCheckedChange={(checked) => 
                  updateSecuritySettings({
                    ...securitySettings,
                    requireApproval: checked
                  })
                }
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">จำนวนธุรกรรมสูงสุด</label>
              <Input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">ระยะเวลารอคอย (วินาที)</label>
              <Input
                type="number"
                value={cooldownPeriod}
                onChange={(e) => setCooldownPeriod(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-500">เปิดใช้งานรายชื่อที่อนุญาต</label>
              <Switch
                checked={securitySettings.whitelistEnabled}
                onCheckedChange={(checked) => 
                  updateSecuritySettings({
                    ...securitySettings,
                    whitelistEnabled: checked
                  })
                }
              />
            </div>
            
            <Button 
              onClick={handleUpdateSettings}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                'บันทึกการตั้งค่า'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 text-blue-500" />
            รายชื่อที่อนุญาต
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex gap-2">
              <Input
                placeholder="ที่อยู่ที่ต้องการเพิ่ม"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleAddToWhitelist}
                disabled={isLoading || !newAddress}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  'เพิ่ม'
                )}
              </Button>
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ที่อยู่</TableHead>
                <TableHead>การดำเนินการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {whitelistedAddresses.map((address) => (
                <TableRow key={address}>
                  <TableCell className="font-mono">{address}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveFromWhitelist(address)}
                      disabled={isLoading}
                    >
                      ลบ
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {whitelistedAddresses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-gray-500">
                    ไม่มีที่อยู่ในรายชื่อที่อนุญาต
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}; 