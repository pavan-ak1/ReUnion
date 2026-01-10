import type { Request, Response } from "express";
import type { QueryResult } from "pg";
import { pool } from "../db/pool.js";
import { StatusCodes } from "http-status-codes";
import crypto from "crypto";
import { redisClient } from "../cache/redisClient.js";

function hashQuery(obj: object) {
  return crypto.createHash("md5").update(JSON.stringify(obj)).digest("hex");
}

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
    const keys = await redisClient.keys("alumni:*");
if (keys.length) await redisClient.del(keys);

await redisClient.del(`student:profile:${user_id}`);

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
    // ----------------------------
    // Query Params (Sanitized)
    // ----------------------------
    const search = typeof req.query.search === "string" ? req.query.search : "";
    const department =
      typeof req.query.department === "string" ? req.query.department : "";
    const degree = typeof req.query.degree === "string" ? req.query.degree : "";
    const company =
      typeof req.query.company === "string" ? req.query.company : "";
    const location =
      typeof req.query.location === "string" ? req.query.location : "";

    const graduationYear =
      req.query.graduation_year &&
      !isNaN(Number(req.query.graduation_year))
        ? Number(req.query.graduation_year)
        : null;

    // ----------------------------
    // Pagination
    // ----------------------------
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit as string) || 10)
    );
    const offset = (page - 1) * limit;

    // ----------------------------
    // Cache Key (Normalized)
    // ----------------------------
    const cacheKey =
      "alumni:list:" +
      crypto
        .createHash("md5")
        .update(
          JSON.stringify({
            search,
            department,
            degree,
            company,
            location,
            graduationYear,
            page,
            limit,
          })
        )
        .digest("hex");

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(StatusCodes.OK).json(JSON.parse(cached));
    }

    // ----------------------------
    // Base Query
    // ----------------------------
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
      baseQuery += ` AND u.name ILIKE $${index}`;
      params.push(`%${search}%`);
      index++;
    }

    if (company) {
      baseQuery += ` AND a.company ILIKE $${index}`;
      params.push(`%${company}%`);
      index++;
    }

    if (department) {
      baseQuery += ` AND a.department ILIKE $${index}`;
      params.push(`%${department}%`);
      index++;
    }

    if (degree) {
      baseQuery += ` AND a.degree ILIKE $${index}`;
      params.push(`%${degree}%`);
      index++;
    }

    if (location) {
      baseQuery += ` AND a.location ILIKE $${index}`;
      params.push(`%${location}%`);
      index++;
    }

    if (graduationYear !== null) {
      baseQuery += ` AND a.graduation_year = $${index}`;
      params.push(graduationYear);
      index++;
    }

    // Pagination
    baseQuery += ` ORDER BY u.name ASC LIMIT $${index} OFFSET $${index + 1}`;
    params.push(limit, offset);

    // ----------------------------
    // Count Query
    // ----------------------------
    let countQuery = `
      SELECT COUNT(*) AS total
      FROM users u
      JOIN alumni a ON a.user_id = u.user_id
      WHERE 1=1
    `;

    const countParams: (string | number)[] = [];
    let countIndex = 1;

    if (search) {
      countQuery += ` AND u.name ILIKE $${countIndex}`;
      countParams.push(`%${search}%`);
      countIndex++;
    }

    if (company) {
      countQuery += ` AND a.company ILIKE $${countIndex}`;
      countParams.push(`%${company}%`);
      countIndex++;
    }

    if (department) {
      countQuery += ` AND a.department ILIKE $${countIndex}`;
      countParams.push(`%${department}%`);
      countIndex++;
    }

    if (degree) {
      countQuery += ` AND a.degree ILIKE $${countIndex}`;
      countParams.push(`%${degree}%`);
      countIndex++;
    }

    if (location) {
      countQuery += ` AND a.location ILIKE $${countIndex}`;
      countParams.push(`%${location}%`);
      countIndex++;
    }

    if (graduationYear !== null) {
      countQuery += ` AND a.graduation_year = $${countIndex}`;
      countParams.push(graduationYear);
      countIndex++;
    }

    // ----------------------------
    // Execute Queries
    // ----------------------------
    const [result, countResult] = await Promise.all([
      client.query(baseQuery, params),
      client.query(countQuery, countParams),
    ]);

    const total = Number(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    const responsePayload = {
      message: "Alumni fetched successfully",
      data: result.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords: total,
        recordsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };

    await redisClient.set(cacheKey, JSON.stringify(responsePayload), {
      EX: 1800, // 30 minutes
    });

    return res.status(StatusCodes.OK).json(responsePayload);
  } catch (error) {
    console.error("Error fetching alumni:", error);
    return res
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
    const cacheKey = "alumni:filters";

    // 1. Check if redisClient is defined before attempting to use it
    if (redisClient) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.status(StatusCodes.OK).json(JSON.parse(cached));
      }
    }

    const queries = [
      "SELECT DISTINCT company FROM alumni WHERE company IS NOT NULL ORDER BY company",
      "SELECT DISTINCT department FROM alumni WHERE department IS NOT NULL ORDER BY department",
      "SELECT DISTINCT degree FROM alumni WHERE degree IS NOT NULL ORDER BY degree",
      "SELECT DISTINCT location FROM alumni WHERE location IS NOT NULL ORDER BY location",
      "SELECT DISTINCT graduation_year FROM alumni WHERE graduation_year IS NOT NULL ORDER BY graduation_year",
    ];

    const results: QueryResult<any>[] = await Promise.all(
      queries.map((query) => client.query(query))
    );

    const options = {
      companies: results[0]?.rows?.map((r) => r.company) || [],
      departments: results[1]?.rows?.map((r) => r.department) || [],
      degrees: results[2]?.rows?.map((r) => r.degree) || [],
      locations: results[3]?.rows?.map((r) => r.location) || [],
      graduationYears: results[4]?.rows?.map((r) => r.graduation_year) || [],
    };

    const responsePayload = {
      message: "Filter options fetched successfully",
      data: options,
    };

    // 2. Safely set the cache if redisClient is available
    if (redisClient) {
      await redisClient.set(cacheKey, JSON.stringify(responsePayload), {
        EX: 3600, // 1 hour
      });
    }

    return res.status(StatusCodes.OK).json(responsePayload);
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Server error while fetching filter options",
    });
  } finally {
    // Always release the DB client back to the pool
    client.release();
  }
};

export const getAlumniYearStats = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
     const cacheKey = "alumni:year-stats";

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const query = `
      SELECT 
        graduation_year,
        COUNT(*) AS total_alumni
      FROM alumni
      GROUP BY graduation_year
      ORDER BY graduation_year ASC
    `;

    const result = await client.query(query);

     const responsePayload = {
      message: "Alumni year stats fetched successfully",
      data: result.rows
    };

    await redisClient.set(cacheKey, JSON.stringify(responsePayload), {
      EX: 3600
    });

    res.status(200).json(responsePayload);
  } catch (error) {
    console.error("Error fetching alumni year stats:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Server error while fetching alumni year stats",
    });
  } finally {
    client.release();
  }
};
