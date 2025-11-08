import type { Request, Response } from "express";

import pool from "../db/pool.js";
import { StatusCodes } from "http-status-codes";

export const getAllEvents = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const query =
      "select e.event_id, e.event_name, e.description, e.date, e.location, u.name as organizer_name, u.email as organizer_email from events e join users u on e.organizer_id = u.user_id order by e.date asc";

    const result = await client.query(query);

    res.status(StatusCodes.OK).json({
      message: "All events fetched successfully",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching all events:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error while fetching events" });
  } finally {
    client.release();
  }
};

export const getStudentEvents = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { user_id } = req.user!;

    const query =
      "select e.event_id, e.event_name, e.description, e.date, e.location, u.name as organizer_name from events e join student_events se on e.event_id = se.event_id join users u on e.organizer_id = u.user_id where se.student_id = $1 order by e.date desc";

    const result = await client.query(query, [user_id]);

    res.status(StatusCodes.OK).json({
      message: "Registered events fetched successfully",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching student events:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error while fetching student events" });
  } finally {
    client.release();
  }
};

export const registerForEvent = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { user_id } = req.user!;
    const { event_id } = req.body;

    if (!event_id) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "event_id is required" });
    }

    // Check if event exists
    const eventCheck = await client.query(
      "SELECT * FROM events WHERE event_id = $1",
      [event_id]
    );
    if (eventCheck.rows.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Event not found" });
    }

    // Check if already registered
    const already = await client.query(
      "SELECT * FROM student_events WHERE student_id = $1 AND event_id = $2",
      [user_id, event_id]
    );
    if (already.rows.length > 0) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "Already registered for this event" });
    }

    await client.query(
      "INSERT INTO student_events (student_id, event_id) VALUES ($1, $2)",
      [user_id, event_id]
    );

    res
      .status(StatusCodes.CREATED)
      .json({ message: "Successfully registered for the event" });
  } catch (error) {
    console.error("Error registering for event:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error during event registration" });
  } finally {
    client.release();
  }
};

export const unregisterFromEvent = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { user_id } = req.user!;
    const { eventId } = req.params;

    // Check if registration exists
    const check = await client.query(
      "SELECT * FROM student_events WHERE student_id = $1 AND event_id = $2",
      [user_id, eventId]
    );
    if (check.rows.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Not registered for this event" });
    }

    await client.query(
      "DELETE FROM student_events WHERE student_id = $1 AND event_id = $2",
      [user_id, eventId]
    );

    res.status(StatusCodes.OK).json({ message: "Unregistered successfully" });
  } catch (error) {
    console.error("Error unregistering from event:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error while unregistering from event" });
  } finally {
    client.release();
  }
};

export const createEvent = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { user_id } = req.user!;
    const { event_name, description, date, location } = req.body;

    if (!event_name || !date || !location) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "event_name, date, and location are required" });
    }

    const query = `
      INSERT INTO events (event_name, description, date, location, organizer_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING event_id, event_name, date, location, description, created_at
    `;

    const result = await client.query(query, [
      event_name,
      description || null,
      date,
      location,
      user_id,
    ]);

    res.status(StatusCodes.CREATED).json({
      message: "Event created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error while creating event" });
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

    res.status(StatusCodes.OK).json({
      message: "Alumni events fetched successfully",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching alumni events:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error while fetching events" });
  } finally {
    client.release();
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { user_id } = req.user!;
    const { eventId } = req.params;
    const { event_name, description, date, location } = req.body;

    // Ownership verification
    const check = await client.query(
      `SELECT * FROM events WHERE event_id = $1 AND organizer_id = $2`,
      [eventId, user_id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Event not found or not owned by this alumni" });
    }

    await client.query(
      `UPDATE events 
       SET event_name = COALESCE($1, event_name),
           description = COALESCE($2, description),
           date = COALESCE($3, date),
           location = COALESCE($4, location)
       WHERE event_id = $5`,
      [event_name, description, date, location, eventId]
    );

    return res.status(200).json({ message: "Event updated successfully" });
  } catch (error) {
    console.error("Error updating event:", error);
    return res.status(500).json({ message: "Server error while updating event" });
  } finally {
    client.release();
  }
};



export const deleteEvent = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { user_id } = req.user!;
    const { eventId } = req.params;

    const check = await client.query(
      `SELECT * FROM events WHERE event_id = $1 AND organizer_id = $2`,
      [eventId, user_id]
    );

    if (check.rows.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Event not found or not owned by this alumni" });
    }

    await client.query("DELETE FROM events WHERE event_id = $1", [eventId]);

    res.status(StatusCodes.OK).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error while deleting event" });
  } finally {
    client.release();
  }
};