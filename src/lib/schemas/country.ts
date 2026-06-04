import { z } from 'zod';

export const countryCode2Schema = z.string().length(2);
export const countryCode3Schema = z.string().length(3);

export const countrySchema = z.object({
  code2: countryCode2Schema,
  code3: countryCode3Schema,
  value: z.string(),
  locale: z.string().optional(),
  timeZone: z.string().optional(),
});

export const PAYMENT_METHOD_COUNTRY_CODE3 = ['COL', 'PER'] as const;

export const paymentMethodCountryCode3Schema = z.enum(PAYMENT_METHOD_COUNTRY_CODE3);

export const paymentMethodCountryLabels: Record<
  (typeof PAYMENT_METHOD_COUNTRY_CODE3)[number],
  string
> = {
  COL: 'Colombia',
  PER: 'Perú',
};
