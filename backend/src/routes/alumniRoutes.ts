import express, { Router } from "express";
import {
  getAlumniProfile,
  updateAlumniProfile,
} from "../controllers/alumniController.js";
import { verifyAlumni } from "../middleware/authMiddleware.js";

const router:Router = express.Router();


router.get("/alumni/profile",  verifyAlumni,getAlumniProfile);


router.put("/alumni/profile/update", verifyAlumni, updateAlumniProfile);

export default router;
