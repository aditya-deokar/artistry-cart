import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Validation schemas
const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(false),
  conceptIds: z.array(z.string()).default([]),
});

const updateCollectionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  isPublic: z.boolean().optional(),
  coverImage: z.string().url().optional().nullable(),
  sortOrder: z.number().optional(),
});

const addConceptsSchema = z.object({
  conceptIds: z.array(z.string()).min(1),
});

const inviteCollaboratorSchema = z.object({
  userId: z.string(),
  permission: z.enum(['view', 'edit', 'admin']).default('view'),
});

/**
 * Create a new collection
 */
export const createCollection = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const validatedData = createCollectionSchema.parse(req.body);

    // Check if collection name already exists for this user
    const existing = await prisma.conceptCollection.findUnique({
      where: {
        userId_name: {
          userId,
          name: validatedData.name,
        },
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'A collection with this name already exists',
      });
    }

    // Verify concepts belong to user if provided
    if (validatedData.conceptIds.length > 0) {
      const concepts = await prisma.concept.findMany({
        where: {
          id: { in: validatedData.conceptIds },
          session: { userId },
        },
      });

      if (concepts.length !== validatedData.conceptIds.length) {
        return res.status(403).json({
          success: false,
          error: 'Some concepts do not belong to you',
        });
      }
    }

    const collection = await prisma.conceptCollection.create({
      data: {
        userId,
        name: validatedData.name,
        description: validatedData.description,
        isPublic: validatedData.isPublic,
        conceptIds: validatedData.conceptIds,
      },
    });

    logger.info('Collection created', {
      collectionId: collection.id,
      userId,
      name: collection.name,
    });

    res.status(201).json({ success: true, data: collection });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    logger.error('Create collection failed', { error });
    res.status(500).json({ success: false, error: 'Failed to create collection' });
  }
};

/**
 * List user's collections
 */
export const listCollections = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { includeShared } = req.query;

    const where: any = {
      OR: [{ userId }],
    };

    // Include collections where user is a collaborator
    if (includeShared === 'true') {
      where.OR.push({ collaboratorIds: { has: userId } });
    }

    const collections = await prisma.conceptCollection.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    // Get concept counts and cover images
    const enrichedCollections = await Promise.all(
      collections.map(async (collection) => {
        const conceptCount = collection.conceptIds.length;
        let coverImageUrl = collection.coverImage;

        // If no cover image set, use first concept's image
        if (!coverImageUrl && collection.conceptIds.length > 0) {
          const firstConcept = await prisma.concept.findUnique({
            where: { id: collection.conceptIds[0] },
            select: { primaryImageUrl: true },
          });
          coverImageUrl = firstConcept?.primaryImageUrl || null;
        }

        return {
          ...collection,
          conceptCount,
          coverImageUrl,
          isOwner: collection.userId === userId,
        };
      })
    );

    res.json({ success: true, data: enrichedCollections });
  } catch (error) {
    logger.error('List collections failed', { error });
    res.status(500).json({ success: false, error: 'Failed to list collections' });
  }
};

/**
 * Get single collection with concepts
 */
export const getCollection = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const collection = await prisma.conceptCollection.findUnique({
      where: { id },
    });

    if (!collection) {
      return res.status(404).json({ success: false, error: 'Collection not found' });
    }

    // Check access permissions
    const hasAccess =
      collection.isPublic ||
      collection.userId === userId ||
      collection.collaboratorIds.includes(userId || '');

    if (!hasAccess) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Fetch concepts
    const concepts = await prisma.concept.findMany({
      where: { id: { in: collection.conceptIds } },
      include: {
        generatedProduct: {
          select: {
            title: true,
            category: true,
            tags: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: {
        ...collection,
        concepts,
        isOwner: collection.userId === userId,
        canEdit:
          collection.userId === userId ||
          (collection.permissions as any)?.[userId || ''] === 'edit' ||
          (collection.permissions as any)?.[userId || ''] === 'admin',
      },
    });
  } catch (error) {
    logger.error('Get collection failed', { error });
    res.status(500).json({ success: false, error: 'Failed to get collection' });
  }
};

/**
 * Update collection
 */
export const updateCollection = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { id } = req.params;
    const validatedData = updateCollectionSchema.parse(req.body);

    const collection = await prisma.conceptCollection.findUnique({
      where: { id },
    });

    if (!collection) {
      return res.status(404).json({ success: false, error: 'Collection not found' });
    }

    // Check edit permissions
    const canEdit =
      collection.userId === userId ||
      (collection.permissions as any)?.[userId] === 'edit' ||
      (collection.permissions as any)?.[userId] === 'admin';

    if (!canEdit) {
      return res.status(403).json({ success: false, error: 'No permission to edit' });
    }

    // Check name uniqueness if changing name
    if (validatedData.name && validatedData.name !== collection.name) {
      const existing = await prisma.conceptCollection.findUnique({
        where: {
          userId_name: {
            userId: collection.userId,
            name: validatedData.name,
          },
        },
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          error: 'A collection with this name already exists',
        });
      }
    }

    const updated = await prisma.conceptCollection.update({
      where: { id },
      data: validatedData,
    });

    logger.info('Collection updated', { collectionId: id, userId });

    res.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    logger.error('Update collection failed', { error });
    res.status(500).json({ success: false, error: 'Failed to update collection' });
  }
};

/**
 * Delete collection
 */
