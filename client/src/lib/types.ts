export interface Service {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number; // in cents
  active: boolean;
}

export interface Booking {
  id: number;
  serviceId: number;
  clientName: string;
  clientPhone: string;
  startTime: string;
  endTime: string;
  providerId?: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  extras?: any;
  totalPrice: number; // in cents
}

export interface Message {
  id: number;
  senderId?: number;
  receiverId?: number;
  content: string;
  channel: 'sms' | 'whatsapp' | 'ai';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  metadata?: any;
}

export interface Conversation {
  id: string;
  contact: {
    name: string;
    phone: string;
    avatar?: string;
  };
  lastMessage: {
    content: string;
    timestamp: string;
    isRead: boolean;
  };
}

export interface AIPersona {
  id: number;
  name: string;
  description: string;
  systemPrompt: string;
  icon: string;
  iconColor: string;
  active: boolean;
}

export interface AISetting {
  id: number;
  key: string;
  value: any;
  description?: string;
}

export interface AIConversation {
  id: number;
  personaId: number;
  userId?: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  id: string;
  conversationId: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface DateSelection {
  date: Date;
  timeSlots: TimeSlot[];
}

export interface FormattedPrice {
  value: number;
  formatted: string;
}
