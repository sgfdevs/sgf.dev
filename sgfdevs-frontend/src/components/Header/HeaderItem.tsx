import { PropsWithChildren } from 'react';
import { Link } from '@/components/Link';
import { cn } from '@/utils/cn';

interface Route {
  label: string;
  href: string;
}

interface HeaderItemProps extends PropsWithChildren {
  href: string;
  subMenuRoutes?: Route[];
}

export function HeaderItem({ href, subMenuRoutes, children }: HeaderItemProps) {
  return (
    <>
      {href.includes('/about') ? (
        <li className={'group/about relative ml-[3.5vw] hidden lg:block'}>
          <div className={'group-hover/about:text-foreground-light'}>
            <Link
              variant={'nav'}
              className={'pb-[22px] group-hover/about:text-foreground-light'}
              href={'/about'}
            >
              {children}
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={3}
                stroke='currentColor'
                className='inline h-[18px] pb-[1px] pl-1.5 align-text-bottom'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='m19.5 8.25-7.5 7.5-7.5-7.5'
                />
              </svg>
            </Link>
          </div>

          <nav>
            <ul
              className={cn(
                'invisible absolute left-1/2 top-[46px] z-10 mx-auto -translate-x-1/2 translate-y-[10px] transform divide-y-[.75px]',
                'divide-[#979797] rounded-[1.75rem] bg-white text-center opacity-0 shadow-[5px_5px_20px_#00000080]',
                'transition-all duration-[250ms] ease-in group-hover/about:visible group-hover/about:translate-y-0 group-hover/about:opacity-100',
              )}
            >
              {subMenuRoutes?.map((route) => (
                <li
                  key={route.href}
                  className={
                    'mx-[38px] whitespace-nowrap py-[23px] leading-none'
                  }
                >
                  <Link variant='nav' href={route.href}>
                    {route.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </li>
      ) : (
        <li className='relative ml-[3.5vw] hidden lg:block'>
          <Link variant='nav' href={href}>
            {children}
          </Link>
        </li>
      )}
    </>
  );
}
