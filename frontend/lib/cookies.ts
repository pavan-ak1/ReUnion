import { getCookie as getCookieNext, setCookie as setCookieNext, deleteCookie as deleteCookieNext } from 'cookies-next';

type CookieOptions = {
  path?: string;
  expires?: Date;
  maxAge?: number;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: boolean | 'lax' | 'strict' | 'none';
  encode?: (value: string) => string;
};

export const getCookie = (key: string, options?: CookieOptions): string => {
  const value = getCookieNext(key, options);
  return typeof value === 'string' ? value : '';
};

export const setCookie = (key: string, value: string, options?: CookieOptions): void => {
  setCookieNext(key, value, {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    ...options,
  });
};

export const deleteCookie = (key: string, options?: CookieOptions): void => {
  deleteCookieNext(key, {
    path: '/',
    ...options,
  });
};

export const getAuthToken = (): string => {
  return getCookie('token');
};

export const setAuthToken = (token: string): void => {
  setCookie('token', token, {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    httpOnly: false, // Must be false to be accessible via JavaScript
    secure: process.env.NODE_ENV === 'production', // Secure in production
    sameSite: 'lax',
  });
};

export const clearAuth = (): void => {
  deleteCookie('token');
  deleteCookie('userRole');
};
