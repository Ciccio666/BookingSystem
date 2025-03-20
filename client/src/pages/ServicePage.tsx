import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Service, TimeSlot } from "@/lib/types";
import ServiceCard from "@/components/services/ServiceCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Check, ChevronRight } from "lucide-react";
import Calendar from "@/components/booking/Calendar";
import TimeSelector from "@/components/booking/TimeSelector";
import ClientInfoForm from "@/components/booking/ClientInfoForm";
import { generateTimeSlots, formatPrice } from "@/lib/utils/booking";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";

// Booking flow steps
enum BookingStep {
  SERVICE_SELECTION = 0,
  DATE_TIME_SELECTION = 1,
  SERVICE_EXTRAS = 2,
  CLIENT_INFO = 3,
  CONFIRMATION = 4
}

const ServicePage = () => {
  // State for booking flow
  const [currentStep, setCurrentStep] = useState<BookingStep>(BookingStep.SERVICE_SELECTION);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const { toast } = useToast();
  
  // Fetch only active services from API, sorted by position
  const { data: services, isLoading, error } = useQuery({
    queryKey: ['/api/services', { active: true }],
    queryFn: () => fetch('/api/services?active=true').then(res => res.json())
  });
  
  // Update time slots when selected date or service changes
  useEffect(() => {
    if (selectedService) {
      setTimeSlots(generateTimeSlots(selectedDate, selectedService.duration));
      setTotalPrice(selectedService.price);
    }
  }, [selectedDate, selectedService]);
  
  // Update total price when extras change
  useEffect(() => {
    if (selectedService) {
      let newTotal = selectedService.price;
      
      // Add extras costs (for demo purposes)
      if (selectedExtras.includes('naturalSex')) {
        newTotal += 10000; // $100
      }
      
      setTotalPrice(newTotal);
    }
  }, [selectedExtras, selectedService]);
  
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
    } else if (currentStep === BookingStep.SERVICE_EXTRAS) {
      setCurrentStep(BookingStep.DATE_TIME_SELECTION);
    } else if (currentStep === BookingStep.CLIENT_INFO) {
      setCurrentStep(BookingStep.SERVICE_EXTRAS);
    }
    // Scroll to top when changing steps
    window.scrollTo(0, 0);
  };
  
  // Handle extras selection
  const handleExtraToggle = (extraId: string) => {
    setSelectedExtras(prev => {
      if (prev.includes(extraId)) {
        return prev.filter(id => id !== extraId);
      } else {
        return [...prev, extraId];
      }
    });
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
      setCurrentStep(BookingStep.SERVICE_EXTRAS);
    } else if (currentStep === BookingStep.SERVICE_EXTRAS) {
      setCurrentStep(BookingStep.CLIENT_INFO);
    }
    // Scroll to top when changing steps
    window.scrollTo(0, 0);
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
  
  // Format the current date and time for display
  const getCurrentTimeDisplay = () => {
    const now = new Date();
    return format(now, "h:mm a 'Australia/Melbourne'");
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div>
        <div className="grid grid-cols-3 text-center bg-primary text-white font-medium overflow-hidden mb-6">
          <div className="p-4 bg-primary">Service</div>
          <div className="p-4 bg-white text-gray-700">Time</div>
          <div className="p-4 bg-white text-gray-700">Client</div>
        </div>
        
        <div className="text-right text-sm text-gray-600 mb-4">
          Our time: {getCurrentTimeDisplay()}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
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

  // Header for all steps
  const renderHeader = () => {
    return (
      <div className="grid grid-cols-3 text-center text-white font-medium overflow-hidden mb-6">
        <div className={`p-4 ${currentStep === BookingStep.SERVICE_SELECTION || currentStep === BookingStep.SERVICE_EXTRAS ? 'bg-primary' : 'bg-white text-gray-700'}`}>
          Service
          {selectedService && currentStep > BookingStep.SERVICE_SELECTION && (
            <div className="text-xs font-normal mt-1">{selectedService.name}</div>
          )}
        </div>
        <div className={`p-4 ${currentStep === BookingStep.DATE_TIME_SELECTION ? 'bg-primary' : 'bg-white text-gray-700'}`}>
          Time
        </div>
        <div className={`p-4 ${currentStep === BookingStep.CLIENT_INFO ? 'bg-primary' : 'bg-white text-gray-700'}`}>
          Client
        </div>
      </div>
    );
  };

  // Service Selection Step
  if (currentStep === BookingStep.SERVICE_SELECTION) {
    return (
      <div>
        {renderHeader()}
        
        <div className="text-right text-sm text-gray-600 mb-4">
          Our time: {getCurrentTimeDisplay()}
        </div>
        
        {services && services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((service: Service) => (
              <div key={service.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4">
                  <h3 className="font-bold text-lg text-neutral-800 mb-2">{service.name}</h3>
                  <p className="text-neutral-600 text-sm mb-4">{service.description}</p>
                  
                  <div className="flex justify-between text-sm mb-2">
                    <span>{service.duration} mins.</span>
                    <span className="font-bold text-primary">{formatPrice(service.price).formatted}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <a href="#" className="text-sm text-primary">Read more</a>
                    <Button 
                      className="bg-primary hover:bg-primary/90 text-white font-medium px-8"
                      onClick={() => handleServiceSelect(service)}
                    >
                      Select
                    </Button>
                  </div>
                </div>
              </div>
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
        {renderHeader()}
        
        <div className="text-right text-sm text-gray-600 mb-4">
          Our time: {getCurrentTimeDisplay()}
        </div>
        
        {/* Back navigation */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80"
            onClick={handleBack}
          >
            back
          </Button>
        </div>
        
        {/* Calendar in widescreen format */}
        <div className="mb-6">
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            serviceDuration={selectedService.duration}
          />
        </div>
        
        {/* Time slots */}
        <div className="mb-6">
          <h3 className="text-base font-medium text-neutral-700 mb-4">Available start times</h3>
          <TimeSelector
            timeSlots={timeSlots}
            selectedTime={selectedTime}
            onTimeSelect={handleTimeSelect}
          />
        </div>
        
        {/* Next Button */}
        <div className="flex justify-end">
          <Button
            className="bg-primary hover:bg-primary/90 text-white font-medium py-2.5 px-8 rounded-full"
            onClick={handleProceed}
            disabled={!selectedTime}
          >
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }
  
  // Service Extras Step
  if (currentStep === BookingStep.SERVICE_EXTRAS && selectedService) {
    return (
      <div>
        {renderHeader()}
        
        <div className="text-right text-sm text-gray-600 mb-4">
          Our time: {getCurrentTimeDisplay()}
        </div>
        
        {/* Back navigation */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80"
            onClick={handleBack}
          >
            back
          </Button>
        </div>
        
        <h2 className="text-xl font-bold text-neutral-800 mb-6">Do you want to enjoy some extras ...</h2>
        
        {/* Extras options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-4 border border-neutral-200 rounded-lg">
            <h3 className="font-medium mb-2">Natural Sex</h3>
            <p className="text-sm text-neutral-600 mb-4">Only if I'm comfortable you are 20000%</p>
            <div className="flex justify-between items-center">
              <span className="font-bold text-primary">AU$100.00</span>
              <Checkbox 
                checked={selectedExtras.includes('naturalSex')} 
                onCheckedChange={() => handleExtraToggle('naturalSex')}
              />
            </div>
            <div className="text-right mt-2">
              <a href="#" className="text-sm text-primary">Read more</a>
            </div>
          </div>
        </div>
        
        {/* Summary and Next Button */}
        <div className="flex justify-between items-center border-t border-neutral-200 pt-4">
          <div>
            <div className="text-sm">Total duration: <span className="font-medium">{selectedService.duration} mins.</span></div>
            <div className="text-sm">Subtotal: <span className="font-medium">{formatPrice(totalPrice).formatted}</span></div>
          </div>
          <Button
            className="bg-primary hover:bg-primary/90 text-white font-medium py-2.5 px-8 rounded-full"
            onClick={handleProceed}
          >
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }
  
  // Client Info Step
  if (currentStep === BookingStep.CLIENT_INFO && selectedService && selectedDate && selectedTime) {
    return (
      <div>
        {renderHeader()}
        
        <div className="text-right text-sm text-gray-600 mb-4">
          Our time: {getCurrentTimeDisplay()}
        </div>
        
        {/* Back navigation */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80"
            onClick={handleBack}
          >
            back
          </Button>
        </div>
        
        <div className="max-w-md mx-auto">
          <h2 className="text-lg font-bold text-neutral-800 mb-4">Please, confirm details</h2>
          
          <Card className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4">
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
      </div>
    );
  }
  
  // Confirmation Step
  if (currentStep === BookingStep.CONFIRMATION) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-800 mb-4">Booking Confirmed!</h1>
        <p className="text-neutral-600 mb-6">Your booking has been successfully confirmed. You will receive a confirmation message shortly.</p>
        <Button onClick={() => setCurrentStep(BookingStep.SERVICE_SELECTION)} className="bg-primary hover:bg-primary/90">
          Make Another Booking
        </Button>
      </div>
    );
  }
  
  return null; // Fallback
};

export default ServicePage;
