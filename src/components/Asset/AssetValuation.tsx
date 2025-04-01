import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useAssetValuation } from '@/hooks/useAssetValuation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { Loader2, DollarSign, TrendingUp, History } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AssetValuation = () => {
  const { id } = useParams();
  const { 
    currentValue, 
    historicalValues, 
    newValue, 
    setNewValue, 
    updateValue, 
    isLoading 
  } = useAssetValuation(Number(id));
  
  const handleUpdateValue = async () => {
    if (!newValue || Number(newValue) <= 0) return;
    await updateValue(Number(newValue));
  };
  
  const chartData = historicalValues.map((value, index) => ({
    time: `Day ${index + 1}`,
    value: Number(value)
  }));
  
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
            <DollarSign className="mr-2 text-muted-foreground" />
            มูลค่าสินทรัพย์
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">มูลค่าปัจจุบัน</p>
              <p className="text-2xl font-bold">
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  `${Number(currentValue).toLocaleString('th-TH')} ETH`
                )}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">อัปเดตมูลค่า</label>
            <div className="flex space-x-2">
              <Input
                type="number"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="ระบุมูลค่าใหม่"
                disabled={isLoading}
              />
              <LoadingButton
                onClick={handleUpdateValue}
                isLoading={isLoading}
                disabled={!newValue || Number(newValue) <= 0}
              >
                อัปเดตมูลค่า
              </LoadingButton>
            </div>
          </div>
          
          <div className="h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="mr-2 text-blue-500" />
            ประวัติมูลค่า
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalValues}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}; 