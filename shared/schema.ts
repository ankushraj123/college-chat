import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const colleges = pgTable("colleges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
  collegeId: varchar("college_id").references(() => colleges.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionToken: text("session_token").notNull().unique(),
  userId: varchar("user_id").references(() => users.id),
  collegeCode: text("college_code"),
  nickname: text("nickname"),
  dailyConfessionCount: integer("daily_confession_count").notNull().default(0),
  lastResetDate: text("last_reset_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const confessions = pgTable("confessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  category: text("category").notNull(),
  collegeCode: text("college_code").notNull(),
  sessionId: varchar("session_id").references(() => sessions.id),
  nickname: text("nickname"),
  isApproved: boolean("is_approved").notNull().default(false),
  isAnonymous: boolean("is_anonymous").notNull().default(true),
  likes: integer("likes").notNull().default(0),
  commentCount: integer("comment_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  confessionId: varchar("confession_id").references(() => confessions.id),
  sessionId: varchar("session_id").references(() => sessions.id),
  nickname: text("nickname"),
  isApproved: boolean("is_approved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const directMessages = pgTable("direct_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  fromSessionId: varchar("from_session_id").references(() => sessions.id),
  toSessionId: varchar("to_session_id").references(() => sessions.id),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const chatRooms = pgTable("chat_rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  collegeCode: text("college_code").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  maxParticipants: integer("max_participants").notNull().default(50),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  roomId: varchar("room_id").references(() => chatRooms.id),
  sessionId: varchar("session_id").references(() => sessions.id),
  nickname: text("nickname"),
  isPublic: boolean("is_public").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const likes = pgTable("likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  confessionId: varchar("confession_id").references(() => confessions.id),
  sessionId: varchar("session_id").references(() => sessions.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertCollegeSchema = createInsertSchema(colleges).omit({ id: true, createdAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true, createdAt: true });
export const insertConfessionSchema = createInsertSchema(confessions).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true, 
  likes: true, 
  commentCount: true,
  isApproved: true 
});
export const insertCommentSchema = createInsertSchema(comments).omit({ 
  id: true, 
  createdAt: true,
  isApproved: true 
});
export const insertDirectMessageSchema = createInsertSchema(directMessages).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  status: true,
  adminNote: true 
});
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });
export const insertLikeSchema = createInsertSchema(likes).omit({ id: true, createdAt: true });

// Types
export type College = typeof colleges.$inferSelect;
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Confession = typeof confessions.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type DirectMessage = typeof directMessages.$inferSelect;
export type ChatRoom = typeof chatRooms.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type Like = typeof likes.$inferSelect;

export type InsertCollege = z.infer<typeof insertCollegeSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type InsertConfession = z.infer<typeof insertConfessionSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertDirectMessage = z.infer<typeof insertDirectMessageSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type InsertLike = z.infer<typeof insertLikeSchema>;
