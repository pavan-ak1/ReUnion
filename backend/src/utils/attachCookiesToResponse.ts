import { generateToken } from "./generateToken.js"
import type { Response } from "express"

interface User{
    user_id:number,
    role:string
}


export const attachCookiesToResponse = (res:Response, token:string)=>{
    const isProduction = process.env.NODE_ENV === 'production';
    const oneDay = 1000 * 60 * 60 * 24; // 1 day in milliseconds

    const cookieOptions: any = {
        httpOnly: true,
        secure: isProduction,
        signed: true,
        expires: new Date(Date.now() + oneDay),
        sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-site cookies in production
        path: '/',
        domain: isProduction ? '.yourdomain.com' : 'localhost', // Replace with your domain in production
    };

    console.log('Setting cookie with options:', {
        ...cookieOptions,
        expires: cookieOptions.expires.toISOString(),
    });

    res.cookie('token', token, cookieOptions);
};