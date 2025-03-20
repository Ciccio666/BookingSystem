import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Service } from "@/lib/types";
import { formatPrice } from "@/lib/utils/booking";

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

  return (
    <Card className="bg-white rounded-lg shadow overflow-hidden border border-neutral-200">
      <CardContent className="p-6">
        <h3 className="font-bold text-lg text-neutral-800 mb-2">{service.name}</h3>
        <p className="text-neutral-600 text-sm mb-4">{service.description}</p>
        
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-neutral-500">{formatDuration(service.duration)}</span>
          <span className="font-bold text-primary">{formattedPrice.formatted}</span>
        </div>
        
        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 px-4 rounded transition-colors"
          onClick={() => onSelect(service)}
        >
          Select
        </Button>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
