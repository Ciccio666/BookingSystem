import { Button } from "@/components/ui/button";
import { TimeSlot } from "@/lib/types";

interface TimeSelectorProps {
  timeSlots: TimeSlot[];
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
}

const TimeSelector = ({ timeSlots, selectedTime, onTimeSelect }: TimeSelectorProps) => {
  return (
    <div className="p-4 border-t border-neutral-200">
      <h3 className="text-base font-medium text-neutral-700 mb-4">Available start times</h3>
      
      {timeSlots.length === 0 ? (
        <p className="text-sm text-neutral-600">No available times for this date.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {timeSlots.map((slot) => (
            <Button
              key={slot.time}
              variant="outline"
              className={`py-2 px-4 text-center text-sm transition-colors ${
                !slot.available
                  ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                  : slot.time === selectedTime
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-blue-100 text-blue-800 hover:bg-blue-200"
              }`}
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
