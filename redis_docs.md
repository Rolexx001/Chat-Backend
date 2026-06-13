# Redis Implementation & Architecture Documentation (Hinglish)

Yeh document is backend project mein **Redis** ke complete setup aur iske use-cases ko detail mein samjhane ke liye hai. Hum dekhenge ki Redis kya hai, ise is project mein kyun use kiya gaya hai, aur ise kaise implement kiya gaya hai.

---

## 1. Redis Kya Hai? (What is Redis?)

**Redis (Remote Dictionary Server)** ek open-source, in-memory key-value data store hai.
*   **In-Memory Store:** Yeh data ko disk (hard drive) par store karne ke bajaye server ki primary memory (RAM) mein store karta hai. Is wajah se yeh normal databases (jaise MongoDB ya PostgreSQL) se **bahut tez (super-fast)** hota hai.
*   **Key-Value Structure:** Isme data simple `key` aur `value` ke pair mein store hota hai.
*   **Data Structures:** Yeh String, Lists, Sets, Hashes, aur Sorted Sets jaise complex data structures ko natively support karta hai.

---

## 2. Is Project Mein Redis Kyun Use Kiya Gaya Hai? (Why Redis?)

Normal backend applications mein databases (jaise MongoDB) data store toh kar lete hain, par real-time chat application mein dynamic requirements hoti hain jo MongoDB par high load banati hain:

1.  **Super-Fast Execution (Speed):** Online status check karna ya session validate karna har request/socket event par hota hai. Agar iske liye baar-baar MongoDB query karenge to app slow ho jayega. Redis RAM se response milliseconds ke fraction mein de deta hai.
2.  **Horizontal Scaling (Horizontal Scaling for Socket.io):** Socket.io default memory mein states rakhta hai. Agar kal ko system ko scale karne ke liye hum chat-backend ke 3-4 separate instances run karein, to Instance A pe baitha user Instance B pe baithe user ko messages nahi bhej payega. Redis Adapter is problem ko solve karta hai.
3.  **Expiry/Time-to-Live (TTL):** Active user sessions ko 15 minutes baad automatically expire karna ho, to Redis ka `EXPIRE` command use hota hai.
4.  **Pub/Sub (Publish/Subscribe) Support:** Sockets aur workers ke beech system-wide alerts instantly share karne ke liye Redis ka in-built Pub/Sub system best hai.
5.  **Job Queuing (BullMQ):** Heavy processing (jaise image compress karna or WebP convert karna) background tasks ko pipeline karne ke liye Redis ko queue broker banaya gaya hai.

---

## 3. Kaise Use Ho Raha Hai? (How Redis is Used in this Project)

