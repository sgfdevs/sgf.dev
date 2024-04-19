'use server';

import { z } from 'zod';

const schema = z.object({
  username: z
    .string()
    .trim()
    .min(1, { message: 'The Username field is required.' }),
  password: z.string().min(1, { message: 'The Password field is required.' }),
});

export async function loginAction(prevstate: any, formData: FormData) {
  const validateFormData = schema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
  });

  if (!validateFormData.success) {
    return {
      data: {},
      errors: validateFormData.error.flatten().fieldErrors,
    };
  }

  // Call Login API here
}
