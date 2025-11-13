console.log("✅ mentorRoutes loaded successfully");
import { Router } from "express";
import express from "express";
import {
  setupMentorshipProfile,
  getMentorshipProfile,
   getAvailableMentors,
  sendMentorshipRequest,
  getStudentRequests,
  getMentorshipRequests,
  respondToMentorshipRequest,
} from "../controllers/mentorshipController.js";
import { verifyAlumni,verifyStudent } from "../middleware/authMiddleware.js";

const router:Router = express.Router();


//students routes

// View all available mentors
router.get("/student/mentorship/mentors", verifyStudent, getAvailableMentors);

// Send a mentorship request
router.post("/student/mentorship/request", verifyStudent, sendMentorshipRequest);

// View own mentorship requests
router.get("/student/mentorship/requests", verifyStudent, getStudentRequests);



//alumni routes
router.post("/alumni/mentorship/setup", verifyAlumni, setupMentorshipProfile);

router.get("/alumni/mentorship/profile", verifyAlumni, getMentorshipProfile);

router.get("/alumni/mentorship/requests", verifyAlumni, getMentorshipRequests);

// Respond to a request (accept/reject)
router.put(
  "/alumni/mentorship/request/:requestId/status",
  verifyAlumni,
  respondToMentorshipRequest
);

export default router;
