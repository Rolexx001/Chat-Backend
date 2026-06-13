# Chat Application API Documentation (Postman Guide)

This guide documents all the REST API routes available in the project, including request/response examples and headers to help you test the endpoints in Postman.

## Base URL
Default local server: `http://localhost:5000`

---

## 1. Authentication & Profile Updates
All routes in this section (except Signup & Login) require an `Authorization` header:
`Authorization: Bearer <your_access_token>`

### Signup
* **Method**: `POST`
* **Path**: `/api/auth/signup`
* **Headers**: `Content-Type: application/json`
* **Body (JSON)**:
  ```json
  {
    "name": "John Doe",
    "email": "johndoe@example.com",
    "password": "Password123!"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "user": {
      "_id": "60d0fe4f5311236168a109ca",
      "name": "John Doe",
      "email": "johndoe@example.com",
      "avatar": "",
      "bio": "",
      "isOnline": false,
      "blockedUser": [],
      "createdAt": "2026-06-12T00:00:00.000Z",
      "updatedAt": "2026-06-12T00:00:00.000Z"
    }
  }
  ```

### Login
* **Method**: `POST`
* **Path**: `/api/auth/login`
* **Headers**: `Content-Type: application/json`
* **Body (JSON)**:
  ```json
  {
    "email": "johndoe@example.com",
    "password": "Password123!"
  }
  ```
* **Success Response (200 OK)**:
  Sets HTTP-Only Cookie: `refreshToken`
  ```json
  {
    "success": true,
    "user": {
      "_id": "60d0fe4f5311236168a109ca",
      "name": "John Doe",
      "email": "johndoe@example.com",
      "avatar": "",
      "bio": "",
      "isOnline": true
    },
    "accessToken": "ey..."
  }
  ```

### Refresh Access Token
* **Method**: `POST`
* **Path**: `/api/auth/refresh-token`
* **Headers**: None (Requires the `refreshToken` Cookie to be sent)
* **Success Response (200 OK)**:
  Sets HTTP-Only Cookie: `refreshToken` (newly rotated)
  ```json
  {
    "success": true,
    "accessToken": "ey..."
  }
  ```

### Get Profile
* **Method**: `GET`
* **Path**: `/api/auth/profile`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "_id": "60d0fe4f5311236168a109ca",
      "name": "John Doe",
      "email": "johndoe@example.com",
      "avatar": "",
      "bio": "Coding away..."
    }
  }
  ```

### Update Profile
* **Method**: `PUT`
* **Path**: `/api/auth/profile`
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Body (JSON)**:
  ```json
  {
    "name": "Johnathan Doe",
    "bio": "Software Engineer & Architect",
    "avatar": "/uploads/1718150400000-xyz.webp"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "_id": "60d0fe4f5311236168a109ca",
      "name": "Johnathan Doe",
      "email": "johndoe@example.com",
      "avatar": "/uploads/1718150400000-xyz.webp",
      "bio": "Software Engineer & Architect"
    }
  }
  ```

### Logout
* **Method**: `POST`
* **Path**: `/api/auth/logout`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  Clears Cookie: `refreshToken`
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

---

## 2. User Relationship & Device Session Control
All routes require `Authorization: Bearer <token>`.

### Search Users
* **Method**: `GET`
* **Path**: `/api/user/search` (or `/api/user`)
* **Headers**: `Authorization: Bearer <token>`
* **Query Parameters**:
  * `query`: Search string (searches name or email case-insensitively)
  * Example: `/api/user/search?query=john`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "users": [
      {
        "_id": "60d0f4ef5311236168a109cb",
        "name": "John Smith",
        "email": "smith@example.com",
        "avatar": "",
        "bio": "Hey there!",
        "isOnline": false,
        "lastSeen": "2026-06-11T23:00:00.000Z"
      }
    ]
  }
  ```

### Block User
* **Method**: `POST`
* **Path**: `/api/auth/block`
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Body (JSON)**:
  ```json
  {
    "targetUserId": "60d0f4ef5311236168a109cb"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User blocked successfully"
  }
  ```

### Unblock User
* **Method**: `POST`
* **Path**: `/api/auth/unblock`
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Body (JSON)**:
  ```json
  {
    "targetUserId": "60d0f4ef5311236168a109cb"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User unblocked successfully"
  }
  ```

