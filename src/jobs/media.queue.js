import { Queue } from "bullmq";
import { redis } from "../config/redis.js";

export const mediaQueue = new Queue("media-processing", {
    connection: redis,
});
