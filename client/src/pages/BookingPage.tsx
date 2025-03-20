import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Calendar from "@/components/booking/Calendar";
import TimeSelector from "@/components/booking/TimeSelector";
import ClientInfoForm from "@/components/booking/ClientInfoForm";
import { Service, TimeSlot } from "@/lib/types";
import { generateTimeSlots } from "@/lib/utils/booking";
import { useToast } from "@/hooks/use-toast";

// Booking flow steps
enum BookingStep {
  SERVICE_SELECTION = 0,
  DATE_TIME_SELECTION = 1,
  CLIENT_INFO = 2,
  CONFIRMATION = 3
}

const BookingPage = () => {
  const [location, navigate] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  
  // Extract service ID from URL query parameters or params
  const searchParams = new URLSearchParams(location.split("?")[1]);
  const serviceIdFromQuery = searchParams.get("serviceId");
  const serviceId = serviceIdFromQuery || params.id;
  
  // State for booking flow
  const [currentStep, setCurrentStep] = useState<BookingStep>(BookingStep.DATE_TIME_SELECTION);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  
  // Fetch service details
  const { data: service, isLoading, error } = useQuery({
    queryKey: ['/api/services', serviceId],
    enabled: !!serviceId
  });
  
  // Update time slots when selected date changes
  useEffect(() => {
    if (service) {
      setTimeSlots(generateTimeSlots(selectedDate, service.duration));
    }
  }, [selectedDate, service]);
  
  // Navigate back to services if no service ID is provided
  useEffect(() => {
    if (!serviceId && !isLoading) {
      navigate("/services");
      toast({
        title: "No Service Selected",
        description: "Please select a service first.",
      });
    }
  }, [serviceId, isLoading, navigate, toast]);
  
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
      navigate("/services");
    } else if (currentStep === BookingStep.CLIENT_INFO) {
      setCurrentStep(BookingStep.DATE_TIME_SELECTION);
    }
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
    }
  };
  
  // Handle booking completion
  const handleBookingComplete = (bookingId: number) => {
    navigate(`/bookings/${bookingId}`);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Error state
  if (error || !service) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-neutral-800 mb-4">Oops! Something went wrong</h1>
        <p className="text-neutral-600 mb-6">We couldn't load the service details. Please try again later.</p>
        <Button onClick={() => navigate("/services")}>Back to Services</Button>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-neutral-800">
          {currentStep === BookingStep.DATE_TIME_SELECTION ? "Select Date & Time" : "Please, confirm details"}
        </h1>
      </div>
      
      {/* Date & Time Selection View */}
      {currentStep === BookingStep.DATE_TIME_SELECTION && (
        <Card className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Calendar Header */}
          <div className="bg-primary text-white p-4">
            <h2 className="text-xl font-medium">Time</h2>
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
      )}
      
      {/* Client Information Form View */}
      {currentStep === BookingStep.CLIENT_INFO && service && selectedDate && selectedTime && (
        <Card className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <ClientInfoForm
              service={service}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onBack={handleBack}
              onComplete={handleBookingComplete}
            />
          </div>
        </Card>
      )}
    </div>
  );
};

export default BookingPage;
