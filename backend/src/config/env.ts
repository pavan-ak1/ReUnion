import dotenv from 'dotenv'

dotenv.config();

export const RedisURL = process.env.REDIS_URL;