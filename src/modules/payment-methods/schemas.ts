import { z } from 'zod';
import { paymentMethodCountryCode3Schema } from '$lib/schemas/country';

export const paymentMethodSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  allowRefund: z.boolean(),
  isActive: z.boolean(),
  isGlobal: z.boolean(),
  countryCode3: z.array(paymentMethodCountryCode3Schema),
  commissionPercentage: z.number().min(0).max(100),
  companyPaysCommission: z.boolean(),
});

export const paymentMethodsResponseSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  data: z.array(paymentMethodSchema),
  message: z.array(z.string()),
  errors: z.array(
    z.object({
      field: z.string(),
      message: z.string(),
    }),
  ),
  date: z.string().datetime(),
});

export const createPaymentMethodSchema = z
  .object({
    name: z.string().trim().min(1, 'Ingresa el nombre del método de pago.'),
    allowRefund: z.boolean(),
    isGlobal: z.boolean(),
    countryCode3: z.array(paymentMethodCountryCode3Schema),
    commissionPercentage: z.coerce
      .number({ error: 'Ingresa una comisión válida.' })
      .min(0, 'La comisión no puede ser menor a 0%.')
      .max(100, 'La comisión no puede ser mayor a 100%.'),
    companyPaysCommission: z.boolean(),
    isEnabledByDefault: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (!data.isGlobal && data.countryCode3.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['countryCode3'],
        message: 'Selecciona al menos un país.',
      });
    }
  });

export const createPaymentMethodResponseSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  data: z.unknown(),
  message: z.array(z.string()),
  errors: z.array(
    z.object({
      field: z.string(),
      message: z.string(),
    }),
  ),
  date: z.string().datetime(),
});

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type CreatePaymentMethodForm = z.infer<typeof createPaymentMethodSchema>;
