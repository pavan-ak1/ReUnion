import express,{Router} from "express";
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getAlumniEvents,
  getStudentEvents,
  registerForEvent,
  unregisterFromEvent,
  updateEvent,
} from "../controllers/eventController.js";
import { verifyAlumni, verifyStudent } from "../middleware/authMiddleware.js";


const router:Router = express.Router();

router.get("/events", getAllEvents);

router.get("/student/events", verifyStudent, getStudentEvents);
router.post("/student/events/register", verifyStudent, registerForEvent);
router.delete(
  "/student/events/unregister/:eventId",
  verifyStudent,
  unregisterFromEvent
);

//alumni routes for events
router.post('/alumni/events/create', verifyAlumni, createEvent);

router.get('/alumni/events', verifyAlumni, getAlumniEvents);

router.put('/alumni/events/:eventId/update',verifyAlumni,updateEvent);

router.delete('/alumni/events/:eventId/delete', verifyAlumni,deleteEvent);



export default router;