'use client';

import { loginAction } from '@/actions/login-action';
import InputLabel from '@/components/InputLabel';
import Link from 'next/link';
import Input from '@/components/Input';
import { useFormState } from 'react-dom';

const initialState = {
  data: {},
  errors: {},
};

const formFields = [
  {
    labelText: 'Username',
    inputType: 'text',
    inputName: 'username',
  },
  {
    labelText: 'Password',
    inputType: 'password',
    inputName: 'password',
  },
];

export default function Login() {
  const [state, formAction] = useFormState(loginAction, initialState);

  return (
    <>
      <div
        className={
          'w-screen px-[3rem] pb-[96px] font-source-sans-3 md:mx-auto md:w-[675px] md:px-0'
        }
      >
        <form action={formAction}>
          {formFields.map((field) => (
            <div key={field.labelText}>
              <InputLabel
                labelText={field.labelText}
                inputName={field.inputName}
                errors={state?.errors}
              />
              <Input
                inputType={field.inputType}
                inputName={field.inputName}
                inputPlaceholder={`Enter your ${field.inputName}...`}
              />
            </div>
          ))}

          <button
            type='submit'
            className={
              'mb-[30px] block h-[64px] w-[95px] rounded-full bg-[#609fcd] text-[16px] font-semibold uppercase text-white md:w-[119px]'
            }
          >
            Login
          </button>
        </form>

        <Link
          className={'pt-[35px] text-[18px] text-[#609fcd]'}
          href={'/forgotten-password'}
        >
          Forgot your password?
        </Link>
      </div>
    </>
  );
}
