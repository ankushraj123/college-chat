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
import { socket } from "@/lib/socket";
import { filterMessage } from "@/lib/bad-words";
import TextareaAutosize from "react-textarea-autosize";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, Smile, Flag, Shield, MessageCircle, X, Menu, Clock, AlertCircle } from 'lucide-react';
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

const messageSchema = z.object({
  content: z
    .string()
    .min(1, "Please enter a message before sending.")
    .max(500, "Message must be less than 500 characters"),
});

const nicknameSchema = z.object({
  nickname: z
    .string()
    .min(3, "Nickname must be at least 3 characters")
    .max(20, "Nickname must be less than 20 characters"),
});

const dmSchema = z.object({
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(1000, "Message must be less than 1000 characters"),
  toSessionId: z.string().min(1, "Please select a recipient"),
});

type MessageFormData = z.infer<typeof messageSchema>;
type NicknameFormData = z.infer<typeof nicknameSchema>;
type DMFormData = z.infer<typeof dmSchema>;

type ChatMessage = z.infer<typeof messageSchema>;
type ChatMessageWithStatus = ChatMessage & { status: "sending" | "sent" | "failed" };
type Nickname = z.infer<typeof nicknameSchema>;
type DirectMessage = z.infer<typeof dmSchema>;

interface ChatRoomProps {
  collegeCode: string;
}

