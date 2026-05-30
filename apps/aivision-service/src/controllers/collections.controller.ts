import { Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

type CollectionPermission = 'view' | 'edit' | 'admin';

const isJsonObject = (
  value: Prisma.JsonValue | null | undefined,
): value is Prisma.JsonObject => typeof value === 'object' && value !== null && !Array.isArray(value);

const getCollectionPermission = (
  permissions: Prisma.JsonValue | null | undefined,
  userId: string,
): CollectionPermission | undefined => {
  if (!isJsonObject(permissions)) {
    return undefined;
  }

  const value = permissions[userId];
  if (value === 'view' || value === 'edit' || value === 'admin') {
    return value;
  }

  return undefined;
};

const canEditCollection = (
  collection: { userId: string; permissions: Prisma.JsonValue | null | undefined },
  userId: string,
) => {
  const permission = getCollectionPermission(collection.permissions, userId);
  return collection.userId === userId || permission === 'edit' || permission === 'admin';
};

const isCollectionAdmin = (
  collection: { userId: string; permissions: Prisma.JsonValue | null | undefined },
  userId: string,
) => collection.userId === userId || getCollectionPermission(collection.permissions, userId) === 'admin';

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

export const createCollection = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const validatedData = createCollectionSchema.parse(req.body);

    const existing = await prisma.conceptCollection.findUnique({
      where: {
        userId_name: {
          userId,
          name: validatedData.name,
        },
      },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        error: 'A collection with this name already exists',
      });
      return;
    }

    if (validatedData.conceptIds.length > 0) {
      const concepts = await prisma.concept.findMany({
        where: {
          id: { in: validatedData.conceptIds },
          session: { userId },
        },
      });

      if (concepts.length !== validatedData.conceptIds.length) {
        res.status(403).json({
          success: false,
          error: 'Some concepts do not belong to you',
        });
        return;
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
      res.status(400).json({ success: false, error: error.issues });
      return;
    }

    logger.error('Create collection failed', { error });
    res.status(500).json({ success: false, error: 'Failed to create collection' });
  }
};

export const listCollections = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const where: Prisma.ConceptCollectionWhereInput =
      req.query.includeShared === 'true'
        ? { OR: [{ userId }, { collaboratorIds: { has: userId } }] }
        : { OR: [{ userId }] };

    const collections = await prisma.conceptCollection.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    const enrichedCollections = await Promise.all(
      collections.map(async (collection) => {
        const conceptCount = collection.conceptIds.length;
        let coverImageUrl = collection.coverImage;

        if (!coverImageUrl && collection.conceptIds.length > 0) {
          const firstConcept = await prisma.concept.findUnique({
            where: { id: collection.conceptIds[0] },
            select: { primaryImageUrl: true },
          });
          coverImageUrl = firstConcept?.primaryImageUrl ?? null;
        }

        return {
          ...collection,
          conceptCount,
          coverImageUrl,
          isOwner: collection.userId === userId,
        };
      }),
    );

    res.json({ success: true, data: enrichedCollections });
  } catch (error) {
    logger.error('List collections failed', { error });
    res.status(500).json({ success: false, error: 'Failed to list collections' });
  }
};

export const getCollection = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const collection = await prisma.conceptCollection.findUnique({
      where: { id },
    });

    if (!collection) {
      res.status(404).json({ success: false, error: 'Collection not found' });
      return;
    }

    const hasAccess =
      collection.isPublic ||
      collection.userId === userId ||
      (userId ? collection.collaboratorIds.includes(userId) : false);

    if (!hasAccess) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

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

    const permission = userId ? getCollectionPermission(collection.permissions, userId) : undefined;

    res.json({
      success: true,
      data: {
        ...collection,
        concepts,
        isOwner: collection.userId === userId,
        canEdit: collection.userId === userId || permission === 'edit' || permission === 'admin',
      },
    });
  } catch (error) {
    logger.error('Get collection failed', { error });
    res.status(500).json({ success: false, error: 'Failed to get collection' });
  }
};

