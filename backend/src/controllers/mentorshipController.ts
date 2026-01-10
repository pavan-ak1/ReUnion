import type { Request, Response } from "express";
import { pool } from "../db/pool.js";
import { StatusCodes } from "http-status-codes";
import { redisClient } from "../cache/redisClient.js";

export const setupMentorshipProfile = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { user_id } = req.user!;
    const { expertise, availability, max_mentees } = req.body;

    if (!expertise) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Expertise field is required" });
    }

    // Check if mentorship profile exists
    const existing = await client.query(
      `SELECT * FROM mentors WHERE alumni_id = $1`,
      [user_id]
    );

    let result;
    if (existing.rows.length > 0) {
      // UPDATE mentor profile
      result = await client.query(
        `UPDATE mentors
         SET expertise = COALESCE($1, expertise),
             availability = COALESCE($2, availability),
             max_mentees = COALESCE($3, max_mentees)
         WHERE alumni_id = $4
         RETURNING alumni_id, expertise, availability, max_mentees`,
        [expertise, availability, max_mentees, user_id]
      );

      let keys = await redisClient.keys("mentors:*");
      if (keys.length) {
        await redisClient.del(keys);
      }
      keys = await redisClient.keys("alumni:*");
      if (keys.length) await redisClient.del(keys);


      await redisClient.del(`student:profile:${user_id}`);
      await redisClient.del(`mentor:public:${user_id}`);

      return res.status(StatusCodes.OK).json({
        message: "Mentorship profile updated successfully",
        data: result.rows[0],
      });
    }

    // CREATE new mentor profile
    result = await client.query(
      `INSERT INTO mentors (alumni_id, expertise, availability, max_mentees)
       VALUES ($1, $2, COALESCE($3, TRUE), COALESCE($4, 5))
       RETURNING alumni_id, expertise, availability, max_mentees`,
      [user_id, expertise, availability, max_mentees]
    );

    return res.status(StatusCodes.CREATED).json({
      message: "Mentorship profile created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error setting up mentorship profile:", error);
    res
      .status(500)
      .json({ message: "Server error while setting up mentorship profile" });
  } finally {
    client.release();
  }
};

export const getMentorshipProfile = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { user_id, role } = req.user!;

    if (role !== "alumni") {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "Access restricted to alumni only" });
    }

    const query = `
      SELECT 
        m.alumni_id,
        m.expertise,
        m.availability,
        m.max_mentees,
        u.name,
        u.email,
        u.phone
      FROM mentors m
      JOIN users u ON m.alumni_id = u.user_id
      WHERE m.alumni_id = $1
    `;

    const result = await client.query(query, [user_id]);

    if (result.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "No mentorship profile found for this alumni",
      });
    }

    res.status(StatusCodes.OK).json({
      message: "Mentorship profile fetched successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching mentorship profile:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching mentorship profile" });
  } finally {
    client.release();
  }
};

export const getAvailableMentors = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const cacheKey = `mentors:available:page=${page}:limit=${limit}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(StatusCodes.OK).json(JSON.parse(cached));
    }

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM mentors m
      WHERE m.availability = TRUE
    `;

    const countResult = await client.query(countQuery);
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    // Get paginated mentors
    const query = `
      SELECT 
        m.alumni_id AS mentor_id,
        u.name AS mentor_name,
        u.email AS mentor_email,
        a.degree,
        a.department,
        m.expertise,
        m.availability,
        m.max_mentees
      FROM mentors m
      JOIN users u ON m.alumni_id = u.user_id
      JOIN alumni a ON a.user_id = u.user_id
      WHERE m.availability = TRUE
      ORDER BY a.department, u.name
      LIMIT $1 OFFSET $2
    `;

    const result = await client.query(query, [limit, offset]);
    const responsePayload = {
      message: "Available mentors fetched successfully",
      data: result.rows,
      pagination: {
        currentPage: page,
        totalPages,
        total,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    // 4️⃣ CACHE STORE (TTL = safety net)
    await redisClient.set(
      cacheKey,
      JSON.stringify(responsePayload),
      { EX: 1800 } // 30 mins
    );

    res.status(StatusCodes.OK).json(responsePayload);
  } catch (error) {
    console.error("Error fetching mentors:", error);
    res.status(500).json({ message: "Server error while fetching mentors" });
  } finally {
    client.release();
  }
};

export const sendMentorshipRequest = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { user_id, role } = req.user!;
    const { mentor_id } = req.body; // frontend still sends mentor_id (which = alumni_id)

    if (role !== "student") {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "Access restricted to students only" });
    }

    // Check if mentor exists
    const mentorCheck = await client.query(
      "SELECT * FROM mentors WHERE alumni_id = $1 AND availability = TRUE",
      [mentor_id]
    );

    if (mentorCheck.rows.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Mentor not found or unavailable" });
    }

    // Check if already requested
    const existing = await client.query(
      "SELECT * FROM mentorship_requests WHERE student_id = $1 AND mentor_id = $2",
      [user_id, mentor_id]
    );

    if (existing.rows.length > 0) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "You have already requested this mentor" });
    }

    // Insert new request
    const result = await client.query(
      `INSERT INTO mentorship_requests (student_id, mentor_id)
       VALUES ($1, $2)
       RETURNING request_id, status, requested_at`,
      [user_id, mentor_id]
    );

    res.status(StatusCodes.CREATED).json({
      message: "Mentorship request sent successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error sending mentorship request:", error);
    res.status(500).json({ message: "Server error while sending request" });
  } finally {
    client.release();
  }
};

