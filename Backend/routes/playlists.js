import express from 'express';
import * as playlistController from '../controllers/playlistController.js';
import { songUpload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', playlistController.getPlaylists);
router.get('/:id', playlistController.getPlaylistById);
router.post('/', songUpload.single('cover'), playlistController.createPlaylist);
router.put('/:id', songUpload.single('cover'), playlistController.updatePlaylist);
router.delete('/:id', playlistController.deletePlaylist);

export default router;
