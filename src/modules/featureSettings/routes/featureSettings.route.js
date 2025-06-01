import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware.js';
import { getFeatureSettings, updateFeatureSettings } from '../controller/featureSettings.controller.js';

const router = Router();
// Route to get feature settings
router.get('/', getFeatureSettings);
// Route to update feature settings
router.put('/', authMiddleware, updateFeatureSettings);
export const featureSettingsRouter = router;