### List Blocked Users
* **Method**: `GET`
* **Path**: `/api/auth/blocked`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "blockedUsers": [
      {
        "_id": "60d0f4ef5311236168a109cb",
        "name": "John Smith",
        "email": "smith@example.com",
        "avatar": ""
      }
    ]
  }
  ```

### Report User
* **Method**: `POST`
* **Path**: `/api/auth/report`
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Body (JSON)**:
  ```json
  {
    "reportedUserId": "60d0f4ef5311236168a109cb",
    "reason": "abuse",
    "description": "Sent offensive messages in group chat.",
    "blockUser": true
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "report": {
      "_id": "60d0f50f5311236168a109d0",
      "reporter": "60d0fe4f5311236168a109ca",
      "reportedUser": "60d0f4ef5311236168a109cb",
      "reason": "abuse",
      "description": "Sent offensive messages in group chat.",
      "createdAt": "2026-06-12T00:05:00.000Z"
    }
  }
  ```

### List Active Devices/Sessions
* **Method**: `GET`
* **Path**: `/api/auth/devices`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "sessions": [
      {
        "id": "60d0fe4f5311236168a109ce",
        "deviceInfo": "Mozilla/5.0 Chrome/120.0",
        "ipAddress": "127.0.0.1",
        "lastActive": "2026-06-12T00:10:00.000Z",
        "isCurrent": true
      }
    ]
  }
  ```

### Revoke Specific Session
* **Method**: `DELETE`
* **Path**: `/api/auth/devices/:sessionId`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Session revoked successfully"
  }
  ```

### Revoke All Other Sessions
* **Method**: `DELETE`
* **Path**: `/api/auth/devices`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "All other sessions revoked successfully"
  }
  ```

---

## 3. Chat Room Conversations
All routes require `Authorization: Bearer <token>`.

### Create Private 1-to-1 Chat
* **Method**: `POST`
* **Path**: `/api/chat`
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Body (JSON)**:
  ```json
  {
    "userId": "60d0f4ef5311236168a109cb"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "chat": {
      "_id": "60d0f70f5311236168a109e2",
      "isGroup": false,
      "participants": ["60d0fe4f5311236168a109ca", "60d0f4ef5311236168a109cb"],
      "pinnedMessages": [],
      "createdAt": "2026-06-12T00:12:00.000Z"
    }
  }
  ```

### Create Group Chat
* **Method**: `POST`
* **Path**: `/api/chat/group`
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Body (JSON)**:
  ```json
  {
    "groupName": "Project Devs",
    "participants": ["60d0f4ef5311236168a109cb", "60d0f55f5311236168a109cc"]
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "chat": {
      "_id": "60d0f72f5311236168a109e5",
      "isGroup": true,
      "groupName": "Project Devs",
      "participants": ["60d0fe4f5311236168a109ca", "60d0f4ef5311236168a109cb", "60d0f55f5311236168a109cc"],
      "Admin": "60d0fe4f5311236168a109ca",
      "pinnedMessages": []
    }
  }
  ```

### Fetch Chats List
* **Method**: `GET`
* **Path**: `/api/chat`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "chats": [
      {
        "_id": "60d0f70f5311236168a109e2",
        "isGroup": false,
        "participants": [
          { "_id": "60d0fe4f5311236168a109ca", "name": "John Doe", "email": "johndoe@example.com" },
          { "_id": "60d0f4ef5311236168a109cb", "name": "John Smith", "email": "smith@example.com" }
        ],
        "pinnedMessages": [],
        "updatedAt": "2026-06-12T00:12:00.000Z"
      }
    ]
  }
  ```

### Add User to Group
* **Method**: `PUT`
* **Path**: `/api/chat/add/:chatId`
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Body (JSON)**:
  ```json
  {
    "userId": "60d0f66f5311236168a109cd"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "chat": {
      "_id": "60d0f72f5311236168a109e5",
      "isGroup": true,
      "participants": ["60d0fe4f5311236168a109ca", "60d0f4ef5311236168a109cb", "60d0f55f5311236168a109cc", "60d0f66f5311236168a109cd"]
    }
  }
  ```

### Remove User from Group
* **Method**: `PUT`
* **Path**: `/api/chat/remove/:chatId`
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Body (JSON)**:
  ```json
  {
    "userId": "60d0f66f5311236168a109cd"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "chat": {
      "_id": "60d0f72f5311236168a109e5",
      "isGroup": true,
      "participants": ["60d0fe4f5311236168a109ca", "60d0f4ef5311236168a109cb", "60d0f55f5311236168a109cc"]
    }
  }
  ```

### Pin a Message
* **Method**: `PUT`
* **Path**: `/api/chat/pin/:chatId`
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Body (JSON)**:
  ```json
  {
    "messageId": "60d0f90f5311236168a109f0"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "chat": {
      "_id": "60d0f70f5311236168a109e2",
      "pinnedMessages": ["60d0f90f5311236168a109f0"]
    }
  }
  ```

### Unpin a Message
* **Method**: `PUT`
* **Path**: `/api/chat/unpin/:chatId`
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Body (JSON)**:
  ```json
  {
    "messageId": "60d0f90f5311236168a109f0"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "chat": {
      "_id": "60d0f70f5311236168a109e2",
      "pinnedMessages": []
    }
  }
  ```

### Get Pinned Messages
* **Method**: `GET`
* **Path**: `/api/chat/pinned/:chatId`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "pinnedMessages": [
      {
        "_id": "60d0f90f5311236168a109f0",
        "sender": { "_id": "60d0fe4f5311236168a109ca", "name": "John Doe", "email": "johndoe@example.com" },
        "content": "This is a pinned message!",
        "createdAt": "2026-06-12T00:15:00.000Z"
      }
    ]
  }
  ```

