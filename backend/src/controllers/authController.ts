import type { Request, Response } from "express";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pool from "../db/pool.js";
import { StatusCodes } from "http-status-codes";
import { hashPassword } from "../utils/hashPassword.js";
import { checkPassword } from "../utils/checkPasswordMatch.js";
import { generateToken } from "../utils/generateToken.js";
import { attachCookiesToResponse } from "../utils/attachCookiesToResponse.js";

const JWT_SECRET = process.env.JWT_SECRET as string;


export const signup = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { name, email, phone, password, role, extra } = req.body;

    // Check for duplicate email
    const check = await client.query("SELECT * FROM users WHERE email=$1", [email]);
    if (check.rows.length > 0) {
      return res.status(StatusCodes.CONFLICT).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Begin transaction
    await client.query("BEGIN");

    // Insert into users table (select only safe fields to return)
    const userResult = await client.query(
      'INSERT INTO users (name, email, phone, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, name, email, phone, role, created_at',
      [name, email, phone, hashedPassword, role]
    );
    const user = userResult.rows[0]; // this already excludes password

    // Insert into role-specific table
    if (role === "student") {
      await client.query(
        `INSERT INTO students (user_id, enrollment_year, degree, department, expected_graduation)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          user.user_id,
          extra.enrollment_year,
          extra.degree,
          extra.department,
          extra.expected_graduation,
        ]
      );
    } else if (role === "alumni") {
      await client.query(
        `INSERT INTO alumni (user_id, graduation_year, degree, department, current_position, company, location)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          user.user_id,
          extra.graduation_year,
          extra.degree,
          extra.department,
          extra.current_position,
          extra.company,
          extra.location,
        ]
      );
    }

    // Commit transaction
    await client.query("COMMIT");

    // Send response
    res.status(StatusCodes.CREATED).json({
      message: "Signup Successful",
      user,
    });
  } catch (error) {
    // Rollback if anything goes wrong
    await client.query("ROLLBACK");
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
  } finally {
    client.release();
  }
};


export const signin = async(req:Request, res:Response)=>{
    const client = await pool.connect();

    try{

      const {email,password} = req.body;

      const userResult = await client.query('SELECT * FROM users WHERE email=$1', [email]);

      if(userResult.rows.length == 0){
        return res.status(StatusCodes.NOT_FOUND).json({message:"User not Found"});
      }

      const user = userResult.rows[0];
      const databasePassword = user.password;
      const isMatch = await checkPassword(password,databasePassword);
      
      if(!isMatch){
        return res.status(StatusCodes.UNAUTHORIZED).json({message:'Invalid Credentials'});

      }

      const token = await generateToken(user.user_id, user.role);

      if(!token){
        res.status(StatusCodes.BAD_REQUEST).json({message:'Token not created'});
      }

      const tokenUser = {
        user_id:user.user_id,
        role:user.role
      }
      await attachCookiesToResponse(res,token);

      res.status(StatusCodes.OK).json({message:"User authenticated", user:tokenUser});
      
    }
    catch(error){
      console.log(error);
    }
}