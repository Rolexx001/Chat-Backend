import dotenv from 'dotenv';
dotenv.config();
import { Server } from 'socket.io';
import http from 'http';
import  app  from "./app.js";
import connectDB from "./config/db.js";
import { initSocket } from './sockets/socket.js';
import { createAdapter } from '@socket.io/redis-adapter';
import { pub, sub } from './config/redisPubSub.js';
import { initNotificationSubscriber } from './services/notification.subscriber.js';
import './jobs/notification.worker.js';



const port=process.env.PORT || 5000;

const server=http.createServer(app);
const io=new Server(server,{
    cors:{
        origin:"*",
    }
});

initSocket(io);
initNotificationSubscriber();

io.adapter(createAdapter(pub, sub));


connectDB().then(()=>{
    server.listen(port,()=>{
        console.log(`Server is running on port ${port}`);
    });
});



