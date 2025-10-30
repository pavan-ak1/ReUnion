import { Router } from "express";
import { getAllJobs } from "../controllers/jobController.js";


const router = Router()

router.get('/jobs',getAllJobs)


export default  router;