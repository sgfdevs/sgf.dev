import { PropsWithChildren } from 'react';
import { Link } from '@/components/Link';

interface HeaderItemProps extends PropsWithChildren {
  href: string;
}

export function HeaderItem({ href, children }: HeaderItemProps) {
  return (
    <li className='relative ml-[3.5vw] hidden lg:block'>
      <Link variant='nav' href={href}>
        {children}
      </Link>
    </li>
  );
}
