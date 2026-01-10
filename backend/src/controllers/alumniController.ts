import type { Request, Response } from "express";
import { pool } from "../db/pool.js";
import { StatusCodes } from "http-status-codes";
import { redisClient } from "../cache/redisClient.js";

export const getAlumniProfile = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { user_id } = req.user!;

    const query = `
      SELECT 
        u.user_id,
        u.name,
        u.email,
        u.phone,
        a.graduation_year,
        a.degree,
        a.department,
        a.current_position,
        a.company,
        a.location,
        u.created_at
      FROM users u
      JOIN alumni a ON a.user_id = u.user_id
      WHERE u.user_id = $1
    `;

    const result = await client.query(query, [user_id]);

    if (result.rows.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Alumni profile not found" });
    }

    // IMPORTANT FIX: send only the profile object
    return res.status(StatusCodes.OK).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching alumni profile:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error while fetching alumni profile" });
  } finally {
    client.release();
  }
};

export const updateAlumniProfile = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { user_id } = req.user!;
    const {
      name,
      phone,
      graduation_year,
      degree,
      department,
      current_position,
      company,
      location,
    } = req.body;

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

    // Update ALUMNI table
    await client.query(
      `
      UPDATE alumni 
      SET graduation_year = COALESCE($1, graduation_year),
          degree = COALESCE($2, degree),
          department = COALESCE($3, department),
          current_position = COALESCE($4, current_position),
          company = COALESCE($5, company),
          location = COALESCE($6, location)
      WHERE user_id = $7
      `,
      [
        graduation_year || null,
        degree || null,
        department || null,
        current_position || null,
        company || null,
        location || null,
        user_id,
      ]
    );

    await client.query("COMMIT");
    const keys = await redisClient.keys("alumni:*");
    if (keys.length) await redisClient.del(keys);

    await redisClient.del(`student:profile:${user_id}`);

    res
      .status(StatusCodes.OK)
      .json({ message: "Alumni profile updated successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating alumni profile:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error while updating alumni profile" });
  } finally {
    client.release();
  }
};
