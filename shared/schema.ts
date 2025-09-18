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

// VIP System Tables
export const userTokens = pgTable("user_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id").references(() => sessions.id),
  balance: integer("balance").notNull().default(0),
  totalEarned: integer("total_earned").notNull().default(0),
  totalSpent: integer("total_spent").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const vipMemberships = pgTable("vip_memberships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id").references(() => sessions.id),
  membershipType: text("membership_type").notNull(), // basic, premium, elite
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  purchasedAt: timestamp("purchased_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const marketplaceItems = pgTable("marketplace_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // vip_features, premium_services, special_access
  price: integer("price").notNull(), // price in tokens
  createdByUserId: varchar("created_by_user_id").references(() => users.id),
  isActive: boolean("is_active").notNull().default(true),
  features: jsonb("features"), // array of features included
  duration: integer("duration"), // duration in days (null for permanent)
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tokenTransactions = pgTable("token_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id").references(() => sessions.id),
  type: text("type").notNull(), // purchase, spend, earn, refund
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  relatedItemId: varchar("related_item_id"), // marketplace item or service purchased
  paymentMethod: text("payment_method"), // stripe, admin_grant, etc
  paymentReference: text("payment_reference"), // external payment ID
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const vipPurchases = pgTable("vip_purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id").references(() => sessions.id),
  marketplaceItemId: varchar("marketplace_item_id").references(() => marketplaceItems.id),
  tokensSpent: integer("tokens_spent").notNull(),
  status: text("status").notNull().default("active"), // active, expired, refunded
  expiresAt: timestamp("expires_at"),
  purchasedAt: timestamp("purchased_at").notNull().defaultNow(),
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

// VIP System Insert Schemas
export const insertUserTokensSchema = createInsertSchema(userTokens).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  totalEarned: true,
  totalSpent: true 
});
export const insertVipMembershipSchema = createInsertSchema(vipMemberships).omit({ 
  id: true, 
  createdAt: true,
  purchasedAt: true 
});
export const insertMarketplaceItemSchema = createInsertSchema(marketplaceItems).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const insertTokenTransactionSchema = createInsertSchema(tokenTransactions).omit({ 
  id: true, 
  createdAt: true 
});
export const insertVipPurchaseSchema = createInsertSchema(vipPurchases).omit({ 
  id: true, 
  createdAt: true,
  purchasedAt: true 
});

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

// VIP System Types
export type UserTokens = typeof userTokens.$inferSelect;
export type VipMembership = typeof vipMemberships.$inferSelect;
export type MarketplaceItem = typeof marketplaceItems.$inferSelect;
export type TokenTransaction = typeof tokenTransactions.$inferSelect;
export type VipPurchase = typeof vipPurchases.$inferSelect;

export type InsertUserTokens = z.infer<typeof insertUserTokensSchema>;
export type InsertVipMembership = z.infer<typeof insertVipMembershipSchema>;
export type InsertMarketplaceItem = z.infer<typeof insertMarketplaceItemSchema>;
export type InsertTokenTransaction = z.infer<typeof insertTokenTransactionSchema>;
export type InsertVipPurchase = z.infer<typeof insertVipPurchaseSchema>;