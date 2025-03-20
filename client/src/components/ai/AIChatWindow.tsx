import { useState, FormEvent, useRef, useEffect } from "react";
import { Settings, MoreVertical, Smile, Paperclip, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AIPersona, AIMessage } from "@/lib/types";
import { groupAIMessagesByTimestamp, getAIMessageGroupTimestamp, getPersonaIcon } from "@/lib/utils/ai";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AIChatWindowProps {
  persona: AIPersona;
  messages: AIMessage[];
  onMessageSend: (message: AIMessage) => void;
  onSettingsClick: () => void;
}

const AIChatWindow = ({
  persona,
  messages,
  onMessageSend,
  onSettingsClick,
}: AIChatWindowProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Group messages by timestamp for display
  const groupedMessages = groupAIMessagesByTimestamp(messages);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    setIsSending(true);
    
    try {
      // Create a temporary user message for immediate display
      const tempUserMessage: AIMessage = {
        id: `temp-${Date.now()}`,
        conversationId: 0, // This will be replaced by the response from the API
        role: "user",
        content: newMessage,
        timestamp: new Date().toISOString(),
      };
      
      // Call onMessageSend to update UI immediately
      onMessageSend(tempUserMessage);
      
      // Prepare message data for API
      const messageData = {
        personaId: persona.id,
        content: newMessage,
        // Add any other required fields for your AI API
      };
      
      // Send message to API
      // This is a placeholder - implement the actual API call
      // In a real app, the backend would process this message with the AI and return a response
      const response = await apiRequest("POST", "/api/ai/message", messageData);
      const aiResponse = await response.json();
      
      // Call onMessageSend again with the AI response
      onMessageSend(aiResponse);
      
      // Clear input
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message to AI:", error);
      toast({
        title: "Message Not Sent",
        description: "Failed to communicate with the AI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };
  
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden lg:col-span-2 flex flex-col h-full">
      {/* Chat Header */}
      <div className="border-b border-neutral-200 p-4">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full bg-${persona.iconColor}-100 flex items-center justify-center text-${persona.iconColor}-500 mr-3`}>
            <i className={`fas ${getPersonaIcon(persona.icon)}`}></i>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-neutral-800">{persona.name}</h3>
            <p className="text-xs text-neutral-500">Active</p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-600 hover:text-neutral-800"
              onClick={onSettingsClick}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-600 hover:text-neutral-800"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="p-4 overflow-y-auto flex-1 bg-neutral-50">
        {groupedMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-neutral-500">
            Start a conversation with {persona.name}!
          </div>
        ) : (
          groupedMessages.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-6">
              {/* Timestamp */}
              <div className="flex justify-center mb-4">
                <span className="text-xs text-neutral-500 bg-neutral-200 px-2 py-1 rounded-full">
                  {getAIMessageGroupTimestamp(group.timestamp)}
                </span>
              </div>
              
              {/* Messages in this group */}
              {group.messages.map((message, messageIndex) => {
                const isUser = message.role === "user";
                
                return (
                  <div 
                    key={messageIndex}
                    className={`flex mb-4 ${isUser ? "justify-end" : ""}`}
                  >
                    {!isUser && (
                      <div className={`w-8 h-8 rounded-full bg-${persona.iconColor}-100 flex items-center justify-center text-${persona.iconColor}-500 mr-2`}>
                        <i className={`fas ${getPersonaIcon(persona.icon)}`}></i>
                      </div>
                    )}
                    <div className="max-w-[70%]">
                      <div 
                        className={`${
                          isUser 
                            ? "bg-blue-500 text-white" 
                            : "bg-white text-neutral-800"
                        } rounded-lg p-3 shadow-sm`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <div className={`flex mt-1 ${isUser ? "justify-end" : ""}`}>
                        <span className="text-xs text-neutral-500">
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
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
            <div className="flex-1 relative">
              <Textarea
                placeholder="Type a message..."
                value={newMessage}
                onChange={handleMessageChange}
                className="w-full px-4 py-2 border border-neutral-300 rounded-md resize-none max-h-32 pr-10"
                rows={2}
              />
              <div className="absolute right-3 bottom-2 flex space-x-2 text-neutral-500">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:text-neutral-700"
                >
                  <Smile className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:text-neutral-700"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              className="ml-2 px-4 py-3 rounded-full bg-secondary text-white hover:bg-secondary/90 flex items-center"
              disabled={isSending || !newMessage.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              <span>Send</span>
            </Button>
          </div>
          
          <div className="flex justify-between mt-2 text-xs text-neutral-500">
            <div className="flex items-center">
              <Button
                variant="link"
                size="sm"
                className="text-xs p-0 h-auto flex items-center"
                onClick={onSettingsClick}
              >
                <Settings className="h-3 w-3 mr-1" />
                AI Settings
              </Button>
            </div>
            <div>
              <Button
                variant="link"
                size="sm"
                className="text-xs p-0 h-auto"
              >
                View training status
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIChatWindow;
