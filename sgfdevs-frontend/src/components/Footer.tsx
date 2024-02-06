import LogoShort from '@/assets/logo_short.svg';
import { Link } from '@/components/Link';
import Image from 'next/image';
import { PropsWithChildren } from 'react';

const FooterLink = ({
  children,
  href,
}: { href: string } & PropsWithChildren) => (
  <Link href={href} className='flex items-center text-sm font-bold'>
    {children}
  </Link>
);

const SubLink = ({ children, href }: { href: string } & PropsWithChildren) => (
  <Link href={href} className='text-sm font-light leading-none'>
    {children}
  </Link>
);

export function Footer() {
  return (
    <footer className='rounded-t-3xl bg-[#f4f4f4] pb-8 pt-14'>
      <div className='relative mx-auto flex flex-col px-8 lg:grid lg:grid-cols-2'>
        <div className='mb-14'>
          <div>
            <Link href='/'>
              <Image src={LogoShort} alt='SGF Devs' />
            </Link>
          </div>
          <nav className='mt-2 flex flex-wrap gap-8'>
            <FooterLink href='/about'>About</FooterLink>
            <FooterLink href='/directory'>Directory</FooterLink>
            <FooterLink href='/groups'>Chapters</FooterLink>
          </nav>
        </div>
        <div className='order-3'>
          <nav className='flex flex-wrap gap-5'>
            <SubLink href='https://twitch.tv/sgfdevs'>Twitch</SubLink>
            <SubLink href='https://www.youtube.com/channel/UC09Jd4ouiP_BUc7REYhC2kw'>
              Youtube
            </SubLink>
            <SubLink href='https://github.com/sgfdevs'>GitHub</SubLink>
            <SubLink href='https://www.facebook.com/sgfdevs'>Facebook</SubLink>
            <SubLink href='https://twitter.com/sgfdevs'>Twitter</SubLink>
            <SubLink href='https://www.instagram.com/sgfdevs'>
              Instagram
            </SubLink>
            <SubLink href='https://discord.sgf.dev'>Discord</SubLink>
          </nav>
          <p className='my-4'>
            <span className='text-sm'>V2.0</span>
          </p>
        </div>
        <div className='order-2 mb-14 max-w-[500px] lg:ml-auto'>
          <h5 className='text-xl font-bold text-foreground'>
            Never miss a thing
          </h5>
          <p className='my-4 font-light'>
            Subscribe to our newsletter and be the first to know about exciting
            events, exclusive offers from sponsors and what’s happening in our
            dev community.
          </p>
          <form
            action='https://hooks.zapier.com/hooks/catch/5643689/o317nvx'
            method='post'
            id='updates_subscribe'
          >
            <div>
              <label className='mb-2 block text-sm font-bold uppercase'>
                Email
              </label>
              <input
                className='mb-6 w-full border-0 border-b-2 border-[#cbcbcb] text-[#000] focus:border-[#000] focus:outline-none'
                style={{ background: 'none' }}
                type='text'
                placeholder='laurie.bream@raviga.com'
                name='email'
                id='email'
              />
            </div>
          </form>
          <button className='inline-flex h-[40px] items-center rounded-3xl border-0 bg-foreground-light px-6 text-sm font-bold text-white'>
            Sign Up
          </button>
        </div>
      </div>
    </footer>
  );
}
