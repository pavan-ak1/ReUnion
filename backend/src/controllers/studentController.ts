import type { Request, Response } from "express";
import pool from "../db/pool.js";
import { StatusCodes } from "http-status-codes";

// Database row interfaces
interface CompanyRow {
  company: string;
}

interface DepartmentRow {
  department: string;
}

interface DegreeRow {
  degree: string;
}

interface LocationRow {
  location: string;
}

interface GraduationYearRow {
  graduation_year: number;
}


export const getStudentProfile = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    if (!req.user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "User not authenticated" });
    }
    const { user_id, role } = req.user;

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
    if (!req.user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "User not authenticated" });
    }
    const { user_id, role } = req.user;
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

    // Pagination parameters
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const offset = (page - 1) * limit;

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

    const params: (string | number)[] = [];
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

    // Add ordering and pagination
    baseQuery += ` ORDER BY u.name ASC LIMIT $${index} OFFSET $${index + 1}`;
    params.push(limit, offset);

    // Count query for total records
    let countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      JOIN alumni a ON a.user_id = u.user_id
      WHERE 1=1
    `;

    const countParams: (string | number)[] = [];
    let countIndex = 1;

    if (search) {
      countQuery += ` AND LOWER(u.name) LIKE LOWER($${countIndex})`;
      countParams.push(`%${search}%`);
      countIndex++;
    }

    if (company) {
      countQuery += ` AND LOWER(a.company) LIKE LOWER($${countIndex})`;
      countParams.push(`%${company}%`);
      countIndex++;
    }

    if (department) {
      countQuery += ` AND LOWER(a.department) LIKE LOWER($${countIndex})`;
      countParams.push(`%${department}%`);
      countIndex++;
    }

    if (degree) {
      countQuery += ` AND LOWER(a.degree) LIKE LOWER($${countIndex})`;
      countParams.push(`%${degree}%`);
      countIndex++;
    }

    if (location) {
      countQuery += ` AND LOWER(a.location) LIKE LOWER($${countIndex})`;
      countParams.push(`%${location}%`);
      countIndex++;
    }

    if (graduation_year) {
      countQuery += ` AND a.graduation_year = $${countIndex}`;
      countParams.push(Number(graduation_year));
      countIndex++;
    }

    // Execute both queries
    const [result, countResult] = await Promise.all([
      client.query(baseQuery, params),
      client.query(countQuery, countParams)
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.status(StatusCodes.OK).json({
      message: "Alumni fetched successfully",
      data: result.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords: total,
        recordsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
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

// NEW: Get unique filter options for dropdowns
export const getFilterOptions = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const queries = [
      'SELECT DISTINCT company FROM alumni WHERE company IS NOT NULL ORDER BY company',
      'SELECT DISTINCT department FROM alumni WHERE department IS NOT NULL ORDER BY department',
      'SELECT DISTINCT degree FROM alumni WHERE degree IS NOT NULL ORDER BY degree',
      'SELECT DISTINCT location FROM alumni WHERE location IS NOT NULL ORDER BY location',
      'SELECT DISTINCT graduation_year FROM alumni WHERE graduation_year IS NOT NULL ORDER BY graduation_year'
    ];

    const results = await Promise.all(
      queries.map(query => client.query(query))
    );

    const options = {
      companies: results[0]?.rows
        .filter((row: CompanyRow) => row.company !== null && row.company !== undefined)
        .map((row: CompanyRow) => row.company) || [],
      departments: results[1]?.rows
        .filter((row: DepartmentRow) => row.department !== null && row.department !== undefined)
        .map((row: DepartmentRow) => row.department) || [],
      degrees: results[2]?.rows
        .filter((row: DegreeRow) => row.degree !== null && row.degree !== undefined)
        .map((row: DegreeRow) => row.degree) || [],
      locations: results[3]?.rows
        .filter((row: LocationRow) => row.location !== null && row.location !== undefined)
        .map((row: LocationRow) => row.location) || [],
      graduationYears: results[4]?.rows
        .filter((row: GraduationYearRow) => row.graduation_year !== null && row.graduation_year !== undefined)
        .map((row: GraduationYearRow) => row.graduation_year) || []
    };

    res.status(StatusCodes.OK).json({
      message: "Filter options fetched successfully",
      data: options
    });
  } catch (error) {
    console.error("Error fetching filter options:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Server error while fetching filter options"
    });
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
