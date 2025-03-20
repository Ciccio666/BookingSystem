import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";

// Form schema for SMS
const smsFormSchema = z.object({
  recipientPhone: z.string().min(5, "Valid phone number is required"),
  message: z.string().min(1, "Message is required"),
});

// Form schema for WhatsApp
const whatsappFormSchema = z.object({
  recipientPhone: z.string().min(5, "Valid WhatsApp number is required"),
  message: z.string().min(1, "Message is required"),
});

type SMSFormValues = z.infer<typeof smsFormSchema>;
type WhatsAppFormValues = z.infer<typeof whatsappFormSchema>;

const SMSForm = () => {
  const [isSendingSMS, setIsSendingSMS] = useState(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const { toast } = useToast();

  const smsForm = useForm<SMSFormValues>({
    resolver: zodResolver(smsFormSchema),
    defaultValues: {
      recipientPhone: "",
      message: "",
    }
  });

  const whatsappForm = useForm<WhatsAppFormValues>({
    resolver: zodResolver(whatsappFormSchema),
    defaultValues: {
      recipientPhone: "",
      message: "",
    }
  });

  const onSendSMS = async (data: SMSFormValues) => {
    try {
      setIsSendingSMS(true);
      
      const message: Partial<Message> = {
        content: data.message,
        channel: 'sms',
        receiverId: 0, // This would be the recipient ID in a real app
        metadata: {
          recipientPhone: data.recipientPhone,
        }
      };
      
      // Send the message to the API
      const response = await apiRequest('/api/messages', {
        method: 'POST',
        body: JSON.stringify(message),
      });
      
      toast({
        title: "SMS sent successfully",
        description: `Message sent to ${data.recipientPhone}`,
      });
      
      // Reset the form
      smsForm.reset();
    } catch (error) {
      console.error("Error sending SMS:", error);
      toast({
        title: "Failed to send SMS",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingSMS(false);
    }
  };

  const onSendWhatsApp = async (data: WhatsAppFormValues) => {
    try {
      setIsSendingWhatsApp(true);
      
      const message: Partial<Message> = {
        content: data.message,
        channel: 'whatsapp',
        receiverId: 0, // This would be the recipient ID in a real app
        metadata: {
          recipientPhone: data.recipientPhone,
        }
      };
      
      // Send the message to the API
      const response = await apiRequest('/api/messages', {
        method: 'POST',
        body: JSON.stringify(message),
      });
      
      toast({
        title: "WhatsApp message sent successfully",
        description: `Message sent to ${data.recipientPhone}`,
      });
      
      // Reset the form
      whatsappForm.reset();
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      toast({
        title: "Failed to send WhatsApp message",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Messages</CardTitle>
        <CardDescription>Send SMS or WhatsApp messages to clients</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sms" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="sms">SMS</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          </TabsList>

          {/* SMS Tab */}
          <TabsContent value="sms">
            <Form {...smsForm}>
              <form onSubmit={smsForm.handleSubmit(onSendSMS)} className="space-y-4">
                <FormField
                  control={smsForm.control}
                  name="recipientPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient Phone Number</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <div className="flex items-center px-2 py-1 bg-neutral-100 border border-neutral-300 border-r-0 rounded-l-md">
                            <span className="flex items-center text-xs">
                              <span className="text-neutral-600">+61</span>
                            </span>
                          </div>
                          <Input
                            {...field}
                            className="rounded-l-none"
                            placeholder="412 345 678"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={smsForm.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMS Message</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Type your SMS message here..."
                          className="min-h-[120px] resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSendingSMS}
                >
                  {isSendingSMS ? "Sending..." : "Send SMS"}
                </Button>
              </form>
            </Form>
          </TabsContent>

          {/* WhatsApp Tab */}
          <TabsContent value="whatsapp">
            <Form {...whatsappForm}>
              <form onSubmit={whatsappForm.handleSubmit(onSendWhatsApp)} className="space-y-4">
                <FormField
                  control={whatsappForm.control}
                  name="recipientPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient WhatsApp Number</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <div className="flex items-center px-2 py-1 bg-neutral-100 border border-neutral-300 border-r-0 rounded-l-md">
                            <span className="flex items-center text-xs">
                              <span className="text-neutral-600">+61</span>
                            </span>
                          </div>
                          <Input
                            {...field}
                            className="rounded-l-none"
                            placeholder="412 345 678"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={whatsappForm.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp Message</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Type your WhatsApp message here..."
                          className="min-h-[120px] resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSendingWhatsApp}
                >
                  {isSendingWhatsApp ? "Sending..." : "Send WhatsApp Message"}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SMSForm;