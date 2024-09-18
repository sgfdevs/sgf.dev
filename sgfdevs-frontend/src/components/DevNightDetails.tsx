import Image from 'next/image';

function DevNightDetails({ presentation, index, total }) {
  const group = presentation.Group;
  const presenter = presentation.Presenter;
  const otherPresenters = presentation.OtherPresenters || [];


  // Determine presentations class based on total number of presentations
  let pClass = ' verticals relative border-2 border-solid border-foreground-light py-8 px-8 bg-foreground flex flex-col justify-between flex-1 ';
  // let pClass = ' relative border-2 border-solid border-foreground-light py-8 px-8 bg-foreground ';

  if (total === 1) {
    pClass += ' presentations_1 ';
  } else if (total === 2 ) {
    if (index === 0) {
      pClass += ' presentations_2_first';
    } else if (index === 1) {
      pClass += ' presentations_2_last';
    }
  } else if (total === 3 && index === 1) {
      pClass += ' presentations_3_middle'
  }
  // export function DevNightDetails() {
  return (
      <li className={pClass +' min-w-48 flex-grow '} >
        {/* Photo contianer */}
        <div className='absolute -top-10 left-1/2 flex -translate-x-1/2'>
          <a
            href='#'
            className='block h-20 w-20 rounded-full border-2 border-solid border-foreground-light'
          >
            <Image
              src='/ChrisKin.jpg' //needs to change for actual pictures
              alt="Chris's Name" // needs to point to actual user
              height={76}
              width={76}
              className='rounded-full object-cover grayscale'
              style={{ zIndex: 1}}
              z-index={1}
            />
          </a>
        </div>
        {/* Presentation Title */}
        <a
          href='https://www.meetup.com/sgfdevs/events/293671834/'
          href={presentation.MeetupUrl || '#' }
          title={presentation.name}
        >
          <h3 className='text-xl font-bold text-white underline my-6 break-words'>
            {presentation.name}
          </h3>
        </a>
        <dl className='mb-1 text-base'>
          <dt className='m-0 inline-block uppercase tracking-wider mr-2'>
            Presented By{' '}
          </dt>
          <dd className='m-0 inline-block uppercase tracking-wider'>
            <a className='text-foreground-light' href='https://sgf.dev/member/bellis/'>
              {presentation.presenter}
            </a>
          </dd>
        </dl>
        <dl className='mt-0 text-base'>
          <dt className='m-0 inline-block uppercase tracking-wider mr-2'>From </dt>
          <dd className='m-0 inline-block uppercase tracking-wider'>
            <a
              className='text-foreground-light'
              href='https://sgf.dev/groups/springfield-aws/'
            >
              {presentation.group}
            </a>
          </dd>
        </dl>
        {otherPresenters.length > 0 && (
          <dl className='mt-0 text-base'>
            <dt className='m-0 inline-block uppercase tracking-wider mr-2'>
              Other Presenters{' '}
            </dt>
            {otherPresenters.map((otherPresenter, index) => (
               <dd key={index} className='m-0 inline-block uppercase tracking-wider'>
              <a
                className='text-foreground-light'
                href='https://sgf.dev/member/bellis/'
              >
                {otherPresenter}
              </a>
            </dd>
            ))}
          </dl>
        )}
      </li>
  );
}
export { DevNightDetails };
// export default DevNightDetails;
