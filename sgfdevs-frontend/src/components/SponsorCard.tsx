import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import { Link } from '@/components/Link';
import Image from 'next/image';

interface SponsorCardProps {
  href: string;
  imageSrc: string | StaticImport;
  name: string;
  url: string;
  founding?: boolean;
}

export function SponsorCard({
  href,
  imageSrc,
  name,
  founding,
  url,
}: SponsorCardProps) {
  return (
    <div className='block max-w-full rounded-3xl'>
      <figure className='relative h-[228px] overflow-hidden rounded-t-[inherit]'>
        <Link className='text-foreground-light' href={href}>
          <Image
            className='h-full w-full object-cover'
            src={imageSrc}
            alt={name}
          />
        </Link>
        {founding && (
          <figcaption className='absolute bottom-4 right-0'>
            <div
              className='mb-2 bg-foreground-light pl-4 pr-1 text-sm font-normal leading-6 tracking-none'
              style={{
                clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 7px 50%)',
              }}
            >
              Founding Sponsor
            </div>
          </figcaption>
        )}
      </figure>
      <div className='rounded-b-[inherit] bg-white p-4'>
        <dl className='text-foreground'>
          <dt className='text-md font-semibold'>
            <Link href={href}>{name}</Link>
          </dt>
          <dd className='text-sm'>
            <Link
              className='font-light tracking-none text-foreground-light'
              href={`https://${url}`}
              target='_blank'
            >
              {url}
            </Link>
          </dd>
        </dl>
      </div>
    </div>
  );
}
