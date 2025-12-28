import { Router } from 'express';
import { validate } from '../middleware/validation.middleware';
import { TextToImageSchema, ProductVariationSchema, RefineConceptSchema } from '../validators/schemas';
import * as generationController from '../controllers/generation.controller';

const router: Router = Router();

// POST /api/v1/ai/generate/text-to-image
router.post(
    '/text-to-image',
    validate(TextToImageSchema),
    generationController.textToImage
);

// POST /api/v1/ai/generate/product-variation
router.post(
    '/product-variation',
    validate(ProductVariationSchema),
    generationController.productVariation
);

// POST /api/v1/ai/generate/from-image
router.post(
    '/from-image',
    generationController.fromImage
);

// POST /api/v1/ai/generate/refine
router.post(
    '/refine',
    validate(RefineConceptSchema),
    generationController.refineConcept
);

export default router;
