import { Router } from 'express';
import { requireSeller } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { ArtisanResponseSchema } from '../validators/schemas';
import * as artisansController from '../controllers/artisans.controller';

const router: Router = Router();

// GET /api/v1/ai/artisans/match?conceptId=xxx - Get matches for a concept
router.get('/match', artisansController.getMatches);

// POST /api/v1/ai/artisans/respond (seller only)
router.post(
    '/respond',
    requireSeller,
    validate(ArtisanResponseSchema),
    artisansController.respond
);

// GET /api/v1/ai/artisans/my-matches (seller only)
router.get('/my-matches', requireSeller, artisansController.getSellerMatches);

export default router;
