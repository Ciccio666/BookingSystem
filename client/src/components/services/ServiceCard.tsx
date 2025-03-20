import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Service } from "@/lib/types";
import { formatPrice } from "@/lib/utils/booking";
import { motion } from "framer-motion";

interface ServiceCardProps {
  service: Service;
  onSelect: (service: Service) => void;
}

const ServiceCard = ({ service, onSelect }: ServiceCardProps) => {
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

  // Only show active services
  if (!service.active) {
    return null;
  }

  return (
    <Card className="bg-white rounded-lg shadow overflow-hidden border border-neutral-200 flex flex-col h-full">
      {service.photo && (
        <div className="w-full h-48 overflow-hidden">
          <img 
            src={service.photo} 
            alt={service.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex-grow">
          <h3 className="font-bold text-lg text-neutral-800 mb-2">{service.name}</h3>
          <p className="text-neutral-600 text-sm">{service.description}</p>
        </div>
        
        <div className="mt-auto pt-4">
          <div className="flex justify-between items-center mb-4 border-t border-neutral-100 pt-4">
            <span className="text-sm text-neutral-500">{formatDuration(service.duration)}</span>
            <span className="font-bold text-primary">{formattedPrice.formatted}</span>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 px-4 rounded transition-all"
              onClick={() => onSelect(service)}
            >
              Select
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
