import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Edit, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils/booking';
import { ServiceAddon } from '@/lib/types';

interface ServiceAddonCardProps {
  addon: ServiceAddon;
  isSelected?: boolean;
  onSelect?: (addon: ServiceAddon, selected: boolean) => void;
  showPrice?: boolean;
  showControls?: boolean;
  onEdit?: (addon: ServiceAddon) => void;
  onToggleActive?: (addon: ServiceAddon) => void;
}

const ServiceAddonCard: React.FC<ServiceAddonCardProps> = ({
  addon,
  isSelected = false,
  onSelect,
  showPrice = true,
  showControls = false,
  onEdit,
  onToggleActive,
}) => {
  const handleClick = () => {
    if (onSelect) {
      onSelect(addon, !isSelected);
    }
  };

  const formattedPrice = formatPrice(addon.price);

  return (
    <Card 
      className={`relative transition-all duration-200 overflow-hidden ${
        isSelected ? 'ring-2 ring-primary' : ''
      } ${onSelect ? 'cursor-pointer hover:shadow-md' : ''}`}
      onClick={onSelect ? handleClick : undefined}
    >
      {addon.photo && (
        <div className="h-32 overflow-hidden">
          <img 
            src={addon.photo} 
            alt={addon.name} 
            className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
      
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium">{addon.name}</CardTitle>
          
          {showControls && (
            <div className="flex items-center gap-1">
              <Switch 
                checked={addon.active}
                onCheckedChange={() => onToggleActive && onToggleActive(addon)}
                className="scale-75"
              />
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-gray-500 hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit && onEdit(addon);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        {addon.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{addon.description}</p>
        )}
        
        <div className="flex flex-wrap gap-2 mt-2">
          {addon.duration > 0 && (
            <span className="px-2 py-1 text-xs bg-gray-100 rounded-full">
              +{addon.duration} min
            </span>
          )}
          
          {addon.displayOnBookingPage && (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              Booking Page
            </span>
          )}
          
          {addon.addPriceToDeposit && (
            <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">
              Deposit
            </span>
          )}
        </div>
      </CardContent>
      
      {showPrice && (
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <span className="font-semibold text-primary">AU${formattedPrice.formatted}</span>
          
          {onSelect && (
            <div className="h-5 w-5 rounded-full border-2 flex items-center justify-center overflow-hidden transition-colors duration-200 mr-1 text-white">
              {isSelected && (
                <div className="h-full w-full bg-primary flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              )}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default ServiceAddonCard;