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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/lib/utils/booking";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

// Form validation schema
const bookingFormSchema = z.object({
  clientName: z.string().min(2, { message: "Name is required" }),
  clientPhone: z.string().min(5, { message: "Valid phone number is required" }),
  extras: z.string().optional(),
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
  
  // Define extras options
  const extrasOptions = [
    { value: "", label: "Select additional items" },
    { value: "extra_time", label: "Extra time (+15 min) - AU$50.00" },
    { value: "special_request", label: "Special request - AU$100.00" },
  ];

  // Initialize form
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      clientName: "",
      clientPhone: "",
      extras: "",
      agreeTerms: false,
    },
  });

  // Handle form submission
  const onSubmit = async (data: BookingFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Calculate total price (add extras if selected)
      let totalPrice = service.price;
      if (data.extras === "extra_time") totalPrice += 5000; // $50.00
      if (data.extras === "special_request") totalPrice += 10000; // $100.00
      
      // Prepare booking data
      const bookingData = {
        serviceId: service.id,
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        startTime: getBookingDateTime().toISOString(),
        extras: data.extras ? { type: data.extras } : null,
        totalPrice,
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <FormField
          control={form.control}
          name="clientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Name: <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} />
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
            <FormItem>
              <FormLabel>
                Phone: <span className="text-red-500">*</span>
              </FormLabel>
              <div className="flex">
                <div className="flex items-center px-3 bg-neutral-100 border border-neutral-300 border-r-0 rounded-l-md">
                  <span className="flex items-center">
                    <img
                      src="https://cdn.jsdelivr.net/npm/flag-icon-css@3.5.0/flags/4x3/au.svg"
                      alt="Australia Flag"
                      className="w-5 h-auto mr-1"
                    />
                    <span className="text-sm text-neutral-600">+61</span>
                  </span>
                </div>
                <Input
                  {...field}
                  className="rounded-l-none"
                  type="tel"
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Service Summary */}
        <div className="mt-6 mb-4">
          <h3 className="text-base font-medium text-neutral-800 mb-3">
            {service.name}
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-neutral-600">Date:</div>
            <div className="font-medium">
              {format(selectedDate, "dd.MM.yyyy")} {selectedTime}
            </div>

            <div className="text-neutral-600">Provider:</div>
            <div className="font-medium">Tori</div>
          </div>
        </div>

        {/* Service Add-ons */}
        <FormField
          control={form.control}
          name="extras"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Items:</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select additional items" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {extrasOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Total */}
        <div className="border-t border-neutral-200 pt-4 mb-6">
          <div className="flex justify-between">
            <span className="font-medium">Total for booking:</span>
            <span className="font-bold text-primary">
              {formattedPrice.formatted}
            </span>
          </div>
        </div>

        {/* Terms Checkbox */}
        <FormField
          control={form.control}
          name="agreeTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I agree with SimplyBook.me Terms & Conditions
                  <span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex space-x-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onBack}
          >
            Back
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-primary hover:bg-primary/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Confirm Booking"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ClientInfoForm;
