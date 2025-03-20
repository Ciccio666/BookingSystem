import { useState, ChangeEvent } from "react";
import { Search, PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Conversation } from "@/lib/types";
import { formatMessageTimestamp, truncateMessage } from "@/lib/utils/messaging";

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (conversation: Conversation) => void;
  onNewConversation: () => void;
}

const ConversationList = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
}: ConversationListProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filter conversations by search query
  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.contact.phone.includes(searchQuery)
  );

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden lg:col-span-1 flex flex-col h-full">
      <div className="border-b border-neutral-200 p-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-10"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <Search className="h-4 w-4 text-neutral-400" />
          </div>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-500 hover:text-primary"
              onClick={onNewConversation}
            >
              <PlusCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-neutral-500">
            No conversations found
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`border-b border-neutral-200 hover:bg-neutral-50 transition-colors cursor-pointer ${
                activeConversationId === conversation.id ? "bg-blue-50" : ""
              }`}
              onClick={() => onSelectConversation(conversation)}
            >
              <div className="p-4">
                <div className="flex items-start">
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
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-medium text-neutral-800 truncate">
                        {conversation.contact.name}
                      </h3>
                      <span className="text-xs text-neutral-500">
                        {formatMessageTimestamp(conversation.lastMessage.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 truncate">
                      {truncateMessage(conversation.lastMessage.content)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;
