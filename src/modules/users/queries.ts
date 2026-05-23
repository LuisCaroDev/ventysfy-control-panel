import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
import { apiFetch } from '$lib/api/client';
import { updateUserPasswordResponseSchema, usersResponseSchema } from './schemas';

export function useUsers(filters: { search: string; companyId: string; accountStatus: string }) {
  return createQuery(() => ({
    queryKey: ['users', filters.search, filters.companyId, filters.accountStatus],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.search) params.set('search', filters.search);
      if (filters.companyId) params.set('companyId', filters.companyId);
      if (filters.accountStatus) params.set('accountStatus', filters.accountStatus);

      const query = params.toString();
      const res = await apiFetch(`/v1/backoffice/user${query ? `?${query}` : ''}`);

      return usersResponseSchema.parse(res).data;
    },
  }));
}

export function useUpdateUserPassword() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await apiFetch('/v1/backoffice/user/updatePassword', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const parsed = updateUserPasswordResponseSchema.parse(res);

      if (!parsed.success) {
        const fieldErrors = parsed.errors.map((error) => error.message).filter(Boolean);
        const message = [...parsed.message, ...fieldErrors].filter(Boolean).join(', ');
        throw new Error(message || 'No fue posible actualizar la contraseña.');
      }

      return parsed;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  }));
}
