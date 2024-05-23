"use client";

import React, {
  useState,
  FormEvent,
  ChangeEvent,
  useRef,
  useEffect,
} from "react";
import classes from "./page.module.css";
import { useSocket } from "./contexts/SocketProvider";

interface IMessages {
  text: string;
}

interface Errors {
  name?: string;
  roomId?: string;
}

const Page = () => {
  const {
    sendMessage,
    messages,
    registerUser,
    joinRoom,
    leaveRoom,
    startTyping,
  } = useSocket();
  const [chatScreen, setChatScreen] = useState(false);

  const [name, setName] = useState<string>("");

  const [roomId, setRoomId] = useState<string>("");
  const [errors, setErrors] = useState<Errors>({});

  const itemRef = useRef<any>(null);

  const inputEleRef = useRef<HTMLInputElement | null>(null);

  const handleSendMessage = () => {
    const value = inputEleRef.current?.value as string;
    if (value !== "") {
      sendMessage(value, roomId);
      if (inputEleRef.current) inputEleRef.current.value = "";
    }
  };

  const validate = (): Errors => {
    const newErrors: Errors = {};
    if (!name) newErrors.name = "Name is required";
    if (!roomId) newErrors.roomId = "Room ID is required";
    return newErrors;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      setChatScreen((prev) => !prev);
      registerUser(name, roomId);
      joinRoom(roomId);
    } else {
      setErrors(validationErrors);
    }
  };

  useEffect(() => {
    if (itemRef.current) {
      itemRef.current.scrollTop = itemRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      leaveRoom(roomId);
    };
  }, []);

  useEffect(() => {
    const eventFunc = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        handleSendMessage();
      }
    };

    const inputTracking = () => {
      startTyping(name, roomId);
    };

    const inputEle = inputEleRef.current;
    if (inputEle) inputEle.addEventListener("keypress", eventFunc);
    if (inputEle) inputEle.addEventListener("input", inputTracking);

    return () => {
      if (inputEle) inputEle.removeEventListener("keypress", eventFunc);
      if (inputEle) inputEle.removeEventListener("input", inputTracking);
    };
  }, [chatScreen]);

  const handleChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: ChangeEvent<HTMLInputElement>) =>
      setter(e.target.value);
  if (!chatScreen) {
    return (
      <div className={classes.container}>
        <form className={classes.form} onSubmit={handleSubmit}>
          <h1 className={classes.heading}>Chat Room</h1>
          <div className={classes.inputGroup}>
            <label className={classes.label}>Name</label>
            <input
              type="text"
              value={name}
              onChange={handleChange(setName)}
              className={classes.input}
            />
            {errors.name && <p className={classes.error}>{errors.name}</p>}
          </div>
          <div className={classes.inputGroup}>
            <label className={classes.label}>Room ID</label>
            <input
              type="text"
              value={roomId}
              onChange={handleChange(setRoomId)}
              className={classes.input}
            />
            {errors.roomId && <p className={classes.error}>{errors.roomId}</p>}
          </div>
          <button type="submit" className={classes.button}>
            Continue
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className={classes["chat-screen"]}>
      <div className={classes["message-area"]} ref={itemRef}>
        <h1 className={classes.heading}>Chat Space</h1>
        {messages.map((msg, index) => (
          <div key={index} className={classes.message}>
            <div className={classes.messageHeader}>{msg.user}</div>
            <div className={classes.messageContent}>{msg.message}</div>
          </div>
        ))}
      </div>
      <div className={classes["input-area"]}>
        <input type="text" placeholder="Type a message..." ref={inputEleRef} />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Page;
