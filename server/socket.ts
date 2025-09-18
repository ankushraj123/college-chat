import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

export function setupSocket(server: HttpServer) {
  const io = new Server(server, {
    cors: {
      origin: "*", // Allow all origins for now
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log("A user connected:", socket.id);

    socket.on("joinRoom", (room: string) => {
      socket.join(room);
      console.log(`User ${socket.id} joined room ${room}`);
    });

    socket.on("sendMessage", (data) => {
      socket.to(data.room).emit("receiveMessage", data);
    });

    socket.on("typing", (data) => {
      socket.to(data.room).emit("userTyping", {
        nickname: data.nickname,
        isTyping: data.isTyping,
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
}