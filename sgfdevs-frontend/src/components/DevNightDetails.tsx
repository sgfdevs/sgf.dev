import Image from 'next/image';

export function DevNightDetails() {
  return (
    <ul className='grid grid-cols-1 gap-12 px-11 '>
      <li className='relative border-2 border-solid border-cyan-500 py-8 px-32 max-w-4xl mx-auto'>
        {/* Photo contianer */}
        <div className='absolute -top-10 left-1/2 flex -translate-x-1/2'>
          <a
            href='#'
            className='block h-20 w-20 rounded-full border-2 border-solid border-cyan-500'
          >
            <Image
              src='/ChrisKin.jpg'
              alt='Speaker Name'
              height={76}
              width={76}
              className='rounded-full object-cover grayscale'
              z-index={1}
            />
          </a>
        </div>
        {/* Presentation Title */}
        <a
          href='https://www.meetup.com/sgfdevs/events/293671834/'
          title='Meetup Link'
        >
          <h3 className='text-xl font-bold text-white underline my-6'>
            TED Talk Title
          </h3>
        </a>
        <dl className='mb-1 text-base'>
          <dt className='m-0 inline-block uppercase tracking-wider mr-2'>
            Presented By{' '}
          </dt>
          <dd className='m-0 inline-block uppercase tracking-wider'>
            <a className='text-cyan-500' href='https://sgf.dev/member/bellis/'>
              Presenter Name
            </a>
          </dd>
        </dl>
        <dl className='mt-0 text-base'>
          <dt className='m-0 inline-block uppercase tracking-wider mr-2'>From </dt>
          <dd className='m-0 inline-block uppercase tracking-wider'>
            <a
              className='text-cyan-500'
              href='https://sgf.dev/groups/springfield-aws/'
            >
              Organization Name
            </a>
          </dd>
        </dl>
      </li>
    </ul>
  );
}

