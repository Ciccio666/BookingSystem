import type { Conversation, Message } from '../types';

/**
 * Format timestamp into a human-readable string
 */
export function formatMessageTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    // Today - show time
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffInDays === 1) {
    // Yesterday
    return 'Yesterday';
  } else if (diffInDays < 7) {
    // Less than a week - show day of week
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    // More than a week - show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

/**
 * Function to group messages by date for display
 */
export function groupMessagesByDate(messages: Message[]): { date: string; messages: Message[] }[] {
  const groups: { [date: string]: Message[] } = {};
  
  messages.forEach(message => {
    const date = new Date(message.timestamp).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
  });
  
  return Object.entries(groups).map(([date, messages]) => ({
    date,
    messages
  }));
}

/**
 * Check if a message is from the current user
 */
export function isOwnMessage(message: Message, currentUserId?: number): boolean {
  return message.senderId === currentUserId;
}

/**
 * Format a conversation list item
 */
export function truncateMessage(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Filter conversations by search term
 */
export function filterConversations(conversations: Conversation[], searchTerm: string): Conversation[] {
  if (!searchTerm) return conversations;
  
  const lowerCaseSearch = searchTerm.toLowerCase();
  
  return conversations.filter(conv => 
    conv.contact.name.toLowerCase().includes(lowerCaseSearch) || 
    conv.contact.phone.toLowerCase().includes(lowerCaseSearch) ||
    conv.lastMessage.content.toLowerCase().includes(lowerCaseSearch)
  );
}

/**
 * Generate a friendly timestamp for message groups
 */
export function getMessageGroupTimestamp(date: string): string {
  const messageDate = new Date(date);
  const today = new Date();
  
  if (messageDate.toDateString() === today.toDateString()) {
    return 'Today, ' + messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  
  if (messageDate.toDateString() === yesterday.toDateString()) {
    return 'Yesterday, ' + messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  return messageDate.toLocaleDateString([], { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  }) + ', ' + messageDate.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}
