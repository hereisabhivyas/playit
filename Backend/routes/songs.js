import express from 'express';
import * as songController from '../controllers/songController.js';
import { authenticateToken } from '../middleware/auth.js';
import { audioUpload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', songController.getSongs);
router.post('/', songController.createSong);
router.post('/upload', authenticateToken, audioUpload.single('audio'), songController.uploadUserSong);
router.get('/:id/stream', songController.streamSong);
router.get('/:id', songController.getSongById);
router.put('/:id', songController.updateSong);
router.delete('/:id', songController.deleteSong);

export default router;
