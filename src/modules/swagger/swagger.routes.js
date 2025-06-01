import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerDocs from "./swagger.config.js";

const router = express.Router();

// Swagger UI route
router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

export const swaggerRouter = router

