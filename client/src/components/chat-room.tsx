import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useDailyLimit } from "@/hooks/use-daily-limit";
import { useToast } from "@/hooks/use-toast";
import type { ChatMessage, ChatRoom as ChatRoomType } from "@shared/schema";

const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(500, "Message must be less than 500 characters"),
  nickname: z.string().optional(),
});

const dmSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(1000, "Message must be less than 1000 characters"),
  toSessionId: z.string().min(1, "Please select a recipient"),
});

type MessageFormData = z.infer<typeof messageSchema>;
type DMFormData = z.infer<typeof dmSchema>;

interface ChatRoomProps {
  collegeCode: string;
}

export function ChatRoom({ collegeCode }: ChatRoomProps) {
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [showDMDialog, setShowDMDialog] = useState(false);
  const [nickname, setNickname] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: dailyLimit } = useDailyLimit();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const messageForm = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
      nickname: "",
    },
  });

  const dmForm = useForm<DMFormData>({
    resolver: zodResolver(dmSchema),
    defaultValues: {
      content: "",
      toSessionId: "",
    },
  });

  // Get chat rooms for this college
  const { data: rooms = [] } = useQuery({
    queryKey: ["/api/chat/rooms", collegeCode],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (collegeCode) params.append("collegeCode", collegeCode);
      
      const response = await fetch(`/api/chat/rooms?${params}`);
      if (!response.ok) throw new Error("Failed to fetch chat rooms");
      return response.json() as Promise<ChatRoomType[]>;
    },
  });

  // Get messages for selected room
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/chat/rooms", selectedRoom, "messages"],
    queryFn: async () => {
      if (!selectedRoom) return [];
      const response = await fetch(`/api/chat/rooms/${selectedRoom}/messages`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json() as Promise<ChatMessage[]>;
    },
    enabled: !!selectedRoom,
    refetchInterval: 3000, // Poll every 3 seconds for new messages
  });

  // Get pending direct messages
  const { data: pendingDMs = [] } = useQuery({
    queryKey: ["/api/direct-messages"],
    queryFn: async () => {
      const sessionToken = localStorage.getItem("sessionToken");
      const response = await fetch("/api/direct-messages", {
        headers: sessionToken ? { "x-session-token": sessionToken } : {},
      });
      if (!response.ok) return [];
      return response.json();
    },
    refetchInterval: 5000, // Poll every 5 seconds for DM updates
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (data: MessageFormData) => {
      if (!selectedRoom) throw new Error("No room selected");
      
      const sessionToken = localStorage.getItem("sessionToken");
      const response = await apiRequest("POST", `/api/chat/rooms/${selectedRoom}/messages`, {
        content: data.content,
        nickname: data.nickname || nickname || undefined,
        isPublic: true,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/rooms", selectedRoom, "messages"] });
      messageForm.reset();
      toast({
        title: "Message sent!",
        description: "Your message has been posted to the chat.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to send message",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Send DM mutation
  const sendDM = useMutation({
    mutationFn: async (data: DMFormData) => {
      const response = await apiRequest("POST", "/api/direct-messages", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/direct-messages"] });
      dmForm.reset();
      setShowDMDialog(false);
      toast({
        title: "Direct message sent!",
        description: "Your message is pending admin approval.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to send direct message",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Set default room when rooms are loaded
  useEffect(() => {
    if (rooms.length > 0 && !selectedRoom) {
      setSelectedRoom(rooms[0].id);
    }
  }, [rooms, selectedRoom]);

  const handleSendMessage = (data: MessageFormData) => {
    if (dailyLimit && dailyLimit.remaining <= 0) {
      toast({
        title: "Daily limit reached",
        description: "You've reached your daily confession limit.",
        variant: "destructive",
      });
      return;
    }
    
    sendMessage.mutate(data);
  };

  const handleSendDM = (data: DMFormData) => {
    sendDM.mutate(data);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Chat Room Selection */}
      <Card data-testid="card-chat-rooms">
        <CardHeader>
          <CardTitle className="gradient-text">Live Chat Rooms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {rooms.map((room) => (
              <Button
                key={room.id}
                variant={selectedRoom === room.id ? "default" : "outline"}
                onClick={() => setSelectedRoom(room.id)}
                data-testid={`button-room-${room.id}`}
              >
                <i className="fas fa-comments mr-2"></i>
                {room.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Limit and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="glass-card rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <i className="fas fa-clock text-accent"></i>
              <span className="font-mono text-sm">
                <span className="text-primary font-bold" data-testid="text-chat-limit">
                  {dailyLimit?.remaining ?? 5}
                </span> messages remaining today
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Set nickname..."
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-40"
              data-testid="input-nickname"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Dialog open={showDMDialog} onOpenChange={setShowDMDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-send-dm">
                <i className="fas fa-envelope mr-2"></i>
                Send Direct Message
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Direct Message</DialogTitle>
              </DialogHeader>
              <Form {...dmForm}>
                <form onSubmit={dmForm.handleSubmit(handleSendDM)} className="space-y-4">
                  <FormField
                    control={dmForm.control}
                    name="toSessionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Recipient session ID or username"
                            {...field}
                            data-testid="input-dm-recipient"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={dmForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Your message..."
                            rows={4}
                            {...field}
                            data-testid="textarea-dm-content"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowDMDialog(false)}
                      data-testid="button-cancel-dm"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={sendDM.isPending}
                      className="flex-1"
                      data-testid="button-submit-dm"
                    >
                      {sendDM.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane mr-2"></i>
                          Send DM
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Button variant="outline" data-testid="button-contact-admin">
            <i className="fas fa-shield-alt mr-2"></i>
            Contact Admin
          </Button>
        </div>
      </div>

      {/* Pending DMs Status */}
      {pendingDMs.length > 0 && (
        <Card className="border-accent/50" data-testid="card-pending-dms">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <i className="fas fa-envelope text-accent"></i>
              <span className="font-semibold">Direct Messages</span>
              <Badge className="bg-accent/20 text-accent">{pendingDMs.length}</Badge>
            </div>
            <div className="mt-2 space-y-2">
              {pendingDMs.slice(0, 3).map((dm: any) => (
                <div key={dm.id} className="flex items-center justify-between text-sm">
                  <span className="truncate flex-1">{dm.content.substring(0, 50)}...</span>
                  <Badge 
                    variant={dm.status === "approved" ? "default" : dm.status === "rejected" ? "destructive" : "secondary"}
                    data-testid={`badge-dm-status-${dm.id}`}
                  >
                    {dm.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Messages */}
      {selectedRoom && (
        <Card className="h-96" data-testid="card-chat-messages">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {rooms.find(r => r.id === selectedRoom)?.name} Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-col h-full">
            <ScrollArea className="flex-1 p-4">
              {messagesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="text-no-messages">
                  <i className="fas fa-comment-slash text-3xl mb-2"></i>
                  <p>No messages yet. Be the first to start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div key={message.id} className="group" data-testid={`message-${message.id}`}>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-user text-primary text-sm"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm" data-testid={`text-message-author-${message.id}`}>
                              {message.nickname || "Anonymous User"}
                            </span>
                            <span className="text-xs text-muted-foreground" data-testid={`text-message-time-${message.id}`}>
                              {formatTime(message.createdAt.toString())}
                            </span>
                          </div>
                          <p className="text-foreground mt-1" data-testid={`text-message-content-${message.id}`}>
                            {message.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t p-4">
              <Form {...messageForm}>
                <form onSubmit={messageForm.handleSubmit(handleSendMessage)} className="space-y-3">
                  <FormField
                    control={messageForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              placeholder={dailyLimit && dailyLimit.remaining <= 0 
                                ? "Daily limit reached" 
                                : "Type your message..."
                              }
                              disabled={dailyLimit && dailyLimit.remaining <= 0}
                              {...field}
                              className="flex-1"
                              data-testid="input-chat-message"
                            />
                            <Button
                              type="submit"
                              disabled={sendMessage.isPending || (dailyLimit && dailyLimit.remaining <= 0)}
                              data-testid="button-send-message"
                            >
                              {sendMessage.isPending ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <i className="fas fa-paper-plane"></i>
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
