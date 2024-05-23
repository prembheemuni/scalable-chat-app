# Chat Room Application

## Overview
The Chat Room Application is real-time chat platform where users can join specific chat rooms and communicate with each other. This application is designed using a monorepo architecture, leveraging Turbo build for efficient development and deployment. The server-side logic is built with Node.js and Socket.IO, while the client-side is developed with Next JS frameworks. Redis is utilized for pub-sub architecture to manage real-time notifications, and PostgreSQL is used for persistent storage of users, rooms, messages, and their socket IDs.

## Features
- **Real-Time Communication**: Users can join rooms using a unique room ID and chat with others in real-time.
- **Join/Leave Notifications**: All users in a room are notified when someone joins or leaves.
- **Typing Indicators**: Users see typing indications from other users in the same room, enhancing the interactive experience.
- **Scalability**: The application leverages Redis for pub-sub messaging to ensure efficient communication and scalability as the number of users increases.

## Technologies Used
- **Node.js**: Backend server for handling connections and real-time communication.
- **Socket.IO**: Facilitates real-time, bi-directional communication between clients and servers.
- **Redis**: Used for pub-sub architecture to manage real-time notifications across distributed systems.
- **PostgreSQL**: Database for storing user information, chat rooms, messages, and socket IDs.
- **Turbo Build**: Monorepo tool to streamline the development process, managing both client and server codebases in a single repository.

