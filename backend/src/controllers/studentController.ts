import type { Request, Response } from "express";
import pool from "../db/pool.js";
import { StatusCodes } from "http-status-codes";


export const getStudentProfile = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { user_id, role } = req.user!;

    if (role !== "student") {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "Access restricted to students only" });
    }
    console.log(req.user);

    const query = await client.query(
      `SELECT 
          u.user_id,
          u.name,
          u.email,
          u.phone,
          s.enrollment_year,
          s.degree,
          s.department,
          s.expected_graduation
       FROM users u
       JOIN students s ON s.user_id = u.user_id
       WHERE u.user_id = $1`,
      [user_id]
    );

    if (query.rows.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Student profile not found" });
    }

    res.status(StatusCodes.OK).json({
      message: "Profile fetched successfully",
      data: query.rows[0],
    });
  } catch (error) {
    console.error("Error fetching student profile:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error while fetching profile" });
  } finally {
    client.release();
  }
};

export const updateStudentProfile = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { user_id, role } = req.user!;
    const {
      name,
      phone,
      degree,
      department,
      enrollment_year,
      expected_graduation,
    } = req.body;

    // Only students can update student profile
    if (role !== "student") {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "Access restricted to students only" });
    }

    // Begin transaction
    await client.query("BEGIN");

    // Update USERS table
    await client.query(
      `
      UPDATE users 
      SET name = COALESCE($1, name),
          phone = COALESCE($2, phone)
      WHERE user_id = $3
      `,
      [name || null, phone || null, user_id]
    );

    // Update STUDENTS table
    await client.query(
      `
      UPDATE students 
      SET 
        degree = COALESCE($1, degree),
        department = COALESCE($2, department),
        enrollment_year = COALESCE($3, enrollment_year),
        expected_graduation = COALESCE($4, expected_graduation)
      WHERE user_id = $5
      `,
      [
        degree || null,
        department || null,
        enrollment_year || null,
        expected_graduation || null,
        user_id,
      ]
    );

    // Commit transaction
    await client.query("COMMIT");

    return res
      .status(StatusCodes.OK)
      .json({ message: "Profile updated successfully" });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating student profile:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error while updating profile" });
  } finally {
    client.release();
  }
};
