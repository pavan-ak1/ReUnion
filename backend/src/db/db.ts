import {Pool} from 'pg'


export const connectDb = new Pool({
    connectionString:process.env.DATABASE_URL,
    ssl:{
        rejectUnauthorized:false,
    }
})

connectDb.connect()
.then(()=>{
    console.log("Connected to postgreSQL database");
})
.catch(()=>{
    console.log("Could not connect to databsse");
})