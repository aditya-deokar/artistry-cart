import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { SaveConceptSchema, SendToArtisansSchema } from '../validators/schemas';
import * as conceptsController from '../controllers/concepts.controller';

const router: Router = Router();

// GET /api/v1/ai/concepts - List user's concepts
router.get('/', conceptsController.listConcepts);

// GET /api/v1/ai/concepts/:id - Get single concept
router.get('/:id', conceptsController.getConcept);

// POST /api/v1/ai/concepts/:id/save - Save concept (requires auth)
router.post(
    '/:id/save',
    requireAuth,
    validate(SaveConceptSchema),
    conceptsController.saveConcept
);

// DELETE /api/v1/ai/concepts/:id - Delete concept
router.delete('/:id', requireAuth, conceptsController.deleteConcept);

// POST /api/v1/ai/concepts/:id/send-to-artisans
router.post(
    '/:id/send-to-artisans',
    requireAuth,
    validate(SendToArtisansSchema),
    conceptsController.sendToArtisans
);

export default router;
