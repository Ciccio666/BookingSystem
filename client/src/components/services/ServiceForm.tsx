import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Service } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import ServicePhotoUpload from "./ServicePhotoUpload";
import BufferTimeSelector from "./BufferTimeSelector";

interface ServiceFormProps {
  initialData?: Service;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

// Form validation schema with added fields
const serviceFormSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  description: z.string().min(10, { message: "Description should be at least 10 characters" }),
  duration: z.coerce.number().min(1, { message: "Duration is required" }),
  price: z.coerce.number().min(1, { message: "Price is required" }),
  active: z.boolean().default(true),
  photo: z.string().nullable().refine(val => val !== null, {
    message: "Service photo is required",
  }),
  bufferBefore: z.string().default("0"),
  bufferAfter: z.string().default("0"),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

const ServiceForm = ({ initialData, onSubmit, onCancel, isEdit = false }: ServiceFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default values for the form
  const defaultValues: Partial<ServiceFormValues> = {
    name: initialData?.name || "",
    description: initialData?.description || "",
    duration: initialData?.duration || 60,
    price: initialData ? Math.floor(initialData.price / 100) : 0, // Convert cents to dollars for display
    active: initialData?.active ?? true,
    photo: initialData?.photo || null,
    bufferBefore: initialData?.bufferBefore || "0",
    bufferAfter: initialData?.bufferAfter || "0",
  };

  // Initialize form
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues,
  });

  // Handle form submission
  const handleSubmit = async (data: ServiceFormValues) => {
    setIsSubmitting(true);
    try {
      // Convert price to cents for API
      const formattedData = {
        ...data,
        price: Math.round(data.price * 100), // Convert to cents
      };
      
      await onSubmit(formattedData);
      
      toast({
        title: `Service ${isEdit ? "updated" : "created"} successfully`,
        description: `${data.name} has been ${isEdit ? "updated" : "added"} to your services.`,
      });
    } catch (error) {
      console.error("Service submission error:", error);
      toast({
        title: `Service ${isEdit ? "update" : "creation"} failed`,
        description: "There was an error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Service Photo */}
        <FormField
          control={form.control}
          name="photo"
          render={({ field }) => (
            <FormItem>
              <ServicePhotoUpload
                initialImageUrl={field.value || undefined}
                onImageChange={(imageBase64) => field.onChange(imageBase64)}
                required={true}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Service Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Service Name <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g. Deep Tissue Massage" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Service Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Description <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Textarea placeholder="Describe your service..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Duration */}
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Duration (minutes) <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Price */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Price (AU$) <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
                      AU$
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      className="pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Buffer Times */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Buffer Before */}
          <FormField
            control={form.control}
            name="bufferBefore"
            render={({ field }) => (
              <FormItem>
                <BufferTimeSelector 
                  value={field.value} 
                  onChange={field.onChange}
                  label="Buffer Time Before"
                  description="Add preparation time before appointments"
                />
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Buffer After */}
          <FormField
            control={form.control}
            name="bufferAfter"
            render={({ field }) => (
              <FormItem>
                <BufferTimeSelector 
                  value={field.value} 
                  onChange={field.onChange}
                  label="Buffer Time After"
                  description="Add recovery time after appointments"
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Active/Inactive Toggle */}
        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Active</FormLabel>
                <FormDescription>
                  Make this service available for booking
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex gap-4 justify-end">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? `${isEdit ? "Updating" : "Creating"}...` 
              : isEdit ? "Update Service" : "Create Service"
            }
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ServiceForm;