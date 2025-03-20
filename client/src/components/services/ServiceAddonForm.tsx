import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ServiceAddon } from '@/lib/types';
import ServicePhotoUpload from './ServicePhotoUpload';

const serviceAddonFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  duration: z.coerce.number().min(0, 'Duration must be a positive number'),
  photo: z.string().optional().nullable(),
  active: z.boolean().default(true),
  displayOnBookingPage: z.boolean().default(true),
  addPriceToDeposit: z.boolean().default(false),
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
      price: initialData ? initialData.price / 100 : 0, // Convert from cents to dollars for display
      duration: initialData?.duration || 0,
      photo: initialData?.photo || null,
      active: initialData?.active ?? true,
      displayOnBookingPage: initialData?.displayOnBookingPage ?? true,
      addPriceToDeposit: initialData?.addPriceToDeposit ?? false,
    },
  });
  
  const handleSubmit = async (data: ServiceAddonFormValues) => {
    try {
      // Convert price back to cents for storage
      const formattedData = {
        ...data,
        price: Math.round(data.price * 100),
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
              <FormLabel>Name*</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Extended Massage" {...field} />
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
                  placeholder="Describe the add-on service..." 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (AU$)*</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    placeholder="0.00" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
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
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Active</FormLabel>
                  <div className="text-sm text-gray-500">
                    Make this add-on available for booking
                  </div>
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
          
          <FormField
            control={form.control}
            name="displayOnBookingPage"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Show on Booking Page</FormLabel>
                  <div className="text-sm text-gray-500">
                    Display this add-on on the client booking page
                  </div>
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
          
          <FormField
            control={form.control}
            name="addPriceToDeposit"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Add to Deposit</FormLabel>
                  <div className="text-sm text-gray-500">
                    Include this add-on's price in the required booking deposit
                  </div>
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
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {isEdit ? 'Update' : 'Create'} Add-on
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ServiceAddonForm;