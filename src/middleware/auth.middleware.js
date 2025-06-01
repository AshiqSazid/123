import catchAsync from "../utils/catchAsync.js";
import SendResponse from "../utils/SendResponse.js";
import jwt from "jsonwebtoken";
import * as env from "dotenv";
env.config();
export const authMiddleware = catchAsync(async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json(new SendResponse(401, "No token provided", null));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Optional: Check for token expiration manually
        if (Date.now() >= decoded.exp * 1000) {
            return res.status(401).json(new SendResponse(401, "Token has expired", null));
        }
        req.user = decoded
        next();
    } catch (error) {
        console.log("🚀 ~ authMiddleware ~ error:", error)
        return res.status(401).json(new SendResponse(401, "Invalid token", null));
    }
});
