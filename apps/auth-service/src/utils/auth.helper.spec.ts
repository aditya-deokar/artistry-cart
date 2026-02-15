/**
 * Unit Tests for Auth Helper Functions
 * 
 * Tests for validation, OTP handling, and password management utilities.
 */

import { 
  validationRegistrationData, 
  checkOTPRestrictions, 
  sendOTP, 
  trackOTPRequests, 
  verifyOTP,
  handleForgotPassword,
  verifyForgotPasswordOTP
} from './auth.helper';
import { ValidationError } from '../../../../packages/error-handler';
import { redisMock, resetRedisMock, setRedisKey, hasRedisKey } from '../__tests__/mocks/redis.mock';
import { prismaMock, createMockUser, resetPrismaMock } from '../__tests__/mocks/prisma.mock';

// Mock dependencies
jest.mock('../../../../packages/libs/redis', () => redisMock);
jest.mock('../../../../packages/libs/prisma', () => ({
  __esModule: true,
  default: prismaMock,
}));
jest.mock('./sendMail', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
}));

describe('Auth Helper Functions', () => {
  beforeEach(() => {
    resetRedisMock();
    resetPrismaMock();
    jest.clearAllMocks();
  });

  describe('validationRegistrationData', () => {
    it('should pass validation for valid user data', () => {
      const data = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };
      
      expect(() => validationRegistrationData(data, 'user')).not.toThrow();
    });

    it('should pass validation for valid seller data with phone and country', () => {
      const data = {
        name: 'Test Seller',
        email: 'seller@example.com',
        password: 'password123',
        phone_number: '+1234567890',
        country: 'US',
      };
      
      expect(() => validationRegistrationData(data, 'seller')).not.toThrow();
    });

    it('should throw ValidationError for missing name', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123',
      };
      
      expect(() => validationRegistrationData(data, 'user')).toThrow(ValidationError);
      expect(() => validationRegistrationData(data, 'user')).toThrow('Missing Required fields!');
    });

    it('should throw ValidationError for missing email', () => {
      const data = {
        name: 'Test User',
        password: 'password123',
      };
      
      expect(() => validationRegistrationData(data, 'user')).toThrow(ValidationError);
    });

    it('should throw ValidationError for missing password', () => {
      const data = {
        name: 'Test User',
        email: 'test@example.com',
      };
      
      expect(() => validationRegistrationData(data, 'user')).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid email format', () => {
      const data = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
      };
      
      expect(() => validationRegistrationData(data, 'user')).toThrow(ValidationError);
      expect(() => validationRegistrationData(data, 'user')).toThrow('Invalid email format!');
    });

    it('should throw ValidationError for seller missing phone_number', () => {
      const data = {
        name: 'Test Seller',
        email: 'seller@example.com',
        password: 'password123',
        country: 'US',
      };
      
      expect(() => validationRegistrationData(data, 'seller')).toThrow(ValidationError);
    });

    it('should throw ValidationError for seller missing country', () => {
      const data = {
        name: 'Test Seller',
        email: 'seller@example.com',
        password: 'password123',
        phone_number: '+1234567890',
      };
      
      expect(() => validationRegistrationData(data, 'seller')).toThrow(ValidationError);
    });
  });

  describe('checkOTPRestrictions', () => {
    const mockNext = jest.fn();

    beforeEach(() => {
      mockNext.mockClear();
    });

    it('should pass when no restrictions exist', async () => {
      await checkOTPRestrictions('test@example.com', mockNext);
      
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw error when OTP lock exists', async () => {
      setRedisKey('otp-lock:test@example.com', 'locked');
      
      await expect(checkOTPRestrictions('test@example.com', mockNext))
        .rejects.toThrow('Account locked due to multiple failed attempts! Try again after 30 minutes');
    });

    it('should throw error when spam lock exists', async () => {
      setRedisKey('otp_spam_lock:test@example.com', 'locked');
      
      await expect(checkOTPRestrictions('test@example.com', mockNext))
        .rejects.toThrow('Too many OTP requests! Please wait 1 hour before requesting again.');
    });

    it('should throw error when cooldown exists', async () => {
      setRedisKey('otp_cooldown:test@example.com', 'true');
      
      await expect(checkOTPRestrictions('test@example.com', mockNext))
        .rejects.toThrow('Please wait 1 minute before requesting a new OTP!');
    });
  });

  describe('sendOTP', () => {
    it('should generate and store OTP in Redis', async () => {
      const { sendEmail } = require('./sendMail');
      
      await sendOTP('Test User', 'test@example.com', 'user-activation-mail');
      
      // Verify OTP was stored
      expect(hasRedisKey('otp:test@example.com')).toBe(true);
      
      // Verify cooldown was set
      expect(hasRedisKey('otp_cooldown:test@example.com')).toBe(true);
      
      // Verify email was sent
      expect(sendEmail).toHaveBeenCalledWith(
        'test@example.com',
        'Verify Your Email',
        'user-activation-mail',
        expect.objectContaining({
          name: 'Test User',
          otp: expect.any(String),
        })
      );
    });
  });

  describe('trackOTPRequests', () => {
    const mockNext = jest.fn();

    beforeEach(() => {
      mockNext.mockClear();
    });

    it('should track first OTP request', async () => {
      await trackOTPRequests('test@example.com', mockNext);
      
      const count = await redisMock.get('otp_request_count:test@example.com');
      expect(count).toBe('1');
    });

    it('should track second OTP request', async () => {
      setRedisKey('otp_request_count:test@example.com', '1');
      
      await trackOTPRequests('test@example.com', mockNext);
      
      const count = await redisMock.get('otp_request_count:test@example.com');
      expect(count).toBe('2');
    });

    it('should throw error on third request (spam lock)', async () => {
      setRedisKey('otp_request_count:test@example.com', '2');
      
      await expect(trackOTPRequests('test@example.com', mockNext))
        .rejects.toThrow('Too many OTP requests. Please wait 1 hour before requesting again.');
      
      // Verify spam lock was set
      expect(hasRedisKey('otp_span_lock:test@example.com')).toBe(true);
    });
  });

  describe('verifyOTP', () => {
    const mockNext = jest.fn();

    beforeEach(() => {
      mockNext.mockClear();
    });

    it('should verify correct OTP', async () => {
      setRedisKey('otp:test@example.com', '1234');
      
      await verifyOTP('test@example.com', '1234', mockNext);
      
      // OTP should be deleted after successful verification
      expect(hasRedisKey('otp:test@example.com')).toBe(false);
    });

    it('should throw error for invalid OTP', async () => {
      setRedisKey('otp:test@example.com', '1234');
      
      await expect(verifyOTP('test@example.com', '5678', mockNext))
        .rejects.toThrow('Incorrect OTP. 2 attempts left.');
      
      // Failed attempts should be tracked
      const attempts = await redisMock.get('otp_attempts:test@example.com');
      expect(attempts).toBe('1');
    });

    it('should throw error for expired OTP', async () => {
      // No OTP set in Redis
      
      await expect(verifyOTP('test@example.com', '1234', mockNext))
        .rejects.toThrow('Invalide or Expired OTP!');
    });

    it('should lock account after 3 failed attempts', async () => {
      setRedisKey('otp:test@example.com', '1234');
      setRedisKey('otp_attempts:test@example.com', '2');
      
      await expect(verifyOTP('test@example.com', '5678', mockNext))
        .rejects.toThrow('Too many failed attempts, Your account is locked for 30 mins!');
      
      // Verify lock was set
      expect(hasRedisKey('otp_lock:test@example.com')).toBe(true);
    });
  });

  describe('handleForgotPassword', () => {
    const mockReq = (body: any) => ({ body } as any);
    const mockRes = () => {
      const res: any = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };
    const mockNext = jest.fn();

    beforeEach(() => {
      mockNext.mockClear();
    });

    it('should send OTP for existing user', async () => {
      const req = mockReq({ email: 'test@example.com' });
      const res = mockRes();
      
      prismaMock.users.findUnique.mockResolvedValueOnce(createMockUser());
      
      await handleForgotPassword(req, res, mockNext, 'user');
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'OTP sent to email. Please verify your account.'
      });
    });

    it('should throw error for non-existent user', async () => {
      const req = mockReq({ email: 'nonexistent@example.com' });
      const res = mockRes();
      
      prismaMock.users.findUnique.mockResolvedValueOnce(null);
      
      await handleForgotPassword(req, res, mockNext, 'user');
      
      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should throw error for missing email', async () => {
      const req = mockReq({});
      const res = mockRes();
      
      await handleForgotPassword(req, res, mockNext, 'user');
      
      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });

  describe('verifyForgotPasswordOTP', () => {
    const mockReq = (body: any) => ({ body } as any);
    const mockRes = () => {
      const res: any = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };
    const mockNext = jest.fn();

    beforeEach(() => {
      mockNext.mockClear();
    });

    it('should verify correct OTP', async () => {
      setRedisKey('otp:test@example.com', '1234');
      
      const req = mockReq({ email: 'test@example.com', otp: '1234' });
      const res = mockRes();
      
      await verifyForgotPasswordOTP(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'OTP verified, You can now reset your password.'
      });
    });

    it('should throw error for missing email or OTP', async () => {
      const req = mockReq({ email: 'test@example.com' });
      const res = mockRes();
      
      await verifyForgotPasswordOTP(req, res, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });
});
