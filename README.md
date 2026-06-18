# 🚀 Enterprise-Grade Real-Time Chat & WebRTC Calling Backend

A high-performance, robust, and horizontally scalable backend service designed for real-time messaging, group conversations, status stories, and WebRTC audio/video signaling. 

Built with **Node.js**, **Express**, **Socket.io**, and **MongoDB**, backed by **Redis** for distributed state management and **BullMQ** for asynchronous background media optimization.

---

## ⚡ Key Features

- **📞 WebRTC Voice & Video Calling**: Real-time signaling relay with active call locks, busy indicators, receiver offline detection, and fallback systems.
- **💬 Real-Time Messaging & Chat Rooms**: 1-to-1 and Group chats with typing indicators, soft delete (self/everyone), forward, reply, and star actions.
- **👥 Group Management**: Dynamic member management (add/remove users) and pinned messages.
- **🟢 Presence Tracking**: Online/offline state synchronization with multi-device connections handling and contact status updates.
- **⏳ Expiring Status/Stories**: 24-hour expiring image/video stories with viewer counters and updates grouping.
- **🛠 BullMQ Media Workers**: Asynchronous, non-blocking background image optimization using Sharp (converting avatar, status, and message attachments to optimized WebP).
- **🔒 Secure Device Session Control**: Multi-device login tracking with HTTP-Only Cookie refresh token rotation and session revocation (revoke specific or all other devices).
- **🎯 Push & In-App Alerts**: Redis pub/sub backed notification queue to push alerts in real-time or fall back to offline workers.
- **🛡 Trust & Safety**: Complete user blocking, reporting, and message search capabilities.

---


## 🛠 Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **In-Memory Store & Adapter**: Redis & `@socket.io/redis-adapter`
- **Real-Time Communication**: Socket.io
- **Media Processing**: Sharp & Multer
- **Task Queue**: BullMQ
- **Authentication**: JSON Web Tokens (JWT) with HTTP-only cookies

---

## 📂 Project Structure

```text
src/
├── config/             # DB, Redis connection, and queue configs
├── jobs/               # BullMQ background workers (media optimization, push notifications)
├── middlewares/        # Authentication, rate limiters, validation, and error handlers
├── modules/            # Domain-driven features (Auth, Chat, Message, Call, Story, Notification)
│   ├── controller.js   # Handles incoming requests & response mapping
│   ├── model.js        # Mongoose database schema definitions
│   ├── routes.js       # HTTP routing specifications
│   └── services.js     # Business & database transaction logic
├── sockets/            # Socket.io connection, presence, and WebRTC event controllers
├── utils/              # Token generation, helpers, and Redis caches
├── app.js              # Express app definitions
└── server.js           # Server startup and socket server wrappers
```

---

## 🚀 Quick Start Guide

### Prerequisites
Make sure you have the following installed locally:
- **Node.js** (v18+)
- **Docker & Docker Compose** (for spinning up databases) OR local installations of **MongoDB** and **Redis**.

