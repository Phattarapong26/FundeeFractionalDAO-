import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useAssetSecurity } from '@/hooks/useAssetSecurity';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { Loader2, UserPlus, UserMinus, Users } from 'lucide-react';
import { useState } from 'react';

export default function Whitelist() {
  const { id } = useParams();
  const [newAddress, setNewAddress] = useState('');
  const { 
    whitelistedAddresses, 
    addToWhitelist, 
    removeFromWhitelist, 
    isLoading 
  } = useAssetSecurity(Number(id));

  const handleAddAddress = async () => {
    if (!newAddress) return;
    await addToWhitelist(newAddress);
    setNewAddress('');
  };

  const handleRemoveAddress = async (address: string) => {
    await removeFromWhitelist(address);
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
            <Users className="mr-2 text-blue-500" />
            จัดการ Whitelist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <UserPlus className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">จำนวนที่อยู่ใน Whitelist</p>
              <p className="text-2xl font-bold">
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  whitelistedAddresses.length
                )}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">เพิ่มที่อยู่ใหม่</label>
              <div className="flex space-x-2">
                <Input
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="ระบุที่อยู่ Ethereum"
                  disabled={isLoading}
                />
                <LoadingButton
                  onClick={handleAddAddress}
                  isLoading={isLoading}
                  disabled={!newAddress}
                >
                  เพิ่ม
                </LoadingButton>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">รายการที่อยู่ใน Whitelist</label>
              <div className="space-y-2">
                {whitelistedAddresses.map((address) => (
                  <div key={address} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-mono text-sm">{address}</span>
                    <LoadingButton
                      onClick={() => handleRemoveAddress(address)}
                      isLoading={isLoading}
                      variant="destructive"
                    >
                      <UserMinus className="h-4 w-4" />
                    </LoadingButton>
                  </div>
                ))}
                {whitelistedAddresses.length === 0 && (
                  <p className="text-sm text-gray-500">ไม่มีที่อยู่ใน Whitelist</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 