export const getStudentRequests = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { user_id, role } = req.user!;

    if (role !== "student") {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "Access restricted to students only" });
    }

    const query = `
      SELECT 
        r.request_id,
        r.status,
        r.requested_at,
        m.alumni_id AS mentor_id,
        m.expertise,
        u.name AS mentor_name,
        u.email AS mentor_email
      FROM mentorship_requests r
      JOIN mentors m ON r.mentor_id = m.alumni_id
      JOIN users u ON m.alumni_id = u.user_id
      WHERE r.student_id = $1
      ORDER BY r.requested_at DESC
    `;

    const result = await client.query(query, [user_id]);

    res.status(StatusCodes.OK).json({
      message:
        result.rows.length === 0
          ? "No mentorship requests found"
          : "Mentorship requests fetched successfully",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching student requests:", error);
    res.status(500).json({ message: "Server error while fetching requests" });
  } finally {
    client.release();
  }
};

export const getMentorshipRequests = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { user_id, role } = req.user!;

    if (role !== "alumni") {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "Access restricted to alumni only" });
    }

    // Check if alumni is a mentor
    const mentorRes = await client.query(
      "SELECT alumni_id, max_mentees FROM mentors WHERE alumni_id = $1",
      [user_id]
    );

    if (mentorRes.rows.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "No mentorship profile found for this alumni" });
    }

    const mentor_id = mentorRes.rows[0].alumni_id;

    const query = `
      SELECT 
        r.request_id,
        r.status,
        r.requested_at,
        u.user_id AS student_id,
        u.name AS student_name,
        u.email AS student_email,
        u.phone AS student_phone
      FROM mentorship_requests r
      JOIN users u ON r.student_id = u.user_id
      WHERE r.mentor_id = $1
      ORDER BY r.requested_at DESC
    `;

    const result = await client.query(query, [mentor_id]);

    if (result.rows.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "No mentorship requests found" });
    }

    res.status(StatusCodes.OK).json({
      message: "Mentorship requests fetched successfully",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching mentorship requests:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching mentorship requests" });
  } finally {
    client.release();
  }
};

export const respondToMentorshipRequest = async (
  req: Request,
  res: Response
) => {
  const client = await pool.connect();
  try {
    const { user_id, role } = req.user!;
    const { requestId } = req.params;
    const { status } = req.body;

    if (role !== "alumni") {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "Access restricted to alumni only" });
    }

    if (!["Accepted", "Rejected"].includes(status)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Status must be either 'Accepted' or 'Rejected'" });
    }

    // Fetch mentor details
    const mentorRes = await client.query(
      "SELECT alumni_id, max_mentees FROM mentors WHERE alumni_id = $1",
      [user_id]
    );

    if (mentorRes.rows.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "No mentorship profile found for this alumni" });
    }

    const mentor_id = mentorRes.rows[0].alumni_id;
    const max_mentees = mentorRes.rows[0].max_mentees;

    // Verify request belongs to this mentor
    const check = await client.query(
      "SELECT * FROM mentorship_requests WHERE request_id = $1 AND mentor_id = $2",
      [requestId, mentor_id]
    );

    if (check.rows.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Request not found or not authorized to modify" });
    }

    // Update request status
    await client.query(
      "UPDATE mentorship_requests SET status = $1 WHERE request_id = $2",
      [status, requestId]
    );

    // Auto-disable mentor availability when full
    if (status === "Accepted") {
      const countAccepted = await client.query(
        "SELECT COUNT(*) FROM mentorship_requests WHERE mentor_id = $1 AND status = 'Accepted'",
        [mentor_id]
      );

      const acceptedCount = parseInt(countAccepted.rows[0].count);

      if (acceptedCount >= max_mentees) {
        await client.query(
          "UPDATE mentors SET availability = FALSE WHERE alumni_id = $1",
          [mentor_id]
        );
      }
    }
    const keys = await redisClient.keys("mentors:*");
    if (keys.length) {
      await redisClient.del(keys);
    }

    await redisClient.del(`mentor:public:${user_id}`);

    res.status(StatusCodes.OK).json({
      message: `Mentorship request ${status.toLowerCase()} successfully`,
    });
  } catch (error) {
    console.error("Error responding to mentorship request:", error);
    res
      .status(500)
      .json({ message: "Server error while updating request status" });
  } finally {
    client.release();
  }
};

export const getMentorPublicProfile = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { mentorId } = req.params;

    const cacheKey = `mentor:public:${mentorId}`;

    // 1️⃣ CACHE CHECK
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const query = await client.query(
      `
      SELECT 
        m.alumni_id AS mentor_id,
        u.name,
        u.email,
        a.degree,
        a.department,
        m.expertise,
        m.availability,
        a.current_position,
        a.company,
        a.location
      FROM mentors m
      JOIN alumni a ON a.user_id = m.alumni_id
      JOIN users u ON u.user_id = m.alumni_id
      WHERE m.alumni_id = $1
      `,
      [mentorId]
    );

    if (query.rows.length === 0) {
      return res.status(404).json({ message: "Mentor profile not found" });
    }

    const responsePayload = {
      message: "Mentor profile fetched successfully",
      data: query.rows[0],
    };

    // 3️⃣ CACHE STORE
    await redisClient.set(
      cacheKey,
      JSON.stringify(responsePayload),
      { EX: 3600 } // 1 hour
    );

    return res.status(200).json(responsePayload);
  } catch (error) {
    console.error("Error fetching mentor public profile:", error);
    return res.status(500).json({
      message: "Server error while fetching mentor profile",
    });
  } finally {
    client.release();
  }
};
