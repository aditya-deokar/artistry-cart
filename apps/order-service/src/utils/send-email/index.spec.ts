/**
 * Unit Tests for sendEmail utility
 *
 * Tests the nodemailer + EJS template rendering email sender.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  nodemailerMock,
  transporterMock,
  resetNodemailerMock,
} from '../../../../../packages/test-utils';

// ── Module mocks ──
vi.mock('nodemailer', async () => {
  const { nodemailerMock: nm } = await import('../../../../../packages/test-utils/mocks/nodemailer.mock');
  return { default: nm };
});

vi.mock('ejs', () => ({
  __esModule: true,
  default: { renderFile: vi.fn().mockResolvedValue('<h1>Hello</h1>') },
  renderFile: vi.fn().mockResolvedValue('<h1>Hello</h1>'),
}));

vi.mock('dotenv', () => ({
  __esModule: true,
  default: { config: vi.fn() },
  config: vi.fn(),
}));

import { sendEmail } from './index';
import ejs from 'ejs';

beforeEach(() => {
  resetNodemailerMock();
  vi.mocked(ejs.renderFile).mockReset().mockResolvedValue('<h1>Hello</h1>' as any);
});

describe('sendEmail', () => {
  it('should render template and send email successfully', async () => {
    const result = await sendEmail('user@test.com', 'Order Confirmation', 'order-confirmation', {
      name: 'Test User',
    });

    expect(ejs.renderFile).toHaveBeenCalledWith(
      expect.stringContaining('order-confirmation.ejs'),
      expect.objectContaining({ name: 'Test User' }),
    );
    expect(transporterMock.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@test.com',
        subject: 'Order Confirmation',
        html: '<h1>Hello</h1>',
      }),
    );
    expect(result).toBe(true);
  });

  it('should return false when template rendering fails', async () => {
    vi.mocked(ejs.renderFile).mockRejectedValueOnce(new Error('Template not found'));

    const result = await sendEmail('user@test.com', 'Subject', 'missing-template', {});

    expect(result).toBe(false);
  });

  it('should return false when sendMail fails', async () => {
    transporterMock.sendMail.mockRejectedValueOnce(new Error('SMTP error'));

    const result = await sendEmail('user@test.com', 'Subject', 'order-confirmation', {});

    expect(result).toBe(false);
  });

  it('should use correct template path from auth-service', async () => {
    await sendEmail('x@y.com', 'S', 'reset-password', { token: 'abc' });

    const templatePath = vi.mocked(ejs.renderFile).mock.calls[0][0] as string;
    expect(templatePath).toContain('auth-service');
    expect(templatePath).toContain('email-templates');
    expect(templatePath).toContain('reset-password.ejs');
  });
});
