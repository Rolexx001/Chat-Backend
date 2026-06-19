import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
dotenv.config();

import User from '../../src/models/user.model.js';
import Session from '../../src/models/session.model.js';
import Chat from '../../src/models/chat.model.js';
import { generateAccessToken, generateRefreshToken } from '../../src/utils/generatetoken.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NUM_USERS = 100; // 100 users, 50 pairs
const PASSWORD = 'Password123!';

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/chat-backend');
        console.log('Connected to MongoDB.');

        // Clean existing load test records
        console.log('Cleaning existing load test records...');
        const existingUsers = await User.find({ email: /loadtest_.*@example\.com/ });
        const userIds = existingUsers.map(u => u._id);
        
        await User.deleteMany({ _id: { $in: userIds } });
        await Session.deleteMany({ userId: { $in: userIds } });
        await Chat.deleteMany({ participants: { $in: userIds } });
        console.log('Cleanup completed.');

        // Hash password once
        console.log('Hashing password...');
        const hashedPassword = await bcrypt.hash(PASSWORD, 10);

        // Create Users and Sessions
        console.log(`Creating ${NUM_USERS} users and sessions...`);
        const users = [];
        const sessions = [];
        const tokens = [];

        for (let i = 1; i <= NUM_USERS; i++) {
            const user = new User({
                name: `Load Tester ${i}`,
                email: `loadtest_${i}@example.com`,
                password: hashedPassword,
                bio: `Automated test runner number ${i}`,
                isOnline: false
            });
            await user.save();
            users.push(user);

            const session = new Session({
                userId: user._id,
                refreshToken: 'temp',
                deviceInfo: 'Artillery Load Tester',
                ipAddress: '127.0.0.1'
            });
            await session.save();

            const accessToken = generateAccessToken(user._id, session._id);
            const refreshToken = generateRefreshToken(user._id, session._id);

            session.refreshToken = refreshToken;
            await session.save();
            
            sessions.push(session);
            tokens.push(accessToken);
        }
        console.log('Users and sessions created.');

        // Create Chats between pairs
        console.log('Creating chats...');
        const csvRows = ['userId,token,sessionId,chatId,targetUserId'];

        for (let i = 0; i < NUM_USERS; i += 2) {
            const userA = users[i];
            const userB = users[i + 1];

            const chat = new Chat({
                participants: [userA._id, userB._id],
                isGroup: false
            });
            await chat.save();

            // Row for User A as the runner
            csvRows.push(`${userA._id},${tokens[i]},${sessions[i]._id},${chat._id},${userB._id}`);
            // Row for User B as the runner
            csvRows.push(`${userB._id},${tokens[i+1]},${sessions[i+1]._id},${chat._id},${userA._id}`);
        }

        // Write to CSV
        const csvPath = path.join(__dirname, 'users.csv');
        fs.writeFileSync(csvPath, csvRows.join('\n'));
        console.log(`Seeding complete. Wrote CSV data to ${csvPath}`);

    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
    }
}

seed();