### Clear Chat History (For Self)
* **Method**: `DELETE`
* **Path**: `/api/chat/clear/:chatId`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "clearedAt": "2026-06-12T00:20:00.000Z"
  }
  ```

### Get Clear Timestamp
* **Method**: `GET`
* **Path**: `/api/chat/cleared-timestamp/:chatId`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "clearedAt": "2026-06-12T00:20:00.000Z"
  }
  ```

---

## 4. Messages History & Interactions
All routes require `Authorization: Bearer <token>`.

### Send Message
* **Method**: `POST`
* **Path**: `/api/message`
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Body (JSON)**:
  ```json
  {
    "chatId": "60d0f70f5311236168a109e2",
    "content": "Hello! How are you?",
    "mediaUrl": "",
    "replyTo": "60d0f90f5311236168a109f0" // Optional
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": {
      "_id": "60d0faef5311236168a10a01",
      "chatId": "60d0f70f5311236168a109e2",
      "sender": "60d0fe4f5311236168a109ca",
      "content": "Hello! How are you?",
      "replyTo": "60d0f90f5311236168a109f0",
      "seenBy": [],
      "deletedFor": [],
      "isDeleted": false,
      "createdAt": "2026-06-12T00:25:00.000Z"
    }
  }
  ```

### Get Messages (Cursor-based Pagination)
* **Method**: `GET`
* **Path**: `/api/message/:chatId`
* **Headers**: `Authorization: Bearer <token>`
* **Query Parameters**:
  * `cursor`: Message ID (exclusive upper boundary. Get older messages prior to this ID)
  * `limit`: Number of messages (Default 20, max 50)
  * Example: `/api/message/60d0f70f5311236168a109e2?limit=10&cursor=60d0faef5311236168a10a01`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "messages": [
      {
        "_id": "60d0f90f5311236168a109f0",
        "sender": { "_id": "60d0fe4f5311236168a109ca", "name": "John Doe" },
        "content": "This is a pinned message!"
      }
    ],
    "nextCursor": "60d0f90f5311236168a109f0",
    "hasMore": true
  }
  ```

### Edit Message
* **Method**: `PUT`
* **Path**: `/api/message/edit/:id` (where `:id` is messageId)
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Body (JSON)**:
  ```json
  {
    "content": "Hello! How are you doing today?"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": {
      "_id": "60d0faef5311236168a10a01",
      "content": "Hello! How are you doing today?",
      "isEdited": true
    }
  }
  ```

### Delete Message
* **Method**: `DELETE`
* **Path**: `/api/message/delete/:id` (where `:id` is messageId)
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Body (JSON)**:
  ```json
  {
    "type": "everyone" // or "self" to hide only for current user
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": {
      "_id": "60d0faef5311236168a10a01",
      "content": "This message was deleted",
      "isDeleted": true
    }
  }
  ```

### Mark Message as Seen
* **Method**: `POST`
* **Path**: `/api/message/seen/:id`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": {
      "_id": "60d0faef5311236168a10a01",
      "seenBy": ["60d0fe4f5311236168a109ca", "60d0f4ef5311236168a109cb"]
    }
  }
  ```

