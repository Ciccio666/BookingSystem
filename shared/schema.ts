import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  phone: text("phone"),
  role: text("role").default("client"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Services schema
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // duration in minutes
  price: integer("price").notNull(), // price in cents
  active: boolean("active").default(true),
  position: integer("position").default(0), // for ordering services
  photo: text("photo"), // Base64 encoded service image
  bufferBefore: text("buffer_before").default("0"), // Buffer time in minutes before appointment
  bufferAfter: text("buffer_after").default("0"), // Buffer time in minutes after appointment
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
});

// Availability schema
export const availability = pgTable("availability", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull(), // References users with provider role
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 for Sunday-Saturday
  startTime: text("start_time").notNull(), // HH:MM format
  endTime: text("end_time").notNull(), // HH:MM format
  isAvailable: boolean("is_available").default(true),
});

export const insertAvailabilitySchema = createInsertSchema(availability).omit({
  id: true,
});

// Bookings schema
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").notNull(),
  clientName: text("client_name").notNull(),
  clientPhone: text("client_phone").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  providerId: integer("provider_id"), // References users with provider role
  status: text("status").default("pending"), // pending, confirmed, cancelled, completed
  extras: jsonb("extras"),
  totalPrice: integer("total_price").notNull(), // price in cents
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  status: true,
  endTime: true,
});

// Messages schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id"), // null for system/ai messages
  receiverId: integer("receiver_id"), // null for broadcast messages
  content: text("content").notNull(),
  channel: text("channel").default("sms"), // sms, whatsapp, ai
  status: text("status").default("sent"), // sent, delivered, read, failed
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata"),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
  status: true,
});

// AI Personas schema
export const aiPersonas = pgTable("ai_personas", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  systemPrompt: text("system_prompt").notNull(),
  icon: text("icon").default("robot"),
  iconColor: text("icon_color").default("blue"),
  active: boolean("active").default(true),
});

export const insertAIPersonaSchema = createInsertSchema(aiPersonas).omit({
  id: true,
});

// AI Settings schema
export const aiSettings = pgTable("ai_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value"),
  description: text("description"),
});

export const insertAISettingSchema = createInsertSchema(aiSettings).omit({
  id: true,
});

// AI Conversations schema
export const aiConversations = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  personaId: integer("persona_id").notNull(),
  userId: integer("user_id"), // null for anonymous conversations
  title: text("title").default("New Conversation"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAIConversationSchema = createInsertSchema(aiConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type Availability = typeof availability.$inferSelect;
export type InsertAvailability = z.infer<typeof insertAvailabilitySchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type AIPersona = typeof aiPersonas.$inferSelect;
export type InsertAIPersona = z.infer<typeof insertAIPersonaSchema>;

export type AISetting = typeof aiSettings.$inferSelect;
export type InsertAISetting = z.infer<typeof insertAISettingSchema>;

export type AIConversation = typeof aiConversations.$inferSelect;
export type InsertAIConversation = z.infer<typeof insertAIConversationSchema>;
