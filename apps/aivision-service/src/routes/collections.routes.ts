import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import * as collectionsController from '../controllers/collections.controller';

const router: Router = Router();

// All collection routes require authentication
router.use(requireAuth);

// Collection CRUD
router.post('/', collectionsController.createCollection);
router.get('/', collectionsController.listCollections);
router.get('/:id', collectionsController.getCollection);
router.put('/:id', collectionsController.updateCollection);
router.delete('/:id', collectionsController.deleteCollection);

// Manage concepts in collection
router.post('/:id/concepts', collectionsController.addConcepts);
router.delete('/:id/concepts/:conceptId', collectionsController.removeConcept);

// Collaboration
router.post('/:id/collaborators', collectionsController.inviteCollaborator);
router.delete('/:id/collaborators/:collaboratorId', collectionsController.removeCollaborator);

export default router;
