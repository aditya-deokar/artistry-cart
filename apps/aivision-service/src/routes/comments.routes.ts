import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  createComment,
  getConceptComments,
  updateComment,
  deleteComment,
  getUserComments,
} from '../controllers/comments.controller';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Comment CRUD
router.post('/', createComment);
router.get('/concept/:conceptId', getConceptComments);
router.get('/my-comments', getUserComments);
router.put('/:commentId', updateComment);
router.delete('/:commentId', deleteComment);

export default router;
