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
    subMenuRoutes: [
      {
        label: 'Springfield Devs',
        href: '/about/',
      },
      {
        label: 'Leadership',
        href: '/about/leadership/',
      },
      {
        label: 'Code of conduct',
        href: '/about/code-of-conduct/',
      },
      {
        label: 'Sponsorship',
        href: '/about/sponsorship',
      },
      {
        label: 'Volunteer to Speak',
        href: 'https://sessionize.com/sgf-dev-night',
      },
    ],
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
    href: 'https://youtube.com/playlist?list=PLsuKlCbZhK0Of5hMBU7CZeunPHIciRfPD&si=Iv9RVVeOHaCAexIc',
  },
  {
    label: 'Discord',
    href: 'https://discord.sgf.dev/',
  },
];

export function Header() {
  return (
    <header className='pb-10 pt-7'>
      <div className='relative mx-auto flex items-center justify-between px-12'>
        <div>
          <Link href='/'>
            <Image src={Logo} alt='Logo' />
          </Link>
        </div>
        <nav className='hidden lg:block relative z-50' role='navigation'>
          <ul className='flex'>
            {routes.map(({ label, href, subMenuRoutes }) => (
              <HeaderItem key={href} href={href} subMenuRoutes={subMenuRoutes}>
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
