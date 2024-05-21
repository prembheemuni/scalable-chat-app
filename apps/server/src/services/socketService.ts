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

      socket.on(
        "event:username",
        async ({ username, email }: { username: string; email: string }) => {
          //  this.users[socket.id] = username;
          try {
            await prismaClient.user.create({
              data: {
                username,
                email,
                socketId: socket.id,
              },
            });
          } catch (e) {
            console.log(e);
          }
        }
      );

      socket.on(
        "event:message",
        async ({ message, email }: { message: string; email: string }) => {
          if (!email || !message) return;
          try {
            console.log("new message received", message);
            const { username } = await prismaClient.user.findUnique({
              where: { email: email },
            });
            await pub.publish(
              "MESSAGES",
              JSON.stringify({ message, user: username })
            );
          } catch (e) {
            console.log(e);
          }
        }
      );

      socket.on("disconnect", async () => {
        console.log(`Bye Bye!! ${this.users[socket.id]}`);
        if (!socket.id) return;
        try {
          const { id } = await prismaClient.user.findUnique({
            where: { socketId: socket.id },
          });
          if (id) await prismaClient.user.delete({ where: { id: id } });
        } catch (e) {
          console.log(e);
        }
      });
    });

    sub.on("message", (channel, message) => {
      if (channel === "MESSAGES") {
        io.emit("message", message);
      }
    });
  }
}

export default SocketService;
