import { redirect, type Handle, type HandleServerError } from '@sveltejs/kit';
import { decrypt } from '$lib/server/session';

const protectedRoutes = ['/businesses', '/users', '/team', '/dashboard', '/plans'];
const publicRoutes = ['/login'];
const defaultProtectedRoute = '/businesses';
const defaultPublicRoute = '/login';

export const handle: Handle = async ({ event, resolve }) => {
  const path = event.url.pathname;
  const isPrivateRoute = protectedRoutes.some((route) => path.startsWith(route));

  // Also protect API proxy routes except public ones if needed
  // For now, API proxy will handle its own token check, but we can secure them here
  const isApiProxy = path.startsWith('/api/proxy') || path.startsWith('/api/invoicing');

  const sessionToken = event.cookies.get('session');
  const session = sessionToken ? await decrypt(sessionToken) : null;
  const isAuthenticated = !!session?.accessToken;

  // Root redirect
  if (path === '/') {
    if (isAuthenticated) throw redirect(302, defaultProtectedRoute);
    else throw redirect(302, defaultPublicRoute);
  }

  if (isPrivateRoute && !isAuthenticated) {
    throw redirect(302, defaultPublicRoute);
  }

  // Si está autenticado no debería visitar login (solo aplica a navegación GET directa)
  if (path.startsWith('/login') && isAuthenticated && event.request.method === 'GET') {
    throw redirect(302, defaultProtectedRoute);
  }

  // Pasamos datos al res/locals si lo necesitamos (no necesario con CSR-first,
  // pero el proxy podría usar event.locals)
  if (session) {
    event.locals.user = { email: session.email, name: session.name };
    event.locals.accessToken = session.accessToken;
  }

  return resolve(event);
};

export const handleError = ({ error, event }) => {
  console.error('--- UNHANDLED SERVER ERROR ---');
  console.error('Path:', event.url.pathname);
  console.error(error);
  console.error('-----------------------------');
  return {
    message: error instanceof Error ? error.message : 'Internal Error',
  };
};
