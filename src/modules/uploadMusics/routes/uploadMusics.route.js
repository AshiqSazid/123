
import { Router } from "express";

import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { deleteMusic, getMusicById, getMusicByUserId, getMusicCountByUserId, uploadMusic } from "../controller/uploadMusics.controller.js";
import upload from "../../../middleware/multer.middleware.js";

const router = Router();
router.post('/upload',authMiddleware, upload.single("file"), uploadMusic);
router.get('/', authMiddleware, getMusicByUserId);
router.get('/count', authMiddleware, getMusicCountByUserId);
router.get('/analyse/:id', authMiddleware, getMusicById);
router.delete('/:id', authMiddleware, deleteMusic);
export const uploadMusicRouter = router;