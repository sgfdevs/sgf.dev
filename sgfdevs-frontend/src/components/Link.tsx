import NextLink, { LinkProps } from 'next/link';
import React, { forwardRef, PropsWithChildren } from 'react';
import { cva, VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const styles = cva('', {
  variants: {
    variant: {
      smallButton: 'border-foreground-light inline-flex items-center text-sm rounded-3xl border px-4 font-bold',
      button:
        'border-foreground-light inline-flex items-center text-sm rounded-3xl border px-4',
      nav: 'text-foreground hover:text-foreground-light text-sm font-bold uppercase tracking-wide transition-colors duration-300',
    },
    fill: {
      primary: 'bg-foreground-light text-white px-5 h-[40px]',
    },
  },
});

export const Link = forwardRef<
  HTMLAnchorElement,
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> &
    LinkProps &
    PropsWithChildren &
    VariantProps<typeof styles>
>(({ className, variant, fill, ...other }, ref) => (
  <NextLink
    className={cn(styles({ variant, fill }), className)}
    ref={ref}
    {...other}
  />
));
Link.displayName = 'Link';
