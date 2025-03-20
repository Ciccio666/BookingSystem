import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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

const ServiceAddonCard = ({ 
  addon,
  isSelected = false,
  onSelect,
  showPrice = true,
  showControls = false,
  onEdit,
  onToggleActive
}: ServiceAddonCardProps) => {
  const { name, description, price, active } = addon;
  const formattedPrice = formatPrice(price);

  return (
    <Card className={`w-full transition-all ${isSelected ? 'ring-2 ring-primary' : ''} ${!active ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">{name}</CardTitle>
            {!active && <Badge variant="outline" className="ml-2">Inactive</Badge>}
          </div>
          {onSelect && (
            <Checkbox 
              checked={isSelected}
              onCheckedChange={(checked) => onSelect(addon, checked as boolean)}
              className="mt-1"
            />
          )}
        </div>
        {description && (
          <CardDescription className="text-sm mt-1">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-3">
        {showPrice && (
          <div className="text-base font-semibold text-primary">
            {formattedPrice.formatted}
          </div>
        )}
        {addon.duration > 0 && (
          <div className="text-sm text-muted-foreground mt-1">
            Additional time: {addon.duration} min
          </div>
        )}
        <div className="flex flex-wrap gap-2 mt-2">
          {addon.displayOnBookingPage && (
            <Badge variant="outline" className="text-xs">
              Visible on booking
            </Badge>
          )}
          {addon.addPriceToDeposit && (
            <Badge variant="outline" className="text-xs">
              Added to deposit
            </Badge>
          )}
        </div>
      </CardContent>
      {showControls && (
        <CardFooter className="pt-0 flex justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit?.(addon)}
          >
            Edit
          </Button>
          <Button 
            variant={active ? "default" : "secondary"} 
            size="sm"
            onClick={() => onToggleActive?.(addon)}
          >
            {active ? 'Deactivate' : 'Activate'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ServiceAddonCard;