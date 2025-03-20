import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface BufferTimeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  description?: string;
}

const BufferTimeSelector = ({ 
  value, 
  onChange, 
  label = "Buffer Time", 
  description 
}: BufferTimeSelectorProps) => {
  
  // Generate time options in 15-minute increments
  const bufferTimeOptions = Array.from({ length: 9 }, (_, i) => {
    const hours = Math.floor((i * 15) / 60);
    const minutes = (i * 15) % 60;
    
    const formattedTime = `${hours}h ${minutes}m`;
    const value = `${hours * 60 + minutes}`; // Value in minutes
    
    return { label: formattedTime, value };
  });
  
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      
      <Select
        value={value}
        onValueChange={onChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select buffer time" />
        </SelectTrigger>
        <SelectContent>
          {bufferTimeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default BufferTimeSelector;