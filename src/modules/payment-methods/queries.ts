import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
import { apiFetch } from '$lib/api/client';
import { percentageToRate } from '$lib/utils';
import {
  createPaymentMethodResponseSchema,
  paymentMethodsResponseSchema,
  type CreatePaymentMethodForm,
} from './schemas';

export function usePaymentMethods() {
  return createQuery(() => ({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const res = await apiFetch('/v1/backoffice/payment-method');
      const parsed = paymentMethodsResponseSchema.parse(res);

      if (!parsed.success) {
        const fieldErrors = parsed.errors.map((error) => error.message).filter(Boolean);
        const message = [...parsed.message, ...fieldErrors].filter(Boolean).join(', ');
        throw new Error(message || 'No fue posible cargar los métodos de pago.');
      }

      return parsed.data;
    },
  }));
}

export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async (data: CreatePaymentMethodForm) => {
      const payload = {
        ...data,
        name: data.name.trim(),
        countryCode3: data.isGlobal ? [] : data.countryCode3,
        commissionPercentage: percentageToRate(data.commissionPercentage),
      };

      const res = await apiFetch('/v1/backoffice/payment-method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const parsed = createPaymentMethodResponseSchema.parse(res);

      if (!parsed.success) {
        const fieldErrors = parsed.errors.map((error) => error.message).filter(Boolean);
        const message = [...parsed.message, ...fieldErrors].filter(Boolean).join(', ');
        throw new Error(message || 'No fue posible crear el método de pago.');
      }

      return parsed;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
  }));
}
