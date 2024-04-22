'use client';

import Input from '@/components/Input';
import InputLabel from '@/components/InputLabel';
import NullCheckText from '@/components/NullCheckText';
import Modal from '@/components/Modal';
import { registerAction } from '@/actions/register-action';
import Link from 'next/link';
import { useFormState } from 'react-dom';
import { useState } from 'react';

const initialState = {
  data: {},
  errors: {},
};

const formFields = [
  {
    labelText: 'First Name',
    inputType: 'text',
    inputName: 'firstname',
  },
  {
    labelText: 'Last Name',
    inputType: 'text',
    inputName: 'lastname',
  },
  {
    labelText: 'Email',
    inputType: 'email',
    inputName: 'email',
  },
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
  {
    labelText: 'Null Check',
    inputType: 'text',
    inputName: 'nullcheck',
  },
];

export default function Register() {
  const [state, formAction] = useFormState(registerAction, initialState);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        className={
          'w-screen px-[3rem] pb-[96px] font-source-sans-3 md:mx-auto md:w-[675px] md:px-0'
        }
      >
        <h1 className={'mt-[.67em] text-[2em] font-bold'}>
          Get started with your account
        </h1>

        <p className={'my-[1em]'}>
          Meet your peers. Engage with experts. Iron sharpening iron, you get
          it. Do it all with a membership to Springfield Devs. Already have an
          account?
          <Link className={'text-foreground-light'} href={'/login'}>
            {' '}
            Log in
          </Link>
        </p>

        <form action={formAction}>
          {formFields.map((field) => (
            <div key={field.labelText}>
              <InputLabel
                labelText={field.labelText}
                inputName={field.inputName}
                errors={state?.errors}
                nullCheckText={
                  field.inputName.includes('nullcheck') && (
                    <NullCheckText
                      isModalOpen={isModalOpen}
                      setIsModalOpen={setIsModalOpen}
                    />
                  )
                }
              />
              <Input inputType={field.inputType} inputName={field.inputName} />
            </div>
          ))}

          {isModalOpen && (
            <Modal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
          )}

          <div className={'flex gap-x-6'}>
            <button
              type='submit'
              className={
                'mb-[30px] block h-[64px] w-[158px] flex-shrink-0 rounded-full bg-[#609fcd] text-[16px] font-semibold uppercase text-white lg:w-[182px]'
              }
            >
              Get Started!
            </button>
            <p>
              By clicking the "get started" button, you are creating a
              Springfield Devs account, and you agree to Springfield Devs{' '}
              <Link
                className={'text-foreground-light'}
                href={'/code-of-conduct'}
              >
                Code of Conduct.
              </Link>
            </p>
          </div>
        </form>
      </div>
    </>
  );
}
