import type { AIPersona, AIMessage } from '../types';

/**
 * Get the appropriate icon for an AI persona
 */
export function getPersonaIcon(icon: string): string {
  const iconMap: Record<string, string> = {
    'robot': 'fa-robot',
    'user-tie': 'fa-user-tie',
    'heart': 'fa-heart',
    'fire': 'fa-fire',
    'comments': 'fa-comments',
    'user': 'fa-user',
    'star': 'fa-star',
    'gem': 'fa-gem'
  };
  
  return iconMap[icon] || 'fa-robot';
}

/**
 * Format AI messages into conversation format
 */
export function formatAIMessages(messages: AIMessage[]): AIMessage[] {
  return messages.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

/**
 * Group AI messages by timestamp for display
 */
export function groupAIMessagesByTimestamp(messages: AIMessage[]): { timestamp: string; messages: AIMessage[] }[] {
  const groups: { [timestamp: string]: AIMessage[] } = {};
  
  messages.forEach(message => {
    const date = new Date(message.timestamp);
    const formattedDate = date.toLocaleDateString();
    
    if (!groups[formattedDate]) {
      groups[formattedDate] = [];
    }
    
    groups[formattedDate].push(message);
  });
  
  return Object.entries(groups).map(([timestamp, messages]) => ({
    timestamp,
    messages
  }));
}

/**
 * Filter personas by search term
 */
export function filterPersonas(personas: AIPersona[], searchTerm: string): AIPersona[] {
  if (!searchTerm) return personas;
  
  const lowerCaseSearch = searchTerm.toLowerCase();
  
  return personas.filter(persona => 
    persona.name.toLowerCase().includes(lowerCaseSearch) || 
    persona.description.toLowerCase().includes(lowerCaseSearch)
  );
}

/**
 * Get a user-friendly timestamp for AI message groups
 */
export function getAIMessageGroupTimestamp(timestamp: string): string {
  const messageDate = new Date(timestamp);
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
