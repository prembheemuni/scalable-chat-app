import http from "http";
import SocketService from "./services/socketService";
const initiateServer = () => {
  const app = http.createServer((req, res) => {
    if (req.method === "GET" && req.url == "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });

      const healthCheck = {
        uptime: process.uptime(),
        message: "OK",
        timestamp: Date.now(),
      };

      res.end(JSON.stringify(healthCheck));
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    }
  });
  const PORT = process.env.PORT ? process.env.PORT : 8001;

  const socketService = new SocketService();
  socketService.io.attach(app);

  app.listen(PORT, () => {
    console.log(`Port ${PORT} conneted success fully`);
  });

  socketService.initializeListeners();
};

initiateServer();
