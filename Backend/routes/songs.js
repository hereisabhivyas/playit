import express from 'express';
import * as songController from '../controllers/songController.js';
import { authenticateToken } from '../middleware/auth.js';
import { songUpload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', songController.getSongs);
router.get('/mine', authenticateToken, songController.getMyUploadedSongs);
router.post('/', songController.createSong);
router.post(
	'/upload',
	authenticateToken,
	songUpload.fields([
		{ name: 'audio', maxCount: 1 },
		{ name: 'cover', maxCount: 1 },
	]),
	songController.uploadUserSong,
);
router.get('/:id/stream', songController.streamSong);
router.get('/:id', songController.getSongById);
router.put('/:id', songController.updateSong);
router.delete('/:id', songController.deleteSong);

export default router;
