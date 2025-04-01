import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useAssetAnalytics } from '@/hooks/useAssetAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Users, DollarSign, BarChart } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar
} from 'recharts';

export const AssetAnalytics = () => {
  const { id } = useParams();
  const { 
    totalValue, 
    totalShares, 
    totalHolders, 
    tradingVolume, 
    trades,
    orders,
    isLoading 
  } = useAssetAnalytics(Number(id));
  
  // แปลงข้อมูล trades สำหรับกราฟ
  const tradesData = trades.map(trade => ({
    timestamp: trade.timestamp,
    price: Number(trade.price),
    volume: Number(trade.amount)
  }));
  
  // แปลงข้อมูล orders สำหรับกราฟ
  const ordersData = orders.map(order => ({
    timestamp: order.timestamp,
    price: Number(order.price),
    amount: Number(order.amount),
    type: order.isBuyOrder ? 'ซื้อ' : 'ขาย'
  }));
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">มูลค่ารวม</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                `${Number(totalValue).toLocaleString('th-TH')} ETH`
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">จำนวนหุ้นทั้งหมด</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                `${Number(totalShares).toLocaleString('th-TH')}`
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">จำนวนผู้ถือหุ้น</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                totalHolders.toLocaleString('th-TH')
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ปริมาณการซื้อขาย</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                `${Number(tradingVolume).toLocaleString('th-TH')} ETH`
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>ประวัติการซื้อขาย</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tradesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="price" stroke="#8884d8" name="ราคา" />
                  <Line yAxisId="right" type="monotone" dataKey="volume" stroke="#82ca9d" name="ปริมาณ" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>คำสั่งซื้อขายปัจจุบัน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={ordersData.filter(order => order.isActive)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#8884d8" name="จำนวน" />
                </RechartsBarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>รายการซื้อขายล่าสุด</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">เวลา</th>
                  <th className="text-left">ผู้ซื้อ</th>
                  <th className="text-left">ผู้ขาย</th>
                  <th className="text-right">จำนวน</th>
                  <th className="text-right">ราคา</th>
                </tr>
              </thead>
              <tbody>
                {trades.slice(0, 10).map((trade) => (
                  <tr key={trade.id}>
                    <td>{trade.timestamp}</td>
                    <td>{trade.buyer.slice(0, 6)}...{trade.buyer.slice(-4)}</td>
                    <td>{trade.seller.slice(0, 6)}...{trade.seller.slice(-4)}</td>
                    <td className="text-right">{Number(trade.amount).toLocaleString('th-TH')}</td>
                    <td className="text-right">{Number(trade.price).toLocaleString('th-TH')} ETH</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}; 