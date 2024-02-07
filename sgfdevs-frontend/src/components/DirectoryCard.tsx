import { Link } from '@/components/Link';

interface DirectoryCardProps {
  memberCount: number;
}

export function DirectoryCard({ memberCount }: DirectoryCardProps) {
  return (
    <div className='line ml-12 mr-8 flex max-w-sm flex-shrink-0 flex-col rounded-3xl border border-[#f5f7f7] bg-[#f5f7f7] px-6 py-7 text-sm leading-[inherit]'>
      <dl className=''>
        <dt className='mb-4 text-sm font-semibold text-[#000]'>
          Professional Directory
        </dt>
        <dd className='text-foreground text-xl font-bold'>
          Find the{' '}
          <strong className='text-foreground-light'>best agencies</strong> and{' '}
          <strong className='text-foreground-light'>
            talented professionals
          </strong>{' '}
          in Southwest Missouri
        </dd>
      </dl>
      <p className='text-sm'>{memberCount} profiles found</p>
      <footer className='mt-auto'>
        <Link variant='button' className='h-[40px] px-6' href='/directory'>
          Explore
        </Link>
      </footer>
    </div>
  );
}
