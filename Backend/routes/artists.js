import express from 'express';
import * as artistController from '../controllers/artistController.js';

const router = express.Router();

router.get('/', artistController.getArtists);
router.get('/:id', artistController.getArtistById);
router.post('/', artistController.createArtist);
router.put('/:id', artistController.updateArtist);
router.delete('/:id', artistController.deleteArtist);

export default router;
