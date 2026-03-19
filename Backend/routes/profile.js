import express from 'express';
import { getMyProfile, updateMyProfile } from '../controllers/profileController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', authenticateToken, getMyProfile);
router.put('/me', authenticateToken, updateMyProfile);

export default router;
