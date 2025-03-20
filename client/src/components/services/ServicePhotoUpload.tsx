import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Image, Upload, X } from 'lucide-react';

interface ServicePhotoUploadProps {
  initialImageUrl?: string;
  onImageChange: (imageBase64: string | null) => void;
  required?: boolean;
}

const ServicePhotoUpload = ({ 
  initialImageUrl, 
  onImageChange,
  required = true 
}: ServicePhotoUploadProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(initialImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      return;
    }
    
    // Validate file type
    if (!file.type.match('image.*')) {
      setError('Please select an image file (JPEG, PNG, etc.)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    // Reset error
    setError(null);
    
    // Convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      onImageChange(base64);
    };
    reader.readAsDataURL(file);
  };
  
  const handleRemoveImage = () => {
    setImagePreview(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="service-photo">
        Service Photo {required && <span className="text-red-500">*</span>}
      </Label>
      
      <div className="border-2 border-dashed rounded-lg p-4 text-center">
        {!imagePreview ? (
          <div 
            className="flex flex-col items-center justify-center gap-2 cursor-pointer py-6"
            onClick={triggerFileInput}
          >
            <Image className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Click to upload service photo
            </p>
            <p className="text-xs text-muted-foreground">
              JPEG, PNG or GIF (max. 5MB)
            </p>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Photo
            </Button>
          </div>
        ) : (
          <div className="relative">
            <img 
              src={imagePreview} 
              alt="Service Preview" 
              className="max-h-48 mx-auto object-contain"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background opacity-80 hover:opacity-100"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <input
          id="service-photo"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
      </div>
      
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default ServicePhotoUpload;