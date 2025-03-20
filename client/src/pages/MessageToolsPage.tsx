import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import SMSForm from "@/components/messaging/SMSForm";
import { Message } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";

const MessageToolsPage = () => {
  const [activeTab, setActiveTab] = useState("send");

  // Fetch messages
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/messages'],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", '/api/messages');
        const data = await response.json();
        return data as Message[];
      } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
      }
    },
  });

  // Message status badge
  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      sent: "bg-blue-100 text-blue-800",
      delivered: "bg-green-100 text-green-800",
      read: "bg-purple-100 text-purple-800",
      failed: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Format the timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "dd/MM/yyyy HH:mm");
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-800 mb-6">Messaging Tools</h1>

      <Tabs defaultValue="send" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full max-w-md mb-6">
          <TabsTrigger value="send" className="flex-1">Send Messages</TabsTrigger>
          <TabsTrigger value="history" className="flex-1">Message History</TabsTrigger>
        </TabsList>

        {/* Send Messages Tab */}
        <TabsContent value="send">
          <div className="max-w-xl mx-auto">
            <SMSForm />
          </div>
        </TabsContent>

        {/* Message History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Message History</CardTitle>
              <CardDescription>View a history of all sent messages</CardDescription>
            </CardHeader>
            <CardContent>
              {messagesLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex space-x-3">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-5 w-1/3" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Content</TableHead>
                        <TableHead>Channel</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {messages && messages.length > 0 ? (
                        messages.map((message) => (
                          <TableRow key={message.id}>
                            <TableCell className="font-medium">
                              {message.metadata?.recipientPhone || "Unknown"}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {message.content}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {message.channel}
                              </Badge>
                            </TableCell>
                            <TableCell>{getStatusBadge(message.status)}</TableCell>
                            <TableCell>{formatTimestamp(message.timestamp)}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                Resend
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10 text-neutral-500">
                            No messages found in the history
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MessageToolsPage;