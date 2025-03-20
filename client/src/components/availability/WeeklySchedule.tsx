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

const DEFAULT_TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i; 
  const isPM = hour >= 12;
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const ampm = isPM ? 'PM' : 'AM';
  const time = `${displayHour}:00 ${ampm}`;
  const halfHourTime = `${displayHour}:30 ${ampm}`;
  
  return [
    { time, isAvailable: false },
    { time: halfHourTime, isAvailable: false }
  ];
}).flat();

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
        days.push({
          date: addDays(currentWeekStart, i),
          dayOfWeek: i,
          slots: [...DEFAULT_TIME_SLOTS],
          isRecurring: false,
          isEnabled: true
        });
      }
      setSchedule(days);
    }
  }, [initialSchedule, currentWeekStart]);

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
    const endOfWeek = addDays(currentWeekStart, 6);
    return `Week of ${format(currentWeekStart, 'MMM d, yyyy')}`;
  };
  
  return (
    <Card className="w-full dark:bg-slate-900">
      <CardHeader>
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={handlePreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle>{formatWeekDisplay()}</CardTitle>
          <Button variant="ghost" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>Set your weekly availability</CardDescription>
        
        <div className="mt-4 flex items-center gap-4">
          <Label htmlFor="maxDaysAhead">Maximum Days Ahead</Label>
          <Input
            id="maxDaysAhead"
            type="number"
            value={maxDaysAhead}
            onChange={(e) => setMaxDaysAhead(parseInt(e.target.value))}
            className="w-24"
            min="1"
          />
          <span className="text-sm text-muted-foreground">
            Determines how far in advance clients can book
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {schedule.map((day, dayIndex) => (
          <div key={dayIndex} className={`border rounded-lg p-4 ${!day.isEnabled ? 'opacity-60' : ''}`}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={day.isEnabled}
                  onCheckedChange={() => handleToggleDayEnabled(dayIndex)}
                />
                <h3 className="text-lg font-medium">
                  {format(day.date, 'EEEE (MMM d)')}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Recurring</span>
                <Switch 
                  checked={day.isRecurring}
                  onCheckedChange={() => handleToggleRecurring(dayIndex)}
                  disabled={!day.isEnabled}
                />
              </div>
            </div>
            
            {day.isEnabled && (
              <>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">AM Hours</h4>
                <div className="grid grid-cols-6 gap-2 mb-4">
                  {day.slots
                    .filter(slot => slot.time.includes('AM'))
                    .map((slot, slotIndex) => {
                      const actualIndex = day.slots.findIndex(s => s.time === slot.time);
                      return (
                        <Button
                          key={`${dayIndex}-${slotIndex}-${slot.time}`}
                          variant={slot.isAvailable ? "default" : "outline"}
                          className={`text-xs h-10 ${slot.isAvailable ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                          onClick={() => handleTimeSlotClick(dayIndex, actualIndex)}
                        >
                          {slot.time}
                        </Button>
                      );
                    })}
                </div>
                
                <h4 className="text-sm font-medium text-muted-foreground mb-2">PM Hours</h4>
                <div className="grid grid-cols-6 gap-2">
                  {day.slots
                    .filter(slot => slot.time.includes('PM'))
                    .map((slot, slotIndex) => {
                      const actualIndex = day.slots.findIndex(s => s.time === slot.time);
                      return (
                        <Button
                          key={`${dayIndex}-${slotIndex}-${slot.time}`}
                          variant={slot.isAvailable ? "default" : "outline"}
                          className={`text-xs h-10 ${slot.isAvailable ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                          onClick={() => handleTimeSlotClick(dayIndex, actualIndex)}
                        >
                          {slot.time}
                        </Button>
                      );
                    })}
                </div>
              </>
            )}
          </div>
        ))}
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button onClick={handleSaveSchedule} className="bg-primary text-primary-foreground">
          Save Availability
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WeeklySchedule;