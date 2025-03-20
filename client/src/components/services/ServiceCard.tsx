import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Service } from "@/lib/types";
import { formatPrice } from "@/lib/utils/booking";
import { Switch } from "@/components/ui/switch";
import { AnimatePresence, motion } from "framer-motion";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ServiceCardProps {
  service: Service;
  onSelect: (service: Service) => void;
}

const ServiceCard = ({ service, onSelect }: ServiceCardProps) => {
  const [isActive, setIsActive] = useState<boolean>(service.active ?? true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const { toast } = useToast();
  const formattedPrice = formatPrice(service.price);
  
  // Format service duration into a readable string
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} mins.`;
    } else {
      const hours = Math.floor(minutes / 60);
      return hours === 1 ? `1 hr.` : `${hours} hrs.`;
    }
  };
  
  // Handle service active status toggle
  const handleToggleActive = async (checked: boolean) => {
    setIsUpdating(true);
    try {
      // Visual feedback first
      setIsActive(checked);
      
      // Then update the server
      await apiRequest("PATCH", `/api/services/${service.id}`, {
        active: checked
      });
      
      // Invalidate services cache to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      
      toast({
        title: checked ? "Service Activated" : "Service Deactivated",
        description: `${service.name} is now ${checked ? 'available' : 'unavailable'} for booking.`,
      });
    } catch (error) {
      // Revert UI on error
      setIsActive(!checked);
      
      toast({
        title: "Update Failed",
        description: "Failed to update service status. Please try again.",
        variant: "destructive",
      });
      
      console.error("Failed to update service:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className={`bg-white rounded-lg shadow overflow-hidden border ${isActive ? 'border-neutral-200' : 'border-neutral-300 bg-neutral-50'}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-neutral-800">{service.name}</h3>
          <div className="flex items-center">
            <span className="text-xs text-neutral-500 mr-2">{isActive ? 'Active' : 'Inactive'}</span>
            <Switch 
              checked={isActive}
              onCheckedChange={handleToggleActive}
              disabled={isUpdating}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
        </div>
        
        <p className="text-neutral-600 text-sm mb-4">{service.description}</p>
        
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-neutral-500">{formatDuration(service.duration)}</span>
          <span className="font-bold text-primary">{formattedPrice.formatted}</span>
        </div>
        
        <AnimatePresence>
          <motion.div
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 5, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 px-4 rounded transition-all"
              onClick={() => onSelect(service)}
              disabled={!isActive}
            >
              {isActive ? 'Select' : 'Service Unavailable'}
            </Button>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
