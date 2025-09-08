import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConfessionSchema, insertCommentSchema, insertDirectMessageSchema, insertChatMessageSchema, insertLikeSchema, insertUserSchema, insertSessionSchema, insertMarketplaceItemSchema, insertVipPurchaseSchema } from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Helper function to get or create session
  const getOrCreateSession = async (req: any) => {
    let sessionToken = req.headers['x-session-token'];
    
    if (!sessionToken) {
      sessionToken = randomUUID();
      const session = await storage.createSession({
        sessionToken,
        userId: null,
        collegeCode: null,
        nickname: null,
        dailyConfessionCount: 0,
        lastResetDate: new Date().toDateString(),
      });
      return { session, isNew: true };
    }
    
    let session = await storage.getSessionByToken(sessionToken);
    if (!session) {
      session = await storage.createSession({
        sessionToken,
        userId: null,
        collegeCode: null,
        nickname: null,
        dailyConfessionCount: 0,
        lastResetDate: new Date().toDateString(),
      });
      return { session, isNew: true };
    }
    
    // Reset daily count if it's a new day
    const today = new Date().toDateString();
    if (session.lastResetDate !== today) {
      await storage.updateSession(session.id, {
        dailyConfessionCount: 0,
        lastResetDate: today,
      });
      session.dailyConfessionCount = 0;
      session.lastResetDate = today;
    }
    
    return { session, isNew: false };
  };

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const sessionToken = randomUUID();
      const session = await storage.createSession({
        sessionToken,
        userId: user.id,
        collegeCode: null,
        nickname: null,
        dailyConfessionCount: 0,
        lastResetDate: new Date().toDateString(),
      });
      
      res.json({ user, sessionToken, session });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const sessionToken = req.headers['x-session-token'];
      if (!sessionToken) {
        return res.status(401).json({ error: "No session token" });
      }
      
      const session = await storage.getSessionByToken(sessionToken as string);
      if (!session?.userId) {
        return res.status(401).json({ error: "Invalid session" });
      }
      
      const user = await storage.getUser(session.userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to get user info" });
    }
  });

  // Session routes
  app.get("/api/session", async (req, res) => {
    try {
      const { session, isNew } = await getOrCreateSession(req);
      res.json({ session, isNew });
    } catch (error) {
      res.status(500).json({ error: "Failed to get session" });
    }
  });

  app.put("/api/session", async (req, res) => {
    try {
      const { session } = await getOrCreateSession(req);
      const updates = req.body;
      
      const updatedSession = await storage.updateSession(session.id, updates);
      res.json(updatedSession);
    } catch (error) {
      res.status(500).json({ error: "Failed to update session" });
    }
  });

  // College routes
  app.get("/api/colleges", async (req, res) => {
    try {
      const colleges = await storage.getColleges();
      res.json(colleges);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch colleges" });
    }
  });

  app.get("/api/colleges/:code", async (req, res) => {
    try {
      const college = await storage.getCollegeByCode(req.params.code);
      if (!college) {
        return res.status(404).json({ error: "College not found" });
      }
      res.json(college);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch college" });
    }
  });

  // Confession routes
  app.get("/api/confessions", async (req, res) => {
    try {
      const { collegeCode, limit, offset } = req.query;
      const confessions = await storage.getConfessions(
        collegeCode as string,
        limit ? parseInt(limit as string) : undefined,
        offset ? parseInt(offset as string) : undefined
      );
      res.json(confessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch confessions" });
    }
  });

  app.post("/api/confessions", async (req, res) => {
    try {
      const { session } = await getOrCreateSession(req);
      
      // Check daily limit
      if (session.dailyConfessionCount >= 5) {
        return res.status(429).json({ error: "Daily confession limit reached" });
      }
      
      const validatedData = insertConfessionSchema.parse(req.body);
      const confession = await storage.createConfession({
        ...validatedData,
        sessionId: session.id,
      });
      
      // Update daily count
      await storage.updateSession(session.id, {
        dailyConfessionCount: session.dailyConfessionCount + 1,
      });
      
      res.json(confession);
    } catch (error) {
      res.status(400).json({ error: "Failed to create confession" });
    }
  });

  app.get("/api/confessions/:id", async (req, res) => {
    try {
      const confession = await storage.getConfession(req.params.id);
      if (!confession) {
        return res.status(404).json({ error: "Confession not found" });
      }
      res.json(confession);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch confession" });
    }
  });

  // Comment routes
  app.get("/api/confessions/:id/comments", async (req, res) => {
    try {
      const comments = await storage.getCommentsByConfession(req.params.id);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/confessions/:id/comments", async (req, res) => {
    try {
      const { session } = await getOrCreateSession(req);
      const validatedData = insertCommentSchema.parse(req.body);
      
      const comment = await storage.createComment({
        ...validatedData,
        confessionId: req.params.id,
        sessionId: session.id,
      });
      
      res.json(comment);
    } catch (error) {
      res.status(400).json({ error: "Failed to create comment" });
    }
  });

  // Like routes
  app.post("/api/confessions/:id/like", async (req, res) => {
    try {
      const { session } = await getOrCreateSession(req);
      const confessionId = req.params.id;
      
      const hasLiked = await storage.hasUserLiked(confessionId, session.id);
      if (hasLiked) {
        await storage.deleteLike(confessionId, session.id);
        res.json({ action: "unliked" });
      } else {
        await storage.createLike({
          confessionId,
          sessionId: session.id,
        });
        res.json({ action: "liked" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle like" });
    }
  });

  // Direct message routes
  app.get("/api/direct-messages", async (req, res) => {
    try {
      const { session } = await getOrCreateSession(req);
      const messages = await storage.getDirectMessages(session.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch direct messages" });
    }
  });

  app.post("/api/direct-messages", async (req, res) => {
    try {
      const { session } = await getOrCreateSession(req);
      const validatedData = insertDirectMessageSchema.parse(req.body);
      
      const dm = await storage.createDirectMessage({
        ...validatedData,
        fromSessionId: session.id,
      });
      
      res.json(dm);
    } catch (error) {
      res.status(400).json({ error: "Failed to create direct message" });
    }
  });

  // Chat routes
  app.get("/api/chat/rooms", async (req, res) => {
    try {
      const { collegeCode } = req.query;
      const rooms = await storage.getChatRooms(collegeCode as string);
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat rooms" });
    }
  });

  app.get("/api/chat/rooms/:id/messages", async (req, res) => {
    try {
      const { limit } = req.query;
      const messages = await storage.getChatMessages(
        req.params.id,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/chat/rooms/:id/messages", async (req, res) => {
    try {
      const { session } = await getOrCreateSession(req);
      const validatedData = insertChatMessageSchema.parse(req.body);
      
      const message = await storage.createChatMessage({
        ...validatedData,
        roomId: req.params.id,
        sessionId: session.id,
      });
      
      res.json(message);
    } catch (error) {
      res.status(400).json({ error: "Failed to create chat message" });
    }
  });

  // Admin routes
  app.get("/api/admin/confessions/pending", async (req, res) => {
    try {
      const sessionToken = req.headers['x-session-token'];
      if (!sessionToken) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const session = await storage.getSessionByToken(sessionToken as string);
      if (!session?.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const user = await storage.getUser(session.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const confessions = await storage.getPendingConfessions();
      res.json(confessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending confessions" });
    }
  });

  app.post("/api/admin/confessions/:id/approve", async (req, res) => {
    try {
      const sessionToken = req.headers['x-session-token'];
      if (!sessionToken) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const session = await storage.getSessionByToken(sessionToken as string);
      if (!session?.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const user = await storage.getUser(session.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const success = await storage.approveConfession(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Confession not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to approve confession" });
    }
  });

  app.delete("/api/admin/confessions/:id", async (req, res) => {
    try {
      const sessionToken = req.headers['x-session-token'];
      if (!sessionToken) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const session = await storage.getSessionByToken(sessionToken as string);
      if (!session?.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const user = await storage.getUser(session.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const success = await storage.deleteConfession(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Confession not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete confession" });
    }
  });

  app.get("/api/admin/direct-messages/pending", async (req, res) => {
    try {
      const sessionToken = req.headers['x-session-token'];
      if (!sessionToken) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const session = await storage.getSessionByToken(sessionToken as string);
      if (!session?.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const user = await storage.getUser(session.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const messages = await storage.getPendingDirectMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending direct messages" });
    }
  });

  app.post("/api/admin/direct-messages/:id/approve", async (req, res) => {
    try {
      const sessionToken = req.headers['x-session-token'];
      if (!sessionToken) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const session = await storage.getSessionByToken(sessionToken as string);
      if (!session?.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const user = await storage.getUser(session.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const { status, adminNote } = req.body;
      const updated = await storage.updateDirectMessage(req.params.id, {
        status,
        adminNote,
      });
      
      if (!updated) {
        return res.status(404).json({ error: "Direct message not found" });
      }
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update direct message" });
    }
  });

  // VIP System Routes
  
  // Get user token balance
  app.get("/api/vip/tokens", async (req, res) => {
    try {
      const { session } = await getOrCreateSession(req);
      const tokens = await storage.getUserTokens(session.userId || undefined, session.id);
      
      if (!tokens) {
        // Create initial token record
        const newTokens = await storage.createUserTokens({
          userId: session.userId,
          sessionId: session.id,
          balance: 0,
        });
        return res.json(newTokens);
      }
      
      res.json(tokens);
    } catch (error) {
      res.status(500).json({ error: "Failed to get tokens" });
    }
  });

  // Get VIP membership status
  app.get("/api/vip/membership", async (req, res) => {
    try {
      const { session } = await getOrCreateSession(req);
      const membership = await storage.getVipMembership(session.userId || undefined, session.id);
      res.json(membership || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to get VIP membership" });
    }
  });

  // Get marketplace items
  app.get("/api/vip/marketplace", async (req, res) => {
    try {
      const items = await storage.getMarketplaceItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to get marketplace items" });
    }
  });

  // Get token transactions
  app.get("/api/vip/transactions", async (req, res) => {
    try {
      const { session } = await getOrCreateSession(req);
      const transactions = await storage.getTokenTransactions(session.userId || undefined, session.id);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to get transactions" });
    }
  });

  // Get VIP purchases
  app.get("/api/vip/purchases", async (req, res) => {
    try {
      const { session } = await getOrCreateSession(req);
      const purchases = await storage.getVipPurchases(session.userId || undefined, session.id);
      res.json(purchases);
    } catch (error) {
      res.status(500).json({ error: "Failed to get purchases" });
    }
  });

  // Purchase VIP item
  app.post("/api/vip/purchase", async (req, res) => {
    try {
      const { session } = await getOrCreateSession(req);
      const { itemId } = req.body;

      if (!itemId) {
        return res.status(400).json({ error: "Item ID is required" });
      }

      // Get marketplace item
      const item = await storage.getMarketplaceItem(itemId);
      if (!item || !item.isActive) {
        return res.status(404).json({ error: "Item not found or inactive" });
      }

      // Check if user has enough tokens
      const userTokens = await storage.getUserTokens(session.userId || undefined, session.id);
      if (!userTokens || userTokens.balance < item.price) {
        return res.status(400).json({ 
          error: `Insufficient tokens. You have ${userTokens?.balance || 0} tokens, but need ${item.price} tokens.` 
        });
      }

      // Spend tokens
      const success = await storage.spendTokens(
        session.userId || '',
        session.id,
        item.price,
        `Purchase: ${item.title}`
      );

      if (!success) {
        return res.status(400).json({ error: "Failed to spend tokens" });
      }

      // Create VIP purchase record
      const expiresAt = item.duration ? 
        new Date(Date.now() + item.duration * 24 * 60 * 60 * 1000) : 
        null;

      const purchase = await storage.createVipPurchase({
        userId: session.userId,
        sessionId: session.id,
        itemId: item.id,
        itemTitle: item.title,
        tokensSpent: item.price,
        features: item.features,
        status: "active",
        expiresAt,
      });

      // Create VIP membership if needed
      const existingMembership = await storage.getVipMembership(session.userId || undefined, session.id);
      
      if (!existingMembership) {
        await storage.createVipMembership({
          userId: session.userId,
          sessionId: session.id,
          membershipType: item.category,
          features: item.features,
          isActive: true,
          expiresAt,
        });
      } else {
        // Update existing membership with new features
        const combinedFeatures = [...new Set([...existingMembership.features, ...item.features])];
        const newExpiresAt = expiresAt && (!existingMembership.expiresAt || new Date(expiresAt) > new Date(existingMembership.expiresAt)) 
          ? expiresAt 
          : existingMembership.expiresAt;
          
        await storage.updateVipMembership(existingMembership.id, {
          features: combinedFeatures,
          expiresAt: newExpiresAt,
        });
      }

      res.json({ success: true, purchase });
    } catch (error) {
      res.status(500).json({ error: "Failed to purchase item" });
    }
  });

  // Admin: Create marketplace item
  app.post("/api/vip/admin/marketplace", async (req, res) => {
    try {
      const sessionToken = req.headers['x-session-token'];
      if (!sessionToken) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const session = await storage.getSessionByToken(sessionToken as string);
      if (!session?.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const user = await storage.getUser(session.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const validatedData = insertMarketplaceItemSchema.parse(req.body);
      const item = await storage.createMarketplaceItem({
        ...validatedData,
        createdByUserId: user.id,
        isActive: true,
      });

      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to create marketplace item" });
    }
  });

  // Admin: Update marketplace item
  app.put("/api/vip/admin/marketplace/:id", async (req, res) => {
    try {
      const sessionToken = req.headers['x-session-token'];
      if (!sessionToken) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const session = await storage.getSessionByToken(sessionToken as string);
      if (!session?.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const user = await storage.getUser(session.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const updated = await storage.updateMarketplaceItem(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Item not found" });
      }

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update marketplace item" });
    }
  });

  // Admin: Give tokens to user
  app.post("/api/vip/admin/give-tokens", async (req, res) => {
    try {
      const sessionToken = req.headers['x-session-token'];
      if (!sessionToken) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const session = await storage.getSessionByToken(sessionToken as string);
      if (!session?.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const user = await storage.getUser(session.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { sessionId, amount, description } = req.body;
      
      if (!sessionId || !amount || amount <= 0) {
        return res.status(400).json({ error: "Valid session ID and positive amount required" });
      }

      const success = await storage.addTokens('', sessionId, amount, description || 'Admin grant');
      
      if (!success) {
        return res.status(400).json({ error: "Failed to add tokens" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to give tokens" });
    }
  });

  // Daily limit check
  app.get("/api/daily-limit", async (req, res) => {
    try {
      const { session } = await getOrCreateSession(req);
      res.json({
        used: session.dailyConfessionCount,
        limit: 5,
        remaining: Math.max(0, 5 - session.dailyConfessionCount),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to check daily limit" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
