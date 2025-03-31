
// This is a mock implementation for file upload
// In a real application, this would upload to a storage service like AWS S3, Firebase Storage, etc.

export const uploadImage = async (file: File): Promise<string> => {
  if (!file) {
    throw new Error("No file provided");
  }
  
  // Check if file is an image
  if (!file.type.startsWith('image/')) {
    throw new Error("File must be an image");
  }
  
  // Maximum file size (5MB)
  const MAX_FILE_SIZE = 50 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File size exceeds 5MB limit");
  }
  
  // In a real implementation, here we would upload to a storage service
  // For this demo, we'll create a mock URL with a delay to simulate network request
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // Create a temporary URL for the uploaded file
      // In a real app, this would be the URL returned by the storage service
      const mockFileId = Math.random().toString(36).substring(2, 15);
      
      // For local testing, create an ObjectURL to actually view the image in the UI
      // Note: In a real app, we'd use the URL from the storage service
      const objectUrl = URL.createObjectURL(file);
      
      // In a production app, return the remote URL
      // resolve(`https://storage.example.com/uploads/${mockFileId}/${file.name}`);
      
      // For demo purposes, we'll use the ObjectURL so we can see the actual uploaded image
      resolve(objectUrl);
    }, 1500); // Simulate network delay
  });
};

export const createImageUploadHandler = (
  setImageUrl: (url: string) => void,
  setIsUploading: (isUploading: boolean) => void
) => {
  return async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setIsUploading(true);
    
    try {
      const url = await uploadImage(file);
      setImageUrl(url);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };
};
