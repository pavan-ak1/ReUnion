import type { Request, Response } from "express";
import pool from "../db/pool.js";
import { StatusCodes } from "http-status-codes";

export const getAllJobs = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
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
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error while fetching jobs" });
  } finally {
    client.release();
  }
};

export const applyForJob = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { user_id } = req.user!;
    const { job_id } = req.body;
    if (!job_id) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "job_id is required" });
    }
    const jobCheck = await client.query(
      "Select * from jobs where job_id = $1",
      [job_id]
    );
    if (jobCheck.rows.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "job id required" });
    }

    const applied = await client.query(
      "select * from job_applications where job_id=$1 and student_id=$2",
      [job_id, user_id]
    );
    if (applied.rows.length > 0) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "Already applied for this job" });
    }
    await client.query(
      "INSERT INTO job_applications (job_id, student_id) VALUES ($1, $2)",
      [job_id, user_id]
    );

    res
      .status(StatusCodes.CREATED)
      .json({ message: "Successfully applied for the job" });
  } catch (error) {
    console.error("Error applying for job:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error during job application" });
  } finally {
    client.release();
  }
};

export const getAppliedJobs = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { user_id } = req.user!;

    const query = `
      SELECT 
        j.job_id,
        j.job_title,
        j.company,
        j.location,
        j.employment_type,
        j.application_deadline,
        ja.status,
        ja.applied_at,
        u.name AS posted_by
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.job_id
      JOIN users u ON j.alumni_id = u.user_id
      WHERE ja.student_id = $1
      ORDER BY ja.applied_at DESC;
    `;

    const result = await client.query(query, [user_id]);

    res.status(StatusCodes.OK).json({
      message: "Applied jobs fetched successfully",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching applied jobs:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error while fetching applied jobs" });
  } finally {
    client.release();
  }
};



export const createJob = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { user_id } = req.user!;
    const {
      job_title,
      company,
      job_description,
      location,
      employment_type,
      application_deadline,
    } = req.body;

    

    if (!job_title || !company || !employment_type || !application_deadline) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Missing required job fields" });
    }

    const query = `
      INSERT INTO jobs (alumni_id, job_title, company, job_description, location, employment_type, application_deadline)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING job_id, job_title, company, employment_type, location, posted_date
    `;

    const result = await client.query(query, [
      user_id,
      job_title,
      company,
      job_description || null,
      location || null,
      employment_type,
      application_deadline,
    ]);

    res.status(StatusCodes.CREATED).json({
      message: "Job created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating job:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error while creating job" });
  } finally {
    client.release();
  }
};


export const getAlumniJobs = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { user_id } = req.user!;

    const query = `
      SELECT job_id, job_title, company, location, employment_type, posted_date, application_deadline
      FROM jobs
      WHERE alumni_id = $1
      ORDER BY posted_date DESC
    `;
    const result = await client.query(query, [user_id]);

    res.status(StatusCodes.OK).json({
      message: "Jobs fetched successfully",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching alumni jobs:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error while fetching jobs" });
  } finally {
    client.release();
  }
};


export const updateJob = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { user_id } = req.user!;
    const { jobId } = req.params;
    const {
      job_title,
      company,
      job_description,
      location,
      employment_type,
      application_deadline,
    } = req.body;

    // Check if this job belongs to the logged-in alumni
    const check = await client.query(
      `SELECT * FROM jobs WHERE job_id = $1 AND alumni_id = $2`,
      [jobId, user_id]
    );

    if (check.rows.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Job not found or not owned by this alumni" });
    }

    await client.query(
      `UPDATE jobs
       SET job_title = COALESCE($1, job_title),
           company = COALESCE($2, company),
           job_description = COALESCE($3, job_description),
           location = COALESCE($4, location),
           employment_type = COALESCE($5, employment_type),
           application_deadline = COALESCE($6, application_deadline)
       WHERE job_id = $7`,
      [
        job_title,
        company,
        job_description,
        location,
        employment_type,
        application_deadline,
        jobId,
      ]
    );

    res.status(StatusCodes.OK).json({ message: "Job updated successfully" });
  } catch (error) {
    console.error("Error updating job:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error while updating job" });
  } finally {
    client.release();
  }
};



export const deleteJob = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { user_id } = req.user!;
    const { jobId } = req.params;

    
    const check = await client.query(
      `SELECT * FROM jobs WHERE job_id = $1 AND alumni_id = $2`,
      [jobId, user_id]
    );

    if (check.rows.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Job not found or not owned by this alumni" });
    }

    await client.query("DELETE FROM jobs WHERE job_id = $1", [jobId]);

    res.status(StatusCodes.OK).json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error while deleting job" });
  } finally {
    client.release();
  }
};



export const getJobApplicants = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { user_id } = req.user!;
    const { jobId } = req.params;

    const check = await client.query(
      `SELECT * FROM jobs WHERE job_id = $1 AND alumni_id = $2`,
      [jobId, user_id]
    );

    if (check.rows.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Job not found or not owned by this alumni" });
    }

    const query = `
      SELECT 
        ja.application_id,
        ja.status,
        ja.applied_at,
        u.name AS student_name,
        u.email AS student_email,
        u.phone AS student_phone
      FROM job_applications ja
      JOIN users u ON ja.student_id = u.user_id
      WHERE ja.job_id = $1
      ORDER BY ja.applied_at DESC
    `;
    const result = await client.query(query, [jobId]);

    res.status(StatusCodes.OK).json({
      message: "Applicants fetched successfully",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching job applicants:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error while fetching applicants" });
  } finally {
    client.release();
  }
};


export const updateApplicationStatus = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { user_id } = req.user!;
    const { jobId, applicationId } = req.params;
    const { status } = req.body;

    if (!["Applied", "Shortlisted", "Hired", "Rejected"].includes(status)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid status value" });
    }

    const check = await client.query(
      `SELECT * FROM jobs WHERE job_id = $1 AND alumni_id = $2`,
      [jobId, user_id]
    );

    if (check.rows.length === 0) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "Not authorized to modify this job" });
    }

    await client.query(
      `UPDATE job_applications SET status = $1 WHERE application_id = $2 AND job_id = $3`,
      [status, applicationId, jobId]
    );

    res.status(StatusCodes.OK).json({ message: "Application status updated" });
  } catch (error) {
    console.error("Error updating application status:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error while updating application status" });
  } finally {
    client.release();
  }
};


