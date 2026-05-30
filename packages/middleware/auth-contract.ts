import type { Request } from 'express';

export type AuthenticatedRole = 'user' | 'seller' | 'admin' | 'USER' | 'SELLER' | 'ADMIN' | string;

export interface AuthenticatedShopSummary {
  id: string;
  [key: string]: unknown;
}

export interface AuthenticatedAccount {
  id: string;
  email?: string | null;
  name?: string | null;
  avatar?: unknown;
  role?: AuthenticatedRole;
  shop?: AuthenticatedShopSummary | null;
  [key: string]: unknown;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedAccount;
  role?: AuthenticatedRole;
}
