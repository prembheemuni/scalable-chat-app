import { Server } from "socket.io";
import { Redis } from "ioredis";
import dotenv from "dotenv";

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

      socket.on("event:message", async ({ message }: { message: string }) => {
        console.log("new message received", message);
        await pub.publish("MESSAGES", JSON.stringify({ message }));
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
