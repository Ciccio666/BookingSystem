import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ServiceAddon } from '@/lib/types';
import ServiceAddonCard from '@/components/services/ServiceAddonCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/utils/booking';

interface ServiceAddonsSelectorProps {
  onAddonsChange: (addons: ServiceAddon[]) => void;
  initialSelectedAddons?: ServiceAddon[];
}

const ServiceAddonsSelector: React.FC<ServiceAddonsSelectorProps> = ({
  onAddonsChange,
  initialSelectedAddons = [],
}) => {
  const [selectedAddons, setSelectedAddons] = useState<ServiceAddon[]>(initialSelectedAddons);
  
  const { data: addons = [] as ServiceAddon[], isLoading, error } = useQuery<ServiceAddon[]>({
    queryKey: ['/api/service-addons'],
    staleTime: 1000 * 60, // 1 minute
  });
  
  // Filter displayed add-ons to only show active ones and those marked for booking page
  const visibleAddons = addons.filter((addon: ServiceAddon) => 
    addon.active && addon.displayOnBookingPage
  );
  
  useEffect(() => {
    onAddonsChange(selectedAddons);
  }, [selectedAddons, onAddonsChange]);
  
  const handleAddonToggle = (addon: ServiceAddon, selected: boolean) => {
    if (selected) {
      setSelectedAddons([...selectedAddons, addon]);
    } else {
      setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
    }
  };
  
  const calculateTotal = () => {
    if (selectedAddons.length === 0) return formatPrice(0);
    return formatPrice(selectedAddons.reduce((sum, addon) => sum + addon.price, 0));
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="rounded-lg border overflow-hidden">
              <Skeleton className="h-32 w-full" />
              <div className="p-4">
                <Skeleton className="h-6 w-2/3 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-5 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load service add-ons. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (visibleAddons.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No add-ons available for this service.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleAddons.map((addon) => (
          <ServiceAddonCard
            key={addon.id}
            addon={addon}
            isSelected={selectedAddons.some(a => a.id === addon.id)}
            onSelect={handleAddonToggle}
          />
        ))}
      </div>
      
      {selectedAddons.length > 0 && (
        <div className="flex justify-between p-4 bg-gray-50 rounded-lg mt-4">
          <span className="font-medium">Selected add-ons:</span>
          <span className="font-semibold text-primary">
            AU${calculateTotal().formatted}
          </span>
        </div>
      )}
    </div>
  );
};

export default ServiceAddonsSelector;