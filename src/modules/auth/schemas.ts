import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Por favor ingrese un email válido.'),
  password: z.string().min(1, 'La contraseña es requerida.'),
});

export type LoginSchema = typeof loginSchema;
