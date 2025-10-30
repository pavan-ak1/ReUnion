import type { Request,Response } from "express";

import pool from "../db/pool.js";
import { StatusCodes } from "http-status-codes";

export const getAllEvents = async(req:Request, res:Response)=>{
    const client = await pool.connect()

    try{
        const query =  'select e.event_id, e.event_name, e.description, e.date, e.location, u.name as organizer_name, u.email as organizer_email from events e join users u on e.organizer_id = u.user_id order by e.date asc';

        const result = await client.query(query);

        res.status(StatusCodes.OK).json({
      message: "All events fetched successfully",
      data: result.rows,
    });


    }catch (error) {
    console.error("Error fetching all events:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error while fetching events" });
  } finally {
    client.release();
  }
}


export const getStudentEvents =  async (req:Request, res:Response)=>{
    const client = await pool.connect();

    try{
        const {user_id} = req.user!;

        const query = 'select e.event_id, e.event_name, e.description, e.date, e.location, u.name as organizer_name from events e join student_events se on e.event_id = se.event_id join users u on e.organizer_id = u.user_id where se.student_id = $1 order by e.date desc';

        const result = await client.query(query,[user_id]);

        res.status(StatusCodes.OK).json({
      message: "Registered events fetched successfully",
      data: result.rows,
    });

    }catch (error) {
    console.error("Error fetching student events:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error while fetching student events" });
  } finally {
    client.release();
  }
}

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


