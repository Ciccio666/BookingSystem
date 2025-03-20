import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Service, TimeSlot } from "@/lib/types";
import ServiceCard from "@/components/services/ServiceCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowUp, ArrowDown, Check } from "lucide-react";
import Calendar from "@/components/booking/Calendar";
import TimeSelector from "@/components/booking/TimeSelector";
import ClientInfoForm from "@/components/booking/ClientInfoForm";
import { generateTimeSlots } from "@/lib/utils/booking";
import { useToast } from "@/hooks/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// Booking flow steps
enum BookingStep {
  SERVICE_SELECTION = 0,
  DATE_TIME_SELECTION = 1,
  CLIENT_INFO = 2,
  CONFIRMATION = 3
}

// Sorting options for services
enum SortOption {
  DEFAULT = "default",
  PRICE_LOW = "price-low",
  PRICE_HIGH = "price-high",
  DURATION_LOW = "duration-low",
  DURATION_HIGH = "duration-high",
  NAME_ASC = "name-asc",
  NAME_DESC = "name-desc"
}

const ServicePage = () => {
  // State for booking flow
  const [currentStep, setCurrentStep] = useState<BookingStep>(BookingStep.SERVICE_SELECTION);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.DEFAULT);
  const { toast } = useToast();
  
  // Fetch services from API
  const { data: services, isLoading, error } = useQuery({
    queryKey: ['/api/services'],
  });
  
  // Update time slots when selected date or service changes
  useEffect(() => {
    if (selectedService) {
      setTimeSlots(generateTimeSlots(selectedDate, selectedService.duration));
    }
  }, [selectedDate, selectedService]);
  
  // Handle service selection
  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setCurrentStep(BookingStep.DATE_TIME_SELECTION);
    // Scroll to top when changing steps
    window.scrollTo(0, 0);
  };
  
  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };
  
  // Handle time selection
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };
  
  // Handle back navigation
  const handleBack = () => {
    if (currentStep === BookingStep.DATE_TIME_SELECTION) {
      setCurrentStep(BookingStep.SERVICE_SELECTION);
    } else if (currentStep === BookingStep.CLIENT_INFO) {
      setCurrentStep(BookingStep.DATE_TIME_SELECTION);
    }
    // Scroll to top when changing steps
    window.scrollTo(0, 0);
  };
  
  // Proceed to next step
  const handleProceed = () => {
    if (currentStep === BookingStep.DATE_TIME_SELECTION) {
      if (!selectedTime) {
        toast({
          title: "Time Required",
          description: "Please select a time slot.",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep(BookingStep.CLIENT_INFO);
      // Scroll to top when changing steps
      window.scrollTo(0, 0);
    }
  };
  
  // Handle booking completion
  const handleBookingComplete = (bookingId: number) => {
    setCurrentStep(BookingStep.CONFIRMATION);
    toast({
      title: "Booking Confirmed!",
      description: `Your booking #${bookingId} has been confirmed.`,
      variant: "default",
    });
  };

  // Sort services based on selected option
  const getSortedServices = () => {
    if (!services) return [];
    
    const servicesCopy = [...services];
    
    switch (sortOption) {
      case SortOption.PRICE_LOW:
        return servicesCopy.sort((a, b) => a.price - b.price);
      case SortOption.PRICE_HIGH:
        return servicesCopy.sort((a, b) => b.price - a.price);
      case SortOption.DURATION_LOW:
        return servicesCopy.sort((a, b) => a.duration - b.duration);
      case SortOption.DURATION_HIGH:
        return servicesCopy.sort((a, b) => b.duration - a.duration);
      case SortOption.NAME_ASC:
        return servicesCopy.sort((a, b) => a.name.localeCompare(b.name));
      case SortOption.NAME_DESC:
        return servicesCopy.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return servicesCopy;
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-neutral-800 mb-6">Select a Service</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow overflow-hidden border border-neutral-200">
              <div className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="flex justify-between items-center mb-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-neutral-800 mb-4">Oops! Something went wrong</h1>
        <p className="text-neutral-600 mb-6">We couldn't load the services. Please try again later.</p>
      </div>
    );
  }

  // Service Selection Step
  if (currentStep === BookingStep.SERVICE_SELECTION) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-neutral-800 mb-6">Select a Service</h1>
        
        {/* Sorting controls */}
        <div className="flex justify-end mb-4">
          <Select
            value={sortOption}
            onValueChange={(value) => setSortOption(value as SortOption)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SortOption.DEFAULT}>Default Order</SelectItem>
              <SelectItem value={SortOption.PRICE_LOW}>Price: Low to High</SelectItem>
              <SelectItem value={SortOption.PRICE_HIGH}>Price: High to Low</SelectItem>
              <SelectItem value={SortOption.DURATION_LOW}>Duration: Shortest</SelectItem>
              <SelectItem value={SortOption.DURATION_HIGH}>Duration: Longest</SelectItem>
              <SelectItem value={SortOption.NAME_ASC}>Name: A to Z</SelectItem>
              <SelectItem value={SortOption.NAME_DESC}>Name: Z to A</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {services && services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getSortedServices().map((service: Service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onSelect={handleServiceSelect}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-neutral-600">No services available at the moment.</p>
          </div>
        )}
      </div>
    );
  }
  
  // Date & Time Selection Step
  if (currentStep === BookingStep.DATE_TIME_SELECTION && selectedService) {
    return (
      <div>
        {/* Back navigation and page title */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="text-neutral-600 hover:text-neutral-800 mr-4"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold text-neutral-800">Select Date & Time</h1>
        </div>
        
        {/* Selected service summary */}
        <div className="bg-neutral-100 p-4 rounded-lg mb-6">
          <h3 className="font-bold text-lg text-neutral-800">{selectedService.name}</h3>
          <p className="text-neutral-600 text-sm">{selectedService.description}</p>
        </div>
        
        <Card className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          {/* Calendar Header */}
          <div className="bg-primary text-white p-4">
            <h2 className="text-xl font-medium">Choose a Date & Time</h2>
          </div>
          
          {/* Calendar Component */}
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
          
          {/* Time Slots Component */}
          <TimeSelector
            timeSlots={timeSlots}
            selectedTime={selectedTime}
            onTimeSelect={handleTimeSelect}
          />
          
          {/* Next Button */}
          <div className="p-4 border-t border-neutral-200 bg-neutral-50">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 px-4 rounded transition-colors"
              onClick={handleProceed}
              disabled={!selectedTime}
            >
              Next
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  // Client Info Step
  if (currentStep === BookingStep.CLIENT_INFO && selectedService && selectedDate && selectedTime) {
    return (
      <div>
        {/* Back navigation and page title */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="text-neutral-600 hover:text-neutral-800 mr-4"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold text-neutral-800">Confirm Your Details</h1>
        </div>
        
        {/* Selected service and time summary */}
        <div className="bg-neutral-100 p-4 rounded-lg mb-6">
          <h3 className="font-bold text-lg text-neutral-800">{selectedService.name}</h3>
          <p className="text-neutral-600 text-sm mb-2">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} 
            {' at '} 
            {selectedTime}
          </p>
        </div>
        
        <Card className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <ClientInfoForm
              service={selectedService}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onBack={handleBack}
              onComplete={handleBookingComplete}
            />
          </div>
        </Card>
      </div>
    );
  }
  
  // Confirmation Step
  if (currentStep === BookingStep.CONFIRMATION) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-800 mb-4">Booking Confirmed!</h1>
        <p className="text-neutral-600 mb-6">Your booking has been successfully confirmed. You will receive a confirmation message shortly.</p>
        <Button onClick={() => setCurrentStep(BookingStep.SERVICE_SELECTION)}>
          Make Another Booking
        </Button>
      </div>
    );
  }
  
  return null; // Fallback
};

export default ServicePage;
