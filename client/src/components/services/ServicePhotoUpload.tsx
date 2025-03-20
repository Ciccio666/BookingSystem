import React, { ChangeEvent, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ImageIcon, Upload, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

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
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      handleFile(file);
    },
    [onImageChange]
  );

  const handleFile = useCallback(
    (file?: File) => {
      if (!file) {
        setError('No file selected');
        return;
      }

      // Check file type
      if (!file.type.match('image.*')) {
        setError('Please select an image file');
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setImageUrl(base64);
        onImageChange(base64);
        setError(null);
      };

      reader.onerror = () => {
        setError('Error reading file');
      };

      reader.readAsDataURL(file);
    },
    [onImageChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      handleFile(file);
    },
    [handleFile]
  );

  const removeImage = useCallback(() => {
    setImageUrl(undefined);
    onImageChange(null);
  }, [onImageChange]);

  return (
    <div className="space-y-4">
      {imageUrl ? (
        <div className="relative rounded-md overflow-hidden border">
          <img 
            src={imageUrl} 
            alt="Service image" 
            className="w-full h-48 object-cover" 
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="absolute top-2 right-2 rounded-full p-1 h-8 w-8"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center min-h-[180px] ${
            isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'
          } ${error ? 'border-red-500' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="p-2 rounded-full bg-gray-100">
              <ImageIcon className="h-10 w-10 text-gray-500" />
            </div>
            <div className="text-sm font-medium">
              Drag and drop your image here or click to upload
            </div>
            <div className="text-xs text-gray-500">
              Supports JPG, PNG, GIF (up to 5MB)
            </div>
            {error && <div className="text-xs text-red-500">{error}</div>}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => document.getElementById('photoUpload')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
          </div>
          <Input
            id="photoUpload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            required={required}
          />
        </div>
      )}
    </div>
  );
};

export default ServicePhotoUpload;