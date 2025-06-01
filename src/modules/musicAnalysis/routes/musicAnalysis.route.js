import { Router } from "express";

import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { getMusicByRequestId } from "../controller/musicAnalysis.controller.js";


const router = Router();
router.get('/:requestId', authMiddleware, getMusicByRequestId)

export const musicAnalysisRouter = router;