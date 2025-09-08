import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConfessionSchema, insertCommentSchema, insertDirectMessageSchema, insertChatMessageSchema, insertLikeSchema, insertUserSchema, insertSessionSchema } from "@shared/schema";
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