export const deleteCollection = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { id } = req.params;

    const collection = await prisma.conceptCollection.findUnique({
      where: { id },
    });

    if (!collection) {
      return res.status(404).json({ success: false, error: 'Collection not found' });
    }

    // Only owner can delete
    if (collection.userId !== userId) {
      return res.status(403).json({ success: false, error: 'Only owner can delete' });
    }

    await prisma.conceptCollection.delete({ where: { id } });

    logger.info('Collection deleted', { collectionId: id, userId });

    res.json({ success: true, message: 'Collection deleted' });
  } catch (error) {
    logger.error('Delete collection failed', { error });
    res.status(500).json({ success: false, error: 'Failed to delete collection' });
  }
};

/**
 * Add concepts to collection
 */
export const addConcepts = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { id } = req.params;
    const { conceptIds } = addConceptsSchema.parse(req.body);

    const collection = await prisma.conceptCollection.findUnique({
      where: { id },
    });

    if (!collection) {
      return res.status(404).json({ success: false, error: 'Collection not found' });
    }

    // Check edit permissions
    const canEdit =
      collection.userId === userId ||
      (collection.permissions as any)?.[userId] === 'edit' ||
      (collection.permissions as any)?.[userId] === 'admin';

    if (!canEdit) {
      return res.status(403).json({ success: false, error: 'No permission to edit' });
    }

    // Verify concepts exist
    const concepts = await prisma.concept.findMany({
      where: { id: { in: conceptIds } },
    });

    if (concepts.length !== conceptIds.length) {
      return res.status(404).json({ success: false, error: 'Some concepts not found' });
    }

    // Add concepts (avoid duplicates)
    const newConceptIds = Array.from(new Set([...collection.conceptIds, ...conceptIds]));

    const updated = await prisma.conceptCollection.update({
      where: { id },
      data: { conceptIds: newConceptIds },
    });

    logger.info('Concepts added to collection', {
      collectionId: id,
      addedCount: conceptIds.length,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    logger.error('Add concepts failed', { error });
    res.status(500).json({ success: false, error: 'Failed to add concepts' });
  }
};

/**
 * Remove concept from collection
 */
export const removeConcept = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { id, conceptId } = req.params;

    const collection = await prisma.conceptCollection.findUnique({
      where: { id },
    });

    if (!collection) {
      return res.status(404).json({ success: false, error: 'Collection not found' });
    }

    // Check edit permissions
    const canEdit =
      collection.userId === userId ||
      (collection.permissions as any)?.[userId] === 'edit' ||
      (collection.permissions as any)?.[userId] === 'admin';

    if (!canEdit) {
      return res.status(403).json({ success: false, error: 'No permission to edit' });
    }

    const newConceptIds = collection.conceptIds.filter((cId) => cId !== conceptId);

    const updated = await prisma.conceptCollection.update({
      where: { id },
      data: { conceptIds: newConceptIds },
    });

    logger.info('Concept removed from collection', { collectionId: id, conceptId });

    res.json({ success: true, data: updated });
  } catch (error) {
    logger.error('Remove concept failed', { error });
    res.status(500).json({ success: false, error: 'Failed to remove concept' });
  }
};

/**
 * Invite collaborator to collection
 */
export const inviteCollaborator = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { id } = req.params;
    const { userId: collaboratorId, permission } = inviteCollaboratorSchema.parse(req.body);

    const collection = await prisma.conceptCollection.findUnique({
      where: { id },
    });

    if (!collection) {
      return res.status(404).json({ success: false, error: 'Collection not found' });
    }

    // Only owner and admins can invite
    const canInvite =
      collection.userId === userId || (collection.permissions as any)?.[userId] === 'admin';

    if (!canInvite) {
      return res.status(403).json({ success: false, error: 'No permission to invite' });
    }

    // Verify collaborator exists
    const collaborator = await prisma.users.findUnique({
      where: { id: collaboratorId },
    });

    if (!collaborator) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Add to collaborators
    const newCollaboratorIds = Array.from(new Set([...collection.collaboratorIds, collaboratorId]));

    const permissions = (collection.permissions as any) || {};
    permissions[collaboratorId] = permission;

    const updated = await prisma.conceptCollection.update({
      where: { id },
      data: {
        collaboratorIds: newCollaboratorIds,
        permissions,
      },
    });

    logger.info('Collaborator invited', {
      collectionId: id,
      collaboratorId,
      permission,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    logger.error('Invite collaborator failed', { error });
    res.status(500).json({ success: false, error: 'Failed to invite collaborator' });
  }
};

/**
 * Remove collaborator from collection
 */
export const removeCollaborator = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { id, collaboratorId } = req.params;

    const collection = await prisma.conceptCollection.findUnique({
      where: { id },
    });

    if (!collection) {
      return res.status(404).json({ success: false, error: 'Collection not found' });
    }

    // Only owner and admins can remove
    const canRemove =
      collection.userId === userId || (collection.permissions as any)?.[userId] === 'admin';

    if (!canRemove) {
      return res.status(403).json({ success: false, error: 'No permission to remove' });
    }

    const newCollaboratorIds = collection.collaboratorIds.filter((cId) => cId !== collaboratorId);

    const permissions = (collection.permissions as any) || {};
    delete permissions[collaboratorId];

    const updated = await prisma.conceptCollection.update({
      where: { id },
      data: {
        collaboratorIds: newCollaboratorIds,
        permissions,
      },
    });

    logger.info('Collaborator removed', { collectionId: id, collaboratorId });

    res.json({ success: true, data: updated });
  } catch (error) {
    logger.error('Remove collaborator failed', { error });
    res.status(500).json({ success: false, error: 'Failed to remove collaborator' });
  }
};
