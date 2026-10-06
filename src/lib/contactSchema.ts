// Validation rules for the contact form (ContactForm island).
// Error messages are dictionary keys under contact.form.errors.
import { z } from 'zod';
import { productSlugs } from '../data/catalog';
import { provinces } from '../config/site';
import { locales } from '../i18n/config';

export const contactMethods = ['phone', 'email', 'whatsapp'] as const;
export const contactTimes = ['morning', 'afternoon', 'evening', 'anytime'] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'name').max(100, 'name'),
  email: z.string().trim().max(200, 'email').pipe(z.email('email')),
  phone: z
    .string()
    .trim()
    .refine((v) => {
      const digits = v.replace(/\D/g, '');
      return digits.length >= 10 && digits.length <= 15;
    }, 'phone'),
  province: z.enum(provinces, { error: 'province' }),
  language: z.enum(locales),
  products: z.array(z.enum(productSlugs)).min(1, 'products'),
  contactMethod: z.enum(contactMethods),
  bestTime: z.enum(contactTimes),
  message: z.string().trim().max(2000, 'message').optional().default(''),
  consent: z.literal(true, { error: 'consent' }),
  /** Honeypot: must stay empty. */
  website: z.string().max(0).optional().default(''),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactData = z.output<typeof contactSchema>;
export type ContactErrorKey = 'name' | 'email' | 'phone' | 'province' | 'products' | 'consent' | 'message';

/** Map zod issues to { field: errorKey } using the first issue per field. */
export function fieldErrors(error: z.ZodError): Partial<Record<keyof ContactInput, ContactErrorKey>> {
  const out: Partial<Record<keyof ContactInput, ContactErrorKey>> = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as keyof ContactInput;
    if (field && !out[field]) out[field] = (issue.message as ContactErrorKey) ?? field;
  }
  return out;
}
