import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Service } from "@/lib/types";
import { formatPrice } from "@/lib/utils/booking";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

// Form validation schema
const bookingFormSchema = z.object({
  clientName: z.string().min(2, { message: "Name is required" }),
  clientPhone: z.string().min(5, { message: "Valid phone number is required" }),
  agreeTerms: z.boolean().refine((val) => val, {
    message: "You must agree to the terms and conditions",
  }),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface ClientInfoFormProps {
  service: Service;
  selectedDate: Date;
  selectedTime: string;
  onBack: () => void;
  onComplete: (bookingId: number) => void;
}

const ClientInfoForm = ({
  service,
  selectedDate,
  selectedTime,
  onBack,
  onComplete,
}: ClientInfoFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const formattedPrice = formatPrice(service.price);
  
  // Convert selectedDate and selectedTime to a Date object for the booking
  const getBookingDateTime = () => {
    const [hours, minutes] = selectedTime.split(':');
    const isPM = selectedTime.toLowerCase().includes('pm');
    
    let hour = parseInt(hours);
    if (isPM && hour !== 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;
    
    const date = new Date(selectedDate);
    date.setHours(hour, parseInt(minutes), 0, 0);
    
    return date;
  };

  // Initialize form
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      clientName: "Frank",
      clientPhone: "0435 151 1",
      agreeTerms: false,
    },
  });

  // Handle form submission
  const onSubmit = async (data: BookingFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Prepare booking data
      const bookingData = {
        serviceId: service.id,
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        startTime: getBookingDateTime().toISOString(),
        extras: null,
        totalPrice: service.price,
      };
      
      // Submit booking to API
      const response = await apiRequest("POST", "/api/bookings", bookingData);
      const booking = await response.json();
      
      toast({
        title: "Booking Confirmed!",
        description: "Your booking has been successfully created.",
      });
      
      onComplete(booking.id);
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Booking Failed",
        description: "There was an error creating your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDateTime = format(getBookingDateTime(), "dd.MM.yyyy h:mm a");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="mb-2">
          <h3 className="text-base font-medium text-neutral-800 mb-2">
            Please, confirm details
          </h3>
        </div>

        {/* Name Field */}
        <FormField
          control={form.control}
          name="clientName"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel className="text-sm font-normal text-neutral-600">
                Name: <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} className="py-1" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone Field */}
        <FormField
          control={form.control}
          name="clientPhone"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel className="text-sm font-normal text-neutral-600">
                Phone: <span className="text-red-500">*</span>
              </FormLabel>
              <div className="flex">
                <div className="flex items-center px-2 py-1 bg-neutral-100 border border-neutral-300 border-r-0 rounded-l-md">
                  <span className="flex items-center text-xs">
                    <span className="text-neutral-600">+61</span>
                  </span>
                </div>
                <Input
                  {...field}
                  className="rounded-l-none py-1"
                  type="tel"
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Service Summary */}
        <div className="border-t border-neutral-200 pt-4 mb-4">
          <div className="mb-4">
            <h4 className="text-base font-medium">{service.name}</h4>
            <div className="text-sm mt-2">
              <div className="flex justify-between mb-1">
                <span>Date:</span>
                <span className="font-medium">{formattedDateTime}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Provider:</span>
                <span className="font-medium">Tori</span>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="text-base font-medium text-primary mb-1">Items:</h4>
            <div className="flex justify-between text-sm mb-2">
              <span>{service.name}</span>
              <span className="font-medium text-primary">{formattedPrice.formatted}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span>Natural Sex</span>
              <span className="font-medium text-primary">AU$100.00</span>
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-neutral-200 pt-3 mb-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total for booking:</span>
              <span className="font-bold text-xl text-primary">
                AU$350.00
              </span>
            </div>
          </div>
        </div>

        {/* Terms Checkbox */}
        <FormField
          control={form.control}
          name="agreeTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-xs text-primary font-medium">
                  I agree with SimplyBook.me Terms & Conditions
                  <span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="pt-4 flex justify-center">
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-white font-medium px-6 py-2 rounded-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Confirm booking"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ClientInfoForm;
