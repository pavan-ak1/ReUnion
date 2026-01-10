import { log } from "console";
import { createClient } from "redis";
import type { RedisClientType } from "redis"; 

export const redisClient:RedisClientType =  createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
})

redisClient.on("error", (err)=>{
    console.error(err);
})

export const connectRedis = async ()=>{
    if(!redisClient.isOpen){
        await redisClient.connect();
        log("Redis connected");
    }
}