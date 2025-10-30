import {Router} from "express";
import {
  getAllEvents,
  getStudentEvents,
  registerForEvent,
  unregisterFromEvent,
} from "../controllers/eventController.js";
import { verifyStudent } from "../middleware/authMiddleware.js";


const router = Router()

router.get("/events", getAllEvents);

router.get("/student/events", verifyStudent, getStudentEvents);
router.post("/student/events/register", verifyStudent, registerForEvent);
router.delete(
  "/student/events/unregister/:eventId",
  verifyStudent,
  unregisterFromEvent
);

export default router;