import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import ConversationList from "@/components/messaging/ConversationList";
import ChatWindow from "@/components/messaging/ChatWindow";
import { Conversation, Message } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const MessagingPage = () => {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [currentUserId] = useState<number | undefined>(1); // In a real app, this would come from auth context
  const { toast } = useToast();

  // Mock conversations - in a real app, this would come from the API
  // This would be replaced with a real API call in production
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['/api/conversations'],
    queryFn: async () => {
      // Mock data since the API endpoint isn't implemented in the provided routes
      return [
        {
          id: "1",
          contact: {
            name: "James Smith",
            phone: "+61421234567",
            avatar: "https://randomuser.me/api/portraits/men/32.jpg",
          },
          lastMessage: {
            content: "Looking forward to our appointment tomorrow!",
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
            isRead: true,
          },
        },
        {
          id: "2",
          contact: {
            name: "Sarah Johnson",
            phone: "+61433445566",
            avatar: "https://randomuser.me/api/portraits/women/45.jpg",
          },
          lastMessage: {
            content: "Can I change my booking to 2:00 PM?",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            isRead: false,
          },
        },
        {
          id: "3",
          contact: {
            name: "Michael Brown",
            phone: "+61455667788",
            avatar: "https://randomuser.me/api/portraits/men/67.jpg",
          },
          lastMessage: {
            content: "Thank you for the amazing service!",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
            isRead: true,
          },
        },
      ] as Conversation[];
    },
  });

  // Get messages for active conversation
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/messages/conversation', activeConversationId],
    queryFn: async () => {
      if (!activeConversationId) return [];

      try {
        // In a real app, this would be an API call to get messages for the active conversation
        // Mock data since the API endpoint isn't implemented as expected in the routes
        const now = Date.now();
        const yesterday = now - 1000 * 60 * 60 * 24;
        
        if (activeConversationId === "2") { // Sarah Johnson
          return [
            {
              id: 1,
              senderId: 2,
              receiverId: 1,
              content: "Hi, I'd like to book an appointment for tomorrow. Is the 1-hour session still available?",
              channel: "sms",
              status: "read",
              timestamp: new Date(yesterday + 1000 * 60 * 60).toISOString(),
              metadata: null,
            },
            {
              id: 2,
              senderId: 1,
              receiverId: 2,
              content: "Yes, I have availability tomorrow! The 1-hour session is still open. What time works best for you?",
              channel: "sms",
              status: "read",
              timestamp: new Date(yesterday + 1000 * 60 * 60 + 1000 * 60 * 2).toISOString(),
              metadata: null,
            },
            {
              id: 3,
              senderId: 2,
              receiverId: 1,
              content: "That's great! Would 2:00 PM work for you?",
              channel: "sms",
              status: "read",
              timestamp: new Date(yesterday + 1000 * 60 * 60 + 1000 * 60 * 4).toISOString(),
              metadata: null,
            },
            {
              id: 4,
              senderId: 2,
              receiverId: 1,
              content: "Hi again! I was wondering if I could change my booking to 2:00 PM instead of 1:00 PM?",
              channel: "sms", 
              status: "delivered",
              timestamp: new Date(now - 1000 * 60 * 120).toISOString(),
              metadata: null,
            },
          ] as Message[];
        }
        
        // Default empty conversation
        return [] as Message[];
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast({
          title: "Failed to load messages",
          description: "Could not retrieve messages for this conversation.",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !!activeConversationId,
  });

  // Set initial active conversation
  useEffect(() => {
    if (!activeConversationId && conversations && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId]);

  // Handle selecting a conversation
  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversationId(conversation.id);
  };

  // Handle new conversation
  const handleNewConversation = () => {
    toast({
      title: "Create new conversation",
      description: "This feature is not yet implemented.",
    });
  };

  // Handle sending a message
  const handleSendMessage = async (message: Message) => {
    // In a real app, this would add the message to the messages array
    // and also trigger a refetch of the conversation list to update the last message
    queryClient.invalidateQueries({ queryKey: ['/api/messages/conversation', activeConversationId] });
    queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
  };

  // Get the current active conversation
  const activeConversation = conversations?.find(c => c.id === activeConversationId) || null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-800 mb-6">Messages</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversation List */}
        {conversationsLoading ? (
          <div className="bg-white rounded-lg shadow overflow-hidden lg:col-span-1">
            <div className="border-b border-neutral-200 p-4">
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <ConversationList
            conversations={conversations || []}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
          />
        )}
        
        {/* Chat Window */}
        {activeConversation ? (
          <ChatWindow
            conversation={activeConversation}
            messages={messages || []}
            currentUserId={currentUserId}
            onMessageSend={handleSendMessage}
          />
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden lg:col-span-2 flex items-center justify-center">
            <p className="text-neutral-500">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingPage;
