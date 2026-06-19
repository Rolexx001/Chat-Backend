import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'url';
import { fileURLToPath } from 'url';
import fsPath from 'path';

// Load env vars
dotenv.config();

import User from '../../src/models/user.model.js';
import Session from '../../src/models/session.model.js';
import Chat from '../../src/models/chat.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = fsPath.dirname(__filename);

async function cleanup() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/chat-backend');
        console.log('Connected to MongoDB.');

        console.log('Finding load test users...');
        const existingUsers = await User.find({ email: /loadtest_.*@example\.com/ });
        const userIds = existingUsers.map(u => u._id);

        if (userIds.length > 0) {
            console.log(`Deleting ${userIds.length} load test users...`);
            const userDel = await User.deleteMany({ _id: { $in: userIds } });
            console.log(`Deleted ${userDel.deletedCount} users.`);

            const sessionDel = await Session.deleteMany({ userId: { $in: userIds } });
            console.log(`Deleted ${sessionDel.deletedCount} sessions.`);

            const chatDel = await Chat.deleteMany({ participants: { $in: userIds } });
            console.log(`Deleted ${chatDel.deletedCount} chats.`);
        } else {
            console.log('No load test users found to delete.');
        }

        // Remove CSV file if exists
        const csvPath = fsPath.join(__dirname, 'users.csv');
        if (fs.existsSync(csvPath)) {
            console.log('Deleting users.csv file...');
            fs.unlinkSync(csvPath);
            console.log('Deleted users.csv.');
        }

    } catch (error) {
        console.error('Cleanup failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
    }
}

cleanup();
