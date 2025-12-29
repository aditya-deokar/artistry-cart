import { Router } from 'express';
import * as galleryController from '../controllers/gallery.controller';

const router: Router = Router();

// GET /api/v1/ai/gallery - Browse public concept gallery
router.get('/', galleryController.listGallery);

// GET /api/v1/ai/gallery/:id - Get gallery item details
router.get('/:id', galleryController.getGalleryItem);

// POST /api/v1/ai/gallery/:id/favorite - Toggle favorite
router.post('/:id/favorite', galleryController.toggleFavorite);

// GET /api/v1/ai/gallery/:id/related - Get related items
router.get('/:id/related', galleryController.getRelatedItems);

export default router;