export function ChatRoom({ collegeCode }: ChatRoomProps) {
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [nickname, setNickname] = useState("");
  const [showNicknameDialog, setShowNicknameDialog] = useState(false);
  const [showContactAdminDialog, setShowContactAdminDialog] = useState(false);
  const [showDMDialog, setShowDMDialog] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);

  const { data: dailyLimit, isLoading: limitLoading } = useDailyLimit();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const messageForm = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  const nicknameForm = useForm<NicknameFormData>({
    resolver: zodResolver(nicknameSchema),
    defaultValues: {
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
  const { data: allRooms = [] } = useQuery({
    queryKey: ["/api/chat/rooms", collegeCode],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (collegeCode) params.append("collegeCode", collegeCode);
      const response = await fetch(`/api/chat/rooms?${params}`);
      if (!response.ok) throw new Error("Failed to fetch chat rooms");
      return response.json() as Promise<ChatRoomType[]>;
    },
    enabled: !!collegeCode,
  });

  // Get messages for selected room
  const { data: fetchedMessages = [], isLoading: messagesLoading } = useQuery<ChatMessageWithStatus[]>({
    queryKey: ["/api/chat/rooms", selectedRoom, "messages"],
    queryFn: async () => {
      if (!selectedRoom) return [];
      const response = await fetch(`/api/chat/rooms/${selectedRoom}/messages`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      const messages = await response.json() as ChatMessage[];
      return messages.map(msg => ({ ...msg, status: 'sent' }));
    },
    enabled: !!selectedRoom,
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
      const response = await apiRequest(
        "POST",
        `/api/chat/rooms/${selectedRoom}/messages`,
        {
          content: data.content,
          nickname: nickname,
          isPublic: true,
        }
      );
      return response.json();
    },
    onMutate: async (newMessage: MessageFormData) => {
      messageForm.reset();
      await queryClient.cancelQueries({ queryKey: ["/api/chat/rooms", selectedRoom, "messages"] });
      const previousMessages = queryClient.getQueryData<ChatMessageWithStatus[]>(["/api/chat/rooms", selectedRoom, "messages"]);
      
      const sessionToken = localStorage.getItem("sessionToken") || "";
      const optimisticMessage: ChatMessageWithStatus = {
        id: `temp-${Date.now()}`,
        content: newMessage.content,
        createdAt: new Date().toISOString(),
        nickname: nickname,
        sessionId: sessionToken,
        roomId: selectedRoom,
        isAdmin: false,
        status: "sending",
      };

      queryClient.setQueryData<ChatMessageWithStatus[]>(
        ["/api/chat/rooms", selectedRoom, "messages"],
        (old = []) => [...old, optimisticMessage]
      );

      return { previousMessages, optimisticMessage };
    },
    onError: (err, newMessage, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(["/api/chat/rooms", selectedRoom, "messages"], context.previousMessages);
      }
      if (context?.optimisticMessage) {
        queryClient.setQueryData<ChatMessageWithStatus[]>(
          ["/api/chat/rooms", selectedRoom, "messages"],
          (old = []) => old.map(msg => 
            msg.id === context.optimisticMessage.id ? { ...msg, status: 'failed' } : msg
          )
        );
      }
      toast({
        title: "Failed to send message",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/rooms", selectedRoom, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-limit"] });
    },
  });

  // Send DM mutation
  const sendDM = useMutation({
    mutationFn: async (data: DMFormData) => {
      const response = await apiRequest("POST", "/api/direct-messages", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/direct-messages"],
      });
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

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("Connected to socket server");
      socket.emit("joinRoom", selectedRoom);
    });

    socket.on("updateOnlineCount", (count: number) => {
      setOnlineCount(count);
    });

    socket.on("receiveMessage", (newMessage: ChatMessage) => {
      queryClient.setQueryData<ChatMessage[]>(
        ["/api/chat/rooms", newMessage.roomId, "messages"],
        (oldMessages = []) => [...oldMessages, newMessage]
      );
    });

    socket.on("userTyping", ({ nickname, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping) {
          return [...new Set([...prev, nickname])];
        } else {
          return prev.filter((user) => user !== nickname);
        }
      });
    });

    return () => {
      socket.off("connect");
      socket.off("receiveMessage");
      socket.off("userTyping");
      socket.disconnect();
    };
  }, [queryClient, selectedRoom]);

  useEffect(() => {
    if (scrollableContainerRef.current) {
      scrollableContainerRef.current.scrollTop = scrollableContainerRef.current.scrollHeight;
    }
  }, [fetchedMessages]);

  useEffect(() => {
    const savedNickname = localStorage.getItem("chatNickname");
    if (savedNickname) {
      setNickname(savedNickname);
    } else {
      setShowNicknameDialog(true);
    }
  }, []);

  // Set default room when rooms are loaded
  useEffect(() => {
    if (allRooms.length > 0 && !selectedRoom) {
      const generalRoom = allRooms.find((room) => room.name === "General Chat");
      if (generalRoom) {
        setSelectedRoom(generalRoom.id);
      } else if (allRooms.length > 0) {
        setSelectedRoom(allRooms[0].id);
      }
    }
  }, [allRooms, selectedRoom]);

  const handleSetNickname = (data: NicknameFormData) => {
    localStorage.setItem("chatNickname", data.nickname);
    setNickname(data.nickname);
    setShowNicknameDialog(false);
    toast({
      title: "Nickname set!",
      description: (
        <span>
          You will now appear as <span className="font-bold">{data.nickname}</span>.
        </span>
      ),
    });
  };

  const handleSendMessage = (data: MessageFormData) => {
    if (dailyLimit && dailyLimit.remaining <= 0) {
      toast({
        title: "Daily limit reached",
        description: "You\'ve reached your daily confession limit.",
        variant: "destructive",
      });
      return;
    }

    sendMessage.mutate(data);
    socket.emit("typing", { room: selectedRoom, nickname, isTyping: false });
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    messageForm.setValue("content", messageForm.getValues("content") + emojiData.emoji);
  };

  const handleSendDM = (data: DMFormData) => {
    sendDM.mutate(data);
  };

  const handleReportMessage = (messageId: string) => {
    // TODO: Implement report logic (e.g., send to backend)
    toast({
      title: "Message Reported",
      description: "Thank you for your feedback. The moderators will review this message.",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const getNicknameColor = (id: string) => {
    const colors = [
      "text-red-400", "text-green-400", "text-yellow-400", "text-blue-400", 
      "text-indigo-400", "text-purple-400", "text-pink-400", "text-teal-400"
    ];
    const hash = id.split("").reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    return colors[Math.abs(hash) % colors.length];
  };

  const isMyMessage = (message: ChatMessage) => {
    const sessionToken = localStorage.getItem("sessionToken");
    return message.sessionId === sessionToken;
  };

  const handleTyping = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      messageForm.handleSubmit(handleSendMessage)();
    }
    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", { room: selectedRoom, nickname, isTyping: true });
    }
  };

  return (
    <>
      <div className="flex h-[calc(100vh-80px)] bg-gray-900 text-white">
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute md:hidden z-20 w-64 bg-gray-800 border-r border-gray-700 flex flex-col h-full"
          >
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-bold">Chat Rooms</h2>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMenuOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              {allRooms.map((room) => (
                <Button
                  key={room.id}
                  variant={selectedRoom === room.id ? "secondary" : "ghost"}
                  className="w-full justify-start rounded-none py-6"
                  onClick={() => {
                    setSelectedRoom(room.id);
                    setIsMenuOpen(false);
                  }}
                >
                  # {room.name}
                </Button>
              ))}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="hidden md:flex md:relative z-20 w-64 bg-gray-800 border-r border-gray-700 flex-col h-full">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-bold">Chat Rooms</h2>
        </div>
        <ScrollArea className="flex-1">
          {allRooms.map((room) => (
            <Button
              key={room.id}
              variant={selectedRoom === room.id ? "secondary" : "ghost"}
              className="w-full justify-start rounded-none py-6"
              onClick={() => {
                setSelectedRoom(room.id);
              }}
            >
              # {room.name}
            </Button>
          ))}
        </ScrollArea>
      </div>

      {/* Chat Panel */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div>
              <h3 className="text-lg font-bold">{allRooms.find((r) => r.id === selectedRoom)?.name || "Live Chat"}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span>{onlineCount} students online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-mono text-gray-400 hidden md:block">
              {limitLoading ? (
                <span>Loading...</span>
              ) : (
                <span>
                  <span className="font-bold text-white">{dailyLimit?.remaining ?? 0}</span> messages left
                </span>
              )}
            </div>
            <Button
              onClick={() => setShowContactAdminDialog(true)}
              variant="default"
              size="sm"
              className="hidden md:flex"
            >
              <Shield className="mr-2 h-4 w-4" /> Contact Admin
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Shield className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setShowContactAdminDialog(true)}>
                  Contact Admin
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Messages Area */}
        <div ref={scrollableContainerRef} className="flex-1 p-4 overflow-y-auto">
            <AnimatePresence>
              {fetchedMessages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full text-gray-500"
                >
                  <MessageCircle className="h-16 w-16 mb-4" />
                  <p className="text-lg">No messages yet.</p>
                  <p>Be the first to start the conversation!</p>
                </motion.div>
              ) : (
                fetchedMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, y: 50, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="mb-4"
                  >
                    <div
                      className={`flex items-start gap-3 ${
                        isMyMessage(msg) ? "justify-end" : ""
                      }`}
                    >
                      {!isMyMessage(msg) && (
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0"></div>
                      )}
                      <div
                        className={`rounded-xl p-3 max-w-md transition-colors duration-300 ${
                          isMyMessage(msg)
                            ? msg.status === 'failed' ? 'bg-red-500' : 'bg-blue-600'
                            : msg.isAdmin
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600"
                            : "bg-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold text-sm ${
                              isMyMessage(msg) ? "text-white" : getNicknameColor(msg.sessionId)
                            }`}
                          >
                            {msg.nickname}
                          </span>
                          <span className="text-xs text-gray-400">{formatTime(msg.createdAt)}</span>
                          {isMyMessage(msg) && msg.status && (
                            <div className="ml-2">
                              {msg.status === 'sending' && <Clock className="h-4 w-4 text-gray-300 animate-spin" />}
                              {msg.status === 'failed' && <AlertCircle className="h-4 w-4 text-white" />}
                            </div>
                          )}
                        </div>
                        <p className="text-white mt-1 break-words">{msg.content}</p>
                        {isMyMessage(msg) && msg.status === 'failed' && (
                          <Button 
                            variant="link"
                            className="text-white text-xs p-0 h-auto mt-1"
                            onClick={() => sendMessage.mutate({ content: msg.content })}
                          >
                            Retry
                          </Button>
                        )}
                      </div>
                      {isMyMessage(msg) && (
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0"></div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
        </div>

          {/* Typing Indicator */}
          <div className="h-6 px-4 text-sm text-gray-400 italic">
            {typingUsers.length > 0 && (
              <span>
                {typingUsers.slice(0, 2).join(", ")}
                {typingUsers.length > 2 ? ` and ${typingUsers.length - 2} others` : ""} is typing...
              </span>
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-700 bg-gray-900">
            <Form {...messageForm}>
              <form
                onSubmit={messageForm.handleSubmit(handleSendMessage)}
                className="flex items-center gap-2"
              >
                <FormField
                  control={messageForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <div className="relative">
                          <TextareaAutosize
                            {...field}
                            placeholder="Type your message..."
                            className="w-full bg-gray-800 rounded-lg p-3 pr-16 resize-none border-none focus:ring-2 focus:ring-purple-500"
                            maxRows={5}
                            onKeyDown={handleTyping}
                            disabled={dailyLimit?.remaining === 0}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                            <Button variant="ghost" size="icon" type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                              <Smile className="h-6 w-6 text-gray-400" />
                            </Button>
                            <Button variant="ghost" size="icon" type="button">
                              <Paperclip className="h-5 w-5 text-gray-400" />
                            </Button>
                          </div>
                          {showEmojiPicker && (
                              <div className="absolute bottom-full right-0 z-10 hidden md:block">
                                <EmojiPicker onEmojiClick={onEmojiClick} />
                              </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs mt-1" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg h-12 w-12 flex-shrink-0"
                  disabled={sendMessage.isPending || !messageForm.formState.isValid || dailyLimit?.remaining === 0}
                >
                  <Send className="h-6 w-6" />
                </Button>
              </form>
            </Form>
            {showEmojiPicker && (
              <div className="mt-4 md:hidden">
                <EmojiPicker onEmojiClick={onEmojiClick} width="100%" height={300} />
              </div>
            )}
            {dailyLimit?.remaining === 0 && (
              <p className="text-center text-red-500 text-sm mt-2">
                You've reached today's limit. Try again tomorrow.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Nickname Dialog */}
      <Dialog open={showNicknameDialog} onOpenChange={setShowNicknameDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Set your nickname</DialogTitle>
          </DialogHeader>
          <Form {...nicknameForm}>
            <form
              onSubmit={nicknameForm.handleSubmit(handleSetNickname)}
              className="space-y-4"
            >
              <FormField
                control={nicknameForm.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Enter your nickname"
                        {...field}
                        className="bg-gray-700 border-gray-600"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    localStorage.setItem("chatNickname", "Anonymous");
                    setNickname("Anonymous");
                    setShowNicknameDialog(false);
                    toast({
                      title: "Nickname Set",
                      description: "You will appear as Anonymous.",
                    });
                  }}
                  disabled={nicknameForm.formState.isSubmitting}
                >
                  Use Anonymous
                </Button>
                <Button type="submit" disabled={nicknameForm.formState.isSubmitting}>
                  Set Nickname
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Contact Admin Dialog */}
      <Dialog open={showContactAdminDialog} onOpenChange={setShowContactAdminDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Contact Admin</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              To request a nickname change or for other inquiries, please join our Discord server and open a ticket.
            </p>
            <Button className="mt-4 w-full">
              Join Discord
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}