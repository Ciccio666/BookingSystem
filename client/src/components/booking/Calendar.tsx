import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  getCalendarDays, 
  getPreviousMonth, 
  getNextMonth, 
  getMonthDisplay,
  isSelectedDate
} from "@/lib/utils/booking";

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

const Calendar = ({ selectedDate, onDateSelect }: CalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarDays = getCalendarDays(currentMonth);
  const monthDisplay = getMonthDisplay(currentMonth);
  
  const handlePrevMonth = () => {
    setCurrentMonth(getPreviousMonth(currentMonth));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(getNextMonth(currentMonth));
  };
  
  // Day names for the calendar header
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div>
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
            const isToday = 
              day.getDate() === new Date().getDate() && 
              day.getMonth() === new Date().getMonth() && 
              day.getFullYear() === new Date().getFullYear();
            const isSelected = selectedDate && isSelectedDate(day, selectedDate);
            
            return (
              <div 
                key={index}
                className={cn(
                  "calendar-day flex items-center justify-center text-sm cursor-pointer transition-colors",
                  isCurrentMonth ? "text-neutral-800" : "text-neutral-400",
                  isToday && !isSelected && "bg-primary/10 font-semibold",
                  isSelected && "bg-primary text-white font-semibold rounded-full"
                )}
                onClick={() => isCurrentMonth && onDateSelect(day)}
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
