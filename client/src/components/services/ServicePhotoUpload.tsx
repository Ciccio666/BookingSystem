import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ImageIcon, UploadIcon, X } from 'lucide-react';

interface ServicePhotoUploadProps {
  initialImageUrl?: string;
  onImageChange: (imageBase64: string | null) => void;
  required?: boolean;
}

const ServicePhotoUpload: React.FC<ServicePhotoUploadProps> = ({ 
  initialImageUrl, 
  onImageChange,
  required = false
}) => {
  const [imageUrl, setImageUrl] = useState<string | undefined>(initialImageUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);
    
    if (!file) return;
    
    // File type validation
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    
    // File size validation (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2MB');
      return;
    }
    
    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imgData = e.target?.result as string;
      setImageUrl(imgData);
      onImageChange(imgData);
      setIsUploading(false);
    };
    
    reader.onerror = () => {
      setError('Failed to read the image file');
      setIsUploading(false);
    };
    
    reader.readAsDataURL(file);
  };
  
  const handleRemove = () => {
    setImageUrl(undefined);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="w-full">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        required={required}
      />
      
      {imageUrl ? (
        <div className="relative rounded-md overflow-hidden border border-gray-200">
          <img 
            src={imageUrl} 
            alt="Service" 
            className="w-full h-48 object-cover"
          />
          <Button 
            variant="destructive" 
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div 
          className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors ${
            error ? 'border-red-400' : 'border-gray-300'
          }`}
          onClick={handleUploadClick}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium">Upload an image</span>
              <span className="text-xs text-gray-500">
                Click to upload or drag and drop
              </span>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              className="mt-2"
              disabled={isUploading}
            >
              {isUploading ? (
                <span>Uploading...</span>
              ) : (
                <>
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Select Image
                </>
              )}
            </Button>
          </div>
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
      
      <p className="text-xs text-gray-500 mt-1">
        {required ? 'Required. ' : ''}
        Max size: 2MB. Formats: JPG, PNG, GIF.
      </p>
    </div>
  );
};

export default ServicePhotoUpload;