export const updateCollection = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const validatedData = updateCollectionSchema.parse(req.body);

    const collection = await prisma.conceptCollection.findUnique({
      where: { id },
    });

    if (!collection) {
      res.status(404).json({ success: false, error: 'Collection not found' });
      return;
    }

    if (!canEditCollection(collection, userId)) {
      res.status(403).json({ success: false, error: 'No permission to edit' });
      return;
    }

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
        res.status(409).json({
          success: false,
          error: 'A collection with this name already exists',
        });
        return;
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
      res.status(400).json({ success: false, error: error.issues });
      return;
    }

    logger.error('Update collection failed', { error });
    res.status(500).json({ success: false, error: 'Failed to update collection' });
  }
};

export const deleteCollection = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    const collection = await prisma.conceptCollection.findUnique({
      where: { id },
    });

    if (!collection) {
      res.status(404).json({ success: false, error: 'Collection not found' });
      return;
    }

    if (collection.userId !== userId) {
      res.status(403).json({ success: false, error: 'Only owner can delete' });
      return;
    }

    await prisma.conceptCollection.delete({ where: { id } });

    logger.info('Collection deleted', { collectionId: id, userId });

    res.json({ success: true, message: 'Collection deleted' });
  } catch (error) {
    logger.error('Delete collection failed', { error });
    res.status(500).json({ success: false, error: 'Failed to delete collection' });
  }
};

export const addConcepts = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const { conceptIds } = addConceptsSchema.parse(req.body);

    const collection = await prisma.conceptCollection.findUnique({
      where: { id },
    });

    if (!collection) {
      res.status(404).json({ success: false, error: 'Collection not found' });
      return;
    }

    if (!canEditCollection(collection, userId)) {
      res.status(403).json({ success: false, error: 'No permission to edit' });
      return;
    }

    const concepts = await prisma.concept.findMany({
      where: { id: { in: conceptIds } },
    });

    if (concepts.length !== conceptIds.length) {
      res.status(404).json({ success: false, error: 'Some concepts not found' });
      return;
    }

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
      res.status(400).json({ success: false, error: error.issues });
      return;
    }

    logger.error('Add concepts failed', { error });
    res.status(500).json({ success: false, error: 'Failed to add concepts' });
  }
};

export const removeConcept = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id, conceptId } = req.params;

    const collection = await prisma.conceptCollection.findUnique({
      where: { id },
    });

    if (!collection) {
      res.status(404).json({ success: false, error: 'Collection not found' });
      return;
    }

    if (!canEditCollection(collection, userId)) {
      res.status(403).json({ success: false, error: 'No permission to edit' });
      return;
    }

    const newConceptIds = collection.conceptIds.filter((storedConceptId) => storedConceptId !== conceptId);

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

export const inviteCollaborator = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const { userId: collaboratorId, permission } = inviteCollaboratorSchema.parse(req.body);

    const collection = await prisma.conceptCollection.findUnique({
      where: { id },
    });

    if (!collection) {
      res.status(404).json({ success: false, error: 'Collection not found' });
      return;
    }

    if (!isCollectionAdmin(collection, userId)) {
      res.status(403).json({ success: false, error: 'No permission to invite' });
      return;
    }

    const collaborator = await prisma.users.findUnique({
      where: { id: collaboratorId },
    });

    if (!collaborator) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const newCollaboratorIds = Array.from(new Set([...collection.collaboratorIds, collaboratorId]));
    const permissions: Prisma.JsonObject = isJsonObject(collection.permissions)
      ? { ...collection.permissions }
      : {};

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
      res.status(400).json({ success: false, error: error.issues });
      return;
    }

    logger.error('Invite collaborator failed', { error });
    res.status(500).json({ success: false, error: 'Failed to invite collaborator' });
  }
};

export const removeCollaborator = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id, collaboratorId } = req.params;

    const collection = await prisma.conceptCollection.findUnique({
      where: { id },
    });

    if (!collection) {
      res.status(404).json({ success: false, error: 'Collection not found' });
      return;
    }

    if (!isCollectionAdmin(collection, userId)) {
      res.status(403).json({ success: false, error: 'No permission to remove' });
      return;
    }

    const newCollaboratorIds = collection.collaboratorIds.filter((storedId) => storedId !== collaboratorId);
    const permissions: Prisma.JsonObject = isJsonObject(collection.permissions)
      ? { ...collection.permissions }
      : {};

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
