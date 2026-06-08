import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './modules/auth/auth.routes.js';
import chatRoutes from './modules/chat/chat.routes.js';
import messageRoutes from './modules/message/message.routes.js';
import mediaRoutes from './modules/media/media.routes.js';
import notificationRoutes from './modules/notification/notification.routes.js';
import userRoutes from './modules/user/user.routes.js';
import statusRoutes from './modules/status/status.routes.js';
import {errorHandler} from './middleware/error.middleware.js';
import {apiLimiter} from './middleware/rateLimit.middleware.js';



const app=express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

app.use("/api",apiLimiter);
app.use("/api/auth",authRoutes);
app.use("/api/chat",chatRoutes);
app.use("/api/message",messageRoutes);
app.use("/api/media",mediaRoutes);
app.use("/api/notification",notificationRoutes);
app.use("/api/user",userRoutes);
app.use("/api/status",statusRoutes);
app.use("/uploads",express.static("uploads"));

app.use(errorHandler);

export default app;
