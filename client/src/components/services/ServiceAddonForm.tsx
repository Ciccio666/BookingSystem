import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ServiceAddon } from '@/lib/types';
import ServicePhotoUpload from './ServicePhotoUpload';

// Validation schema
const serviceAddonFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  duration: z.coerce.number().min(0, 'Duration must be 0 or greater'),
  active: z.boolean().default(true),
  photo: z.string().nullable().optional(),
  displayOnBookingPage: z.boolean().default(true),
  addPriceToDeposit: z.boolean().default(false)
});

type ServiceAddonFormValues = z.infer<typeof serviceAddonFormSchema>;

interface ServiceAddonFormProps {
  initialData?: ServiceAddon;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

const ServiceAddonForm = ({ initialData, onSubmit, onCancel, isEdit = false }: ServiceAddonFormProps) => {
  const form = useForm<ServiceAddonFormValues>({
    resolver: zodResolver(serviceAddonFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price ? initialData.price / 100 : 0, // Convert cents to dollars for display
      duration: initialData?.duration || 0,
      active: initialData?.active ?? true,
      photo: initialData?.photo || null,
      displayOnBookingPage: initialData?.displayOnBookingPage ?? true,
      addPriceToDeposit: initialData?.addPriceToDeposit ?? false
    }
  });
  
  const handleSubmit = async (data: ServiceAddonFormValues) => {
    try {
      // Convert dollars to cents for storage
      const formattedData = {
        ...data,
        price: Math.round(data.price * 100)
      };
      
      await onSubmit(formattedData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter add-on name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the add-on service" 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex flex-col md:flex-row gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    placeholder="0.00" 
                    {...field}
                  />
                </FormControl>
                <FormDescription>Price in dollars</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Additional Duration (minutes)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="1" 
                    placeholder="0" 
                    {...field}
                  />
                </FormControl>
                <FormDescription>Additional time added to booking</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="photo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Photo</FormLabel>
              <FormControl>
                <ServicePhotoUpload
                  initialImageUrl={field.value || undefined}
                  onImageChange={(imageBase64) => field.onChange(imageBase64)}
                  required={false}
                />
              </FormControl>
              <FormDescription>Upload an image for this add-on (optional)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex flex-col md:flex-row gap-6">
          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 flex-1">
                <div className="space-y-0.5">
                  <FormLabel className="text-base mb-1">Active</FormLabel>
                  <FormDescription>
                    When active, this add-on will be available for selection
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <FormField
            control={form.control}
            name="displayOnBookingPage"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 flex-1">
                <div className="space-y-0.5">
                  <FormLabel className="text-base mb-1">Display on Booking Page</FormLabel>
                  <FormDescription>
                    Allow clients to select this add-on during booking
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="addPriceToDeposit"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 flex-1">
                <div className="space-y-0.5">
                  <FormLabel className="text-base mb-1">Add to Deposit</FormLabel>
                  <FormDescription>
                    Include the price of this add-on in the required deposit
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {isEdit ? 'Update Add-on' : 'Create Add-on'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ServiceAddonForm;