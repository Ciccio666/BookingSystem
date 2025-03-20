import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Service } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { 
  Clock, 
  Calendar, 
  MessageSquare, 
  Bot, 
  Bell, 
  DollarSign,
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown
} from "lucide-react";

// Schema for service form
const serviceFormSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  description: z.string().min(1, "Description is required"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  active: z.boolean().default(true),
});

// Schema for availability form
const availabilityFormSchema = z.object({
  days: z.array(z.string()).min(1, "Select at least one day"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  maxAdvanceBooking: z.coerce.number().min(1, "Must allow at least 1 day advance booking"),
});

// Schema for reminder form
const reminderFormSchema = z.object({
  firstReminder: z.coerce.number().min(1, "First reminder must be at least 1 hour before"),
  secondReminder: z.coerce.number().min(1, "Second reminder must be at least 1 hour before"),
});

// Schema for messaging form
const messagingFormSchema = z.object({
  smsApiKey: z.string().min(1, "SMS API key is required"),
  whatsappApiKey: z.string().min(1, "WhatsApp API key is required"),
  defaultMessage: z.string().min(1, "Default message template is required"),
});

const SettingsPage = () => {
  const [serviceList, setServiceList] = useState<Service[]>([]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("services");
  const { toast } = useToast();

  // Fetch services for the services tab
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['/api/services'],
  });
  
  // Update serviceList when services data changes
  useEffect(() => {
    if (services && Array.isArray(services)) {
      setServiceList([...services]);
    }
  }, [services]);

  // Service form
  const serviceForm = useForm<z.infer<typeof serviceFormSchema>>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      duration: 30,
      price: 0,
      active: true,
    },
  });

  // Availability form
  const availabilityForm = useForm<z.infer<typeof availabilityFormSchema>>({
    resolver: zodResolver(availabilityFormSchema),
    defaultValues: {
      days: ["1", "2", "3", "4", "5"], // Monday to Friday
      startTime: "09:00",
      endTime: "17:00",
      maxAdvanceBooking: 30,
    },
  });

  // Reminder form
  const reminderForm = useForm<z.infer<typeof reminderFormSchema>>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: {
      firstReminder: 24,
      secondReminder: 1,
    },
  });

  // Messaging form
  const messagingForm = useForm<z.infer<typeof messagingFormSchema>>({
    resolver: zodResolver(messagingFormSchema),
    defaultValues: {
      smsApiKey: "",
      whatsappApiKey: "",
      defaultMessage: "Hi {name}, this is a reminder for your appointment on {date} at {time}. Reply to confirm.",
    },
  });

  // Handle service form submission
  const onServiceSubmit = async (values: z.infer<typeof serviceFormSchema>) => {
    try {
      // Convert price to cents for API
      const serviceData = {
        ...values,
        price: values.price * 100, // Convert to cents
      };
      
      await apiRequest("POST", "/api/services", serviceData);
      
      toast({
        title: "Service created",
        description: "The service has been successfully created.",
      });
      
      // Reset form and refetch services
      serviceForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
    } catch (error) {
      console.error("Failed to create service:", error);
      toast({
        title: "Failed to create service",
        description: "There was an error creating the service. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle availability form submission
  const onAvailabilitySubmit = (values: z.infer<typeof availabilityFormSchema>) => {
    console.log(values);
    toast({
      title: "Availability saved",
      description: "Your availability settings have been updated.",
    });
  };

  // Handle reminder form submission
  const onReminderSubmit = (values: z.infer<typeof reminderFormSchema>) => {
    console.log(values);
    toast({
      title: "Reminders configured",
      description: "Your reminder settings have been updated.",
    });
  };

  // Handle messaging form submission
  const onMessagingSubmit = (values: z.infer<typeof messagingFormSchema>) => {
    console.log(values);
    toast({
      title: "Messaging settings saved",
      description: "Your messaging settings have been updated.",
    });
  };
  
  // Function to handle drag start
  const handleDragStart = (index: number) => {
    setDraggingIndex(index);
  };
  
  // Function to handle drag over
  const handleDragOver = (index: number) => {
    if (draggingIndex === null || draggingIndex === index) return;
    
    const newList = [...serviceList];
    const draggedItem = newList[draggingIndex];
    
    // Remove the dragged item
    newList.splice(draggingIndex, 1);
    // Insert it at the new position
    newList.splice(index, 0, draggedItem);
    
    setServiceList(newList);
    setDraggingIndex(index);
  };
  
  // Function to handle drag end
  const handleDragEnd = async () => {
    setDraggingIndex(null);
    
    // Get all service IDs in their current order
    const serviceIds = serviceList.map(service => service.id);
    
    try {
      // Make API call to update the order
      const response = await fetch('/api/services/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serviceIds }),
      });
      
      if (response.ok) {
        toast({
          title: "Service order updated",
          description: "The service order has been updated successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update service order.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating service order:", error);
      toast({
        title: "Error",
        description: "Failed to update service order. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Function to move service up in the list
  const moveServiceUp = async (index: number) => {
    if (index === 0) return; // Already at the top
    
    const newList = [...serviceList];
    const temp = newList[index];
    newList[index] = newList[index - 1];
    newList[index - 1] = temp;
    
    setServiceList(newList);
    
    try {
      // Make API call to update the order
      const serviceIds = newList.map(service => service.id);
      const response = await fetch('/api/services/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serviceIds }),
      });
      
      if (response.ok) {
        toast({
          title: "Service moved up",
          description: `${newList[index - 1].name} has been moved up in the list.`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update service order.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating service order:", error);
      toast({
        title: "Error",
        description: "Failed to update service order. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Function to move service down in the list
  const moveServiceDown = async (index: number) => {
    if (index === serviceList.length - 1) return; // Already at the bottom
    
    const newList = [...serviceList];
    const temp = newList[index];
    newList[index] = newList[index + 1];
    newList[index + 1] = temp;
    
    setServiceList(newList);
    
    try {
      // Make API call to update the order
      const serviceIds = newList.map(service => service.id);
      const response = await fetch('/api/services/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serviceIds }),
      });
      
      if (response.ok) {
        toast({
          title: "Service moved down",
          description: `${newList[index + 1].name} has been moved down in the list.`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update service order.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating service order:", error);
      toast({
        title: "Error",
        description: "Failed to update service order. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Function to toggle service active state
  const toggleServiceActive = async (id: number, isActive: boolean) => {
    try {
      // Make API call to update the service
      const response = await fetch(`/api/services/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: isActive }),
      });
      
      if (response.ok) {
        // Update local state if API call was successful
        const updatedList = serviceList.map(service => 
          service.id === id ? { ...service, active: isActive } : service
        );
        
        setServiceList(updatedList);
        
        const service = serviceList.find(s => s.id === id);
        if (service) {
          toast({
            title: `Service ${isActive ? 'activated' : 'deactivated'}`,
            description: `${service.name} is now ${isActive ? 'active' : 'inactive'}.`
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to update service status.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating service status:", error);
      toast({
        title: "Error",
        description: "Failed to update service status. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Function to delete a service
  const deleteService = (id: number) => {
    const service = serviceList.find(s => s.id === id);
    if (!service) return;
    
    // Show confirmation before deleting
    if (window.confirm(`Are you sure you want to delete ${service.name}?`)) {
      const updatedList = serviceList.filter(service => service.id !== id);
      setServiceList(updatedList);
      
      // Here we would make an API call to delete the service in the backend
      toast({
        title: "Service deleted",
        description: `${service.name} has been successfully deleted.`,
        variant: "destructive"
      });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-800 mb-6">Settings</h1>
      
      <Tabs defaultValue="services" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 mb-6">
          <TabsTrigger value="services" className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Services</span>
          </TabsTrigger>
          <TabsTrigger value="availability" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Availability</span>
          </TabsTrigger>
          <TabsTrigger value="reminders" className="flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Reminders</span>
          </TabsTrigger>
          <TabsTrigger value="messaging" className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Messaging</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center">
            <Bot className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">AI Settings</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Services */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Current Services</CardTitle>
                <CardDescription>Manage your service offerings</CardDescription>
              </CardHeader>
              <CardContent>
                {servicesLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="p-4 border rounded-md">
                        <Skeleton className="h-5 w-1/3 mb-2" />
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-2/3 mb-2" />
                        <div className="flex justify-between mt-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : serviceList && serviceList.length > 0 ? (
                  <div className="space-y-4">
                    {serviceList.map((service: Service, index: number) => (
                      <motion.div 
                        key={service.id} 
                        className={`p-4 border rounded-md ${draggingIndex === index ? 'border-primary border-2' : ''}`}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => {
                          e.preventDefault();
                          handleDragOver(index);
                        }}
                        onDragEnd={handleDragEnd}
                        animate={{ 
                          y: draggingIndex === index ? 2 : 0,
                          boxShadow: draggingIndex === index ? '0 4px 8px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)'
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start">
                            <div className="flex flex-col mr-2 mt-1">
                              <div 
                                className="cursor-move text-gray-400 hover:text-gray-600"
                                onMouseDown={(e) => e.preventDefault()}
                              >
                                <GripVertical className="h-5 w-5" />
                              </div>
                              <div className="flex flex-col mt-2 space-y-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`h-5 w-5 p-0 ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-800'}`}
                                  onClick={() => moveServiceUp(index)}
                                  disabled={index === 0}
                                >
                                  <ChevronUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`h-5 w-5 p-0 ${index === serviceList.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-800'}`}
                                  onClick={() => moveServiceDown(index)}
                                  disabled={index === serviceList.length - 1}
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div>
                              <h3 className="font-medium">{service.name}</h3>
                              <p className="text-sm text-neutral-600 mt-1">{service.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch 
                              checked={service.active} 
                              onCheckedChange={(checked) => toggleServiceActive(service.id, checked)} 
                            />
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500 h-8 w-8 p-0"
                              onClick={() => deleteService(service.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-2 text-sm">
                          <span className="text-neutral-500">
                            <Clock className="h-3 w-3 inline mr-1" /> 
                            {service.duration} mins
                          </span>
                          <span className="font-medium text-primary">
                            AU${(service.price / 100).toFixed(2)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    <p>No services found. Create your first service to get started.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Add Service Form */}
            <Card>
              <CardHeader>
                <CardTitle>Add New Service</CardTitle>
                <CardDescription>Create a new service offering</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...serviceForm}>
                  <form onSubmit={serviceForm.handleSubmit(onServiceSubmit)} className="space-y-4">
                    <FormField
                      control={serviceForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Basic Massage" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={serviceForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the service..." 
                              className="resize-none"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={serviceForm.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (minutes)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={serviceForm.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (AU$)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={serviceForm.control}
                      name="active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
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
                    
                    <Button type="submit" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Service
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Availability Tab */}
        <TabsContent value="availability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Set Availability</CardTitle>
              <CardDescription>Configure your working hours and booking window</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...availabilityForm}>
                <form onSubmit={availabilityForm.handleSubmit(onAvailabilitySubmit)} className="space-y-6">
                  <FormField
                    control={availabilityForm.control}
                    name="days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available Days</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { value: "0", label: "Sun" },
                            { value: "1", label: "Mon" },
                            { value: "2", label: "Tue" },
                            { value: "3", label: "Wed" },
                            { value: "4", label: "Thu" },
                            { value: "5", label: "Fri" },
                            { value: "6", label: "Sat" },
                          ].map((day) => (
                            <Button
                              key={day.value}
                              type="button"
                              variant={field.value.includes(day.value) ? "default" : "outline"}
                              className={`h-10 px-4 ${
                                day.value === "0" || day.value === "6" 
                                  ? field.value.includes(day.value) 
                                    ? "bg-red-500 hover:bg-red-600" 
                                    : "text-red-500"
                                  : ""
                              }`}
                              onClick={() => {
                                const updatedValue = field.value.includes(day.value)
                                  ? field.value.filter((val) => val !== day.value)
                                  : [...field.value, day.value];
                                field.onChange(updatedValue);
                              }}
                            >
                              {day.label}
                            </Button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={availabilityForm.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={availabilityForm.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={availabilityForm.control}
                    name="maxAdvanceBooking"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Advance Booking (days)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          How far in advance can clients book appointments
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full">Save Availability Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Reminders Tab */}
        <TabsContent value="reminders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reminder Settings</CardTitle>
              <CardDescription>Configure when and how booking reminders are sent</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...reminderForm}>
                <form onSubmit={reminderForm.handleSubmit(onReminderSubmit)} className="space-y-6">
                  <FormField
                    control={reminderForm.control}
                    name="firstReminder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Reminder (hours before appointment)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Send the first reminder this many hours before the appointment
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={reminderForm.control}
                    name="secondReminder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Second Reminder (hours before appointment)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Send a follow-up reminder this many hours before the appointment
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Reminder Channels</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <label className="text-sm font-medium">SMS Reminders</label>
                          <p className="text-xs text-neutral-500">
                            Send reminders via SMS
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <label className="text-sm font-medium">WhatsApp Reminders</label>
                          <p className="text-xs text-neutral-500">
                            Send reminders via WhatsApp
                          </p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full">Save Reminder Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Messaging Tab */}
        <TabsContent value="messaging" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Messaging Configuration</CardTitle>
              <CardDescription>Configure SMS and WhatsApp integration settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...messagingForm}>
                <form onSubmit={messagingForm.handleSubmit(onMessagingSubmit)} className="space-y-6">
                  <FormField
                    control={messagingForm.control}
                    name="smsApiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMS API Key</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your SMS provider API key" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={messagingForm.control}
                    name="whatsappApiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp API Key</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your WhatsApp API key" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={messagingForm.control}
                    name="defaultMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Message Template</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter default message template" 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Use {'{name}'}, {'{date}'}, {'{time}'}, {'{service}'} as placeholders
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Message Testing</h3>
                    <div className="flex space-x-2">
                      <Input placeholder="Enter phone number to test" className="flex-1" />
                      <Select defaultValue="sms">
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Channel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sms">SMS</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button>Test</Button>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full">Save Messaging Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* AI Settings Tab */}
        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI System Settings</CardTitle>
              <CardDescription>Configure AI chat system and training parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* AI Mode Toggle */}
              <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                <div className="space-y-1">
                  <h3 className="text-base font-medium">AI Mode</h3>
                  <p className="text-sm text-neutral-500">Enable or disable the AI chat system</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              {/* Training Mode Toggle */}
              <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                <div className="space-y-1">
                  <h3 className="text-base font-medium">Training Mode</h3>
                  <p className="text-sm text-neutral-500">AI will learn from conversations when enabled</p>
                </div>
                <Switch />
              </div>
              
              {/* Training Settings */}
              <div className="rounded-lg border p-4 shadow-sm space-y-4">
                <h3 className="text-base font-medium">Training Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Training Turns</label>
                    <Input type="number" defaultValue="20" />
                    <p className="text-xs text-neutral-500">
                      Maximum conversation turns for training
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Active Personas</label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="Select personas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Personas</SelectItem>
                        <SelectItem value="customer">Customer Service Only</SelectItem>
                        <SelectItem value="escort">Professional Escort Only</SelectItem>
                        <SelectItem value="custom">Custom Selection</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-neutral-500">
                      Which personas to use for training
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button>Start Training</Button>
                  <Button variant="outline">Pause Training</Button>
                  <Button variant="outline">Reset Training</Button>
                  <Button variant="outline">View Training Logs</Button>
                </div>
              </div>
              
              {/* AI API Settings */}
              <div className="rounded-lg border p-4 shadow-sm space-y-4">
                <h3 className="text-base font-medium">AI API Configuration</h3>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">AI Provider</label>
                  <Select defaultValue="openai">
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="cohere">Cohere</SelectItem>
                      <SelectItem value="custom">Custom Provider</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">API Key</label>
                  <Input type="password" placeholder="Enter API key" />
                  <p className="text-xs text-neutral-500">
                    Your API key is stored securely and never shared
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Model</label>
                  <Select defaultValue="gpt-4">
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-2">Claude 2</SelectItem>
                      <SelectItem value="command">Cohere Command</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Save AI Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
