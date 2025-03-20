import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertServiceSchema, 
  insertBookingSchema, 
  insertMessageSchema, 
  insertAIPersonaSchema, 
  insertAISettingSchema, 
  insertAIConversationSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { WebSocketServer } from "ws";

// Middleware to handle validation errors
function validateRequest(schema: any, data: any) {
  try {
    return { data: schema.parse(data), error: null };
  } catch (error) {
    if (error instanceof ZodError) {
      return { 
        data: null, 
        error: fromZodError(error).message 
      };
    }
    return { 
      data: null, 
      error: 'Invalid request data' 
    };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time messaging
  const wss = new WebSocketServer({ 
    server: httpServer,
    // Simple configuration without custom protocol handling
    perMessageDeflate: false
  });
  
  wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');
    
    // Send a welcome message to confirm connection
    ws.send(JSON.stringify({
      type: 'connection_established',
      message: 'Connected to messaging server'
    }));
    
    ws.on('message', (message) => {
      try {
        console.log('Received message:', message.toString());
        // Echo the message back to confirm receipt
        ws.send(JSON.stringify({
          type: 'message_received',
          data: message.toString()
        }));
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
    
    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });
  
  // Handle WebSocket server errors
  wss.on('error', (error) => {
    console.error('WebSocket server error:', error);
  });

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });
  
  // Test route for debugging
  app.get('/test', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Page</title>
        </head>
        <body>
          <h1>Server is working!</h1>
          <p>The server is responding correctly. If you can see this, the basic Express functionality is working.</p>
          <script>
            // Add this to test if client-side JS is working
            document.body.innerHTML += '<p>JavaScript is working too!</p>';
          </script>
        </body>
      </html>
    `);
  });

  // Services endpoints
  app.get('/api/services', async (req: Request, res: Response) => {
    try {
      // Check if we want only active services
      const activeOnly = req.query.active === 'true';
      
      let services;
      if (activeOnly) {
        services = await storage.getActiveServices();
      } else {
        services = await storage.getServices();
      }
      
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch services' });
    }
  });

  app.get('/api/services/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid service ID' });
      }
      
      const service = await storage.getService(id);
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }
      
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch service' });
    }
  });

  app.post('/api/services', async (req: Request, res: Response) => {
    try {
      const { data, error } = validateRequest(insertServiceSchema, req.body);
      if (error) {
        return res.status(400).json({ error });
      }
      
      const service = await storage.createService(data);
      res.status(201).json(service);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create service' });
    }
  });

  app.patch('/api/services/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid service ID' });
      }
      
      const service = await storage.getService(id);
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }
      
      const { data, error } = validateRequest(insertServiceSchema.partial(), req.body);
      if (error) {
        return res.status(400).json({ error });
      }
      
      const updatedService = await storage.updateService(id, data);
      res.json(updatedService);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update service' });
    }
  });
  
  app.patch('/api/services/:id/position', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid service ID' });
      }
      
      const service = await storage.getService(id);
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }
      
      const { position } = req.body;
      if (typeof position !== 'number') {
        return res.status(400).json({ error: 'Position must be a number' });
      }
      
      const updatedService = await storage.updateServicePosition(id, position);
      res.json(updatedService);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update service position' });
    }
  });
  
  app.post('/api/services/order', async (req: Request, res: Response) => {
    try {
      const { serviceIds } = req.body;
      if (!Array.isArray(serviceIds)) {
        return res.status(400).json({ error: 'serviceIds must be an array' });
      }
      
      const updatedServices = await storage.updateServicesOrder(serviceIds);
      res.json(updatedServices);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update service order' });
    }
  });
  
  app.delete('/api/services/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid service ID' });
      }
      
      const service = await storage.getService(id);
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }
      
      const success = await storage.deleteService(id);
      if (success) {
        res.status(204).end();
      } else {
        res.status(500).json({ error: 'Failed to delete service' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete service' });
    }
  });

  // Bookings endpoints
  app.get('/api/bookings', async (_req: Request, res: Response) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  });

  app.get('/api/bookings/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid booking ID' });
      }
      
      const booking = await storage.getBookingById(id);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch booking' });
    }
  });

  app.get('/api/bookings/phone/:phone', async (req: Request, res: Response) => {
    try {
      const phone = req.params.phone;
      const bookings = await storage.getBookingsByPhone(phone);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch bookings by phone' });
    }
  });

  app.post('/api/bookings', async (req: Request, res: Response) => {
    try {
      const { data, error } = validateRequest(insertBookingSchema, req.body);
      if (error) {
        return res.status(400).json({ error });
      }
      
      const booking = await storage.createBooking(data);
      res.status(201).json(booking);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to create booking' });
    }
  });

  app.patch('/api/bookings/:id/status', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid booking ID' });
      }
      
      const { status } = req.body;
      if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      
      const booking = await storage.updateBookingStatus(id, status);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update booking status' });
    }
  });

  // Messaging endpoints
  app.get('/api/messages', async (_req: Request, res: Response) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  app.post('/api/messages', async (req: Request, res: Response) => {
    try {
      const { data, error } = validateRequest(insertMessageSchema, req.body);
      if (error) {
        return res.status(400).json({ error });
      }
      
      const message = await storage.createMessage(data);
      
      // Broadcast message to WebSocket clients if needed
      wss.clients.forEach((client) => {
        if (client.readyState === 1) { // OPEN
          client.send(JSON.stringify({
            type: 'new_message',
            message
          }));
        }
      });
      
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create message' });
    }
  });

  app.patch('/api/messages/:id/status', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid message ID' });
      }
      
      const { status } = req.body;
      if (!status || !['sent', 'delivered', 'read', 'failed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      
      const message = await storage.updateMessageStatus(id, status);
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }
      
      res.json(message);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update message status' });
    }
  });

  app.get('/api/messages/sender/:id', async (req: Request, res: Response) => {
    try {
      const senderId = parseInt(req.params.id);
      if (isNaN(senderId)) {
        return res.status(400).json({ error: 'Invalid sender ID' });
      }
      
      const messages = await storage.getMessagesBySenderId(senderId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch messages by sender' });
    }
  });

  app.get('/api/messages/receiver/:id', async (req: Request, res: Response) => {
    try {
      const receiverId = parseInt(req.params.id);
      if (isNaN(receiverId)) {
        return res.status(400).json({ error: 'Invalid receiver ID' });
      }
      
      const messages = await storage.getMessagesByReceiverId(receiverId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch messages by receiver' });
    }
  });

  // AI Persona endpoints
  app.get('/api/ai/personas', async (_req: Request, res: Response) => {
    try {
      const personas = await storage.getAIPersonas();
      res.json(personas);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch AI personas' });
    }
  });

  app.get('/api/ai/personas/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid persona ID' });
      }
      
      const persona = await storage.getAIPersona(id);
      if (!persona) {
        return res.status(404).json({ error: 'Persona not found' });
      }
      
      res.json(persona);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch AI persona' });
    }
  });

  app.post('/api/ai/personas', async (req: Request, res: Response) => {
    try {
      const { data, error } = validateRequest(insertAIPersonaSchema, req.body);
      if (error) {
        return res.status(400).json({ error });
      }
      
      const persona = await storage.createAIPersona(data);
      res.status(201).json(persona);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create AI persona' });
    }
  });

  app.patch('/api/ai/personas/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid persona ID' });
      }
      
      const persona = await storage.getAIPersona(id);
      if (!persona) {
        return res.status(404).json({ error: 'Persona not found' });
      }
      
      const { data, error } = validateRequest(insertAIPersonaSchema.partial(), req.body);
      if (error) {
        return res.status(400).json({ error });
      }
      
      const updatedPersona = await storage.updateAIPersona(id, data);
      res.json(updatedPersona);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update AI persona' });
    }
  });

  // AI Settings endpoints
  app.get('/api/ai/settings', async (_req: Request, res: Response) => {
    try {
      const settings = await storage.getAISettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch AI settings' });
    }
  });

  app.get('/api/ai/settings/:key', async (req: Request, res: Response) => {
    try {
      const key = req.params.key;
      const setting = await storage.getAISetting(key);
      if (!setting) {
        return res.status(404).json({ error: 'Setting not found' });
      }
      
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch AI setting' });
    }
  });

  app.post('/api/ai/settings', async (req: Request, res: Response) => {
    try {
      const { data, error } = validateRequest(insertAISettingSchema, req.body);
      if (error) {
        return res.status(400).json({ error });
      }
      
      const setting = await storage.createAISetting(data);
      res.status(201).json(setting);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create AI setting' });
    }
  });

  app.patch('/api/ai/settings/:key', async (req: Request, res: Response) => {
    try {
      const key = req.params.key;
      const { value } = req.body;
      if (value === undefined) {
        return res.status(400).json({ error: 'Value is required' });
      }
      
      const setting = await storage.getAISetting(key);
      if (!setting) {
        return res.status(404).json({ error: 'Setting not found' });
      }
      
      const updatedSetting = await storage.updateAISetting(key, value);
      res.json(updatedSetting);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update AI setting' });
    }
  });

  // AI Conversation endpoints
  app.post('/api/ai/conversations', async (req: Request, res: Response) => {
    try {
      const { data, error } = validateRequest(insertAIConversationSchema, req.body);
      if (error) {
        return res.status(400).json({ error });
      }
      
      const conversation = await storage.createAIConversation(data);
      res.status(201).json(conversation);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create AI conversation' });
    }
  });

  app.get('/api/ai/conversations', async (_req: Request, res: Response) => {
    try {
      const conversations = await storage.getAIConversations();
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch AI conversations' });
    }
  });

  app.get('/api/ai/conversations/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid conversation ID' });
      }
      
      const conversation = await storage.getAIConversation(id);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch AI conversation' });
    }
  });

  app.get('/api/ai/conversations/persona/:id', async (req: Request, res: Response) => {
    try {
      const personaId = parseInt(req.params.id);
      if (isNaN(personaId)) {
        return res.status(400).json({ error: 'Invalid persona ID' });
      }
      
      const conversations = await storage.getAIConversationsByPersonaId(personaId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch AI conversations by persona' });
    }
  });

  // AI Message endpoint - for sending messages to AI personas
  app.post('/api/ai/message', async (req: Request, res: Response) => {
    try {
      const { personaId, content } = req.body;
      
      if (!personaId || !content) {
        return res.status(400).json({ error: 'PersonaId and content are required' });
      }
      
      // Get the persona to verify it exists
      const persona = await storage.getAIPersona(personaId);
      if (!persona) {
        return res.status(404).json({ error: 'AI Persona not found' });
      }
      
      // In a real application, this would make a call to an AI service
      // For our demo, we'll return a simple mock response
      const timestamp = new Date().toISOString();
      const responseId = `resp-${Date.now()}`;
      const responseContent = `Thank you for your message: "${content}". This is a placeholder response from ${persona.name}. The actual AI integration would be handled by the backend service.`;
      
      // Create a simulated AI message response
      const aiResponse = {
        id: responseId,
        conversationId: 1, // This would be a real conversation ID in a full implementation
        role: "assistant",
        content: responseContent,
        timestamp: timestamp
      };
      
      // Return the AI response
      res.status(200).json(aiResponse);
    } catch (error) {
      console.error('Error handling AI message:', error);
      res.status(500).json({ error: 'Failed to process AI message' });
    }
  });

  // Endpoint to get AI messages for a conversation
  app.get('/api/ai/messages', async (req: Request, res: Response) => {
    try {
      const personaId = req.query.personaId ? parseInt(req.query.personaId as string) : null;
      
      if (!personaId) {
        return res.status(400).json({ error: 'PersonaId query parameter is required' });
      }
      
      // In a real application, this would fetch messages from the database
      // For our demo, we'll return sample messages if available or an empty array
      
      // Example response for the escort persona (personaId === 2)
      if (personaId === 2) {
        const now = Date.now();
        const messages = [
          {
            id: "system-1",
            conversationId: 1,
            role: "system",
            content: "You are a professional escort providing information about premium experiences. Be informative, professional, and discrete.",
            timestamp: new Date(now - 1000 * 60 * 60).toISOString(),
          },
          {
            id: "user-1",
            conversationId: 1,
            role: "user",
            content: "Hello, I'm interested in booking the 1-hour Pornstar Girlfriend Experience. Can you tell me more about what it includes?",
            timestamp: new Date(now - 1000 * 60 * 10).toISOString(),
          },
          {
            id: "assistant-1",
            conversationId: 1,
            role: "assistant",
            content: "Hello there! Thank you for your interest in our 1-hour Pornstar Girlfriend Experience. This premium service is designed to provide you with an unforgettable and tailored experience in a professional and discreet environment.\n\nThe experience includes personalized attention and companionship for the full hour. The service is priced at AU$600.00 and can be booked at your preferred available time slot.\n\nWould you like me to help you check availability or answer any other questions you might have?",
            timestamp: new Date(now - 1000 * 60 * 9).toISOString(),
          },
          {
            id: "user-2",
            conversationId: 1,
            role: "user",
            content: "That sounds great. Is tomorrow afternoon available?",
            timestamp: new Date(now - 1000 * 60 * 5).toISOString(),
          },
          {
            id: "assistant-2",
            conversationId: 1,
            role: "assistant",
            content: "Let me check the availability for tomorrow afternoon. Looking at the calendar, I see several open slots between 1:00 PM and 6:00 PM. Would you prefer early afternoon or later in the day?\n\nOnce we confirm a time, I'll need your name and contact number to secure the booking.",
            timestamp: new Date(now - 1000 * 60 * 4).toISOString(),
          },
        ];
        return res.json(messages);
      }
      
      // Default empty conversation for other personas
      res.json([]);
    } catch (error) {
      console.error('Error fetching AI messages:', error);
      res.status(500).json({ error: 'Failed to fetch AI messages' });
    }
  });

  return httpServer;
}
