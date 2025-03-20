
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
    <div className={cn(
      "border-t border-neutral-200",
      isMobile ? "p-4" : "p-4 md:pl-0 md:border-t-0 md:border-l md:ml-4"
    )}>
      <h3 className="text-base font-medium text-neutral-700 mb-4">Available start times</h3>
      
      {timeSlots.length === 0 ? (
        <p className="text-sm text-neutral-600">No available times for this date.</p>
      ) : (
        <div className={cn(
          "grid gap-2",
          isMobile ? "grid-cols-3 sm:grid-cols-4" : "md:grid-cols-3 lg:grid-cols-4"
        )}>
          {timeSlots.map((slot) => (
            <Button
              key={slot.time}
              variant="outline"
              className={cn(
                "w-full text-sm transition-colors shadow-sm h-10",
                // Pill shape with slight rounded corners instead of full rounded
                "rounded-lg",
                !slot.available && "bg-neutral-100 text-neutral-400 cursor-not-allowed",
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
