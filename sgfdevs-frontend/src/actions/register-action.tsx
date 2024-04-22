'use server';

import { z } from 'zod';

const schema = z.object({
  firstname: z
    .string()
    .trim()
    .min(1, { message: 'The First Name field is required.' }),
  lastname: z
    .string()
    .trim()
    .min(1, { message: 'The Last Name field is required.' }),
  email: z.string().email({ message: 'The Email field is required.' }),
  username: z
    .string()
    .trim()
    .min(1, { message: 'The Username field is required.' }),
  password: z.string().min(1, { message: 'The Password field is required.' }),
  nullcheck: z
    .string()
    .min(1, { message: 'The Null Check field is required.' }),
});

export async function registerAction(prevstate: any, formData: FormData) {
  const validateFormData = schema.safeParse({
    firstname: formData.get('firstname'),
    lastname: formData.get('lastname'),
    email: formData.get('email'),
    username: formData.get('username'),
    password: formData.get('password'),
    nullcheck: formData.get('nullcheck'),
  });

  if (!validateFormData.success) {
    return {
      data: {},
      errors: validateFormData.error.flatten().fieldErrors,
    };
  }

  // Call Register API here
}
