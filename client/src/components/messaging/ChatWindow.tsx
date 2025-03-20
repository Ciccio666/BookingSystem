import { useState, FormEvent, useRef, useEffect } from "react";
import { Phone, Video, MoreVertical, Paperclip, Send, Smile } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Conversation, Message } from "@/lib/types";
import { groupMessagesByDate, isOwnMessage, getMessageGroupTimestamp } from "@/lib/utils/messaging";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId?: number; // Optional as we might not have a logged-in user
  onMessageSend: (message: Message) => void;
}

const ChatWindow = ({
  conversation,
  messages,
  currentUserId,
  onMessageSend,
}: ChatWindowProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [sendingChannel, setSendingChannel] = useState<"sms" | "whatsapp">("sms");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Group messages by date for display
  const groupedMessages = groupMessagesByDate(messages);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    setIsSending(true);
    
    try {
      // Prepare message data
      const messageData = {
        content: newMessage,
        senderId: currentUserId, // This could be undefined for anonymous messages
        receiverId: parseInt(conversation.id), // This assumes conversation.id is the recipient's user ID
        channel: sendingChannel,
      };
      
      // Send message to API
      const response = await apiRequest("POST", "/api/messages", messageData);
      const sentMessage = await response.json();
      
      // Call onMessageSend callback to update UI immediately
      onMessageSend(sentMessage);
      
      // Clear input
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Message Not Sent",
        description: "Failed to send your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
  };

  const handleChannelChange = (value: string) => {
    setSendingChannel(value as "sms" | "whatsapp");
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden lg:col-span-2 flex flex-col h-full">
      {/* Chat Header */}
      <div className="border-b border-neutral-200 p-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-neutral-300 flex-shrink-0 overflow-hidden mr-3">
            {conversation.contact.avatar ? (
              <img
                src={conversation.contact.avatar}
                alt={`${conversation.contact.name} Avatar`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-600 font-medium">
                {conversation.contact.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-neutral-800">{conversation.contact.name}</h3>
            <p className="text-xs text-neutral-500">Last active: 5 minutes ago</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" className="text-neutral-600">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-neutral-600">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-neutral-600">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="p-4 overflow-y-auto flex-1 bg-neutral-50">
        {groupedMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-neutral-500">
            No messages yet. Start a conversation!
          </div>
        ) : (
          groupedMessages.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-6">
              {/* Timestamp */}
              <div className="flex justify-center mb-4">
                <span className="text-xs text-neutral-500 bg-neutral-200 px-2 py-1 rounded-full">
                  {getMessageGroupTimestamp(group.date)}
                </span>
              </div>

              {/* Messages in this group */}
              {group.messages.map((message, messageIndex) => {
                const isOwn = isOwnMessage(message, currentUserId);

                return (
                  <div
                    key={messageIndex}
                    className={`flex mb-4 ${isOwn ? "justify-end" : ""}`}
                  >
                    {!isOwn && (
                      <div className="w-8 h-8 rounded-full bg-neutral-300 flex-shrink-0 overflow-hidden mr-2">
                        {conversation.contact.avatar ? (
                          <img
                            src={conversation.contact.avatar}
                            alt={`${conversation.contact.name} Avatar`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs font-medium">
                            {conversation.contact.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="max-w-[70%]">
                      <div
                        className={`${
                          isOwn
                            ? "bg-primary text-white"
                            : "bg-white text-neutral-800"
                        } rounded-lg p-3 shadow-sm`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <div className={`flex mt-1 ${isOwn ? "justify-end" : ""}`}>
                        <span className="text-xs text-neutral-500">
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isOwn && message.status === "read" && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 text-blue-500 ml-1 mt-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-neutral-200 p-4">
        <form onSubmit={handleSendMessage}>
          <div className="flex items-end">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-neutral-600 mr-2"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <div className="flex-1 relative">
              <Textarea
                placeholder="Type a message..."
                value={newMessage}
                onChange={handleMessageChange}
                className="w-full px-4 py-2 border border-neutral-300 rounded-md resize-none max-h-32 pr-10"
                rows={1}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-3 bottom-2 text-neutral-500 hover:text-neutral-700"
              >
                <Smile className="h-5 w-5" />
              </Button>
            </div>
            <Button
              type="submit"
              className="ml-2 p-2 rounded-full bg-primary text-white hover:bg-primary/90"
              disabled={isSending || !newMessage.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex justify-between mt-2 text-xs text-neutral-500">
            <div className="flex items-center">
              <span>Send as:</span>
              <Select
                value={sendingChannel}
                onValueChange={handleChannelChange}
              >
                <SelectTrigger className="ml-2 py-1 px-2 h-7 border-neutral-200 bg-neutral-100 rounded-md w-28">
                  <SelectValue placeholder="SMS" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button variant="link" size="sm" className="text-xs p-0 h-auto">
                View message status
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
