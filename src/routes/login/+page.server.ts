import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { loginSchema } from '$modules/auth/schemas';
import { createSession, deleteSession } from '$lib/server/session';
import { getDomains, getEnv } from '$lib/server/api-domains';
import { env } from '$env/dynamic/private';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
  const form = await superValidate(zod4(loginSchema));
  
  if (env.DEFAULT_ADMIN_EMAIL) {
    form.data.email = env.DEFAULT_ADMIN_EMAIL;
  }
  if (env.DEFAULT_ADMIN_PASSWORD) {
    form.data.password = env.DEFAULT_ADMIN_PASSWORD;
  }

  return {
    form,
    env: getEnv(cookies),
  };
};

export const actions: Actions = {
  login: async ({ request, cookies }) => {
    const form = await superValidate(request, zod4(loginSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    const { email, password } = form.data;
    const { BASE_URL } = getDomains(cookies.get('api_env'));

    const targetUrl = `${BASE_URL}/v1/auth/signin-backoffice`;
    console.log('Attempting login to target URL:', targetUrl);

    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: email,
          password: password,
        }),
      });

      const jsonResp = await res.json();

      if (!res.ok || !jsonResp.data) {
        return fail(401, {
          form,
          error: jsonResp.message || 'Credenciales no válidas.',
        });
      }

      await createSession(cookies, {
        ...jsonResp.data,
        email,
        name: 'Admin',
      });
    } catch (e) {
      console.error('Login error:', e);
      return fail(400, {
        form,
        error: 'Ocurrió un error al intentar iniciar sesión. Por favor verifica tu conexión.',
      });
    }

    throw redirect(303, '/businesses');
  },

  logout: async ({ cookies }) => {
    await deleteSession(cookies);
    throw redirect(303, '/login');
  },
};
