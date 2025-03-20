import { 
  users, type User, type InsertUser,
  services, type Service, type InsertService,
  availability, type Availability, type InsertAvailability,
  bookings, type Booking, type InsertBooking,
  messages, type Message, type InsertMessage,
  aiPersonas, type AIPersona, type InsertAIPersona,
  aiSettings, type AISetting, type InsertAISetting,
  aiConversations, type AIConversation, type InsertAIConversation
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Service methods
  getServices(): Promise<Service[]>;
  getActiveServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  updateServicePosition(id: number, position: number): Promise<Service | undefined>;
  updateServicesOrder(serviceIds: number[]): Promise<Service[]>;
  deleteService(id: number): Promise<boolean>;
  
  // Availability methods
  getAvailabilityByProviderId(providerId: number): Promise<Availability[]>;
  createAvailability(availability: InsertAvailability): Promise<Availability>;
  updateAvailability(id: number, availability: Partial<InsertAvailability>): Promise<Availability | undefined>;
  
  // Booking methods
  getBookings(): Promise<Booking[]>;
  getBookingById(id: number): Promise<Booking | undefined>;
  getBookingsByPhone(phone: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  
  // Message methods
  getMessages(): Promise<Message[]>;
  getMessagesBySenderId(senderId: number): Promise<Message[]>;
  getMessagesByReceiverId(receiverId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessageStatus(id: number, status: string): Promise<Message | undefined>;
  
  // AI Persona methods
  getAIPersonas(): Promise<AIPersona[]>;
  getAIPersona(id: number): Promise<AIPersona | undefined>;
  createAIPersona(persona: InsertAIPersona): Promise<AIPersona>;
  updateAIPersona(id: number, persona: Partial<InsertAIPersona>): Promise<AIPersona | undefined>;
  
  // AI Settings methods
  getAISettings(): Promise<AISetting[]>;
  getAISetting(key: string): Promise<AISetting | undefined>;
  createAISetting(setting: InsertAISetting): Promise<AISetting>;
  updateAISetting(key: string, value: any): Promise<AISetting | undefined>;
  
  // AI Conversation methods
  getAIConversations(): Promise<AIConversation[]>;
  getAIConversation(id: number): Promise<AIConversation | undefined>;
  getAIConversationsByPersonaId(personaId: number): Promise<AIConversation[]>;
  createAIConversation(conversation: InsertAIConversation): Promise<AIConversation>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private services: Map<number, Service>;
  private availabilities: Map<number, Availability>;
  private bookings: Map<number, Booking>;
  private messages: Map<number, Message>;
  private aiPersonas: Map<number, AIPersona>;
  private aiSettings: Map<string, AISetting>;
  private aiConversations: Map<number, AIConversation>;
  
  private currentUserId: number;
  private currentServiceId: number;
  private currentAvailabilityId: number;
  private currentBookingId: number;
  private currentMessageId: number;
  private currentAIPersonaId: number;
  private currentAISettingId: number;
  private currentAIConversationId: number;

  constructor() {
    this.users = new Map();
    this.services = new Map();
    this.availabilities = new Map();
    this.bookings = new Map();
    this.messages = new Map();
    this.aiPersonas = new Map();
    this.aiSettings = new Map();
    this.aiConversations = new Map();
    
    this.currentUserId = 1;
    this.currentServiceId = 1;
    this.currentAvailabilityId = 1;
    this.currentBookingId = 1;
    this.currentMessageId = 1;
    this.currentAIPersonaId = 1;
    this.currentAISettingId = 1;
    this.currentAIConversationId = 1;
    
    // Initialize with sample services
    this.initSampleData();
  }

  private initSampleData() {
    // Create sample services
    const sampleServices: InsertService[] = [
      {
        name: "Ideepthroat Natural Blow Job & CIM",
        description: "My Ideepthroat Natural Blow Job & CIM offers a discreet and professional experience for clients seeking excellence in oral pleasure.",
        duration: 15,
        price: 20000, // $200.00
        active: true,
        photo: null,
        bufferBefore: "0",
        bufferAfter: "15"
      },
      {
        name: "20min Suck and Fuck",
        description: "Introducing \"20min Suck and Fuck\" service designed for those seeking a quick yet fulfilling experience.",
        duration: 20,
        price: 25000, // $250.00
        active: true,
        photo: null,
        bufferBefore: "15",
        bufferAfter: "0"
      },
      {
        name: "30min Pornstar Girlfriend Experience",
        description: "My 30 minute Pornstar Girlfriend Experience service offers a thrilling and immersive experience that will leave you feeling satisfied and fulfilled.",
        duration: 30,
        price: 35000, // $350.00
        active: true,
        photo: null,
        bufferBefore: "0",
        bufferAfter: "15"
      },
      {
        name: "1hr Pornstar Girlfriend Experience",
        description: "Indulge in the ultimate fantasy with our 1hr Pornstar Girlfriend Experience service. I will provide you with an unforgettable experience tailored to your desires.",
        duration: 60,
        price: 60000, // $600.00
        active: true,
        photo: null,
        bufferBefore: "15",
        bufferAfter: "15"
      },
      {
        name: "2hrs Pornstar Girlfriend Experience",
        description: "Indulge in the ultimate fantasy with our 2-hour Pornstar Girlfriend Experience service. I'll shower you with attention, passion, and desire.",
        duration: 120,
        price: 120000, // $1200.00
        active: true,
        photo: null,
        bufferBefore: "15",
        bufferAfter: "30"
      },
      {
        name: "My Anonymous Sister",
        description: "A specialized experience with a unique theme and personal touch.",
        duration: 45,
        price: 25000, // $250.00
        active: true,
        photo: null,
        bufferBefore: "0",
        bufferAfter: "0"
      }
    ];

    sampleServices.forEach(service => this.createService(service));

    // Create sample AI personas
    const samplePersonas: InsertAIPersona[] = [
      {
        name: "Customer Service",
        description: "General inquiries and bookings",
        systemPrompt: "You are a helpful customer service assistant for a booking service. Help answer questions about services and guide users through the booking process.",
        icon: "robot",
        iconColor: "blue",
        active: true
      },
      {
        name: "Professional Escort",
        description: "VIP experiences and information",
        systemPrompt: "You are a professional escort providing information about premium experiences. Be informative, professional, and discrete.",
        icon: "user-tie",
        iconColor: "purple",
        active: true
      },
      {
        name: "Girlfriend Experience",
        description: "Casual and intimate conversations",
        systemPrompt: "You are providing a girlfriend experience chat service. Be casual, friendly, and engaging in conversation.",
        icon: "heart",
        iconColor: "pink",
        active: true
      },
      {
        name: "Explicit Persona",
        description: "Mature and direct interactions",
        systemPrompt: "You are providing explicit, adult-oriented conversation. Be direct and open while respecting boundaries.",
        icon: "fire",
        iconColor: "red",
        active: true
      }
    ];

    samplePersonas.forEach(persona => this.createAIPersona(persona));

    // Create sample settings
    const sampleSettings: InsertAISetting[] = [
      {
        key: "ai_mode",
        value: false,
        description: "Whether AI mode is enabled"
      },
      {
        key: "training_mode",
        value: false,
        description: "Whether training mode is enabled"
      },
      {
        key: "training_settings",
        value: {
          max_turns: 20,
          message_delay_min: 1000,
          message_delay_max: 3000,
          active_personas: [1, 2]
        },
        description: "Settings for training mode"
      }
    ];

    sampleSettings.forEach(setting => this.createAISetting(setting));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Service methods
  async getServices(): Promise<Service[]> {
    // Return services sorted by position
    return Array.from(this.services.values()).sort((a, b) => a.position - b.position);
  }
  
  async getActiveServices(): Promise<Service[]> {
    // Return only active services sorted by position
    return Array.from(this.services.values())
      .filter(service => service.active)
      .sort((a, b) => a.position - b.position);
  }

  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = this.currentServiceId++;
    // Get the highest position value and add 1
    const highestPosition = Math.max(
      0,
      ...Array.from(this.services.values()).map(s => s.position || 0)
    );
    const position = insertService.position !== undefined ? insertService.position : highestPosition + 1;
    
    const service: Service = { ...insertService, id, position };
    this.services.set(id, service);
    return service;
  }

  async updateService(id: number, serviceUpdate: Partial<InsertService>): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (!service) return undefined;
    
    const updatedService = { ...service, ...serviceUpdate };
    this.services.set(id, updatedService);
    return updatedService;
  }
  
  async updateServicePosition(id: number, position: number): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (!service) return undefined;
    
    const updatedService = { ...service, position };
    this.services.set(id, updatedService);
    return updatedService;
  }
  
  async updateServicesOrder(serviceIds: number[]): Promise<Service[]> {
    // Update position for each service based on its index in the array
    const updatedServices = [];
    
    for (let i = 0; i < serviceIds.length; i++) {
      const id = serviceIds[i];
      const service = this.services.get(id);
      
      if (service) {
        const updatedService = { ...service, position: i };
        this.services.set(id, updatedService);
        updatedServices.push(updatedService);
      }
    }
    
    return updatedServices;
  }
  
  async deleteService(id: number): Promise<boolean> {
    return this.services.delete(id);
  }

  // Availability methods
  async getAvailabilityByProviderId(providerId: number): Promise<Availability[]> {
    return Array.from(this.availabilities.values()).filter(
      (a) => a.providerId === providerId
    );
  }

  async createAvailability(insertAvailability: InsertAvailability): Promise<Availability> {
    const id = this.currentAvailabilityId++;
    const availability: Availability = { ...insertAvailability, id };
    this.availabilities.set(id, availability);
    return availability;
  }

  async updateAvailability(id: number, availabilityUpdate: Partial<InsertAvailability>): Promise<Availability | undefined> {
    const availability = this.availabilities.get(id);
    if (!availability) return undefined;
    
    const updatedAvailability = { ...availability, ...availabilityUpdate };
    this.availabilities.set(id, updatedAvailability);
    return updatedAvailability;
  }

  // Booking methods
  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async getBookingById(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByPhone(phone: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.clientPhone === phone
    );
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const service = await this.getService(insertBooking.serviceId);
    
    if (!service) {
      throw new Error(`Service with ID ${insertBooking.serviceId} not found`);
    }
    
    // Calculate end time based on service duration
    const startTime = new Date(insertBooking.startTime);
    const endTime = new Date(startTime.getTime() + service.duration * 60000);
    
    const booking: Booking = { 
      ...insertBooking, 
      id,
      status: "pending",
      endTime
    };
    
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, status };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  // Message methods
  async getMessages(): Promise<Message[]> {
    return Array.from(this.messages.values());
  }

  async getMessagesBySenderId(senderId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.senderId === senderId
    );
  }

  async getMessagesByReceiverId(receiverId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.receiverId === receiverId
    );
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const timestamp = new Date();
    const message: Message = { 
      ...insertMessage, 
      id,
      timestamp,
      status: "sent"
    };
    
    this.messages.set(id, message);
    return message;
  }

  async updateMessageStatus(id: number, status: string): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, status };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  // AI Persona methods
  async getAIPersonas(): Promise<AIPersona[]> {
    return Array.from(this.aiPersonas.values());
  }

  async getAIPersona(id: number): Promise<AIPersona | undefined> {
    return this.aiPersonas.get(id);
  }

  async createAIPersona(insertPersona: InsertAIPersona): Promise<AIPersona> {
    const id = this.currentAIPersonaId++;
    const persona: AIPersona = { ...insertPersona, id };
    this.aiPersonas.set(id, persona);
    return persona;
  }

  async updateAIPersona(id: number, personaUpdate: Partial<InsertAIPersona>): Promise<AIPersona | undefined> {
    const persona = this.aiPersonas.get(id);
    if (!persona) return undefined;
    
    const updatedPersona = { ...persona, ...personaUpdate };
    this.aiPersonas.set(id, updatedPersona);
    return updatedPersona;
  }

  // AI Settings methods
  async getAISettings(): Promise<AISetting[]> {
    return Array.from(this.aiSettings.values());
  }

  async getAISetting(key: string): Promise<AISetting | undefined> {
    return this.aiSettings.get(key);
  }

  async createAISetting(insertSetting: InsertAISetting): Promise<AISetting> {
    const id = this.currentAISettingId++;
    const setting: AISetting = { ...insertSetting, id };
    this.aiSettings.set(insertSetting.key, setting);
    return setting;
  }

  async updateAISetting(key: string, value: any): Promise<AISetting | undefined> {
    const setting = this.aiSettings.get(key);
    if (!setting) return undefined;
    
    const updatedSetting = { ...setting, value };
    this.aiSettings.set(key, updatedSetting);
    return updatedSetting;
  }

  // AI Conversation methods
  async getAIConversations(): Promise<AIConversation[]> {
    return Array.from(this.aiConversations.values());
  }

  async getAIConversation(id: number): Promise<AIConversation | undefined> {
    return this.aiConversations.get(id);
  }

  async getAIConversationsByPersonaId(personaId: number): Promise<AIConversation[]> {
    return Array.from(this.aiConversations.values()).filter(
      (conversation) => conversation.personaId === personaId
    );
  }

  async createAIConversation(insertConversation: InsertAIConversation): Promise<AIConversation> {
    const id = this.currentAIConversationId++;
    const now = new Date();
    const conversation: AIConversation = { 
      ...insertConversation, 
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.aiConversations.set(id, conversation);
    return conversation;
  }
}

export const storage = new MemStorage();
