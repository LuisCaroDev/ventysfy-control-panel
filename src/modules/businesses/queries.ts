import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
import { apiFetch } from '$lib/api/client';
import {
  businessSchema,
  businessesResponseSchema,
  plansResponseSchema,
  type Business,
  type Plan,
} from './schemas';

export function useBusinesses() {
  return createQuery(() => ({
    queryKey: ['businesses'],
    queryFn: async () => {
      const res = await apiFetch('/v1/user/backoffice/clients');
      return businessesResponseSchema.parse(res).data.clients;
    },
  }));
}

export function useBusiness(businessId: string) {
  return createQuery(() => ({
    queryKey: ['businesses', businessId],
    queryFn: async () => {
      const res = await apiFetch('/v1/user/backoffice/clients');
      const parsed = businessesResponseSchema.parse(res).data.clients;
      const negocio = parsed.find((b: any) => b.docNumber === businessId);
      if (!negocio) throw new Error('Negocio no encontrado');
      return negocio;
    },
    enabled: !!businessId,
  }));
}

export function usePlans() {
  return createQuery(() => ({
    queryKey: ['plans'],
    queryFn: async () => {
      const res = await apiFetch('/v1/auth/subscription');
      return plansResponseSchema.parse(res).data.list;
    },
  }));
}

export function useUpdateBusinessStatus() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: async ({
      businessId,
      status,
    }: {
      businessId: string;
      status: 'suspend' | 'activo';
    }) => {
      return apiFetch(`/v1/user/backoffice/client/${businessId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
  }));
}

export function useCreateMasterUser() {
  return createMutation(() => ({
    mutationFn: async (companyId: string) => {
      const res = await apiFetch<any>(`/v1/backoffice/create-master-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
      });
      if (res && res.data) return res.data;
      throw new Error('Algo salió mal.');
    },
  }));
}

export function useDeleteBusiness() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: async (businessId: string) => {
      const res = await apiFetch<any>(`/v1/backoffice/company/${businessId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res && res.statusCode && res.statusCode !== 200) {
        const message = Array.isArray(res.message) ? res.message.join(', ') : res.message;
        throw new Error(message || 'No fue posible eliminar el negocio.');
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
  }));
}
