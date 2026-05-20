import { z } from 'zod';

export const countrySchema = z.object({
  code2: z.string().length(2),
  code3: z.string().length(3),
  value: z.string(),
  locale: z.string().optional(),
  timeZone: z.string().optional(),
});

export const subscriptionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  status: z.enum(['active', 'inactive', 'cancelled']),
  price: z
    .object({
      id: z.string(),
      description: z.string(),
      currency: z.string().length(3),
      amount: z.number().nonnegative(),
      discount: z.number().nonnegative(),
      days: z.number().nonnegative(),
      shortDuration: z.string(),
    })
    .optional(),
  payment: z.object({
    amount: z.number().nonnegative(),
    currency: z.string().length(3),
  }),
});

export const businessSchema = z.object({
  id: z.string(),
  logoPath: z.string().nullable().optional(),
  enableCashCount: z.boolean().optional(),
  validateCashCount: z.boolean().optional(),
  cashMovementCategoryList: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        type: z.enum(['income', 'expense']),
        enabled: z.boolean(),
      }),
    )
    .optional(),
  email: z.string().email(),
  tradeName: z.string(),
  companyName: z.string(),
  companyType: z.object({
    code: z.string(),
    name: z.string(),
  }),
  country: countrySchema,
  currency: z.object({
    symbol: z.string(),
    code: z.string(),
    supportsDecimals: z.boolean(),
  }),
  docTypeCode: z.string(),
  docTypeDescription: z.string(),
  docNumber: z.string(),
  city: z.string(),
  address: z.string(),
  cellphone: z.object({
    code: z.string(),
    cellphone: z.string(),
    fullCellphone: z.string(),
  }),
  subscription: subscriptionSchema.optional().nullable(),
  salesConfig: z
    .object({
      operationNumberCounter: z.number(),
      tip: z.object({
        enabled: z.boolean(),
        rate: z.number(),
        isComputeFromSubtotal: z.boolean(),
        maxRate: z.number(),
      }),
      discount: z.object({
        enabled: z.boolean(),
        enabledMaxRate: z.boolean(),
        maxRate: z.number(),
      }),
      voucher: z.object({
        enabledPhone: z.boolean(),
        enabledAddres: z.boolean(),
      }),
    })
    .optional(),
  invoiceService: z.object({
    enabled: z.boolean(),
    metadata: z.unknown().nullable().optional(),
    startDate: z.string().nullable().optional(),
    updateDate: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
  }),
  branches: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    )
    .optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  status: z.string(),
});

export type Business = z.infer<typeof businessSchema>;
export const businessesResponseSchema = z.object({
  data: z.object({
    clients: z.array(businessSchema),
  }),
});

// Plans schemas
export const planSchema = z.object({
  id: z.string(),
  name: z.string(),
  active: z.boolean(),
  currency: z.string(),
  prices: z.array(
    z.object({
      id: z.string(),
      currency: z.string(),
      amount: z.number(),
    }),
  ),
});
export type Plan = z.infer<typeof planSchema>;
export const plansResponseSchema = z.object({
  data: z.object({
    list: z.array(planSchema),
  }),
});
