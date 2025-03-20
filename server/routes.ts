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
  app.get('/api/services', async (_req: Request, res: Response) => {
    try {
      const services = await storage.getServices();
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

  return httpServer;
}
