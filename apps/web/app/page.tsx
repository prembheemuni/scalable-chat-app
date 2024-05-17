"use client";

import React, { useEffect, useState } from "react";
import classes from "./page.module.css";
import { useSocket } from "./contexts/SocketProvider";

interface IMessages {
  text: string;
}

const Page = () => {
  const { sendMessage, messages } = useSocket();
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (event: any) => {
    setInputValue(event.target.value);
  };

  const handleSendMessage = () => {
    if (inputValue.trim() !== "") {
      sendMessage(inputValue);
      setInputValue("");
    }
  };

  return (
    <div className={classes["chat-screen"]}>
      <div className={classes["message-area"]}>
        <h1>Chat App</h1>
        {messages.map((message, index) => (
          <div key={index} className={classes["message"]}>
            {message}
          </div>
        ))}
      </div>
      <div className={classes["input-area"]}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Page;
