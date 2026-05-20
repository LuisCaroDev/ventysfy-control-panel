import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { env } = await request.json();

  if (env !== 'dev' && env !== 'prod') {
    throw error(400, 'Invalid environment');
  }

  cookies.set('api_env', env, {
    httpOnly: true,
    secure: false, // set true in production
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
    path: '/',
  });

  return json({ ok: true });
};
