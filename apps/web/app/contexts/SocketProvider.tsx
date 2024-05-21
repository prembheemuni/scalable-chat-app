"use client";

import React, { useCallback, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";

interface SocketProviderProps {
  children?: React.ReactNode;
}

interface IMessageBody {
  message: string;
  user: string;
}
interface ISocketContext {
  sendMessage: (msg: string) => any;
  messages: IMessageBody[];
  registerUser: (user: string) => any;
}

const SocketContext = React.createContext<ISocketContext | null>(null);

const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket>();
  const [messages, setMessages] = useState<IMessageBody[]>([]);

  const sendMessage: ISocketContext["sendMessage"] = useCallback(
    (msg) => {
      console.log("Send Message", msg);
      if (socket) {
        socket.emit("event:message", { message: msg });
      }
    },
    [socket]
  );

  const registerUser: ISocketContext["registerUser"] = useCallback(
    (user) => {
      if (Socket) {
        socket?.emit("event:username", { username: user });
      }
    },
    [socket]
  );

  const onMessageReceived = useCallback((msg: string) => {
    console.log(msg);
    const { message, user } = JSON.parse(msg) as {
      message: string;
      user: string;
    };
    setMessages((prev) => [...prev, { message, user }]);
  }, []);

  useEffect(() => {
    const _socket = io("https://scalable-chat-app-ehu7.onrender.com");
    //const _socket = io("http://localhost:8000");

    _socket.on("message", onMessageReceived);
    setSocket(_socket);
    // toast("Socket connected");

    return () => {
      _socket.disconnect();
      _socket.off("message", onMessageReceived);
      setSocket(undefined);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ sendMessage, messages, registerUser }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const state = useContext(SocketContext);
  if (!state) throw new Error("State is not there");

  return state;
};

export default SocketProvider;
