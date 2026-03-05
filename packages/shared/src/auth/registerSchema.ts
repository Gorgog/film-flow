import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль не менее 6 символов'),
  fullName: z.string().min(1, 'Имя обязательно').optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
