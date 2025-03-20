import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ServiceAddon } from '@/lib/types';
import ServiceAddonCard from '../services/ServiceAddonCard';
import { formatPrice } from '@/lib/utils/booking';

interface ServiceAddonsSelectorProps {
  onAddonsChange: (addons: ServiceAddon[]) => void;
  initialSelectedAddons?: ServiceAddon[];
}

const ServiceAddonsSelector = ({
  onAddonsChange,
  initialSelectedAddons = []
}: ServiceAddonsSelectorProps) => {
  const [selectedAddons, setSelectedAddons] = useState<ServiceAddon[]>(initialSelectedAddons);
  
  const {
    data: addons = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['/api/service-addons', { active: true }],
    queryFn: async () => {
      const response = await fetch('/api/service-addons?active=true');
      if (!response.ok) {
        throw new Error('Failed to fetch service add-ons');
      }
      return response.json();
    },
    staleTime: 1000 * 60, // 1 minute
  });

  // Filter for add-ons that should be displayed on the booking page
  const visibleAddons = addons.filter((addon: ServiceAddon) => 
    addon.active && addon.displayOnBookingPage
  );

  useEffect(() => {
    onAddonsChange(selectedAddons);
  }, [selectedAddons, onAddonsChange]);

  const handleAddonToggle = (addon: ServiceAddon, selected: boolean) => {
    if (selected) {
      setSelectedAddons((prev) => [...prev, addon]);
    } else {
      setSelectedAddons((prev) => prev.filter((a) => a.id !== addon.id));
    }
  };

  const calculateTotalPrice = () => {
    return selectedAddons.reduce((total, addon) => total + addon.price, 0);
  };

  const totalAddonPrice = calculateTotalPrice();
  const formattedTotalPrice = formatPrice(totalAddonPrice);

  if (isLoading) {
    return <div className="py-4 text-center">Loading add-ons...</div>;
  }

  if (error) {
    return <div className="py-4 text-center text-red-500">Error loading add-ons</div>;
  }

  if (visibleAddons.length === 0) {
    return null; // Don't show the section if no add-ons are available
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Service Add-ons (Optional)</h3>
      <p className="text-sm text-muted-foreground">
        Enhance your experience by selecting from these additional services.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {visibleAddons.map((addon: ServiceAddon) => (
          <ServiceAddonCard
            key={addon.id}
            addon={addon}
            isSelected={selectedAddons.some(a => a.id === addon.id)}
            onSelect={handleAddonToggle}
          />
        ))}
      </div>
      
      {selectedAddons.length > 0 && (
        <div className="flex justify-between items-center border-t pt-4 mt-4">
          <div className="font-medium">Selected Add-ons Total:</div>
          <div className="text-lg font-semibold text-primary">
            {formattedTotalPrice.formatted}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceAddonsSelector;