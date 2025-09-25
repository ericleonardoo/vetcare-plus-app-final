import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres."}),
  email: z.string().email({ message: 'Email inválido. Use formato exemplo@dominio.com' }),
  phone: z.string()
    .min(10, { message: 'Telefone deve ter pelo menos 10 dígitos' })
    .max(15, { message: 'Telefone muito longo. Máximo 15 dígitos' })
    .regex(/^\+?[\d\s-()]{10,15}$/, { message: 'Telefone inválido. Use apenas números, espaços, hifens e parênteses (ex: +55 11 99999-9999)' }),
});

export type ProfileSchemaType = z.infer<typeof profileSchema>;
