import express from "express";
import http from "http";
import cors from "cors";
import session from "express-session";
import routes from "./routes";
import { Server } from "socket.io";
import { config } from "dotenv";
config();
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
};

const app = express();
const PORT = 3000;
const server = http.createServer(app);
const io = new Server(server, { cors: corsOptions });

app.use(cors(corsOptions));
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

app.use("/api", routes);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
let users: String[] = [];
interface Message {
  userId: string;
  text: string;
  time: string;
}
interface Room {
  id: string;
  name: string;
  users: string[];
  messages: Message[];
}
const rooms: Room[] = [];

const roomsIO = io.of("/api/rooms");
roomsIO.on("connection", (socket) => {
  socket.on("user connect", (userId: String) => {
    if (!users.includes(userId)) {
      users.push(userId);

      console.log(`New client connected, id: ${userId}`);
      console.log("Active users", roomsIO.sockets.size);
      console.log(users);
    }
    socket.emit("valid user", userId);
  });

  socket.on("createRoom", ({ roomName }) => {
    if (!rooms.find((r) => r.name === roomName)) {
      const room: Room = {
        id: Math.random().toString(36).substr(2, 9),
        name: roomName,
        users: [],
        messages: [],
      };
      rooms.push(room);
      socket.join(room.id);
      socket.emit("roomCreated", room);
      const roomIO = io.of(`/api/rooms/${room.id}`);

      roomIO.on("connection", (socket) => {
        socket.on("pushMessages", () => {
          socket.emit("receiveMessages", room);
        });

        socket.on("sendMessage", ({ roomId, userId, userName, message }) => {
          const room = rooms.find((r) => r.id === roomId);
          if (!room) {
            return;
          }

          const newMessage = {
            userId: userId,
            userName: userName,
            text: message,
            time: Date().toString(),
          };
          room.messages.push(newMessage);

          roomIO.emit("message", {
            ...newMessage,
          });
        });
        socket.on("exitRoom", ({ roomCode, userId }) => {
          const room = rooms.find((r) => r.id === roomCode);
          if (!room) {
            return socket.emit("roomNotFound");
          }
          room.users.splice(room.users.indexOf(userId), 1);
          socket.leave(room.id);
        });
      });
    } else {
      socket.emit("duplicateRoom");
    }
  });

  socket.on("joinRoom", ({ roomCode, userId }) => {
    const room = rooms.find((r) => r.id === roomCode);
    if (!room) {
      return socket.emit("roomNotFound");
    }
    if (!room.users.includes(userId)) {
      room.users.push(userId);
    }
    socket.join(room.id);
    socket.emit("roomJoined", room);
  });
});
