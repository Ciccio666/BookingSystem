import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  getCalendarDays, 
  getPreviousMonth, 
  getNextMonth, 
  getMonthDisplay,
  isSelectedDate,
  generateTimeSlots
} from "@/lib/utils/booking";

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  serviceDuration?: number;
}

const Calendar = ({ selectedDate, onDateSelect, serviceDuration = 60 }: CalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarDays = getCalendarDays(currentMonth);
  const monthDisplay = getMonthDisplay(currentMonth);
  const today = new Date();
  
  // Create array of available days (for demo purposes, we'll show next 14 days as available)
  const [availableDays, setAvailableDays] = useState<Date[]>([]);
  
  useEffect(() => {
    // For demo purposes, mark the next 14 days as available, but skip weekends
    const days: Date[] = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 30; i++) {
      const nextDay = new Date(currentDate);
      nextDay.setDate(currentDate.getDate() + i);
      
      // Skip weekends for this example (0 = Sunday, 6 = Saturday)
      // In a real app, this would come from your availability data
      const dayOfWeek = nextDay.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        days.push(nextDay);
      }
    }
    
    setAvailableDays(days);
  }, []);
  
  const handlePrevMonth = () => {
    setCurrentMonth(getPreviousMonth(currentMonth));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(getNextMonth(currentMonth));
  };
  
  // Check if a date is available
  const isAvailableDate = (date: Date): boolean => {
    // Don't allow dates in the past
    if (date < today && !isSameDay(date, today)) {
      return false;
    }
    
    // Check if the date is in our available days array
    return availableDays.some(availableDate => isSameDay(availableDate, date));
  };
  
  // Helper to check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };
  
  // Day names for the calendar header
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="max-w-[400px] mx-auto">
      {/* Calendar Navigation */}
      <div className="flex justify-between items-center p-4 border-b border-neutral-200">
        <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
          <ChevronLeft className="h-5 w-5 text-neutral-600" />
        </Button>
        <h3 className="text-lg font-medium text-neutral-700">{monthDisplay}</h3>
        <Button variant="ghost" size="icon" onClick={handleNextMonth}>
          <ChevronRight className="h-5 w-5 text-neutral-600" />
        </Button>
      </div>
      
      {/* Calendar Grid */}
      <div className="p-4">
        {/* Days of week */}
        <div className="grid grid-cols-7 mb-2">
          {dayNames.map((day, index) => (
            <div 
              key={day} 
              className={cn(
                "text-center text-sm font-medium",
                index === 0 || index === 6 ? "text-red-500" : "text-neutral-700"
              )}
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const isToday = isSameDay(day, today);
            const isSelected = selectedDate && isSelectedDate(day, selectedDate);
            const isAvailable = isCurrentMonth && isAvailableDate(day);
            
            return (
              <div 
                key={index}
                className={cn(
                  "calendar-day flex items-center justify-center h-10 w-10 mx-auto text-sm cursor-pointer transition-colors rounded-lg shadow-sm",
                  isCurrentMonth ? "text-neutral-800" : "text-neutral-400",
                  isToday && !isSelected && "bg-primary/10 font-semibold",
                  isAvailable && !isSelected && "bg-primary/5",
                  !isAvailable && "pointer-events-none opacity-50",
                  isSelected && "bg-primary text-white font-semibold"
                )}
                onClick={() => isCurrentMonth && isAvailable && onDateSelect(day)}
              >
                {day.getDate()}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
