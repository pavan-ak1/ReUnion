import type { Request, Response } from "express";

import pool from "../db/pool.js";
import { StatusCodes } from "http-status-codes";

export const getAllEvents = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        e.event_id,
        e.event_name,
        e.description,
        e.date,
        e.location,
        u.name AS organizer_name,
        u.email AS organizer_email
      FROM events e
      JOIN users u ON e.organizer_id = u.user_id
      ORDER BY 
        CASE WHEN e.date >= CURRENT_DATE THEN 0 ELSE 1 END,
        e.date ASC NULLS LAST
      LIMIT $1 OFFSET $2
    `;
    const result = await client.query(query, [limit, offset]);

    const countQuery = `
      SELECT COUNT(*) as total
      FROM events e
      JOIN users u ON e.organizer_id = u.user_id
    `;
    const countResult = await client.query(countQuery);
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.status(StatusCodes.OK).json({
      message: "All events fetched successfully",
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
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Server error while fetching events" });
  } finally {
    client.release();
  }
};

export const getStudentEvents = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    if (req.user!.role !== "student") {
      return res.status(403).json({ message: "Only students can view registered events" });
    }

    const { user_id } = req.user!;

    const query = `
      SELECT 
        e.event_id,
        e.event_name,
        e.description,
        e.date,
        e.location,
        u.name AS organizer_name
      FROM events e
      JOIN student_events se ON e.event_id = se.event_id
      JOIN users u ON e.organizer_id = u.user_id
      WHERE se.student_id = $1
      ORDER BY e.date DESC
    `;

    const result = await client.query(query, [user_id]);

    res.status(StatusCodes.OK).json({
      message: "Registered events fetched successfully",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching student events:", error);
    res.status(500).json({ message: "Server error while fetching student events" });
  } finally {
    client.release();
  }
};

export const registerForEvent = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    if (req.user!.role !== "student") {
      return res.status(403).json({ message: "Only students can register for events" });
    }

    const { user_id } = req.user!;
    const { event_id } = req.body;

    if (!event_id) {
      return res.status(400).json({ message: "event_id is required" });
    }

    const eventCheck = await client.query(
      "SELECT * FROM events WHERE event_id = $1",
      [event_id]
    );
    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    const already = await client.query(
      "SELECT * FROM student_events WHERE student_id = $1 AND event_id = $2",
      [user_id, event_id]
    );
    if (already.rows.length > 0) {
      return res.status(409).json({ message: "Already registered for this event" });
    }

    await client.query(
      "INSERT INTO student_events (student_id, event_id) VALUES ($1, $2)",
      [user_id, event_id]
    );

    res.status(201).json({ message: "Successfully registered for the event" });

  } catch (error) {
    console.error("Error registering for event:", error);
    res.status(500).json({ message: "Server error during event registration" });
  } finally {
    client.release();
  }
};


export const unregisterFromEvent = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    if (req.user!.role !== "student") {
      return res.status(403).json({ message: "Only students can unregister from events" });
    }

    const { user_id } = req.user!;
    const { eventId } = req.params;

    const check = await client.query(
      "SELECT * FROM student_events WHERE student_id = $1 AND event_id = $2",
      [user_id, eventId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Not registered for this event" });
    }

    await client.query(
      "DELETE FROM student_events WHERE student_id = $1 AND event_id = $2",
      [user_id, eventId]
    );

    res.status(200).json({ message: "Unregistered successfully" });

  } catch (error) {
    console.error("Error unregistering from event:", error);
    res.status(500).json({ message: "Server error while unregistering" });
  } finally {
    client.release();
  }
};

export const createEvent = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    if (req.user!.role !== "alumni") {
      return res.status(403).json({ message: "Only alumni can create events" });
    }

    const { user_id } = req.user!;
    const { event_name, description, date, location } = req.body;

    if (!event_name || !date || !location) {
      return res.status(400).json({
        message: "event_name, date, and location are required",
      });
    }

    if (isNaN(Date.parse(date))) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const result = await client.query(
      `
      INSERT INTO events (event_name, description, date, location, organizer_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING event_id, event_name, description, date, location, created_at
    `,
      [event_name, description || null, date, location, user_id]
    );

    res.status(201).json({
      message: "Event created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Server error while creating event" });
  } finally {
    client.release();
  }
};

export const getAlumniEvents = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { user_id } = req.user!;

    const query = `
      SELECT event_id, event_name, description, date, location, created_at
      FROM events
      WHERE organizer_id = $1
      ORDER BY date DESC
    `;

    const result = await client.query(query, [user_id]);

    res.status(200).json({
      message: "Alumni events fetched successfully",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching alumni events:", error);
    res.status(500).json({ message: "Server error while fetching events" });
  } finally {
    client.release();
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    if (req.user!.role !== "alumni") {
      return res.status(403).json({ message: "Only alumni can edit events" });
    }

    const { user_id } = req.user!;
    const { eventId } = req.params;
    const { event_name, description, date, location } = req.body;

    const check = await client.query(
      `SELECT * FROM events WHERE event_id = $1 AND organizer_id = $2`,
      [eventId, user_id]
    );

    if (check.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Event not found or not owned by this alumni" });
    }

    await client.query(
      `
      UPDATE events 
      SET event_name = COALESCE($1, event_name),
          description = COALESCE($2, description),
          date = COALESCE($3, date),
          location = COALESCE($4, location)
      WHERE event_id = $5
    `,
      [event_name, description, date, location, eventId]
    );

    res.status(200).json({ message: "Event updated successfully" });

  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Server error while updating event" });
  } finally {
    client.release();
  }
};



export const deleteEvent = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    if (req.user!.role !== "alumni") {
      return res.status(403).json({ message: "Only alumni can delete events" });
    }

    const { user_id } = req.user!;
    const { eventId } = req.params;

    const check = await client.query(
      `SELECT * FROM events WHERE event_id = $1 AND organizer_id = $2`,
      [eventId, user_id]
    );

    if (check.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Event not found or not owned by this alumni" });
    }

    await client.query("DELETE FROM events WHERE event_id = $1", [eventId]);

    res.status(200).json({ message: "Event deleted successfully" });

  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Server error while deleting event" });
  } finally {
    client.release();
  }
};