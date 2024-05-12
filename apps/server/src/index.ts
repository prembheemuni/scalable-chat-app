import http from "http";
import SocketService from "./services/socketService";
import dotenv from "dotenv";
const initiateServer = () => {
  const app = http.createServer();
  const PORT = process.env.PORT ? process.env.PORT : 8001;

  const socketService = new SocketService();
  socketService.io.attach(app);

  app.listen(PORT, () => {
    console.log(`Port ${PORT} conneted success fully`);
  });

  socketService.initializeListeners();
};

initiateServer();
