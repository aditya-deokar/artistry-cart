import { Response } from 'express';
import { ConceptComment, PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

type CommentNode = ConceptComment & {
  replies: CommentNode[];
};

const createCommentSchema = z.object({
  conceptId: z.string().min(1),
  content: z.string().min(1).max(2000),
  parentId: z.string().optional(),
});

const updateCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

export const createComment = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userName = req.user?.name ?? 'Anonymous';
    const userAvatar = req.user?.avatar ?? undefined;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const validation = createCommentSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Invalid input',
        details: validation.error.issues,
      });
      return;
    }

    const { conceptId, content, parentId } = validation.data;

    const concept = await prisma.concept.findUnique({
      where: { id: conceptId },
    });

    if (!concept) {
      res.status(404).json({ error: 'Concept not found' });
      return;
    }

    if (parentId) {
      const parentComment = await prisma.conceptComment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment || parentComment.conceptId !== conceptId) {
        res.status(404).json({ error: 'Parent comment not found' });
        return;
      }
    }

    const comment = await prisma.conceptComment.create({
      data: {
        conceptId,
        userId,
        userName,
        userAvatar,
        content,
        parentId,
      },
    });

    logger.info(`Comment created: ${comment.id} on concept ${conceptId}`);
    res.status(201).json(comment);
  } catch (error) {
    logger.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
};

export const getConceptComments = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { conceptId } = req.params;
    const { sortBy = 'recent' } = req.query;

    const allComments = await prisma.conceptComment.findMany({
      where: { conceptId },
      orderBy: sortBy === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' },
    });

    const commentMap = new Map<string, CommentNode>();
    const rootComments: CommentNode[] = [];

    allComments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    allComments.forEach((comment) => {
      const commentWithReplies = commentMap.get(comment.id);
      if (!commentWithReplies) {
        return;
      }

      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    res.json({
      comments: rootComments,
      total: allComments.length,
    });
  } catch (error) {
    logger.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

export const updateComment = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { commentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const validation = updateCommentSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Invalid input',
        details: validation.error.issues,
      });
      return;
    }

    const { content } = validation.data;

    const existingComment = await prisma.conceptComment.findUnique({
      where: { id: commentId },
    });

    if (!existingComment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    if (existingComment.userId !== userId) {
      res.status(403).json({ error: 'You can only edit your own comments' });
      return;
    }

    const updatedComment = await prisma.conceptComment.update({
      where: { id: commentId },
      data: { content },
    });

    logger.info(`Comment updated: ${commentId}`);
    res.json(updatedComment);
  } catch (error) {
    logger.error('Error updating comment:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
};

export const deleteComment = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { commentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const existingComment = await prisma.conceptComment.findUnique({
      where: { id: commentId },
    });

    if (!existingComment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    const concept = await prisma.concept.findUnique({
      where: { id: existingComment.conceptId },
      select: {
        session: {
          select: {
            userId: true,
          },
        },
      },
    });

    const canDelete =
      existingComment.userId === userId || concept?.session.userId === userId;

    if (!canDelete) {
      res.status(403).json({
        error: 'You can only delete your own comments or comments on your concepts',
      });
      return;
    }

    await prisma.conceptComment.deleteMany({
      where: {
        OR: [
          { id: commentId },
          { parentId: commentId },
        ],
      },
    });

    logger.info(`Comment deleted: ${commentId}`);
    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    logger.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

export const getUserComments = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { limit = 20, page = 1 } = req.query;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const take = Number(limit);
    const currentPage = Number(page);
    const skip = (currentPage - 1) * take;

    const [comments, total] = await Promise.all([
      prisma.conceptComment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.conceptComment.count({ where: { userId } }),
    ]);

    const conceptIds = Array.from(new Set(comments.map((comment) => comment.conceptId)));
    const concepts = conceptIds.length
      ? await prisma.concept.findMany({
          where: { id: { in: conceptIds } },
          select: {
            id: true,
            thumbnailUrl: true,
            generatedProduct: true,
          },
        })
      : [];

    const conceptsById = new Map(concepts.map((concept) => [concept.id, concept]));
    const commentsWithConcept = comments.map((comment) => ({
      ...comment,
      concept: conceptsById.get(comment.conceptId) ?? null,
    }));

    res.json({
      comments: commentsWithConcept,
      pagination: {
        page: currentPage,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    logger.error('Error fetching user comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};
