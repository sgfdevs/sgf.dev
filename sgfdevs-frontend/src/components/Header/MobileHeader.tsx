'use client';

import { PropsWithChildren, useState } from 'react';
import { HeaderItem } from '@/components/Header/HeaderItem';
import { MobileMenu } from '@/components/Header/MobileMenu';
import { MobileNav } from '@/components/Header/MobileNav';

export function MobileHeader({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav role='navigation'>
        <ul className='flex'>
          <MobileNav open={open} toggle={() => setOpen((open) => !open)} />
          <HeaderItem href='/login'>Login</HeaderItem>
          <HeaderItem href='/register'>Sign Up</HeaderItem>
        </ul>
      </nav>
      <MobileMenu open={open}>{children}</MobileMenu>
    </>
  );
}
