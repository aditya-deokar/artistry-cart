import { Router } from 'express';
import * as schemaController from '../controllers/schema.controller';

const router: Router = Router();

// GET /api/v1/ai/schema/categories - Get available categories
router.get('/categories', schemaController.getCategories);

// GET /api/v1/ai/schema/materials - Get material options
router.get('/materials', schemaController.getMaterials);

// GET /api/v1/ai/schema/styles - Get style keywords
router.get('/styles', schemaController.getStyles);

export default router;
