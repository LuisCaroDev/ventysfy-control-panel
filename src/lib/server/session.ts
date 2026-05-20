import { SignJWT, jwtVerify } from 'jose';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import type { Cookies } from '@sveltejs/kit';

export interface SessionPayload {
  accessToken: string;
  storageUrl: string;
  email: string;
  name: string;
  expiresAt: Date;
}

async function getKey() {
  const secretKey = env.SESSION_SECRET;
  if (!secretKey) {
    throw new Error('SESSION_SECRET is not configured in environment variables');
  }
  const enc = new TextEncoder().encode(secretKey);
  return crypto.subtle.importKey('raw', enc, { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);
}

export async function encrypt(payload: SessionPayload) {
  const { expiresAt, ...data } = payload;
  const expirationTime = Math.floor(new Date(expiresAt).getTime() / 1000);
  const key = await getKey();
  return new SignJWT(data)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(key);
}

export async function decrypt(session: string): Promise<SessionPayload | null> {
  if (!session || typeof session !== 'string' || !session.includes('.')) {
    return null;
  }
  try {
    const key = await getKey();
    const { payload } = await jwtVerify(session, key, {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch (error) {
    console.log({ error });
    return null;
  }
}

export async function createSession(cookies: Cookies, data: Omit<SessionPayload, 'expiresAt'>) {
  // Parse token payload to get expiration
  const base64Url = data.accessToken.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(''),
  );
  const jwtPayload = JSON.parse(jsonPayload);

  const expiresAt = new Date(jwtPayload.exp * 1000);
  const session = await encrypt({ ...data, expiresAt });

  cookies.set('session', session, {
    httpOnly: true,
    secure: !dev,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function deleteSession(cookies: Cookies) {
  cookies.delete('session', { path: '/' });
}
