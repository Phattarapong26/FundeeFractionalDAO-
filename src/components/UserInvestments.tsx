import { useState, useEffect } from 'react';
import { useWeb3 } from '@/hooks/useWeb3';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface Investment {
  id: string;
  assetId: string;
  amount: string;
  timestamp: number;
  status: string;
}

interface ContractResponse {
  id: string;
  assetId: string;
  amount: string;
  timestamp: string | number;
  status: string;
}

export const UserInvestments = () => {
  const { account, contract } = useWeb3();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvestments = async () => {
      if (!account || !contract) {
        setIsLoading(false);
        setInvestments([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const userInvestments = await contract.methods.getUserInvestments(account).call();
        
        if (!userInvestments) {
          setInvestments([]);
          return;
        }

        const investmentsArray = Array.isArray(userInvestments) ? userInvestments : [];
        
        const formattedInvestments = investmentsArray
          .filter((investment): investment is ContractResponse => {
            return (
              typeof investment === 'object' &&
              investment !== null &&
              'id' in investment &&
              'assetId' in investment &&
              'amount' in investment &&
              'timestamp' in investment &&
              'status' in investment
            );
          })
          .map((investment: ContractResponse) => ({
            id: String(investment.id || ''),
            assetId: String(investment.assetId || ''),
            amount: String(investment.amount || '0'),
            timestamp: typeof investment.timestamp === 'string' 
              ? parseInt(investment.timestamp, 10) || 0 
              : Number(investment.timestamp) || 0,
            status: String(investment.status || 'pending')
          }));

        setInvestments(formattedInvestments);
      } catch (err) {
        console.error('Error fetching investments:', err);
        setError('ไม่สามารถดึงข้อมูลการลงทุนได้');
        setInvestments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvestments();
  }, [account, contract]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        {error}
      </div>
    );
  }

  if (!Array.isArray(investments) || !investments.length) {
    return (
      <div className="text-center text-muted-foreground">
        ไม่พบข้อมูลการลงทุน
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {investments.map((investment) => (
        <Card key={investment.id} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">สินทรัพย์ #{investment.assetId}</h3>
              <p className="text-sm text-muted-foreground">
                จำนวน: {formatNumber(investment.amount)} ETH
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {new Date(investment.timestamp * 1000).toLocaleDateString('th-TH')}
              </p>
              <span className={`text-sm ${
                investment.status === 'active' ? 'text-green-500' : 'text-yellow-500'
              }`}>
                {investment.status === 'active' ? 'กำลังดำเนินการ' : 'รอดำเนินการ'}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}; 