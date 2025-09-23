
import { relations, sql } from 'drizzle-orm';
import {
  mysqlTable,
  int,
  text,
  boolean,
  datetime,
  json,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const colleges = mysqlTable('colleges', {
  id: int('id').autoincrement().primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: datetime('created_at').default(sql`now()`).notNull(),
});

export const users = mysqlTable(
  'users',
  {
    id: int('id').autoincrement().primaryKey(),
    username: text('username').notNull(),
    password: text('password').notNull(),
    role: text('role').default('user').notNull(),
    collegeId: int('college_id').references(() => colleges.id),
    createdAt: datetime('created_at').default(sql`now()`).notNull(),
  },
  (table) => {
    return {
      uniqueIdx: uniqueIndex('unique_idx').on(table.collegeId, table.role),
    };
  },
);

export const sessions = mysqlTable('sessions', {
  id: int('id').autoincrement().primaryKey(),
  sessionToken: text('session_token').notNull(),
  userId: int('user_id').references(() => users.id),
  collegeCode: text('college_code'),
  nickname: text('nickname'),
  dailyConfessionCount: int('daily_confession_count').default(0).notNull(),
  lastResetDate: text('last_reset_date').notNull(),
  createdAt: datetime('created_at').default(sql`now()`).notNull(),
});

export const confessions = mysqlTable('confessions', {
  id: int('id').autoincrement().primaryKey(),
  content: text('content').notNull(),
  category: text('category').notNull(),
  collegeCode: text('college_code').notNull(),
  sessionId: int('session_id').references(() => sessions.id),
  nickname: text('nickname'),
  isApproved: boolean('is_approved').default(false).notNull(),
  isAnonymous: boolean('is_anonymous').default(true).notNull(),
  likes: int('likes').default(0).notNull(),
  commentCount: int('comment_count').default(0).notNull(),
  createdAt: datetime('created_at').default(sql`now()`).notNull(),
  updatedAt: datetime('updated_at').default(sql`now()`).notNull(),
});

export const comments = mysqlTable('comments', {
  id: int('id').autoincrement().primaryKey(),
  content: text('content').notNull(),
  confessionId: int('confession_id').references(() => confessions.id),
  sessionId: int('session_id').references(() => sessions.id),
  nickname: text('nickname'),
  isApproved: boolean('is_approved').default(false).notNull(),
  createdAt: datetime('created_at').default(sql`now()`).notNull(),
});

export const likes = mysqlTable('likes', {
  id: int('id').autoincrement().primaryKey(),
  confessionId: int('confession_id').references(() => confessions.id),
  sessionId: int('session_id').references(() => sessions.id),
  createdAt: datetime('created_at').default(sql`now()`).notNull(),
});

export const chatRooms = mysqlTable('chat_rooms', {
  id: int('id').autoincrement().primaryKey(),
  name: text('name').notNull(),
  collegeCode: text('college_code').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  maxParticipants: int('max_participants').default(50).notNull(),
  createdAt: datetime('created_at').default(sql`now()`).notNull(),
});

export const chatMessages = mysqlTable('chat_messages', {
  id: int('id').autoincrement().primaryKey(),
  content: text('content').notNull(),
  roomId: int('room_id').references(() => chatRooms.id),
  sessionId: int('session_id').references(() => sessions.id),
  nickname: text('nickname'),
  isPublic: boolean('is_public').default(true).notNull(),
  createdAt: datetime('created_at').default(sql`now()`).notNull(),
});

export const directMessages = mysqlTable('direct_messages', {
  id: int('id').autoincrement().primaryKey(),
  content: text('content').notNull(),
  fromSessionId: int('from_session_id').references(() => sessions.id),
  toSessionId: int('to_session_id').references(() => sessions.id),
  status: text('status').default('pending').notNull(),
  adminNote: text('admin_note'),
  createdAt: datetime('created_at').default(sql`now()`).notNull(),
  updatedAt: datetime('updated_at').default(sql`now()`).notNull(),
});

export const marketplaceItems = mysqlTable('marketplace_items', {
    id: int('id').autoincrement().primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    category: text('category').notNull(),
    price: int('price').notNull(),
    createdById: int('created_by_user_id').references(() => users.id),
    isActive: boolean('is_active').default(true).notNull(),
    features: json('features'),
    duration: int('duration'),
    createdAt: datetime('created_at').default(sql`now()`).notNull(),
    updatedAt: datetime('updated_at').default(sql`now()`).notNull(),
});

export const vipPurchases = mysqlTable('vip_purchases', {
    id: int('id').autoincrement().primaryKey(),
    userId: int('user_id').references(() => users.id),
    sessionId: int('session_id').references(() => sessions.id),
    marketplaceItemId: int('marketplace_item_id').references(() => marketplaceItems.id),
    tokensSpent: int('tokens_spent').notNull(),
    status: text('status').default('active').notNull(),
    expiresAt: datetime('expires_at'),
    purchasedAt: datetime('purchased_at').default(sql`now()`).notNull(),
    createdAt: datetime('created_at').default(sql`now()`).notNull(),
});

export const tokenTransactions = mysqlTable('token_transactions', {
    id: int('id').autoincrement().primaryKey(),
    userId: int('user_id').references(() => users.id),
    sessionId: int('session_id').references(() => sessions.id),
    type: text('type').notNull(),
    amount: int('amount').notNull(),
    description: text('description').notNull(),
    relatedItemId: varchar('related_item_id', { length: 191 }),
    paymentMethod: text('payment_method'),
    paymentReference: text('payment_reference'),
    createdAt: datetime('created_at').default(sql`now()`).notNull(),
});

export const userTokens = mysqlTable('user_tokens', {
    id: int('id').autoincrement().primaryKey(),
    userId: int('user_id').references(() => users.id),
    sessionId: int('session_id').references(() => sessions.id),
    balance: int('balance').default(0).notNull(),
    totalEarned: int('total_earned').default(0).notNull(),
    totalSpent: int('total_spent').default(0).notNull(),
    updatedAt: datetime('updated_at').default(sql`now()`).notNull(),
    createdAt: datetime('created_at').default(sql`now()`).notNull(),
});

export const vipMemberships = mysqlTable('vip_memberships', {
    id: int('id').autoincrement().primaryKey(),
    userId: int('user_id').references(() => users.id),
    sessionId: int('session_id').references(() => sessions.id),
    membershipType: text('membership_type').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    expiresAt: datetime('expires_at'),
    purchasedAt: datetime('purchased_at').default(sql`now()`).notNull(),
    createdAt: datetime('created_at').default(sql`now()`).notNull(),
});

export const insertConfessionSchema = createInsertSchema(confessions, {
  content: z.string().min(1),
});
export const insertCommentSchema = createInsertSchema(comments);
export const insertLikeSchema = createInsertSchema(likes);
export const insertChatMessageSchema = createInsertSchema(chatMessages);
export const insertDirectMessageSchema = createInsertSchema(directMessages);
export const insertMarketplaceItemSchema = createInsertSchema(marketplaceItems);
export const insertVipPurchaseSchema = createInsertSchema(vipPurchases);

export type Confession = typeof confessions.$inferSelect;
export type NewConfession = typeof confessions.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type Like = typeof likes.$inferSelect;
export type NewLike = typeof likes.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;
export type DirectMessage = typeof directMessages.$inferSelect;
export type NewDirectMessage = typeof directMessages.$inferInsert;
export type MarketplaceItem = typeof marketplaceItems.$inferSelect;
export type NewMarketplaceItem = typeof marketplaceItems.$inferInsert;
export type VipPurchase = typeof vipPurchases.$inferSelect;
export type NewVipPurchase = typeof vipPurchases.$inferInsert;