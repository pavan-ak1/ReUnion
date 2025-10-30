import { generateToken } from "./generateToken.js"
import type { Response } from "express"

interface User{
    user_id:number,
    role:string
}


export const attachCookiesToResponse = (res:Response, token:string)=>{
    const oneDay = 1000*60*60*24;

    res.cookie('token', token, {
        httpOnly:true,
        signed:true,
        expires:new Date(Date.now() + oneDay),
        secure:process.env.NODE_ENV === 'production',
    })

}