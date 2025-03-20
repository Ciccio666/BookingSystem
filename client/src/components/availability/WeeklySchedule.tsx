import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { 
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  X 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format, addDays, startOfWeek, addWeeks } from 'date-fns';
import { cn } from '@/lib/utils';

interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

interface DaySchedule {
  date: Date;
  dayOfWeek: number;
  slots: TimeSlot[];
  isRecurring: boolean;
  isEnabled: boolean;
}

interface WeeklyScheduleProps {
  initialSchedule?: DaySchedule[];
  onSave: (schedule: DaySchedule[]) => void;
}

// Create a function to generate time slots for each hour only
const generateHourlyTimeSlots = () => {
  const slots: TimeSlot[] = [];
  
  for (let hour = 0; hour < 24; hour++) {
    // Format hours in 12-hour format with AM/PM
    const isPM = hour >= 12;
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const ampm = isPM ? 'PM' : 'AM';
    
    slots.push({
      time: `${displayHour}:00 ${ampm}`,
      isAvailable: false
    });
  }
  
  return slots;
};

const WeeklySchedule = ({ initialSchedule, onSave }: WeeklyScheduleProps) => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [maxDaysAhead, setMaxDaysAhead] = useState<number>(14);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  
  // Initialize the schedule for the current week
  useEffect(() => {
    if (initialSchedule) {
      setSchedule(initialSchedule);
    } else {
      const days: DaySchedule[] = [];
      for (let i = 0; i < 7; i++) {
        const daySlots = generateHourlyTimeSlots();
        
        // Set some default availability (9 AM to 9 PM) for weekdays
        if (i > 0 && i < 6) { // Monday through Friday
          daySlots.forEach((slot, index) => {
            // Hours 9 through 21 (9AM to 9PM) are available by default
            if (index >= 9 && index < 21) {
              slot.isAvailable = true;
            }
          });
        }
        
        days.push({
          date: addDays(currentWeekStart, i),
          dayOfWeek: i,
          slots: daySlots,
          isRecurring: false,
          isEnabled: i > 0 && i < 6 // Mon-Fri enabled by default
        });
      }
      setSchedule(days);
    }
  }, [initialSchedule]);

  // Update dates when week changes
  useEffect(() => {
    if (schedule.length) {
      const updatedSchedule = schedule.map((day, index) => ({
        ...day,
        date: addDays(currentWeekStart, index)
      }));
      setSchedule(updatedSchedule);
    }
  }, [currentWeekStart]);

  const handlePreviousWeek = () => {
    setCurrentWeekStart(prev => addWeeks(prev, -1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(prev => addWeeks(prev, 1));
  };

  const handleTimeSlotClick = (dayIndex: number, slotIndex: number) => {
    setSchedule(prevSchedule => {
      const newSchedule = [...prevSchedule];
      const day = { ...newSchedule[dayIndex] };
      const slots = [...day.slots];
      slots[slotIndex] = {
        ...slots[slotIndex],
        isAvailable: !slots[slotIndex].isAvailable
      };
      day.slots = slots;
      newSchedule[dayIndex] = day;
      return newSchedule;
    });
  };

  const handleToggleRecurring = (dayIndex: number) => {
    setSchedule(prevSchedule => {
      const newSchedule = [...prevSchedule];
      newSchedule[dayIndex] = {
        ...newSchedule[dayIndex],
        isRecurring: !newSchedule[dayIndex].isRecurring
      };
      return newSchedule;
    });
  };

  const handleToggleDayEnabled = (dayIndex: number) => {
    setSchedule(prevSchedule => {
      const newSchedule = [...prevSchedule];
      newSchedule[dayIndex] = {
        ...newSchedule[dayIndex],
        isEnabled: !newSchedule[dayIndex].isEnabled
      };
      return newSchedule;
    });
  };

  const handleSaveSchedule = () => {
    onSave(schedule);
  };

  const formatWeekDisplay = () => {
    return `Week of ${format(currentWeekStart, 'MMM d, yyyy')}`;
  };
  
  // Function to group time slots into AM and PM
  const getAMSlots = (slots: TimeSlot[]) => slots.filter(slot => slot.time.includes('AM'));
  const getPMSlots = (slots: TimeSlot[]) => slots.filter(slot => slot.time.includes('PM'));
  
  return (
    <div className="bg-slate-900 text-white rounded-lg p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="outline"
          onClick={handlePreviousWeek}
          className="border-gray-700 bg-transparent hover:bg-gray-800 text-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-medium">{formatWeekDisplay()}</h2>
        <Button
          variant="outline"
          onClick={handleNextWeek}
          className="border-gray-700 bg-transparent hover:bg-gray-800 text-white"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="mb-6 flex items-center">
        <div className="min-w-[170px]">Maximum Days Ahead</div>
        <div className="bg-gray-800 px-3 py-2 rounded-md min-w-[70px] text-center">
          {maxDaysAhead}
        </div>
        <p className="ml-4 text-sm text-gray-400">
          Determines how far in advance clients can book
        </p>
      </div>
      
      <div className="space-y-8">
        {schedule.map((day, dayIndex) => (
          <div key={dayIndex} className="border border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-lg">
                  {format(day.date, 'EEEE (MMM d)')}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Recurring</span>
                <Switch 
                  checked={day.isRecurring}
                  onCheckedChange={() => handleToggleRecurring(dayIndex)}
                  className="data-[state=checked]:bg-teal-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-6 gap-2 mb-4">
              {/* AM Hours */}
              {getAMSlots(day.slots).map((slot, slotIndex) => {
                const actualIndex = day.slots.findIndex(s => s.time === slot.time);
                return (
                  <Button
                    key={`${dayIndex}-am-${slotIndex}`}
                    variant={slot.isAvailable ? "default" : "outline"}
                    className={cn(
                      "text-sm rounded-md",
                      slot.isAvailable 
                        ? "bg-teal-500 hover:bg-teal-600 text-white"
                        : "bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700"
                    )}
                    onClick={() => handleTimeSlotClick(dayIndex, actualIndex)}
                  >
                    {slot.time}
                  </Button>
                );
              })}
            </div>
            
            <div className="grid grid-cols-6 gap-2">
              {/* PM Hours */}
              {getPMSlots(day.slots).map((slot, slotIndex) => {
                const actualIndex = day.slots.findIndex(s => s.time === slot.time);
                return (
                  <Button
                    key={`${dayIndex}-pm-${slotIndex}`}
                    variant={slot.isAvailable ? "default" : "outline"}
                    className={cn(
                      "text-sm rounded-md",
                      slot.isAvailable 
                        ? "bg-teal-500 hover:bg-teal-600 text-white"
                        : "bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700"
                    )}
                    onClick={() => handleTimeSlotClick(dayIndex, actualIndex)}
                  >
                    {slot.time}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 flex justify-end">
        <Button 
          onClick={handleSaveSchedule} 
          className="bg-teal-500 hover:bg-teal-600 text-white"
        >
          Save Availability
        </Button>
      </div>
    </div>
  );
};

export default WeeklySchedule;