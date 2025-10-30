import { Router } from "express";
import { getStudentProfile, updateStudentProfile } from "../controllers/studentController.js";

import { verifyStudent } from "../middleware/authMiddleware.js";

const router = Router();

router.get('/profile', verifyStudent, getStudentProfile)

router.put('/profile/update', verifyStudent, updateStudentProfile);

export default router;
