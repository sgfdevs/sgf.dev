import { cn } from '@/utils/cn';
import { PropsWithChildren } from 'react';

export type MobileMenuProps = {
  open: boolean;
} & PropsWithChildren;

export function MobileMenu({ open, children }: MobileMenuProps) {
  return (
    <>
      <div
        className={cn(
          'fixed left-0 top-[125.5px] z-10 h-[100vh] w-[100vw] bg-black transition-opacity duration-1000 lg:hidden',
          open && 'opacity-70',
          !open && 'duration-250 pointer-events-none opacity-0',
        )}
      />
      <nav
        className={cn(
          'fixed right-0 top-[100px] z-20 h-auto min-h-[calc(100vh-100px)] w-full max-w-[500px] bg-white p-8 opacity-100 transition-all duration-500 lg:hidden',
          'before:absolute before:left-0 before:top-0 before:h-[55px] before:w-[110px] before:bg-[url(/mobile-lines-top-left.svg)] before:bg-contain before:bg-no-repeat',
          'after:absolute after:-right-[3.6em] after:top-[calc(50%-25px)] after:h-[56px] after:w-[100px] after:bg-[url(/mobile_lines_mid_right.svg)] after:bg-contain after:bg-no-repeat',
          open && 'right-0',
          !open && 'duration-250 -right-[100vw]',
        )}
      >
        <ul className='mx-auto ml-12 h-[62vh] max-h-[350px] w-[80%] bg-white'>
          {children}
        </ul>
      </nav>
    </>
  );
}
