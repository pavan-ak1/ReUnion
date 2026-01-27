import { log } from "console";
import { createClient } from "redis";
import type { RedisClientType } from "redis"; 
import { RedisURL } from "../config/env.js";

const redisUrl = RedisURL;

if(!redisUrl){
    throw new Error("Redis url missing");
}

export const redisClient:RedisClientType =  createClient({
    url: redisUrl
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