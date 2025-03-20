
import { Button } from "@/components/ui/button";
import { TimeSlot } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface TimeSelectorProps {
  timeSlots: TimeSlot[];
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
}

const TimeSelector = ({ timeSlots, selectedTime, onTimeSelect }: TimeSelectorProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="w-full">      
      {timeSlots.length === 0 ? (
        <p className="text-sm text-neutral-600">No available times for this date.</p>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
          {timeSlots.map((slot) => (
            <Button
              key={slot.time}
              variant="outline"
              className={cn(
                "text-sm transition-colors shadow-sm h-10",
                // Pill shape with slight rounded corners as specified
                "rounded-lg",
                !slot.available && "bg-neutral-100 text-neutral-400 cursor-not-allowed border-neutral-200",
                slot.available && slot.time === selectedTime && "bg-primary text-white border-primary hover:bg-primary/90",
                slot.available && slot.time !== selectedTime && "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
              )}
              disabled={!slot.available}
              onClick={() => slot.available && onTimeSelect(slot.time)}
            >
              {slot.time}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimeSelector;
