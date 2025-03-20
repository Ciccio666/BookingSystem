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
import { format } from "date-fns";

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
    // For demo purposes, mark the next 30 days as available, including weekends
    const days: Date[] = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 30; i++) {
      const nextDay = new Date(currentDate);
      nextDay.setDate(currentDate.getDate() + i);
      days.push(nextDay);
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
  
  // Split the days into weeks for proper widescreen display
  const getDaysInWeeks = () => {
    const weeks: Date[][] = [];
    let week: Date[] = [];
    
    calendarDays.forEach((day, index) => {
      week.push(day);
      
      if ((index + 1) % 7 === 0 || index === calendarDays.length - 1) {
        weeks.push(week);
        week = [];
      }
    });
    
    return weeks;
  };

  // Get weeks layout for display
  const daysInWeeks = getDaysInWeeks();
  
  // Day names for the calendar header
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="w-full">
      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary/80 p-1"
          onClick={handlePrevMonth}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Prev Month
        </Button>
        
        <h3 className="text-lg font-medium text-center">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary/80 p-1"
          onClick={handleNextMonth}
        >
          Next Month <ChevronRight className="h-4 w-4 ml-1" /> 
        </Button>
      </div>
      
      {/* Widescreen Calendar Layout */}
      <div className="w-full overflow-auto">
        <div className="min-width-calendar grid grid-flow-row gap-2">
          {/* Render each week row separately */}
          {daysInWeeks.map((week, weekIndex) => (
            <div key={`week-${weekIndex}`} className="flex overflow-visible">
              {/* Render each day in the week */}
              {week.map((day, dayIndex) => {
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                const isToday = isSameDay(day, today);
                const isSelected = selectedDate && isSelectedDate(day, selectedDate);
                const isAvailable = isCurrentMonth && isAvailableDate(day);
                const dayOfWeek = day.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                
                return (
                  <div 
                    key={`day-${weekIndex}-${dayIndex}`} 
                    className="flex-1 flex flex-col items-center text-center mx-1"
                  >
                    <div className={cn(
                      "text-xs font-medium mb-1",
                      isWeekend ? "text-red-500" : "text-neutral-700"
                    )}>
                      {dayNames[dayOfWeek]}
                    </div>
                    <div 
                      className={cn(
                        "calendar-day flex items-center justify-center h-10 w-10 text-sm cursor-pointer transition-colors rounded-full shadow-sm",
                        !isCurrentMonth && "text-neutral-300 pointer-events-none",
                        isCurrentMonth && !isSelected && !isAvailable && "text-neutral-400 pointer-events-none",
                        isCurrentMonth && isAvailable && !isSelected && "hover:bg-primary/10",
                        isSelected && "bg-primary text-white font-semibold",
                        isToday && !isSelected && "font-bold",
                      )}
                      onClick={() => isCurrentMonth && isAvailable && onDateSelect(day)}
                    >
                      {day.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
