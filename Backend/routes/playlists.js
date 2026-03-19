import express from 'express';
import * as playlistController from '../controllers/playlistController.js';

const router = express.Router();

router.get('/', playlistController.getPlaylists);
router.get('/:id', playlistController.getPlaylistById);
router.post('/', playlistController.createPlaylist);
router.put('/:id', playlistController.updatePlaylist);
router.delete('/:id', playlistController.deletePlaylist);

export default router;
