import { env } from '$env/dynamic/private';
import type { Cookies } from '@sveltejs/kit';

export function getDomains(apiEnv: string | undefined) {
  const envKey = apiEnv === 'prod' ? 'prod' : 'dev';

  switch (envKey) {
    case 'dev':
      return {
        BASE_URL: env.BASE_URL_DEV!,
        INVOICING_URL: env.INVOICING_URL_DEV!,
      };
    case 'prod':
      return {
        BASE_URL: env.BASE_URL_PRO!,
        INVOICING_URL: env.INVOICING_URL_PROD!,
      };
  }
}

export function getEnv(cookies: Cookies) {
  const apiEnv = cookies.get('api_env');
  return apiEnv === 'prod' ? 'prod' : 'dev';
}
