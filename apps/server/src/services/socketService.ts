import { Server } from "socket.io";
import { Redis } from "ioredis";
import dotenv from "dotenv";
import prismaClient from "./prismaClient";

dotenv.config();

const pub = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
});

const sub = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
});

class SocketService {
  private _io: Server;
  private users = {};

  constructor() {
    console.log("Socket service started");
    this._io = new Server({
      cors: {
        allowedHeaders: "*",
        origin: "*",
      },
    });
    sub.subscribe("MESSAGES");
  }

  get io(): Server {
    return this._io;
  }

  public initializeListeners() {
    console.log("Init Socket listeners");
    const io = this._io;
    io.on("connect", (socket) => {
      console.log(`New connection received ${socket.id}`);

      socket.emit("notify", "Welcome to the chat");

      socket.on(
        "event:username",
        async ({ username, room }: { username: string; room: string }) => {
          //  this.users[socket.id] = username;
          try {
            await prismaClient.user.create({
              data: {
                username,
                socketId: socket.id,
                room: room,
              },
            });
            socket.broadcast.to(room).emit("notify:entry", username);
          } catch (e) {
            console.log(e);
          }
        }
      );

      socket.on("event:join_room", ({ room }: { room: string }) => {
        socket.join(room);
        console.log(`room joined ${room}`);
      });
      socket.on("event:exit_room", ({ room }: { room: string }) => {
        console.log("im calling...");
        socket.leave(room);
      });

      socket.on(
        "start_typing",
        ({ user, room }: { user: string; room: string }) => {
          if (user && room)
            socket.broadcast.to(room).emit("notify", `${user} is Typing`);
        }
      );

      socket.on(
        "event:message",
        async ({ message, room }: { message: string; room: string }) => {
          if (!message) return;
          console.log(room, "as rrr");
          try {
            console.log("new message received", message);
            const { username } = await prismaClient.user.findUnique({
              where: { socketId: socket.id },
            });
            await pub.publish(
              "MESSAGES",
              JSON.stringify({ message, user: username, room: room })
            );
          } catch (e) {
            console.log(e);
          }
        }
      );

      socket.on("disconnect", async () => {
        if (!socket.id) return;
        try {
          const { id, username, room } = await prismaClient.user.findUnique({
            where: { socketId: socket.id },
          });
          if (id) await prismaClient.user.delete({ where: { id: id } });
          console.log(`Bye Bye!! ${username} ${room}`);
          socket.broadcast.to(room).emit("notify:exit", username);
        } catch (e) {
          console.log(e);
        }
      });
    });

    sub.on("message", (channel, message) => {
      if (channel === "MESSAGES") {
        const { room } = JSON.parse(message) as { room: string };
        console.log(message, "as dimple");

        io.to(room).emit("message", message);
      }
    });
  }
}

export default SocketService;
