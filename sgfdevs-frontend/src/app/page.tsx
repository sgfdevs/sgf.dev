import Directory from '@/assets/Headline.svg';
import Sponsor from '@/assets/Sponsor.svg';
import Image from 'next/image';
import Carousel from '@/components/Carousel';

import { Link } from '@/components/Link';
import { DirectoryCard } from '@/components/DirectoryCard';
import { SponsorCard } from '@/components/SponsorCard';
import { cn } from '@/utils/cn';
import { DevNightBanner } from '@/components/DevNightBanner';

//TODO: Repplace with actual images.
import Pipey from '@/assets/pipey.jpg';
import ChrisKin from '@/assets/ChrisKin.jpg';
import LogicForte from '@/assets/logic-forte.jpg';
import DeveloperCard from '@/components/DeveloperCard';

export default function Home() {
  const memberCount = 109;
  const exampleDev = {
    avatar:
      'https://sgf.dev/media/o4nhslxo/npadgett.jpg?width=800&rnd=133294228088870000',
    name: 'Nathanael Padgett',
    location: 'Springfield,  MO',
    bio: 'bob',
    skills: [],
    createdAt: new Date(),
    username: 'npadgett',
    social: ' https://nathanaelpadgett.com',
  };
  return (
    <div className='flex-1'>
      <DevNightBanner>

      </DevNightBanner>

      <section className='relative pb-32 pt-11 before:-top-8 before:left-0 before:h-8 before:w-full before:rounded-3xl before:bg-white'>
        <header className='mb-11 flex items-end justify-between px-12'>
          <section className='lg:flex lg:items-end'>
            <Image src={Directory} alt='Directory' />
            <span className='inline leading-[0.8em]'>
              Find the Best Agencies and Professionals
            </span>
          </section>
          <section className='flex items-end'>
            <span className='mr-4 font-light leading-[0.8em]'>
              <strong className='font-bold'>{memberCount}</strong> Members
            </span>
          </section>
        </header>
        <div className='relative'>
          <Link
            className='duration-250 pointer-events-none absolute left-0 top-0 z-10 flex h-full items-center bg-scroll-left px-5 opacity-0 backdrop-blur-sm transition-opacity'
            href='#'
          >
            <i className='font-font-awesome-5-pro before:content-[""]' />
          </Link>
          <Carousel className='flex'
            length = {memberCount}
            directoryCard = {<DirectoryCard memberCount={memberCount}/>}
          />
        </div>
      </section>
      <section className='relative overflow-hidden bg-foreground px-12 pb-11 pt-4 text-white'>
        <header className='mb-[120px] flex flex-col justify-between md:mb-[72px] md:flex-row'>
          <section className='mr-8 mt-[27.5px] lg:flex lg:items-end'>
            <Image
              className='mb-3 mr-2 inline lg:mb-0'
              src={Sponsor}
              alt='Sponsors'
            />
            <span className='block lg:mb-0 lg:inline lg:leading-[10px]'>
              We are proudly sponsored by these companies & brands
            </span>
          </section>
          <div
            className={cn(
              'relative top-[-15px] h-[58px] w-full flex-1 content-[""] md:top-[-3px]',
              'before:absolute before:left-0 before:top-0 before:h-[62px] before:w-[calc(100%+130px)] before:bg-[url(/sponsor_upper_left.svg),linear-gradient(#6F9DCA,#6F9DCA),url(/sponsor_upper_right.svg)] before:bg-sponsor-top before:bg-no-repeat',
              'after:absolute after:left-[110px] after:top-[24px] after:h-[41px] after:w-full after:bg-[url(/sponsor_lower_left.svg),linear-gradient(#6F9DCA,#6F9DCA),url(/sponsor_lower_right.svg)] after:bg-sponsor-bottom after:bg-no-repeat',
            )}
          />
        </header>
        <div className='grid grid-cols-[repeat(auto-fill,minmax(315px,1fr))] gap-x-6 gap-y-7'>
          <div className='flex max-w-full flex-col rounded-3xl bg-[#f5f7f7] px-6 py-7 text-sm text-foreground'>
            <dl className='text-foreground'>
              <dt className='mb-4 text-sm font-semibold leading-relaxed text-[#000]'>
                Sponsorship Opportunities
              </dt>
              <dd className='text-xl font-bold tracking-relaxed text-foreground'>
                Connect with the developer community in Springfield
              </dd>
            </dl>
            <footer className='mt-auto'>
              <Link
                className='h-[40px] px-6'
                variant='button'
                href='/about/sponsorship'
              >
                Become a Sponsor
              </Link>
            </footer>
          </div>
          <SponsorCard
            href='/companies/logicforte'
            imageSrc={LogicForte}
            name='Logic Forte'
            url='logicforte.com'
            founding
          />
          <SponsorCard
            href='/companies/hearo'
            imageSrc={LogicForte}
            name='Hearo'
            url='hearolife.com'
          />
          <SponsorCard
            href='/companies/hearo'
            imageSrc={LogicForte}
            name='Hearo'
            url='hearolife.com'
          />
          <SponsorCard
            href='/companies/hearo'
            imageSrc={LogicForte}
            name='Hearo'
            url='hearolife.com'
          />
          <SponsorCard
            href='/companies/hearo'
            imageSrc={LogicForte}
            name='Hearo'
            url='hearolife.com'
          />
          <SponsorCard
            href='/companies/hearo'
            imageSrc={LogicForte}
            name='Hearo'
            url='hearolife.com'
          />
          <SponsorCard
            href='/companies/hearo'
            imageSrc={LogicForte}
            name='Hearo'
            url='hearolife.com'
          />
          <SponsorCard
            href='/companies/hearo'
            imageSrc={LogicForte}
            name='Hearo'
            url='hearolife.com'
          />
          <SponsorCard
            href='/companies/hearo'
            imageSrc={LogicForte}
            name='Hearo'
            url='hearolife.com'
          />
        </div>
      </section>
      <section
        className={cn(
          'relative pt-[153px]',
          'after:bg-120 after:absolute after:left-0 after:top-[-23px] after:z-[-1] after:h-[180px] after:w-full after:bg-[url(/circuit_graphic.svg)] after:bg-right-bottom after:bg-no-repeat after:content-[""]',
          'md:after:absolute md:after:left-auto md:after:top-auto md:after:z-auto md:after:h-auto md:after:w-auto md:after:bg-none md:after:content-[""]',
          'md:relative md:min-h-[353px] md:bg-[url(/circuit_graphic.svg)] md:bg-[65vw_50%] md:bg-no-repeat md:pb-24 md:pr-16 md:pt-36 xl:bg-[right]',
        )}
      >
        <div className='relative mx-auto px-8'>
          <div className='max-w-[65%] xl:max-w-[43%]'>
            <h3 className='text-4xl font-bold text-foreground'>
              Educating, inspiring and supporting developers, agencies and
              professionals in the Greater Springfield, MO area.
            </h3>
            <p className='my-4'>
              Springfield Devs is a non-profit organization focused on growing
              and fostering the developer community in Southwest Missouri since
              2014. The first Wednesday of every month we host Dev Night where
              several local groups present on their related topics. These events
              are hosted in-person at the efactory and streamed live online. Dev
              Nights are always free events and food/beverages are served. Join
              our Meetup to receive notifications on the next Dev Night.
            </p>
            <p className='my-4'>
              <Link
                variant='button'
                fill='primary'
                href='https://www.meetup.com/sgfdevs'
              >
                SGF Devs Meetup
              </Link>
            </p>
            <p className='my-4'>
              And the party doesn&apos;t stop after Dev Night. Join our Discord
              server to keep the convos rolling.
            </p>
            <p>
              <Link
                variant='button'
                fill='primary'
                href='https://discord.sgf.dev'
                target='_blank'
              >
                SGF Devs Discord
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
