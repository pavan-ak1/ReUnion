import express, { Router } from "express";
import {
  getAllAlumni,
  getStudentProfile,
  updateStudentProfile,
} from "../controllers/studentController.js";

import { verifyStudent } from "../middleware/authMiddleware.js";

const router: Router = express.Router();

router.get("/profile", verifyStudent, getStudentProfile);

router.put("/profile/update", verifyStudent, updateStudentProfile);

// THIS IS THE ONE FRONTEND IS CALLING
router.get("/alumni", getAllAlumni);

export default router;
