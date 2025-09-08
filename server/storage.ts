import { 
  type College, type User, type Session, type Confession, type Comment, 
  type DirectMessage, type ChatMessage, type Like, type ChatRoom,
  type UserTokens, type VipMembership, type MarketplaceItem, type TokenTransaction, type VipPurchase,
  type InsertCollege, type InsertUser, type InsertSession, type InsertConfession,
  type InsertComment, type InsertDirectMessage, type InsertChatMessage, type InsertLike,
  type InsertUserTokens, type InsertVipMembership, type InsertMarketplaceItem, 
  type InsertTokenTransaction, type InsertVipPurchase
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Sessions
  getSession(id: string): Promise<Session | undefined>;
  getSessionByToken(token: string): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: string, updates: Partial<Session>): Promise<Session | undefined>;
  
  // Colleges
  getColleges(): Promise<College[]>;
  getCollegeByCode(code: string): Promise<College | undefined>;
  createCollege(college: InsertCollege): Promise<College>;
  updateCollege(id: string, updates: Partial<College>): Promise<College | undefined>;
  deleteCollege(id: string): Promise<boolean>;
  
  // Confessions
  getConfessions(collegeCode?: string, limit?: number, offset?: number): Promise<Confession[]>;
  getConfession(id: string): Promise<Confession | undefined>;
  createConfession(confession: InsertConfession): Promise<Confession>;
  updateConfession(id: string, updates: Partial<Confession>): Promise<Confession | undefined>;
  deleteConfession(id: string): Promise<boolean>;
  getPendingConfessions(): Promise<Confession[]>;
  approveConfession(id: string): Promise<boolean>;
  
  // Comments
  getCommentsByConfession(confessionId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  approveComment(id: string): Promise<boolean>;
  deleteComment(id: string): Promise<boolean>;
  
  // Direct Messages
  getDirectMessages(sessionId: string): Promise<DirectMessage[]>;
  getPendingDirectMessages(): Promise<DirectMessage[]>;
  createDirectMessage(dm: InsertDirectMessage): Promise<DirectMessage>;
  updateDirectMessage(id: string, updates: Partial<DirectMessage>): Promise<DirectMessage | undefined>;
  
  // Chat
  getChatRooms(collegeCode?: string): Promise<ChatRoom[]>;
  getChatMessages(roomId: string, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Likes
  getLikesByConfession(confessionId: string): Promise<Like[]>;
  createLike(like: InsertLike): Promise<Like>;
  deleteLike(confessionId: string, sessionId: string): Promise<boolean>;
  hasUserLiked(confessionId: string, sessionId: string): Promise<boolean>;

  // VIP System - Tokens
  getUserTokens(userId?: string, sessionId?: string): Promise<UserTokens | undefined>;
  createUserTokens(tokens: InsertUserTokens): Promise<UserTokens>;
  updateUserTokens(userId: string, updates: Partial<UserTokens>): Promise<UserTokens | undefined>;
  addTokens(userId: string, sessionId: string, amount: number, description: string): Promise<boolean>;
  spendTokens(userId: string, sessionId: string, amount: number, description: string): Promise<boolean>;

  // VIP System - Memberships
  getVipMembership(userId?: string, sessionId?: string): Promise<VipMembership | undefined>;
  createVipMembership(membership: InsertVipMembership): Promise<VipMembership>;
  updateVipMembership(id: string, updates: Partial<VipMembership>): Promise<VipMembership | undefined>;

  // VIP System - Marketplace
  getMarketplaceItems(): Promise<MarketplaceItem[]>;
  getMarketplaceItem(id: string): Promise<MarketplaceItem | undefined>;
  createMarketplaceItem(item: InsertMarketplaceItem): Promise<MarketplaceItem>;
  updateMarketplaceItem(id: string, updates: Partial<MarketplaceItem>): Promise<MarketplaceItem | undefined>;
  deleteMarketplaceItem(id: string): Promise<boolean>;

  // VIP System - Transactions
  getTokenTransactions(userId?: string, sessionId?: string): Promise<TokenTransaction[]>;
  createTokenTransaction(transaction: InsertTokenTransaction): Promise<TokenTransaction>;

  // VIP System - Purchases
  getVipPurchases(userId?: string, sessionId?: string): Promise<VipPurchase[]>;
  createVipPurchase(purchase: InsertVipPurchase): Promise<VipPurchase>;
  updateVipPurchase(id: string, updates: Partial<VipPurchase>): Promise<VipPurchase | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private sessions: Map<string, Session> = new Map();
  private colleges: Map<string, College> = new Map();
  private confessions: Map<string, Confession> = new Map();
  private comments: Map<string, Comment> = new Map();
  private directMessages: Map<string, DirectMessage> = new Map();
  private chatRooms: Map<string, ChatRoom> = new Map();
  private chatMessages: Map<string, ChatMessage> = new Map();
  private likes: Map<string, Like> = new Map();
  
  // VIP System Storage
  private userTokens: Map<string, UserTokens> = new Map();
  private vipMemberships: Map<string, VipMembership> = new Map();
  private marketplaceItems: Map<string, MarketplaceItem> = new Map();
  private tokenTransactions: Map<string, TokenTransaction> = new Map();
  private vipPurchases: Map<string, VipPurchase> = new Map();

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default admin user
    const adminId = randomUUID();
    const admin: User = {
      id: adminId,
      username: "admin",
      password: "secretchat2024", // In production, this should be hashed
      role: "admin",
      collegeId: null,
      createdAt: new Date(),
    };
    this.users.set(adminId, admin);

    // Create sample colleges
    const colleges = [
      { name: "University of California, Los Angeles", code: "UCLA123" },
      { name: "New York University", code: "NYU456" },
      { name: "University of Texas at Austin", code: "UT789" },
      { name: "University of Washington", code: "UW012" },
    ];

    colleges.forEach(college => {
      const id = randomUUID();
      this.colleges.set(id, {
        id,
        name: college.name,
        code: college.code,
        isActive: true,
        createdAt: new Date(),
      });
    });

    // Create default chat rooms
    Array.from(this.colleges.values()).forEach(college => {
      const roomId = randomUUID();
      this.chatRooms.set(roomId, {
        id: roomId,
        name: "General Chat",
        collegeCode: college.code,
        isActive: true,
        maxParticipants: 50,
        createdAt: new Date(),
      });
    });

    // Create default marketplace items
    const marketplaceItems = [
      {
        title: "VIP Unlimited Confessions",
        description: "Remove daily confession limits and post unlimited confessions",
        category: "vip_features",
        price: 50,
        features: ["unlimited_confessions", "priority_moderation"],
        duration: 30,
      },
      {
        title: "Premium Chat Access",
        description: "Access to exclusive VIP chat rooms and direct messaging",
        category: "premium_services", 
        price: 75,
        features: ["vip_chat_rooms", "direct_messaging", "custom_nickname_colors"],
        duration: 30,
      },
      {
        title: "Elite Membership",
        description: "Full access to all premium features and special badges",
        category: "special_access",
        price: 150,
        features: ["all_vip_features", "elite_badge", "priority_support", "custom_themes"],
        duration: 30,
      },
    ];

    marketplaceItems.forEach(item => {
      const id = randomUUID();
      this.marketplaceItems.set(id, {
        id,
        ...item,
        createdByUserId: adminId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Sessions
  async getSession(id: string): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async getSessionByToken(token: string): Promise<Session | undefined> {
    return Array.from(this.sessions.values()).find(session => session.sessionToken === token);
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = randomUUID();
    const session: Session = { 
      ...insertSession, 
      id,
      createdAt: new Date(),
    };
    this.sessions.set(id, session);
    return session;
  }

  async updateSession(id: string, updates: Partial<Session>): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    const updated = { ...session, ...updates };
    this.sessions.set(id, updated);
    return updated;
  }

  // Colleges
  async getColleges(): Promise<College[]> {
    return Array.from(this.colleges.values()).filter(college => college.isActive);
  }

  async getCollegeByCode(code: string): Promise<College | undefined> {
    return Array.from(this.colleges.values()).find(college => college.code === code);
  }

  async createCollege(insertCollege: InsertCollege): Promise<College> {
    const id = randomUUID();
    const college: College = { 
      ...insertCollege, 
      id,
      createdAt: new Date(),
    };
    this.colleges.set(id, college);
    return college;
  }

  async updateCollege(id: string, updates: Partial<College>): Promise<College | undefined> {
    const college = this.colleges.get(id);
    if (!college) return undefined;
    
    const updated = { ...college, ...updates };
    this.colleges.set(id, updated);
    return updated;
  }

  async deleteCollege(id: string): Promise<boolean> {
    return this.colleges.delete(id);
  }

  // Confessions
  async getConfessions(collegeCode?: string, limit = 50, offset = 0): Promise<Confession[]> {
    let confessions = Array.from(this.confessions.values())
      .filter(confession => confession.isApproved);
    
    if (collegeCode) {
      confessions = confessions.filter(confession => confession.collegeCode === collegeCode);
    }
    
    return confessions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);
  }

  async getConfession(id: string): Promise<Confession | undefined> {
    return this.confessions.get(id);
  }

  async createConfession(insertConfession: InsertConfession): Promise<Confession> {
    const id = randomUUID();
    const confession: Confession = { 
      ...insertConfession, 
      id,
      isApproved: false,
      likes: 0,
      commentCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.confessions.set(id, confession);
    return confession;
  }

  async updateConfession(id: string, updates: Partial<Confession>): Promise<Confession | undefined> {
    const confession = this.confessions.get(id);
    if (!confession) return undefined;
    
    const updated = { ...confession, ...updates, updatedAt: new Date() };
    this.confessions.set(id, updated);
    return updated;
  }

  async deleteConfession(id: string): Promise<boolean> {
    return this.confessions.delete(id);
  }

  async getPendingConfessions(): Promise<Confession[]> {
    return Array.from(this.confessions.values())
      .filter(confession => !confession.isApproved)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async approveConfession(id: string): Promise<boolean> {
    const confession = this.confessions.get(id);
    if (!confession) return false;
    
    confession.isApproved = true;
    confession.updatedAt = new Date();
    return true;
  }

  // Comments
  async getCommentsByConfession(confessionId: string): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.confessionId === confessionId && comment.isApproved)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = { 
      ...insertComment, 
      id,
      isApproved: false,
      createdAt: new Date(),
    };
    this.comments.set(id, comment);
    return comment;
  }

  async approveComment(id: string): Promise<boolean> {
    const comment = this.comments.get(id);
    if (!comment) return false;
    
    comment.isApproved = true;
    return true;
  }

  async deleteComment(id: string): Promise<boolean> {
    return this.comments.delete(id);
  }

  // Direct Messages
  async getDirectMessages(sessionId: string): Promise<DirectMessage[]> {
    return Array.from(this.directMessages.values())
      .filter(dm => dm.fromSessionId === sessionId || dm.toSessionId === sessionId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getPendingDirectMessages(): Promise<DirectMessage[]> {
    return Array.from(this.directMessages.values())
      .filter(dm => dm.status === "pending")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createDirectMessage(insertDM: InsertDirectMessage): Promise<DirectMessage> {
    const id = randomUUID();
    const dm: DirectMessage = { 
      ...insertDM, 
      id,
      status: "pending",
      adminNote: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.directMessages.set(id, dm);
    return dm;
  }

  async updateDirectMessage(id: string, updates: Partial<DirectMessage>): Promise<DirectMessage | undefined> {
    const dm = this.directMessages.get(id);
    if (!dm) return undefined;
    
    const updated = { ...dm, ...updates, updatedAt: new Date() };
    this.directMessages.set(id, updated);
    return updated;
  }

  // Chat
  async getChatRooms(collegeCode?: string): Promise<ChatRoom[]> {
    let rooms = Array.from(this.chatRooms.values()).filter(room => room.isActive);
    
    if (collegeCode) {
      rooms = rooms.filter(room => room.collegeCode === collegeCode);
    }
    
    return rooms;
  }

  async getChatMessages(roomId: string, limit = 50): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.roomId === roomId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = { 
      ...insertMessage, 
      id,
      createdAt: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  // Likes
  async getLikesByConfession(confessionId: string): Promise<Like[]> {
    return Array.from(this.likes.values())
      .filter(like => like.confessionId === confessionId);
  }

  async createLike(insertLike: InsertLike): Promise<Like> {
    const id = randomUUID();
    const like: Like = { 
      ...insertLike, 
      id,
      createdAt: new Date(),
    };
    this.likes.set(id, like);
    
    // Update confession like count
    const confession = this.confessions.get(insertLike.confessionId!);
    if (confession) {
      confession.likes++;
    }
    
    return like;
  }

  async deleteLike(confessionId: string, sessionId: string): Promise<boolean> {
    const like = Array.from(this.likes.values())
      .find(like => like.confessionId === confessionId && like.sessionId === sessionId);
    
    if (!like) return false;
    
    this.likes.delete(like.id);
    
    // Update confession like count
    const confession = this.confessions.get(confessionId);
    if (confession && confession.likes > 0) {
      confession.likes--;
    }
    
    return true;
  }

  async hasUserLiked(confessionId: string, sessionId: string): Promise<boolean> {
    return Array.from(this.likes.values())
      .some(like => like.confessionId === confessionId && like.sessionId === sessionId);
  }

  // VIP System - Tokens
  async getUserTokens(userId?: string, sessionId?: string): Promise<UserTokens | undefined> {
    return Array.from(this.userTokens.values())
      .find(tokens => tokens.userId === userId || tokens.sessionId === sessionId);
  }

  async createUserTokens(insertTokens: InsertUserTokens): Promise<UserTokens> {
    const id = randomUUID();
    const tokens: UserTokens = { 
      ...insertTokens, 
      id,
      totalEarned: 0,
      totalSpent: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.userTokens.set(id, tokens);
    return tokens;
  }

  async updateUserTokens(userId: string, updates: Partial<UserTokens>): Promise<UserTokens | undefined> {
    const tokens = Array.from(this.userTokens.values())
      .find(t => t.userId === userId);
    if (!tokens) return undefined;
    
    const updated = { ...tokens, ...updates, updatedAt: new Date() };
    this.userTokens.set(tokens.id, updated);
    return updated;
  }

  async addTokens(userId: string, sessionId: string, amount: number, description: string): Promise<boolean> {
    let tokens = await this.getUserTokens(userId, sessionId);
    
    if (!tokens) {
      tokens = await this.createUserTokens({ userId, sessionId, balance: 0 });
    }
    
    const updated = await this.updateUserTokens(tokens.userId!, {
      balance: tokens.balance + amount,
      totalEarned: tokens.totalEarned + amount,
    });

    // Create transaction record
    await this.createTokenTransaction({
      userId,
      sessionId,
      type: "earn",
      amount,
      description,
    });

    return !!updated;
  }

  async spendTokens(userId: string, sessionId: string, amount: number, description: string): Promise<boolean> {
    const tokens = await this.getUserTokens(userId, sessionId);
    
    if (!tokens || tokens.balance < amount) {
      return false;
    }
    
    const updated = await this.updateUserTokens(tokens.userId!, {
      balance: tokens.balance - amount,
      totalSpent: tokens.totalSpent + amount,
    });

    // Create transaction record
    await this.createTokenTransaction({
      userId,
      sessionId,
      type: "spend",
      amount: -amount,
      description,
    });

    return !!updated;
  }

  // VIP System - Memberships
  async getVipMembership(userId?: string, sessionId?: string): Promise<VipMembership | undefined> {
    return Array.from(this.vipMemberships.values())
      .find(membership => 
        (membership.userId === userId || membership.sessionId === sessionId) && 
        membership.isActive &&
        (!membership.expiresAt || new Date(membership.expiresAt) > new Date())
      );
  }

  async createVipMembership(insertMembership: InsertVipMembership): Promise<VipMembership> {
    const id = randomUUID();
    const membership: VipMembership = { 
      ...insertMembership, 
      id,
      purchasedAt: new Date(),
      createdAt: new Date(),
    };
    this.vipMemberships.set(id, membership);
    return membership;
  }

  async updateVipMembership(id: string, updates: Partial<VipMembership>): Promise<VipMembership | undefined> {
    const membership = this.vipMemberships.get(id);
    if (!membership) return undefined;
    
    const updated = { ...membership, ...updates };
    this.vipMemberships.set(id, updated);
    return updated;
  }

  // VIP System - Marketplace
  async getMarketplaceItems(): Promise<MarketplaceItem[]> {
    return Array.from(this.marketplaceItems.values())
      .filter(item => item.isActive)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getMarketplaceItem(id: string): Promise<MarketplaceItem | undefined> {
    return this.marketplaceItems.get(id);
  }

  async createMarketplaceItem(insertItem: InsertMarketplaceItem): Promise<MarketplaceItem> {
    const id = randomUUID();
    const item: MarketplaceItem = { 
      ...insertItem, 
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.marketplaceItems.set(id, item);
    return item;
  }

  async updateMarketplaceItem(id: string, updates: Partial<MarketplaceItem>): Promise<MarketplaceItem | undefined> {
    const item = this.marketplaceItems.get(id);
    if (!item) return undefined;
    
    const updated = { ...item, ...updates, updatedAt: new Date() };
    this.marketplaceItems.set(id, updated);
    return updated;
  }

  async deleteMarketplaceItem(id: string): Promise<boolean> {
    return this.marketplaceItems.delete(id);
  }

  // VIP System - Transactions
  async getTokenTransactions(userId?: string, sessionId?: string): Promise<TokenTransaction[]> {
    return Array.from(this.tokenTransactions.values())
      .filter(transaction => transaction.userId === userId || transaction.sessionId === sessionId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createTokenTransaction(insertTransaction: InsertTokenTransaction): Promise<TokenTransaction> {
    const id = randomUUID();
    const transaction: TokenTransaction = { 
      ...insertTransaction, 
      id,
      createdAt: new Date(),
    };
    this.tokenTransactions.set(id, transaction);
    return transaction;
  }

  // VIP System - Purchases
  async getVipPurchases(userId?: string, sessionId?: string): Promise<VipPurchase[]> {
    return Array.from(this.vipPurchases.values())
      .filter(purchase => purchase.userId === userId || purchase.sessionId === sessionId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createVipPurchase(insertPurchase: InsertVipPurchase): Promise<VipPurchase> {
    const id = randomUUID();
    const purchase: VipPurchase = { 
      ...insertPurchase, 
      id,
      purchasedAt: new Date(),
      createdAt: new Date(),
    };
    this.vipPurchases.set(id, purchase);
    return purchase;
  }

  async updateVipPurchase(id: string, updates: Partial<VipPurchase>): Promise<VipPurchase | undefined> {
    const purchase = this.vipPurchases.get(id);
    if (!purchase) return undefined;
    
    const updated = { ...purchase, ...updates };
    this.vipPurchases.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