Project ke codebase mein Redis ko **8 main use-cases** mein utilize kiya gaya hai:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           REDIS SERVICES                                │
├───────────────────┬──────────────────┬─────────────────┬────────────────┤
│    Socket.io      │     Caching      │   BullMQ Jobs   │    Pub/Sub     │
│    Clustering     │  (Chats/Session) │ (Media/Notif)   │ (Revoke/Notif) │
└───────────────────┴──────────────────┴─────────────────┴────────────────┘
```

### 1. Socket.io Cluster Synchronization
*   **Files:** [server.js](file:///home/amansagar/Projects/chat-backend/src/server.js), [redisPubSub.js](file:///home/amansagar/Projects/chat-backend/src/config/redisPubSub.js)
*   **Kyun:** Multiple instances hone par Socket.io server connections ko synchronize rakhne ke liye.
*   **Kaise:**
    ```javascript
    import { createAdapter } from '@socket.io/redis-adapter';
    import { pub, sub } from './config/redisPubSub.js';
    io.adapter(createAdapter(pub, sub));
    ```
    Isse automatic inter-server packets synchronization ho jata hai.

### 2. User Online/Offline Status Tracking
*   **File:** [socket.js](file:///home/amansagar/Projects/chat-backend/src/sockets/socket.js)
*   **Kyun:** User online hai ya offline, yeh realtime mein har device/socket track karne ke liye.
*   **Kaise (Redis Sets):**
    User jab socket connect karta hai, to `OnlineSockets:${userId}` (jo ki ek Redis Set hai) mein uske socket ID ko push kiya jata hai:
    ```javascript
    await redis.sadd(`OnlineSockets:${userId}`, socket.id);
    ```
    Jab user disconnect hota hai:
    ```javascript
    await redis.srem(`OnlineSockets:${userId}`, socket.id);
    ```
    Server set ki size (`scard`) check karta hai:
    ```javascript
    const wasOffline = (await redis.scard(`OnlineSockets:${userId}`)) === 0;
    ```
    Agar count 0 ho jata hai, tabhi user ko database mein offline update kiya jata hai. Isse multi-device support smooth chalta hai.

### 3. Active Session Tracking & Token Revocation
*   **Files:** [auth.services.js](file:///home/amansagar/Projects/chat-backend/src/modules/auth/auth.services.js), [socket.js](file:///home/amansagar/Projects/chat-backend/src/sockets/socket.js), [notification.subscriber.js](file:///home/amansagar/Projects/chat-backend/src/services/notification.subscriber.js)
*   **Kyun:** Force logout, session change ya token invalidation instant block karne ke liye.
*   **Kaise:**
    1.  Login time active session set karte hain with **TTL of 15 min (900 seconds)**:
        ```javascript
        await redis.set(`session:active:${session._id}`, "true", "EX", 900);
        ```
    2.  Socket connection par unique tab connections map kiye jate hain:
        ```javascript
        await redis.sadd(`SessionSockets:${decoded.sessionId}`, socket.id);
        await redis.set(`SocketSession:${socket.id}`, decoded.sessionId);
        ```
    3.  Logout or Revoke karte waqt active session delete kar ke **Pub/Sub** call karte hain:
        ```javascript
        await redis.del(`session:active:${sessionId}`);
        await pub.publish("SESSION_REVOCATION", JSON.stringify({ sessionId }));
        ```
    4.  Redis subscriber immediately notifications receive kar ke un saare socket IDs ko direct socket connection level se reject and close (`disconnect(true)`) kar deta hai.

### 4. WebRTC Calling Locks (Busy Status)
*   **File:** [socket.js](file:///home/amansagar/Projects/chat-backend/src/sockets/socket.js)
*   **Kyun:** Call setup process ke waqt user ko simultaneous multi-call routing se rokne ke liye (agar caller line pe hai to busy show karna).
*   **Kaise:**
    Call join karte hi redis me target lock key ban jaati hai:
    ```javascript
    await redis.set(`activeCall:${socket.userId}`, callId);
    await redis.set(`activeCall:${targetUserId}`, callId);
    ```
    Aur check karte hain:
    ```javascript
    const isBusy = await redis.get(`activeCall:${targetUserId}`);
    ```
    Call end hone par dono keys delete (`redis.del`) kar di jaati hain.

### 5. Chat & Query Results Caching
*   **Files:** [cache.js](file:///home/amansagar/Projects/chat-backend/src/utils/cache.js), [chat.services.js](file:///home/amansagar/Projects/chat-backend/src/modules/chat/chat.services.js)
*   **Kyun:** SQL ya MongoDB database round-trips kam karne ke liye. User chat list direct Redis se serve ki jaati hai.
*   **Kaise:**
    ```javascript
    const cachedChats = await redis.get(`chats:${userId}`);
    if (cachedChats) return JSON.parse(cachedChats);
    
    // Database query run...
    await redis.set(`chats:${userId}`, JSON.stringify(chats), "EX", 3600); // 1 hour TTL
    ```
    Naya message aane par key invalidate kar di jati hai (`redis.del`).

### 6. Chat Cleared Timestamp Storage
*   **Files:** [chat.services.js](file:///home/amansagar/Projects/chat-backend/src/modules/chat/chat.services.js), [message.services.js](file:///home/amansagar/Projects/chat-backend/src/modules/message/message.services.js)
*   **Kyun:** Kisi individual user ne agar chat history clear ki hai to database se use purane messages fetch na hon.
*   **Kaise:**
    ```javascript
    await redis.set(`clearchat:${userId}:${chatId}`, clearedAtTimestamp);
    ```
    Future fetches me yeh `clearedAt` check kar ke messages dynamic filter kiye jate hain.

### 7. Redis Pub/Sub for Real-Time Signals
*   **Files:** [notification.services.js](file:///home/amansagar/Projects/chat-backend/src/modules/notification/notification.services.js), [notification.subscriber.js](file:///home/amansagar/Projects/chat-backend/src/services/notification.subscriber.js)
*   **Kyun:** Alag worker processes ya functions se notification ko users ke dynamic sockets tak pahunchane ke liye.
*   **Kaise:**
    Server notifications system me publish karta hai:
    ```javascript
    await pub.publish("NOTIFICATION", JSON.stringify(notification));
    ```
    Subscriber thread is notification ko consume kar ke websocket `io.to(userId).emit("ReceiveNotification", notification)` par bhej deta hai.

### 8. Message Broker for BullMQ
*   **Files:** [media.worker.js](file:///home/amansagar/Projects/chat-backend/src/jobs/media.worker.js), [notification.worker.js](file:///home/amansagar/Projects/chat-backend/src/jobs/notification.worker.js)
*   **Kyun:** BullMQ back-end process running queue messages ko manage karne ke liye Redis backend use karta hai.
*   **Kaise:**
    ```javascript
    new Worker("media-processing", async (job) => { ... }, { connection: redis });
    ```
    Queue state management (active jobs, waiting list, failed retries) entirely Redis memory lists standard data models me chalti hain.

---

## 4. Quick Cheat-Sheet: Redis Commands Used in this Project

| Command | Syntax Used in Code | Description |
| :--- | :--- | :--- |
| **`GET`** | `redis.get(key)` | Specific key ki value fetch karta hai. |
| **`SET`** | `redis.set(key, value, 'EX', seconds)` | Key set karta hai and optional dynamic expirations set karta hai. |
| **`DEL`** | `redis.del(key)` | Key ko database se delete karta hai. |
| **`SADD`** | `redis.sadd(key, member)` | Set database structure mein element add karta hai (unique list). |
| **`SREM`** | `redis.srem(key, member)` | Set database se specific member element delete karta hai. |
| **`SCARD`** | `redis.scard(key)` | Set ke total items count return karta hai. |
| **`SMEMBERS`**| `redis.smembers(key)` | Set ke saare items fetch karta hai (Session socket mapping lookup). |
| **`KEYS`** | `redis.keys(pattern)` | Pattern match karne wali sabhi keys list karta hai (e.g. invalidation utility). |
| **`EXPIRE`** | `redis.expire(key, seconds)` | Kisi exist key ke upar TTL limit lagata hai. |
| **`PUBLISH`** | `pub.publish(channel, message)`| Pub/Sub flow me process broadcast initiate karta hai. |
| **`SUBSCRIBE`**| `sub.subscribe(channel)` | Backend listener configure karta hai on channel events. |
