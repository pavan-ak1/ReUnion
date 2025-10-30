import type { Request, Response } from "express";
import pool from "../db/pool.js";
import { StatusCodes } from "http-status-codes";


export const getAllJobs= async(req:Request,res:Response)=>{
    const client = await pool.connect();

    try{
        const query = `
      SELECT 
        j.job_id,
        j.job_title,
        j.company,
        j.job_description,
        j.location,
        j.employment_type,
        j.posted_date,
        j.application_deadline,
        u.name AS posted_by,
        u.email AS alumni_email
      FROM jobs j
      JOIN users u ON j.alumni_id = u.user_id
      ORDER BY j.posted_date DESC;
    `;

    const result = await client.query(query);

    res.status(StatusCodes.OK).json({
      message: "All jobs fetched successfully",
      data: result.rows,
    });


    }
    catch (error) {
    console.error("Error fetching jobs:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error while fetching jobs" });
  } finally {
    client.release();
  }
}


