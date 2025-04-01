import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Loader2, Upload, Image, RefreshCw, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useWeb3 } from '@/hooks/useWeb3';
import { createProposal } from '@/lib/contract/contract';
import PageLayout from '@/components/Layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAssets } from '@/hooks/useAssets';
import { Input } from '@/components/ui/input';
import { createImageUploadHandler } from '@/lib/utils/fileUpload';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CreateProposal = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assetId, setAssetId] = useState('');
  const [executionData, setExecutionData] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { account, contract } = useWeb3();
  const { assets, loading: assetsLoading, refetch } = useAssets();
  const navigate = useNavigate();
  
  const handleImageUpload = createImageUploadHandler(setImageUrl, setIsUploading);

  useEffect(() => {
    console.log("Assets in CreateProposal:", assets);
  }, [assets]);

  const handleCreateAsset = () => {
    navigate('/create-asset');
  };

  const handleRefreshAssets = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("Assets refreshed successfully");
    } catch (error) {
      console.error("Error refreshing assets:", error);
      toast.error("Failed to refresh assets");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!contract) {
      toast.error("Contract not initialized");
      return;
    }

    if (!title || !description || !assetId) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (!imageUrl) {
      toast.error("Please upload an image for the proposal");
      return;
    }

    if (!termsAgreed) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    try {
      setLoading(true);
      await createProposal(
        contract,
        parseInt(assetId),
        title,
        description,
        imageUrl, // Use the uploaded image URL
        executionData || '', // Use empty string if no execution data is provided
        account
      );
      
      toast.success("Proposal created successfully");
      navigate('/governance');
    } catch (error) {
      console.error("Error creating proposal:", error);
      toast.error(`Failed to create proposal: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout className="bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Button
            variant="outline"
            className="mb-6"
            onClick={() => navigate('/governance')}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Governance
          </Button>
          
          <h1 className="text-3xl font-bold mb-4">Create New Proposal</h1>
          <p className="text-lg text-gray-600">
            Submit a new proposal for the DAO to vote on. All proposals require a minimum number of tokens to create.
          </p>
        </motion.div>
        
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="flex justify-end space-x-2 mb-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleCreateAsset}
                  className="h-9"
                >
                  <Plus size={16} className="mr-1" />
                  Create Asset
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefreshAssets}
                  disabled={isRefreshing}
                  className="h-9"
                >
                  <RefreshCw size={16} className={`mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh Assets
                </Button>
              </div>
              
              {assets.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-sm text-blue-700 font-medium mb-2">
                    Available Assets ({assets.length})
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {assets.map(asset => (
                      <div key={asset.id} className="text-xs bg-white p-2 rounded border border-blue-100">
                        <strong>{asset.name}</strong> ({asset.symbol})
                        {asset.id > 2 && <span className="ml-1 text-green-600 text-[10px]">• New</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Proposal Title*
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter a clear, descriptive title"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-32"
                  placeholder="Provide a detailed description of the proposal"
                  required
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="assetId" className="block text-sm font-medium text-gray-700">
                    Related Asset*
                  </label>
                </div>
                
                <Select 
                  value={assetId} 
                  onValueChange={setAssetId}
                  disabled={assetsLoading || assets.length === 0}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetsLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading assets...
                      </SelectItem>
                    ) : assets.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No assets available
                      </SelectItem>
                    ) : (
                      assets.map(asset => (
                        <SelectItem key={asset.id.toString()} value={asset.id.toString()}>
                          {asset.name} ({asset.symbol})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700 mb-1">
                  Proposal Image*
                </label>
                <div className="border border-dashed border-gray-300 rounded-lg bg-gray-50 p-4">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    {imageUrl ? (
                      <div className="relative w-full">
                        <img 
                          src={imageUrl} 
                          alt="Proposal preview" 
                          className="w-full h-48 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 rounded-full p-1 text-white hover:bg-opacity-90"
                        >
                          <ArrowLeft size={16} className="rotate-45" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Image size={40} className="text-gray-400" />
                        <p className="text-sm text-gray-500">
                          Upload an image for your proposal
                        </p>
                        <p className="text-xs text-gray-400">
                          Recommended: 1200 x 630px, max 5MB
                        </p>
                      </>
                    )}
                    
                    <div className="w-full">
                      <Input
                        id="imageUpload"
                        type="file"
                        className={`${imageUrl ? 'hidden' : ''}`}
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                      
                      {!imageUrl && (
                        <Button 
                          type="button"
                          variant="outline" 
                          className="w-full mt-2"
                          onClick={() => document.getElementById('imageUpload')?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <>
                              <Loader2 size={16} className="mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload size={16} className="mr-2" />
                              Browse Files
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                {!imageUrl && (
                  <p className="text-xs text-gray-500 mt-1">
                    Upload an image to represent your proposal. This will be displayed on the Governance page.
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="executionData" className="block text-sm font-medium text-gray-700 mb-1">
                  Execution Data (Optional)
                </label>
                <textarea
                  id="executionData"
                  value={executionData}
                  onChange={(e) => setExecutionData(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-24"
                  placeholder="Data that will be used when the proposal is executed"
                />
              </div>
              
              <div className="flex items-start space-x-3 pt-4">
                <Checkbox 
                  id="terms" 
                  checked={termsAgreed}
                  onCheckedChange={(checked) => setTermsAgreed(checked === true)}
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I understand that creating a proposal requires tokens and once submitted, the proposal cannot be modified or deleted.
                </label>
              </div>
              
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 py-3 h-auto"
                  disabled={loading || !account || !termsAgreed || isUploading || !imageUrl || assets.length === 0}
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="mr-2 animate-spin" />
                      Creating Proposal...
                    </>
                  ) : (
                    <>
                      <Check size={20} className="mr-2" />
                      Submit Proposal
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
};

export default CreateProposal;
