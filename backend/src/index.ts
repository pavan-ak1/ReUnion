import dotenv from 'dotenv'
import express  from 'express'
import type { Request, Response } from 'express';

dotenv.config();

const app = express();

app.get("/", (req:Request,res:Response)=>{
    res.send("API running in backend");
});




const port = process.env.PORT || 5000;

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
    
})