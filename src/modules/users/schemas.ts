import { z } from 'zod';

export const USER_ACCOUNT_STATUS = [
  'without_account',
  'active',
  'locked',
  'suspended',
  'pending',
  'deleted',
  'unknown',
] as const;

export const userSchema = z.object({
  employeeId: z.string(),
  name: z.string(),
  email: z.string().email(),
  companyId: z.string(),
  companyName: z.string().nullable(),
  hasAccount: z.boolean(),
  accountStatus: z.enum(USER_ACCOUNT_STATUS),
  rawUserStatus: z.string().nullable(),
  signinIntents: z.number().nullable(),
  userDeletedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type User = z.infer<typeof userSchema>;

export const usersResponseSchema = z.object({
  data: z.array(userSchema),
});

export const updateUserPasswordSchema = z
  .object({
    email: z.email(),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden.',
  });

export type UpdateUserPasswordForm = z.infer<typeof updateUserPasswordSchema>;

export const updateUserPasswordResponseSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  data: z.null(),
  message: z.array(z.string()),
  errors: z.array(
    z.object({
      field: z.string(),
      message: z.string(),
    }),
  ),
  date: z.string().datetime(),
});

export const userFiltersSchema = z.object({
  companyId: z.string(),
  accountStatus: z.string(),
});

export type UserFiltersForm = z.infer<typeof userFiltersSchema>;
