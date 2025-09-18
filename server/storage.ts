import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "../shared/schema.js";
import { eq, and, desc, asc, sql, count } from "drizzle-orm";
import bcrypt from "bcrypt";

let db: any;

// Check if we're in development mode and MySQL is not accessible
const isDevelopment = process.env.NODE_ENV === 'development';
const mysqlAvailable = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost');

try {
  if (isDevelopment && !mysqlAvailable) {
    // Use SQLite for local development
    const sqlite = new Database('local.db');
    db = drizzleSqlite(sqlite, { schema });
    console.log('Using SQLite for local development');
  } else {
    // Use MySQL for production or when available
    const pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      acquireTimeout: 60000
    });
    db = drizzle(pool, { schema, mode: "default" });
    console.log('Using MySQL database');
  }
} catch (error) {
  console.log('MySQL connection failed, falling back to SQLite');
  const sqlite = new Database('local.db');
  db = drizzleSqlite(sqlite, { schema });
}

export const storage = {
  // Session functions
  createSession: async function(data: { userId: string; token: string; expiresAt: Date }) {
    return await db.insert(schema.sessions).values(data);
  },

  getSessionByToken: async function(token: string) {
    const result = await db.select()
      .from(schema.sessions)
      .where(eq(schema.sessions.token, token))
      .limit(1);
    return result[0];
  },

  updateSession: async function(token: string, data: Partial<{ expiresAt: Date }>) {
    return await db.update(schema.sessions)
      .set(data)
      .where(eq(schema.sessions.token, token));
  },

  // User functions
  getUserByUsername: async function(username: string) {
    const result = await db.select()
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1);
    return result[0];
  },

  getUser: async function(id: string) {
    const result = await db.select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);
    return result[0];
  },

  createUser: async function(data: { username: string; password: string; collegeCode: string; role?: string }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return await db.insert(schema.users).values({
      ...data,
      password: hashedPassword,
      role: data.role || "user",
    });
  },

  getUsersByRole: async function(role: string) {
    return await db.select()
      .from(schema.users)
      .where(eq(schema.users.role, role));
  },

  // College functions
  getColleges: async function() {
    return await db.select().from(schema.colleges);
  },

  getCollegeByCode: async function(code: string) {
    const result = await db.select()
      .from(schema.colleges)
      .where(eq(schema.colleges.code, code))
      .limit(1);
    return result[0];
  },

  // Confession functions
  getConfessions: async function(filters?: { collegeCode?: string; approved?: boolean }) {
    let query = db.select({
      id: schema.confessions.id,
      content: schema.confessions.content,
      collegeCode: schema.confessions.collegeCode,
      createdAt: schema.confessions.createdAt,
      userId: schema.confessions.userId,
      likesCount: schema.confessions.likesCount,
      commentsCount: schema.confessions.commentsCount,
      isApproved: schema.confessions.isApproved,
    }).from(schema.confessions);

    if (filters?.collegeCode) {
      query = query.where(eq(schema.confessions.collegeCode, filters.collegeCode));
    }
    if (filters?.approved !== undefined) {
      query = query.where(eq(schema.confessions.isApproved, filters.approved));
    }

    return await query.orderBy(desc(schema.confessions.createdAt));
  },

  createConfession: async function(data: { content: string; collegeCode: string; userId: string }) {
    return await db.insert(schema.confessions).values({
      ...data,
      isApproved: false,
      likesCount: 0,
      commentsCount: 0,
    });
  },

  getConfession: async function(id: string) {
    const result = await db.select()
      .from(schema.confessions)
      .where(eq(schema.confessions.id, id))
      .limit(1);
    return result[0];
  },

  updateConfession: async function(id: string, data: Partial<{ isApproved: boolean }>) {
    return await db.update(schema.confessions)
      .set(data)
      .where(eq(schema.confessions.id, id));
  },

  deleteConfession: async function(id: string) {
    return await db.delete(schema.confessions)
      .where(eq(schema.confessions.id, id));
  },

  getPendingConfessions: async function() {
    return await db.select()
      .from(schema.confessions)
      .where(eq(schema.confessions.isApproved, false))
      .orderBy(desc(schema.confessions.createdAt));
  },

  // Comment functions
  getCommentsByConfession: async function(confessionId: string) {
    return await db.select()
      .from(schema.comments)
      .where(eq(schema.comments.confessionId, confessionId))
      .orderBy(asc(schema.comments.createdAt));
  },

  createComment: async function(data: { content: string; confessionId: string; userId: string }) {
    return await db.insert(schema.comments).values(data);
  },

  // Like functions
  hasUserLiked: async function(userId: string, confessionId: string) {
    const result = await db.select()
      .from(schema.likes)
      .where(and(
        eq(schema.likes.userId, userId),
        eq(schema.likes.confessionId, confessionId)
      ))
      .limit(1);
    return result.length > 0;
  },

  createLike: async function(data: { userId: string; confessionId: string }) {
    return await db.insert(schema.likes).values(data);
  },

  deleteLike: async function(userId: string, confessionId: string) {
    return await db.delete(schema.likes)
      .where(and(
        eq(schema.likes.userId, userId),
        eq(schema.likes.confessionId, confessionId)
      ));
  },

  // Direct Message functions
  getDirectMessages: async function(userId: string, otherUserId: string) {
    return await db.select()
      .from(schema.directMessages)
      .where(and(
        or(
          and(eq(schema.directMessages.senderId, userId), eq(schema.directMessages.receiverId, otherUserId)),
          and(eq(schema.directMessages.senderId, otherUserId), eq(schema.directMessages.receiverId, userId))
        ),
        eq(schema.directMessages.isApproved, true)
      ))
      .orderBy(asc(schema.directMessages.createdAt));
  },

  createDirectMessage: async function(data: { senderId: string; receiverId: string; content: string }) {
    return await db.insert(schema.directMessages).values({
      ...data,
      isApproved: false,
    });
  },

  updateDirectMessage: async function(id: string, data: Partial<{ isApproved: boolean }>) {
    return await db.update(schema.directMessages)
      .set(data)
      .where(eq(schema.directMessages.id, id));
  },

  getPendingDirectMessages: async function() {
    return await db.select()
      .from(schema.directMessages)
      .where(eq(schema.directMessages.isApproved, false))
      .orderBy(desc(schema.directMessages.createdAt));
  },

  // Chat Room functions
  getChatRooms: async function(collegeCode: string) {
    return await db.select()
      .from(schema.chatRooms)
      .where(eq(schema.chatRooms.collegeCode, collegeCode));
  },

  getChatMessages: async function(roomId: string) {
    return await db.select()
      .from(schema.chatMessages)
      .where(eq(schema.chatMessages.roomId, roomId))
      .orderBy(asc(schema.chatMessages.createdAt));
  },

  createChatMessage: async function(data: { content: string; roomId: string; userId: string }) {
    return await db.insert(schema.chatMessages).values(data);
  },

  // VIP System functions
  getUserTokens: async function(userId: string) {
    const result = await db.select()
      .from(schema.userTokens)
      .where(eq(schema.userTokens.userId, userId))
      .limit(1);
    return result[0];
  },

  createUserTokens: async function(data: { userId: string; balance: number }) {
    return await db.insert(schema.userTokens).values(data);
  },

  getVipMembership: async function(userId: string) {
    const result = await db.select()
      .from(schema.vipMemberships)
      .where(eq(schema.vipMemberships.userId, userId))
      .limit(1);
    return result[0];
  },

  createVipMembership: async function(data: { userId: string; expiresAt: Date }) {
    return await db.insert(schema.vipMemberships).values(data);
  },

  updateVipMembership: async function(userId: string, data: Partial<{ expiresAt: Date }>) {
    return await db.update(schema.vipMemberships)
      .set(data)
      .where(eq(schema.vipMemberships.userId, userId));
  },

  getMarketplaceItems: async function() {
    return await db.select().from(schema.marketplaceItems);
  },

  getMarketplaceItem: async function(id: string) {
    const result = await db.select()
      .from(schema.marketplaceItems)
      .where(eq(schema.marketplaceItems.id, id))
      .limit(1);
    return result[0];
  },

  createMarketplaceItem: async function(data: { name: string; description: string; price: number; type: string }) {
    return await db.insert(schema.marketplaceItems).values(data);
  },

  updateMarketplaceItem: async function(id: string, data: Partial<{ name: string; description: string; price: number; type: string }>) {
    return await db.update(schema.marketplaceItems)
      .set(data)
      .where(eq(schema.marketplaceItems.id, id));
  },

  getTokenTransactions: async function(userId: string) {
    return await db.select()
      .from(schema.tokenTransactions)
      .where(eq(schema.tokenTransactions.userId, userId))
      .orderBy(desc(schema.tokenTransactions.createdAt));
  },

  createTokenTransaction: async function(data: { userId: string; amount: number; type: string; description: string }) {
    return await db.insert(schema.tokenTransactions).values(data);
  },

  getVipPurchases: async function(userId: string) {
    return await db.select()
      .from(schema.vipPurchases)
      .where(eq(schema.vipPurchases.userId, userId))
      .orderBy(desc(schema.vipPurchases.createdAt));
  },

  createVipPurchase: async function(data: { userId: string; itemId: string; price: number }) {
    return await db.insert(schema.vipPurchases).values(data);
  },

  spendTokens: async function(userId: string, amount: number) {
    return await db.update(schema.userTokens)
      .set({ balance: sql`balance - ${amount}` })
      .where(eq(schema.userTokens.userId, userId));
  },

  addTokens: async function(userId: string, amount: number) {
    return await db.update(schema.userTokens)
      .set({ balance: sql`balance + ${amount}` })
      .where(eq(schema.userTokens.userId, userId));
  },
};