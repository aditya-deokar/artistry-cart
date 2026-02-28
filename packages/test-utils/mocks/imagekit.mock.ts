/**
 * ImageKit Mock
 *
 * Mock for packages/libs/imageKit which exports `imagekit`.
 */
import { vi } from 'vitest';

export const imagekitMock: Record<string, any> = {
  upload: vi.fn().mockResolvedValue({
    url: 'https://ik.imagekit.io/test/product-123.jpg',
    fileId: 'file-id-123',
    name: 'product-123.jpg',
    filePath: '/products/product-123.jpg',
    thumbnailUrl: 'https://ik.imagekit.io/test/tr:n-ik_ml_thumbnail/product-123.jpg',
    height: 800,
    width: 800,
    size: 102400,
  }),
  deleteFile: vi.fn().mockResolvedValue({ success: true }),
  getFileDetails: vi.fn().mockResolvedValue({
    fileId: 'file-id-123',
    name: 'product-123.jpg',
    url: 'https://ik.imagekit.io/test/product-123.jpg',
  }),
  listFiles: vi.fn().mockResolvedValue([]),
  url: vi.fn().mockReturnValue('https://ik.imagekit.io/test/product-123.jpg'),
};

export function resetImagekitMock(): void {
  for (const fn of Object.values(imagekitMock)) {
    if (typeof fn?.mockReset === 'function') fn.mockReset();
  }
  // Restore default implementations
  imagekitMock.upload.mockResolvedValue({
    url: 'https://ik.imagekit.io/test/product-123.jpg',
    fileId: 'file-id-123',
    name: 'product-123.jpg',
    filePath: '/products/product-123.jpg',
    thumbnailUrl: 'https://ik.imagekit.io/test/tr:n-ik_ml_thumbnail/product-123.jpg',
    height: 800,
    width: 800,
    size: 102400,
  });
  imagekitMock.deleteFile.mockResolvedValue({ success: true });
  imagekitMock.getFileDetails.mockResolvedValue({
    fileId: 'file-id-123',
    name: 'product-123.jpg',
    url: 'https://ik.imagekit.io/test/product-123.jpg',
  });
  imagekitMock.listFiles.mockResolvedValue([]);
  imagekitMock.url.mockReturnValue('https://ik.imagekit.io/test/product-123.jpg');
}
