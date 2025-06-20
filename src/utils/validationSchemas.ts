import { z } from 'zod';
import type { CreateUserDto } from '../features/users/types';

// Esquema para validar email
export const emailSchema = z.string()
  .email('Correo electrónico inválido')
  .min(1, 'El correo electrónico es requerido')
  .max(255, 'El correo electrónico no debe exceder 255 caracteres');

// Esquema para validar contraseñas
export const passwordSchema = z.string()
  .min(6, 'La contraseña debe tener al menos 6 caracteres')
  .max(50, 'La contraseña no debe exceder 50 caracteres')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
    'La contraseña debe contener al menos una letra minúscula, una mayúscula y un número'
  );

// Esquema para nombre de usuario
export const nameSchema = z.string()
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(50, 'El nombre no debe exceder 50 caracteres')
  .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios');

// Esquema para el formulario de inicio de sesión
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});

// Esquema para el formulario de registro
export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  passwordconf: z.string().min(1, 'Confirmación de contraseña es requerida')
}).refine((data) => data.password === data.passwordconf, {
  message: 'Las contraseñas no coinciden',
  path: ['passwordconf'],
});

// Esquema para actualización de perfil
export const updateProfileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  image: z.string().optional()
});

// Esquema para cambio de contraseña
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: passwordSchema,
  confirmNewPassword: z.string().min(1, 'Confirmación de contraseña es requerida')
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmNewPassword'],
});

// Schema para crear usuario (admin)
export const createUserSchema= z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  passwordconf: z.string().min(6, 'La confirmación debe tener al menos 6 caracteres'),
  role: z.enum(['user', 'admin']),
  image: z.string().optional()
}).refine(data => data.password === data.passwordconf, {
  message: 'Las contraseñas no coinciden',
  path: ['passwordconf']
});

// Schema para actualizar usuario
export const updateUserSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
  passwordconf: z.string().optional(),
  role: z.enum(['user', 'admin']).optional(),
  image: z.string().optional()
}).refine(data => !data.password || !data.passwordconf || data.password === data.passwordconf, {
  message: 'Las contraseñas no coinciden',
  path: ['passwordconf']
});
export const updateUserSchemaAdmin = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  password: z.string().optional(),
  passwordconf: z.string().optional(),
  role: z.enum(['user', 'admin']).optional(),
  image: z.string().optional()
}).refine(data => !data.password || !data.passwordconf || data.password === data.passwordconf, {
  message: 'Las contraseñas no coinciden',
  path: ['passwordconf']
});
// Tipos derivados de los esquemas
export type LoginFormInputs = z.infer<typeof loginSchema>;
export type RegisterFormInputs = z.infer<typeof registerSchema>;
export type UpdateProfileInputs = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInputs = z.infer<typeof changePasswordSchema>;
export type CreateUserFormInputs = z.infer<typeof createUserSchema>;
export type UpdateUserFormInputs = z.infer<typeof updateUserSchema>;