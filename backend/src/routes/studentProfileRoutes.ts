import express, { Router } from "express";
import {
  getAllAlumni,
  getAlumniYearStats,
  getFilterOptions,
  getStudentProfile,
  updateStudentProfile,
} from "../controllers/studentController.js";

import { verifyStudent } from "../middleware/authMiddleware.js";

const router: Router = express.Router();

router.get("/profile", verifyStudent, getStudentProfile);

router.put("/profile/update", verifyStudent, updateStudentProfile);

// THIS IS THE ONE FRONTEND IS CALLING
router.get("/alumni", getAllAlumni);

//Get alumni year stats
router.get("/alumni/year-stats", getAlumniYearStats);

// NEW: Get filter options for dropdowns
router.get("/alumni/filter-options", getFilterOptions);


export default router;
