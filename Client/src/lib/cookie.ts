/**
 * General Browser Cookie Utilities
 * 
 * NOTE: Authentication tokens in Genius Squad are strictly HTTP-only cookies
 * issued and validated exclusively by the backend server. JavaScript in the browser
 * does not and cannot access or manipulate the auth tokens.
 */

export interface CookieOptions {
  days?: number;
  path?: string;
  sameSite?: 'lax' | 'strict' | 'none';
  secure?: boolean;
}

/**
 * Get client cookie value by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie ? document.cookie.split(';') : [];
  const target = `${encodeURIComponent(name.trim())}=`;

  for (let c of cookies) {
    c = c.trim();
    if (c.indexOf(target) === 0) {
      try {
        return decodeURIComponent(c.substring(target.length));
      } catch {
        return c.substring(target.length);
      }
    }
  }

  return null;
}

/**
 * Set client cookie value with configurable options
 */
export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): void {
  if (typeof document === 'undefined') return;

  const {
    days = 7,
    path = '/',
    sameSite = 'lax',
    secure = typeof window !== 'undefined' && window.location.protocol === 'https:',
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=${path}; samesite=${sameSite}`;

  if (days) {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    cookieString += `; expires=${expires}; max-age=${days * 24 * 60 * 60}`;
  }

  if (secure) {
    cookieString += '; secure';
  }

  document.cookie = cookieString;
}

/**
 * Delete client cookie by setting expiration to the past
 */
export function removeCookie(name: string, path = '/'): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${encodeURIComponent(name)}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; samesite=lax`;
}
