import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Validation schemas
const createCommentSchema = z.object({
  conceptId: z.string().min(1),
  content: z.string().min(1).max(2000),
  parentId: z.string().optional(),
});

const updateCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

/**
 * Create a new comment on a concept
 */
export const createComment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.name || 'Anonymous';
    const userAvatar = (req as any).user?.avatar;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validation = createCommentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        details: validation.error.issues 
      });
    }

    const { conceptId, content, parentId } = validation.data;

    // Verify concept exists
    const concept = await prisma.concept.findUnique({
      where: { id: conceptId },
    });

    if (!concept) {
      return res.status(404).json({ error: 'Concept not found' });
    }

    // If replying to a comment, verify parent exists
    if (parentId) {
      const parentComment = await prisma.conceptComment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment || parentComment.conceptId !== conceptId) {
        return res.status(404).json({ error: 'Parent comment not found' });
      }
    }

    // Create comment
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

/**
 * Get all comments for a concept (with nested replies)
 */
export const getConceptComments = async (req: Request, res: Response) => {
  try {
    const { conceptId } = req.params;
    const { sortBy = 'recent' } = req.query;

    // Get all comments for this concept
    const allComments = await prisma.conceptComment.findMany({
      where: { conceptId },
      orderBy: sortBy === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' },
    });

    // Organize into tree structure
    const commentMap = new Map();
    const rootComments: any[] = [];

    // First pass: create map of all comments
    allComments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: build tree structure
    allComments.forEach((comment) => {
      const commentWithReplies = commentMap.get(comment.id);
      
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

/**
 * Update a comment
 */
export const updateComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validation = updateCommentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        details: validation.error.issues 
      });
    }

    const { content } = validation.data;

    // Check if comment exists and user owns it
    const existingComment = await prisma.conceptComment.findUnique({
      where: { id: commentId },
    });

    if (!existingComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (existingComment.userId !== userId) {
      return res.status(403).json({ error: 'You can only edit your own comments' });
    }

    // Update comment
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

/**
 * Delete a comment
 */
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if comment exists and user owns it
    const existingComment = await prisma.conceptComment.findUnique({
      where: { id: commentId },
    });

    if (!existingComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user is owner or concept owner
    const concept = await prisma.concept.findUnique({
      where: { id: existingComment.conceptId },
    });

    const canDelete = existingComment.userId === userId || concept?.userId === userId;

    if (!canDelete) {
      return res.status(403).json({ 
        error: 'You can only delete your own comments or comments on your concepts' 
      });
    }

    // Delete comment and all its replies
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

/**
 * Get user's recent comments
 */
export const getUserComments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { limit = 20, page = 1 } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [comments, total] = await Promise.all([
      prisma.conceptComment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip,
        include: {
          concept: {
            select: {
              id: true,
              generatedProduct: true,
              thumbnailUrl: true,
            },
          },
        },
      }),
      prisma.conceptComment.count({ where: { userId } }),
    ]);

    res.json({
      comments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Error fetching user comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};
