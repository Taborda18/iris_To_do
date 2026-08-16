import type { Request, Response } from 'express';
import { env } from '../../../config/env.js';

export const AUTH_COOKIE = 'iris_auth';
const cookieOptions = env.NODE_ENV === 'production'
  ? 'HttpOnly; Path=/; SameSite=None; Secure'
  : 'HttpOnly; Path=/; SameSite=Lax';

export const setAuthCookie = (response: Response, token: string): void => {
  response.setHeader('Set-Cookie', `${AUTH_COOKIE}=${encodeURIComponent(token)}; ${cookieOptions}`);
};

export const clearAuthCookie = (response: Response): void => {
  response.setHeader('Set-Cookie', `${AUTH_COOKIE}=; ${cookieOptions}; Max-Age=0`);
};

export const readAuthCookie = (request: Request): string | null => {
  const cookies = request.headers.cookie?.split(';').map((cookie) => cookie.trim()) ?? [];
  const value = cookies.find((cookie) => cookie.startsWith(`${AUTH_COOKIE}=`))?.split('=').slice(1).join('=');
  return value ? decodeURIComponent(value) : null;
};
