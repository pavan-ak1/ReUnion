import { Router } from "express";
import { getAllJobs, applyForJob, getAppliedJobs, createJob,
  getAlumniJobs,
  updateJob,
  deleteJob,
  getJobApplicants,
  updateApplicationStatus, } from "../controllers/jobController.js";
import { verifyStudent } from "../middleware/authMiddleware.js";

import { verifyAlumni } from "../middleware/authMiddleware.js";


const router = Router()

router.get('/jobs',getAllJobs)

router.post("/student/jobs/apply", verifyStudent, applyForJob);
router.get("/student/jobs/applied", verifyStudent, getAppliedJobs);



//Alumni Routes
router.post("/alumni/jobs/create", verifyAlumni, createJob);
router.get("/alumni/jobs", verifyAlumni, getAlumniJobs);
router.put("/alumni/jobs/:jobId/update", verifyAlumni, updateJob);
router.delete("/alumni/jobs/:jobId/delete", verifyAlumni, deleteJob);
router.get("/alumni/jobs/:jobId/applications", verifyAlumni, getJobApplicants);
router.put(
  "/alumni/jobs/:jobId/applications/:applicationId/status",
  verifyAlumni,
  updateApplicationStatus
);

export default router;
