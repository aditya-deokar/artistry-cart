import { Router } from 'express';
import { validate } from '../middleware/validation.middleware';
import { VisualSearchSchema } from '../validators/schemas';
import * as searchController from '../controllers/search.controller';

const router: Router = Router();

// POST /api/v1/ai/search/visual - Visual similarity search
router.post(
    '/visual',
    validate(VisualSearchSchema),
    searchController.visualSearchHandler
);

// POST /api/v1/ai/search/hybrid - Combined text + visual search
router.post(
    '/hybrid',
    searchController.hybridSearchHandler
);

// POST /api/v1/ai/search/similar-concepts - Find similar AI concepts
router.post(
    '/similar-concepts',
    searchController.similarConceptsHandler
);

// GET /api/v1/ai/search/quick?q=query - Quick text search
router.get(
    '/quick',
    searchController.quickSearchHandler
);

export default router;
