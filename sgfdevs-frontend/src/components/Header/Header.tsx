import Image from 'next/image';
import Logo from '@/assets/logo.svg';
import { Link } from '@/components/Link';
import { MobileHeader } from '@/components/Header/MobileHeader';
import { HeaderItem } from '@/components/Header/HeaderItem';
import { MobileMenu } from '@/components/Header/MobileMenu';

const routes = [
  {
    label: 'About',
    href: '/about',
  },
  {
    label: 'Groups',
    href: '/groups',
  },
  {
    label: 'Directory',
    href: '/directory',
  },
  {
    label: 'Archives',
    href: '/archives',
  },
  {
    label: 'Discord',
    href: '/discord',
  },
];

export function Header() {
  return (
    <header className='pb-10 pt-7'>
      <div className='relative mx-auto flex items-center justify-between px-12'>
        <div>
          <Link href='/public'>
            <Image src={Logo} alt='Logo' />
          </Link>
        </div>
        <nav className='hidden lg:block' role='navigation'>
          <ul className='flex'>
            {routes.map(({ label, href }) => (
              <HeaderItem key={href} href={href}>
                {label}
              </HeaderItem>
            ))}
          </ul>
        </nav>
        <MobileHeader>
          {routes.map(({ label, href }) => (
            <li key={href} className='pb-2'>
              <Link href={href} variant='nav'>
                {label}
              </Link>
            </li>
          ))}
        </MobileHeader>
      </div>
    </header>
  );
}
