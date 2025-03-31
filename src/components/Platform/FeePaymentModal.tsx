
import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CreditCard, Coins } from 'lucide-react';
import { useFeeStatus } from '@/hooks/useFeeStatus';

interface FeePaymentModalProps {
  onFeePaid?: () => void;
  trigger?: React.ReactNode;
}

export function FeePaymentModal({ onFeePaid, trigger }: FeePaymentModalProps) {
  const [open, setOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { hasPaidFee, payWithETH, payWithToken, isLoading } = useFeeStatus();
  
  const handlePayWithETH = async () => {
    setIsProcessing(true);
    const success = await payWithETH();
    setIsProcessing(false);
    
    if (success) {
      setOpen(false);
      if (onFeePaid) onFeePaid();
    }
  };
  
  const handlePayWithToken = async () => {
    setIsProcessing(true);
    const success = await payWithToken();
    setIsProcessing(false);
    
    if (success) {
      setOpen(false);
      if (onFeePaid) onFeePaid();
    }
  };
  
  if (hasPaidFee) return null;
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Pay Transaction Fee</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pay Transaction Fee</DialogTitle>
          <DialogDescription>
            A one-time fee is required to enable transactions on the platform.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="eth" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="eth">Pay with ETH</TabsTrigger>
            <TabsTrigger value="token">Pay with FUNDFA</TabsTrigger>
          </TabsList>
          <TabsContent value="eth" className="p-4 border rounded-md mt-2">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-500" />
                <h3 className="font-medium">Pay with ETH</h3>
              </div>
              <p className="text-sm text-gray-600">
                Pay a one-time fee of 0.05 ETH to enable transactions across the platform.
              </p>
              <Button 
                onClick={handlePayWithETH} 
                disabled={isProcessing || isLoading}
                className="w-full"
              >
                {isProcessing ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                ) : (
                  "Pay with ETH"
                )}
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="token" className="p-4 border rounded-md mt-2">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-purple-500" />
                <h3 className="font-medium">Pay with FUNDFA Tokens</h3>
              </div>
              <p className="text-sm text-gray-600">
                Pay a one-time fee of 0.022 FUNDFA tokens to enable transactions across the platform.
                Make sure you have approved the token spending.
              </p>
              <Button 
                onClick={handlePayWithToken} 
                disabled={isProcessing || isLoading}
                className="w-full"
              >
                {isProcessing ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                ) : (
                  "Pay with FUNDFA"
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