### Star Message
* **Method**: `POST`
* **Path**: `/api/message/star/:id`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": {
      "_id": "60d0faef5311236168a10a01",
      "starredBy": ["60d0fe4f5311236168a109ca"]
    }
  }
  ```

### Unstar Message
* **Method**: `POST`
* **Path**: `/api/message/unstar/:id`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": {
      "_id": "60d0faef5311236168a10a01",
      "starredBy": []
    }
  }
  ```

### Get Starred Messages in Chat
* **Method**: `GET`
* **Path**: `/api/message/:chatId/starred`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "messages": [
      {
        "_id": "60d0faef5311236168a10a01",
        "sender": { "_id": "60d0fe4f5311236168a109ca", "name": "John Doe" },
        "content": "Hello! How are you doing today?",
        "starredBy": ["60d0fe4f5311236168a109ca"]
      }
    ]
  }
  ```

### Forward Message
* **Method**: `POST`
* **Path**: `/api/message/:id/forward` (where `:id` is original messageId)
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Body (JSON)**:
  ```json
  {
    "chatIds": ["60d0f72f5311236168a109e5"] // Array of chatIds to forward to
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "messages": [
      {
        "_id": "60d0fcef5311236168a10a1b",
        "chatId": "60d0f72f5311236168a109e5",
        "sender": "60d0fe4f5311236168a109ca",
        "content": "Hello! How are you doing today?",
        "forwardedFrom": "60d0faef5311236168a10a01",
        "forwardedFromChatId": "60d0f70f5311236168a109e2"
      }
    ]
  }
  ```

### Search Messages in Chat
* **Method**: `GET`
* **Path**: `/api/message/:chatId/search`
* **Headers**: `Authorization: Bearer <token>`
* **Query Parameters**:
  * `query`: Search string
  * Example: `/api/message/60d0f70f5311236168a109e2/search?query=hello`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "messages": [
      {
        "_id": "60d0faef5311236168a10a01",
        "sender": { "_id": "60d0fe4f5311236168a109ca", "name": "John Doe" },
        "content": "Hello! How are you doing today?"
      }
    ]
  }
  ```

---

## 5. Media Uploads
All uploads require `Authorization: Bearer <token>`.

### Upload Media (Attachment)
* **Method**: `POST`
* **Path**: `/api/media/upload`
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
* **Body (Form-Data)**:
  * `file`: File upload binary (image, video, audio, pdf)
  * `type`: Text parameter, value `"message"` or `"status"`
  * `resourceId`: Text parameter (Optional, messageId or statusId)
* **Success Response (200 OK)**:
  If it's an image, enqueues BullMQ and returns `processing` state:
  ```json
  {
    "success": true,
    "status": "processing",
    "mediaUrl": "/uploads/1718150400000-xyz.jpg",
    "filename": "sunset.jpg"
  }
  ```
  If it's a non-image (like audio, pdf), bypasses queue and returns `ready` state:
  ```json
  {
    "success": true,
    "status": "ready",
    "mediaUrl": "/uploads/1718150400000-xyz.pdf",
    "filename": "document.pdf"
  }
  ```

### Upload Avatar
* **Method**: `POST`
* **Path**: `/api/media/upload-avatar`
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
* **Body (Form-Data)**:
  * `avatar`: File upload binary (image)
* **Success Response (200 OK)**:
  Sets temporary unoptimized avatar url and triggers queue:
  ```json
  {
    "success": true,
    "status": "processing",
    "user": {
      "_id": "60d0fe4f5311236168a109ca",
      "name": "John Doe",
      "avatar": "/uploads/1718150400000-abc.jpg"
    },
    "avatarUrl": "/uploads/1718150400000-abc.jpg"
  }
  ```

---

## 6. Status / Stories (24h Expiring Updates)
All routes require `Authorization: Bearer <token>`.

