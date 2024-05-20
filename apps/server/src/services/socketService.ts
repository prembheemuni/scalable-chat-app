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
        async ({ username }: { username: string }) => {
          //  this.users[socket.id] = username;
          try {
            await prismaClient.user.create({
              data: {
                username,
                socketId: socket.id,
              },
            });
          } catch (e) {
            throw new Error("Database Error");
          }
        }
      );

      socket.on("event:message", async ({ message }: { message: string }) => {
        try {
          console.log("new message received", message);
          const { username } = await prismaClient.user.findUnique({
            where: { socketId: socket.id },
          });
          await pub.publish(
            "MESSAGES",
            JSON.stringify({ message, user: username })
          );
        } catch (e) {
          throw new Error("Db Error");
        }
      });

      socket.on("disconnect", async () => {
        console.log(`Bye Bye!! ${this.users[socket.id]}`);
        delete this.users[socket.id];
        try {
          await prismaClient.user.delete({ where: { socketId: socket.id } });
        } catch (e) {
          throw new Error("Db error");
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
