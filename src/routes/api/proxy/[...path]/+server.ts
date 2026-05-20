import { error, type RequestHandler } from '@sveltejs/kit';
import { getDomains } from '$lib/server/api-domains';

export const fallback: RequestHandler = async ({ request, params, url, locals, cookies }) => {
  if (!locals.accessToken) {
    error(401, 'Unauthorized');
  }

  const { BASE_URL } = getDomains(cookies.get('api_env'));
  const path = params.path;
  const queryString = url.searchParams.toString();
  const targetUrl = `${BASE_URL}/${path}${queryString ? '?' + queryString : ''}`;

  const headers = new Headers(request.headers);
  headers.set('Authorization', `Bearer ${locals.accessToken}`);
  // Removed host and origin to avoid conflicts when proxying
  headers.delete('host');
  headers.delete('origin');
  headers.delete('referer');

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body:
        request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined,
      redirect: 'manual',
    });

    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (err) {
    console.error('Proxy error:', err);
    error(500, 'Internal Server Error while proxying request');
  }
};

export const GET = fallback;
export const POST = fallback;
export const PUT = fallback;
export const PATCH = fallback;
export const DELETE = fallback;
