/**
 * Nodemailer Mock
 *
 * Mock for the nodemailer module used by auth-service and order-service.
 */
import { vi } from 'vitest';

export const transporterMock: Record<string, any> = {
  sendMail: vi.fn().mockResolvedValue({
    messageId: '<test-message-id@localhost>',
    accepted: ['test@example.com'],
    rejected: [],
    response: '250 OK',
  }),
  verify: vi.fn().mockResolvedValue(true),
  close: vi.fn(),
};

export const nodemailerMock: Record<string, any> = {
  createTransport: vi.fn().mockReturnValue(transporterMock),
};

/** Reset all nodemailer mocks */
export function resetNodemailerMock(): void {
  transporterMock.sendMail.mockReset().mockResolvedValue({
    messageId: '<test-message-id@localhost>',
    accepted: ['test@example.com'],
    rejected: [],
    response: '250 OK',
  });
  transporterMock.verify.mockReset().mockResolvedValue(true);
  transporterMock.close.mockReset();
  nodemailerMock.createTransport.mockReset().mockReturnValue(transporterMock);
}
