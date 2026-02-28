/**
 * Unit Tests for preprocessData utility
 *
 * Tests the mapping of raw user actions to interaction format
 * used by the recommendation model.
 */

import { describe, it, expect } from 'vitest';
import { preprocessData } from './preprocessData';

const mockProducts = [
  { id: 'p1', title: 'Painting A' },
  { id: 'p2', title: 'Sculpture B' },
  { id: 'p3', title: 'Pottery C' },
];

describe('preprocessData', () => {
  it('should map PRODUCT_VIEW actions to product_view interaction', () => {
    const actions = [{ productId: 'p1', action: 'PRODUCT_VIEW' }];
    const result = preprocessData(actions, mockProducts, 'user-1');

    expect(result.interactions).toHaveLength(1);
    expect(result.interactions[0]).toEqual({
      userId: 'user-1',
      productId: 'p1',
      actionType: 'product_view',
    });
  });

  it('should map PURCHASE actions to purchase interaction', () => {
    const actions = [{ productId: 'p1', action: 'PURCHASE' }];
    const result = preprocessData(actions, mockProducts, 'user-1');

    expect(result.interactions[0].actionType).toBe('purchase');
  });

  it('should map ADD_TO_CART actions to add_to_cart interaction', () => {
    const actions = [{ productId: 'p2', action: 'ADD_TO_CART' }];
    const result = preprocessData(actions, mockProducts, 'user-1');

    expect(result.interactions[0].actionType).toBe('add_to_cart');
  });

  it('should map WISHLIST_ADD actions to add_to_wishlist interaction', () => {
    const actions = [{ productId: 'p3', action: 'WISHLIST_ADD' }];
    const result = preprocessData(actions, mockProducts, 'user-1');

    expect(result.interactions[0].actionType).toBe('add_to_wishlist');
  });

  it('should filter out actions without productId', () => {
    const actions = [
      { productId: 'p1', action: 'PRODUCT_VIEW' },
      { action: 'PRODUCT_VIEW' }, // missing productId
      { productId: null, action: 'PURCHASE' }, // null productId
    ];
    const result = preprocessData(actions, mockProducts, 'user-1');

    // Only the first action has a valid productId
    expect(result.interactions).toHaveLength(1);
    expect(result.interactions[0].productId).toBe('p1');
  });

  it('should handle empty actions list', () => {
    const result = preprocessData([], mockProducts, 'user-1');

    expect(result.interactions).toHaveLength(0);
    expect(result.products).toBe(mockProducts);
  });

  it('should pass products array through to result', () => {
    const result = preprocessData([], mockProducts, 'user-1');

    expect(result.products).toBe(mockProducts);
    expect(result.products).toHaveLength(3);
  });

  it('should handle duplicate actions (multiple views of same product)', () => {
    const actions = [
      { productId: 'p1', action: 'PRODUCT_VIEW' },
      { productId: 'p1', action: 'PRODUCT_VIEW' },
      { productId: 'p1', action: 'PURCHASE' },
    ];
    const result = preprocessData(actions, mockProducts, 'user-1');

    // All interactions are kept (aggregation happens at model level)
    expect(result.interactions).toHaveLength(3);
  });

  it('should assign userId from parameter to all interactions', () => {
    const actions = [
      { productId: 'p1', action: 'PRODUCT_VIEW' },
      { productId: 'p2', action: 'PURCHASE' },
    ];
    const result = preprocessData(actions, mockProducts, 'user-42');

    for (const interaction of result.interactions) {
      expect(interaction.userId).toBe('user-42');
    }
  });

  it('should handle actions with "type" field instead of "action"', () => {
    const actions = [{ productId: 'p1', type: 'PRODUCT_VIEW' }];
    const result = preprocessData(actions, mockProducts, 'user-1');

    expect(result.interactions[0].actionType).toBe('product_view');
  });

  it('should pass through unknown action types', () => {
    const actions = [{ productId: 'p1', action: 'UNKNOWN_TYPE' }];
    const result = preprocessData(actions, mockProducts, 'user-1');

    // Unknown types fall through the switch — original action string kept
    expect(result.interactions).toHaveLength(1);
    expect(result.interactions[0].actionType).toBe('UNKNOWN_TYPE');
  });
});
