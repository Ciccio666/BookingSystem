import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import type { TimeSlot, FormattedPrice } from '../types';

/**
 * Format price from cents to currency string
 */
export function formatPrice(price: number): FormattedPrice {
  return {
    value: price,
    formatted: `AU$${(price / 100).toFixed(2)}`
  };
}

/**
 * Generate calendar days for a given month
 */
export function getCalendarDays(currentDate: Date = new Date()) {
  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  
  // Get all days in the month
  const calendarDays = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth
  });
  
  // Add days from previous month to start on Sunday (0)
  const startDay = firstDayOfMonth.getDay();
  const previousMonthDays = [];
  
  if (startDay > 0) {
    const previousMonth = new Date(currentDate);
    previousMonth.setDate(0); // Last day of previous month
    
    for (let i = startDay - 1; i >= 0; i--) {
      const day = new Date(previousMonth);
      day.setDate(previousMonth.getDate() - i);
      previousMonthDays.push(day);
    }
  }
  
  // Add days from next month to end on Saturday (6)
  const endDay = lastDayOfMonth.getDay();
  const nextMonthDays = [];
  
  if (endDay < 6) {
    const daysToAdd = 6 - endDay;
    const nextMonth = new Date(lastDayOfMonth);
    
    for (let i = 1; i <= daysToAdd; i++) {
      const day = new Date(nextMonth);
      day.setDate(nextMonth.getDate() + i);
      nextMonthDays.push(day);
    }
  }
  
  return [...previousMonthDays, ...calendarDays, ...nextMonthDays];
}

/**
 * Navigate to previous month
 */
export function getPreviousMonth(currentDate: Date): Date {
  return new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
}

/**
 * Navigate to next month
 */
export function getNextMonth(currentDate: Date): Date {
  return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
}

/**
 * Check if date is the selected date
 */
export function isSelectedDate(date: Date, selectedDate: Date | null): boolean {
  if (!selectedDate) return false;
  return isSameDay(date, selectedDate);
}

/**
 * Get month name and year for display
 */
export function getMonthDisplay(date: Date): string {
  return format(date, 'MMMM yyyy');
}

/**
 * Generate time slots for a service based on provider availability
 * This is a simple implementation that generates slots every 15 minutes
 * In a real application, this would check against provider availability and existing bookings
 */
export function generateTimeSlots(date: Date, serviceDuration: number): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const now = new Date();
  const isCurrentDay = isSameDay(date, now);
  
  // Generate slots from 9 AM to 9 PM in 15 minute increments
  for (let hour = 9; hour < 21; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const slotTime = new Date(date);
      slotTime.setHours(hour, minute, 0, 0);
      
      // If it's today, don't show past time slots
      if (isCurrentDay && slotTime < now) {
        continue;
      }
      
      const formattedTime = format(slotTime, 'h:mm a');
      
      // Mock logic for available slots - in a real app this would check against actual availability
      const available = Math.random() > 0.3; // 70% chance of availability
      
      slots.push({
        time: formattedTime,
        available
      });
    }
  }
  
  return slots;
}

/**
 * Get day of month with ordinal suffix (1st, 2nd, 3rd, etc)
 */
export function getDayWithOrdinal(date: Date): string {
  const day = date.getDate();
  const suffix = getDayOrdinalSuffix(day);
  return `${day}${suffix}`;
}

/**
 * Get ordinal suffix for a number (st, nd, rd, th)
 */
function getDayOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}
