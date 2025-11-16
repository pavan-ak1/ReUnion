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


export const getAllAlumni = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const search = req.query.search ? String(req.query.search) : "";
    const department = req.query.department ? String(req.query.department) : "";
    const degree = req.query.degree ? String(req.query.degree) : "";
    const company = req.query.company ? String(req.query.company) : "";
    const location = req.query.location ? String(req.query.location) : "";
    const graduation_year = req.query.graduation_year ? String(req.query.graduation_year) : "";

    let baseQuery = `
      SELECT 
        u.name, 
        u.email, 
        a.degree, 
        a.department,
        a.current_position, 
        a.company, 
        a.location,
        a.graduation_year
      FROM users u
      JOIN alumni a ON a.user_id = u.user_id
      WHERE 1=1
    `;

    const params: any[] = [];
    let index = 1;

    if (search) {
      baseQuery += ` AND LOWER(u.name) LIKE LOWER($${index})`;
      params.push(`%${search}%`);
      index++;
    }

    if (company) {
      baseQuery += ` AND LOWER(a.company) LIKE LOWER($${index})`;
      params.push(`%${company}%`);
      index++;
    }

    if (department) {
      baseQuery += ` AND LOWER(a.department) LIKE LOWER($${index})`;
      params.push(`%${department}%`);
      index++;
    }

    if (degree) {
      baseQuery += ` AND LOWER(a.degree) LIKE LOWER($${index})`;
      params.push(`%${degree}%`);
      index++;
    }

    if (location) {
      baseQuery += ` AND LOWER(a.location) LIKE LOWER($${index})`;
      params.push(`%${location}%`);
      index++;
    }

    // NEW: Graduation year filter
    if (graduation_year) {
      baseQuery += ` AND a.graduation_year = $${index}`;
      params.push(Number(graduation_year));
      index++;
    }

    const result = await client.query(baseQuery, params);

    res.status(StatusCodes.OK).json({
      message: "Alumni fetched successfully",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching alumni:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error while fetching alumni" });
  } finally {
    client.release();
  }
};


export const getAlumniYearStats = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const query = `
      SELECT 
        graduation_year,
        COUNT(*) AS total_alumni
      FROM alumni
      GROUP BY graduation_year
      ORDER BY graduation_year ASC
    `;

    const result = await client.query(query);

    res.status(StatusCodes.OK).json({
      message: "Alumni year stats fetched successfully",
      data: result.rows,
    });

  } catch (error) {
    console.error("Error fetching alumni year stats:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Server error while fetching alumni year stats",
    });
  } finally {
    client.release();
  }
};
