import type { Request } from 'express';
import type { JwtPayload } from 'jsonwebtoken';

export type UserRole = 'super_admin' | 'admin' | 'distributor' | 'retailer' | 'staff';

export interface AuthUser {
  id: string;
  role: UserRole;
  email?: string;
  phone?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface TokenPayload extends JwtPayload {
  id: string;
  role: UserRole;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiSuccessBody<T = unknown> {
  success: true;
  message: string;
  data: T;
  meta: Record<string, unknown>;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  errors: unknown[];
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, unknown>;
}
