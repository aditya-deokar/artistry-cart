import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { defaultLimiter } from '../middleware/rate-limit.middleware';

// Import route modules
import generationRoutes from './generation.routes';
import searchRoutes from './search.routes';
import conceptsRoutes from './concepts.routes';
import artisansRoutes from './artisans.routes';
import galleryRoutes from './gallery.routes';
import schemaRoutes from './schema.routes';
import collectionsRoutes from './collections.routes';
import commentsRoutes from './comments.routes';
import testRoutes from './test.routes';

const router: Router = Router();

// Apply global middleware
router.use(authMiddleware);
router.use(defaultLimiter);

// Mount routes
router.use('/generate', generationRoutes);
router.use('/search', searchRoutes);
router.use('/concepts', conceptsRoutes);
router.use('/artisans', artisansRoutes);
router.use('/gallery', galleryRoutes);
router.use('/schema', schemaRoutes);
router.use('/collections', collectionsRoutes);
router.use('/comments', commentsRoutes);
router.use('/test', testRoutes);

export default router;
