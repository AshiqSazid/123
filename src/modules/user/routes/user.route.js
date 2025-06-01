
import { Router } from "express";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { getUser, googleAuth, login, register } from "../controller/user.controller.js";

const router = Router();
router.get('/auth', authMiddleware, getUser)
router.post('/register', register)
router.post('/login', login)
router.post('/google', googleAuth)



export const userRouter = router