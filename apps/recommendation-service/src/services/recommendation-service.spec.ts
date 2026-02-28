/**
 * Unit Tests for recommendation-service
 *
 * Tests the TensorFlow-based recommendation engine.
 * @tensorflow/tfjs is fully mocked — no real model training.
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

// ── Hoisted mock objects (must be declared inside vi.hoisted for factory access) ──
const { mockModel, mockTensor, mockSymbolicTensor, mockLayer } = vi.hoisted(() => {
  const mockModel = {
    compile: vi.fn(),
    fit: vi.fn().mockResolvedValue({}),
    predict: vi.fn(),
  };

  const mockTensor = {
    array: vi.fn().mockResolvedValue([0.9, 0.3, 0.7, 0.1, 0.5]),
  };

  const mockSymbolicTensor = { name: 'symbolic' };

  const mockLayer = {
    apply: vi.fn().mockReturnValue(mockSymbolicTensor),
  };

  return { mockModel, mockTensor, mockSymbolicTensor, mockLayer };
});

// ── Module mocks ──
vi.mock('@tensorflow/tfjs', () => ({
  input: vi.fn().mockReturnValue(mockSymbolicTensor),
  layers: {
    embedding: vi.fn().mockReturnValue(mockLayer),
    flatten: vi.fn().mockReturnValue(mockLayer),
    dot: vi.fn().mockReturnValue(mockLayer),
    dense: vi.fn().mockReturnValue(mockLayer),
  },
  model: vi.fn().mockReturnValue(mockModel),
  train: {
    adam: vi.fn().mockReturnValue('adam-optimizer'),
  },
  tensor1d: vi.fn().mockReturnValue({ name: 'tensor1d' }),
  tensor2d: vi.fn().mockReturnValue({ name: 'tensor2d' }),
}));

vi.mock('./fetch-user-activity', () => ({
  getUserActivity: vi.fn(),
}));

vi.mock('../utils/preprocessData', () => ({
  preprocessData: vi.fn(),
}));

import { recommendProducts } from './recommendation-service';
import { getUserActivity } from './fetch-user-activity';
import { preprocessData } from '../utils/preprocessData';
import * as tf from '@tensorflow/tfjs';

describe('recommendProducts', () => {
  const mockProducts = [
    { id: 'p1', title: 'Painting A' },
    { id: 'p2', title: 'Sculpture B' },
    { id: 'p3', title: 'Pottery C' },
    { id: 'p4', title: 'Print D' },
    { id: 'p5', title: 'Canvas E' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset model predict to return mock tensor
    mockModel.predict.mockReturnValue(mockTensor);
    mockModel.fit.mockResolvedValue({});
    mockTensor.array.mockResolvedValue([0.9, 0.3, 0.7, 0.1, 0.5]);

    // Suppress console.log in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('should return empty array when user has no actions', async () => {
    (getUserActivity as Mock).mockResolvedValue([]);

    const result = await recommendProducts('user-1', mockProducts);

    expect(result).toEqual([]);
    expect(tf.model).not.toHaveBeenCalled();
  });

  it('should return empty array when preprocessData returns empty interactions', async () => {
    (getUserActivity as Mock).mockResolvedValue([
      { productId: 'p1', actionType: 'product_view' },
    ]);
    (preprocessData as Mock).mockReturnValue({
      interactions: [],
      products: mockProducts,
    });

    const result = await recommendProducts('user-1', mockProducts);

    expect(result).toEqual([]);
    expect(tf.model).not.toHaveBeenCalled();
  });

  it('should build and train a model when interactions exist', async () => {
    const interactions = [
      { userId: 'user-1', productId: 'p1', actionType: 'product_view' },
      { userId: 'user-1', productId: 'p2', actionType: 'purchase' },
      { userId: 'user-1', productId: 'p3', actionType: 'add_to_cart' },
    ];
    (getUserActivity as Mock).mockResolvedValue(interactions);
    (preprocessData as Mock).mockReturnValue({
      interactions,
      products: mockProducts,
    });

    // predict returns scores for 3 products in the map
    mockTensor.array.mockResolvedValue([0.9, 0.2, 0.7]);

    await recommendProducts('user-1', mockProducts);

    // Model should be created
    expect(tf.input).toHaveBeenCalledTimes(2); // user + product input
    expect(tf.model).toHaveBeenCalled();

    // Model should be compiled with adam optimizer
    expect(mockModel.compile).toHaveBeenCalledWith(
      expect.objectContaining({
        loss: 'binaryCrossentropy',
        metrics: ['accuracy'],
      })
    );

    // Model should be trained
    expect(mockModel.fit).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ epochs: 5, batchSize: 32 })
    );

    // Model should predict
    expect(mockModel.predict).toHaveBeenCalled();
  });

  it('should return product IDs sorted by score descending', async () => {
    const interactions = [
      { userId: 'user-1', productId: 'p1', actionType: 'product_view' },
      { userId: 'user-1', productId: 'p2', actionType: 'purchase' },
      { userId: 'user-1', productId: 'p3', actionType: 'add_to_cart' },
    ];
    (getUserActivity as Mock).mockResolvedValue(interactions);
    (preprocessData as Mock).mockReturnValue({
      interactions,
      products: mockProducts,
    });

    // p1 index 0 = 0.2, p2 index 1 = 0.9, p3 index 2 = 0.5
    mockTensor.array.mockResolvedValue([0.2, 0.9, 0.5]);

    const result = await recommendProducts('user-1', mockProducts);

    // Sorted by score: p2(0.9), p3(0.5), p1(0.2)
    expect(result[0]).toBe('p2');
    expect(result[1]).toBe('p3');
    expect(result[2]).toBe('p1');
  });

  it('should return at most 10 product IDs', async () => {
    // Create 15 interactions with unique products
    const interactions = Array.from({ length: 15 }, (_, i) => ({
      userId: 'user-1',
      productId: `prod-${i}`,
      actionType: 'product_view' as const,
    }));
    (getUserActivity as Mock).mockResolvedValue(interactions);
    (preprocessData as Mock).mockReturnValue({
      interactions,
      products: mockProducts,
    });

    // Return 15 scores
    mockTensor.array.mockResolvedValue(
      Array.from({ length: 15 }, (_, i) => i / 15)
    );

    const result = await recommendProducts('user-1', mockProducts);

    expect(result.length).toBeLessThanOrEqual(10);
  });

  it('should create embedding layers with correct dimensions', async () => {
    const interactions = [
      { userId: 'user-1', productId: 'p1', actionType: 'product_view' },
      { userId: 'user-1', productId: 'p2', actionType: 'purchase' },
    ];
    (getUserActivity as Mock).mockResolvedValue(interactions);
    (preprocessData as Mock).mockReturnValue({
      interactions,
      products: mockProducts,
    });
    mockTensor.array.mockResolvedValue([0.8, 0.3]);

    await recommendProducts('user-1', mockProducts);

    // User embedding: 1 unique user, product embedding: 2 unique products
    expect(tf.layers.embedding).toHaveBeenCalledWith(
      expect.objectContaining({
        inputDim: 1, // 1 unique user
        outputDim: 50, // EMBEDDING_DIM
      })
    );
    expect(tf.layers.embedding).toHaveBeenCalledWith(
      expect.objectContaining({
        inputDim: 2, // 2 unique products
        outputDim: 50,
      })
    );
  });

  it('should create weight labels based on action types', async () => {
    const interactions = [
      { userId: 'user-1', productId: 'p1', actionType: 'product_view' },
      { userId: 'user-1', productId: 'p2', actionType: 'add_to_cart' },
      { userId: 'user-1', productId: 'p3', actionType: 'add_to_wishlist' },
      { userId: 'user-1', productId: 'p4', actionType: 'purchase' },
    ];
    (getUserActivity as Mock).mockResolvedValue(interactions);
    (preprocessData as Mock).mockReturnValue({
      interactions,
      products: mockProducts,
    });
    mockTensor.array.mockResolvedValue([0.5, 0.4, 0.3, 0.2]);

    await recommendProducts('user-1', mockProducts);

    // tf.tensor2d should be called with weight labels
    expect(tf.tensor2d).toHaveBeenCalledWith(
      [[0.1], [0.7], [0.5], [1.0]], // view, cart, wishlist, purchase
      [4, 1]
    );
  });

  it('should call preprocessData with correct arguments', async () => {
    const actions = [
      { userId: 'user-1', productId: 'p1', actionType: 'product_view' },
    ];
    (getUserActivity as Mock).mockResolvedValue(actions);
    (preprocessData as Mock).mockReturnValue({
      interactions: actions,
      products: mockProducts,
    });
    mockTensor.array.mockResolvedValue([0.5]);

    await recommendProducts('user-1', mockProducts);

    expect(preprocessData).toHaveBeenCalledWith(actions, mockProducts, 'user-1');
  });

  it('should call getUserActivity with the correct userId', async () => {
    (getUserActivity as Mock).mockResolvedValue([]);

    await recommendProducts('test-user-42', mockProducts);

    expect(getUserActivity).toHaveBeenCalledWith('test-user-42');
  });

  it('should use sigmoid activation in the output layer', async () => {
    const interactions = [
      { userId: 'user-1', productId: 'p1', actionType: 'product_view' },
    ];
    (getUserActivity as Mock).mockResolvedValue(interactions);
    (preprocessData as Mock).mockReturnValue({
      interactions,
      products: mockProducts,
    });
    mockTensor.array.mockResolvedValue([0.5]);

    await recommendProducts('user-1', mockProducts);

    expect(tf.layers.dense).toHaveBeenCalledWith(
      expect.objectContaining({
        units: 1,
        activation: 'sigmoid',
      })
    );
  });
});
