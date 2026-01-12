/**
 * Validation Schemas
 * Zod schemas for form validation
 */

import { z } from 'zod'

// ============================================================================
// Auth Validation Schemas
// ============================================================================

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(1, 'New password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
})

// ============================================================================
// Website Validation Schemas
// ============================================================================

export const websiteSchema = z.object({
  name: z
    .string()
    .min(1, 'Website name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(200, 'Name must not exceed 200 characters'),
  url: z
    .string()
    .min(1, 'URL is required')
    .url('Please enter a valid URL')
    .refine(
      (url) => url.startsWith('http://') || url.startsWith('https://'),
      'URL must start with http:// or https://'
    ),
  monitoring_interval: z
    .number()
    .min(30, 'Monitoring interval must be at least 30 seconds')
    .max(3600, 'Monitoring interval must not exceed 1 hour (3600 seconds)')
    .default(60),
  timeout_threshold: z
    .number()
    .min(1, 'Timeout must be at least 1 second')
    .max(60, 'Timeout must not exceed 60 seconds')
    .default(10),
})

export const createWebsiteSchema = websiteSchema

export const updateWebsiteSchema = websiteSchema.partial()

// ============================================================================
// Type Exports
// ============================================================================

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>
export type WebsiteFormData = z.infer<typeof websiteSchema>
export type CreateWebsiteFormData = z.infer<typeof createWebsiteSchema>
export type UpdateWebsiteFormData = z.infer<typeof updateWebsiteSchema>
