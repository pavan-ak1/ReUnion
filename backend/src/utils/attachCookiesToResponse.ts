import { generateToken } from "./generateToken.js"
import type { Response } from "express"

interface User{
    user_id:number,
    role:string
}


export const attachCookiesToResponse = (res: Response, token: string) => {
    res.cookie("token", token, {
        httpOnly: true,
        secure: true,      // Render = HTTPS
        signed: true,
        sameSite: "none",  // Required for cross-site cookies
        path: "/",
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24)
    });
};

