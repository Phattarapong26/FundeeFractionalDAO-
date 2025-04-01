import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, ImageIcon, Loader2, Upload } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { fractionalizeAsset } from '@/lib/contract/contract';
import { uploadImage } from '@/lib/utils/fileUpload';
import PageLayout from '@/components/Layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Web3 from 'web3';

const web3 = new Web3();

const CreateAsset = () => {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [totalShares, setTotalShares] = useState('1000');
  const [pricePerShare, setPricePerShare] = useState('0.01');
  const [minInvestment, setMinInvestment] = useState('0.1');
  const [maxInvestment, setMaxInvestment] = useState('10');
  const [apy, setApy] = useState('5');
  const [date, setDate] = useState<Date | undefined>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { account, contract, connectWallet } = useWeb3();
  const navigate = useNavigate();
  
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setImageFile(file);
    setIsUploading(true);
    
    try {
      const url = await uploadImage(file);
      setImageUrl(url);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contract || !account) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    if (!name || !symbol || !imageUrl || !totalShares || !pricePerShare || !date) {
      toast.error("Please fill out all required fields");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const totalValue = Number(totalShares) * Number(pricePerShare);
      const fundingDeadline = Math.floor(date.getTime() / 1000); // Convert to Unix timestamp
      
      // แปลงค่าเป็น Wei
      const pricePerShareWei = web3.utils.toWei(pricePerShare, 'ether');
      const minInvestmentWei = web3.utils.toWei(minInvestment, 'ether');
      const maxInvestmentWei = web3.utils.toWei(maxInvestment, 'ether');
      const totalValueWei = web3.utils.toWei(totalValue.toString(), 'ether');
      
      await fractionalizeAsset(
        contract,
        name,
        symbol,
        imageUrl,
        Number(totalShares),
        Number(pricePerShareWei),
        Number(minInvestmentWei),
        Number(maxInvestmentWei),
        Number(totalValueWei),
        Number(apy),
        fundingDeadline,
        account
      );
      
      toast.success("Asset created successfully!");
      navigate('/marketplace');
    } catch (error) {
      console.error("Error creating asset:", error);
      toast.error("Failed to create asset. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const totalValue = Number(totalShares) * Number(pricePerShare);
  
  return (
    <PageLayout className="bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-4">Create a New Fractionalized Asset</h1>
          <p className="text-lg text-gray-600">
            List a new asset for fractional ownership and investment on the platform.
          </p>
        </motion.div>
        
        {!account ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center bg-white p-10 rounded-xl shadow-sm"
          >
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Connect your wallet to create a new fractionalized asset.
            </p>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={connectWallet}
            >
              Connect Wallet
            </Button>
          </motion.div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Asset Details</CardTitle>
              <CardDescription>
                Provide information about the asset you want to fractionalize
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Asset Name</Label>
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="e.g., Premium Real Estate"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="symbol">Symbol</Label>
                      <Input 
                        id="symbol" 
                        value={symbol} 
                        onChange={(e) => setSymbol(e.target.value)} 
                        placeholder="e.g., PRE"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="image">Asset Image</Label>
                      <div className="mt-1 flex items-center">
                        <label className="relative flex w-full cursor-pointer items-center justify-center rounded-md border border-dashed border-gray-300 p-6 text-center hover:border-gray-400 focus:outline-none">
                          <div className="space-y-2">
                            {imageUrl ? (
                              <div className="flex flex-col items-center">
                                <img 
                                  src={imageUrl} 
                                  alt="Asset preview" 
                                  className="h-32 w-32 object-cover rounded-md"
                                />
                                <span className="text-xs text-gray-500 mt-2">
                                  {imageFile?.name}
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <ImageIcon className="h-8 w-8 text-gray-400" />
                                <span className="text-sm text-gray-500">
                                  {isUploading ? 'Uploading...' : 'Upload an image'}
                                </span>
                              </div>
                            )}
                          </div>
                          <Input 
                            id="image" 
                            type="file" 
                            accept="image/*" 
                            className="sr-only" 
                            onChange={handleImageChange}
                            disabled={isUploading}
                            required
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="totalShares">Total Shares</Label>
                      <Input 
                        id="totalShares" 
                        type="number"
                        value={totalShares} 
                        onChange={(e) => setTotalShares(e.target.value)} 
                        min="1"
                        placeholder="e.g., 1000"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="pricePerShare">Price Per Share (ETH)</Label>
                      <Input 
                        id="pricePerShare" 
                        type="number"
                        value={pricePerShare} 
                        onChange={(e) => setPricePerShare(e.target.value)} 
                        min="0.000001"
                        step="0.000001"
                        placeholder="e.g., 0.01"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="minInvestment">Min Investment (ETH)</Label>
                        <Input 
                          id="minInvestment" 
                          type="number"
                          value={minInvestment} 
                          onChange={(e) => setMinInvestment(e.target.value)} 
                          min="0.000001"
                          step="0.000001"
                          placeholder="e.g., 0.1"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="maxInvestment">Max Investment (ETH)</Label>
                        <Input 
                          id="maxInvestment" 
                          type="number"
                          value={maxInvestment} 
                          onChange={(e) => setMaxInvestment(e.target.value)} 
                          min="0.000001"
                          step="0.000001"
                          placeholder="e.g., 10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="apy">Expected APY (%)</Label>
                      <Input 
                        id="apy" 
                        type="number"
                        value={apy} 
                        onChange={(e) => setApy(e.target.value)} 
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="e.g., 5"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="fundingDeadline">Funding Deadline</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe the asset and investment opportunity" 
                    className="min-h-24"
                  />
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Total Shares:</p>
                      <p className="font-medium">{totalShares}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Value:</p>
                      <p className="font-medium">{totalValue.toFixed(6)} ETH</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Price Per Share:</p>
                      <p className="font-medium">{pricePerShare} ETH</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Expected APY:</p>
                      <p className="font-medium">{apy}%</p>
                    </div>
                  </div>
                </div>
                
                <CardFooter className="flex justify-end px-0">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="mr-4"
                    onClick={() => navigate('/marketplace')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting || isUploading}
                  >
                    {isSubmitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                    ) : (
                      <><Upload className="mr-2 h-4 w-4" /> Create Asset</>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default CreateAsset;