### Create Status Update
Creates a story. Supports uploading a file inline, or passing a `mediaUrl` directly.
* **Method**: `POST`
* **Path**: `/api/status`
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
* **Body (Form-Data)**:
  * `file`: File upload binary (image or video)
  * `caption`: Text caption
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "status": {
      "_id": "60d0fd0f5311236168a10b10",
      "user": "60d0fe4f5311236168a109ca",
      "mediaUrl": "/uploads/1718150400000-status.jpg",
      "caption": "Chasing sunsets!",
      "viewers": [],
      "expiresAt": "2026-06-13T00:40:00.000Z",
      "createdAt": "2026-06-12T00:40:00.000Z"
    }
  }
  ```

### Get Status Feed (Grouped by User)
Fetches statuses of all contacts/participants that the user has chatted with.
* **Method**: `GET`
* **Path**: `/api/status`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "feed": [
      {
        "user": {
          "_id": "60d0f4ef5311236168a109cb",
          "name": "John Smith",
          "avatar": ""
        },
        "stories": [
          {
            "_id": "60d0fd8f5311236168a10b15",
            "mediaUrl": "/uploads/1718150400000-smithstatus.webp",
            "caption": "Good morning!",
            "createdAt": "2026-06-12T00:10:00.000Z"
          }
        ]
      }
    ]
  }
  ```

### Get My Status Updates
* **Method**: `GET`
* **Path**: `/api/status/me`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "statuses": [
      {
        "_id": "60d0fd0f5311236168a10b10",
        "mediaUrl": "/uploads/1718150400000-status.jpg",
        "caption": "Chasing sunsets!",
        "viewers": []
      }
    ]
  }
  ```

### View Status
* **Method**: `POST`
* **Path**: `/api/status/:statusId/view`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Status viewed successfully"
  }
  ```

### Get Status Viewers (Owner Only)
* **Method**: `GET`
* **Path**: `/api/status/:statusId/viewers`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "viewers": [
      {
        "user": {
          "_id": "60d0f4ef5311236168a109cb",
          "name": "John Smith",
          "avatar": ""
        },
        "viewedAt": "2026-06-12T00:45:00.000Z"
      }
    ]
  }
  ```

### Delete Status
* **Method**: `DELETE`
* **Path**: `/api/status/:statusId`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Status deleted successfully"
  }
  ```

---

## 7. Calls & WebRTC Integration
All routes require `Authorization: Bearer <token>`.

### Get Call History
* **Method**: `GET`
* **Path**: `/api/call/history`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "history": [
      {
        "_id": "60d0ff8f5311236168a10c2a",
        "caller": { "_id": "60d0fe4f5311236168a109ca", "name": "John Doe", "avatar": "" },
        "receiver": { "_id": "60d0f4ef5311236168a109cb", "name": "John Smith", "avatar": "" },
        "type": "video",
        "status": "completed",
        "duration": 45,
        "createdAt": "2026-06-11T22:30:00.000Z",
        "endedAt": "2026-06-11T22:30:45.000Z"
      }
    ]
  }
  ```

### Get ICE Servers List (STUN/TURN Servers)
Fetches configurations for connection negotiation.
* **Method**: `GET`
* **Path**: `/api/call/ice-servers`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "iceServers": [
      { "urls": "stun:stun.l.google.com:19302" },
      { "urls": "stun:stun1.l.google.com:19302" },
      { "urls": "turn:your-turn-server.com:3478", "username": "...", "credential": "..." }
    ]
  }
  ```

---

## 8. Notifications Control
All routes require `Authorization: Bearer <token>`.

### Get All Notifications
* **Method**: `GET`
* **Path**: `/api/notification`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "notifications": [
      {
        "_id": "60d0fa9f5311236168a10e05",
        "userId": "60d0fe4f5311236168a109ca",
        "type": "MESSAGE",
        "title": "New Message",
        "body": "Hello! How are you?",
        "isRead": false,
        "createdAt": "2026-06-12T00:25:00.000Z"
      }
    ]
  }
  ```

### Get Unread Notifications
* **Method**: `GET`
* **Path**: `/api/notification/unread`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "notifications": [...]
  }
  ```

### Count Unread Notifications
* **Method**: `GET`
* **Path**: `/api/notification/unread/count`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 1
  }
  ```

### Mark Notification as Read
* **Method**: `PATCH`
* **Path**: `/api/notification/:id/read`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "notification": {
      "_id": "60d0fa9f5311236168a10e05",
      "isRead": true
    }
  }
  ```

### Mark All Notifications as Read
* **Method**: `PATCH`
* **Path**: `/api/notification/read-all`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "All notifications marked as read"
  }
  ```

### Delete Notification
* **Method**: `DELETE`
* **Path**: `/api/notification/:id`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Notification deleted successfully"
  }
  ```
