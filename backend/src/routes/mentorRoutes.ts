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
  getMentorPublicProfile,
} from "../controllers/mentorshipController.js";
import { verifyAlumni,verifyStudent } from "../middleware/authMiddleware.js";

const router:Router = express.Router();
console.log("mentorRoutes loaded");

router.get(
  "/student/mentorship/mentors/:mentorId",
  verifyStudent,
  getMentorPublicProfile
);
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
// Get full mentor profile by mentor_id (Student access)

export default router;
