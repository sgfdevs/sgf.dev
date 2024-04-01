import { DevNightDetails } from '@/components/DevNightDetails';
import Image from 'next/image';

export function DevNightBanner() {
  return (
    <section className='relative overflow-hidden bg-foreground pb-64 text-white text-center rounded-3xl'>
      <time className='block text-white box-border font-bold text-lg'>
        <span className='py-3.5 w-64 inline-block border-x-2 border-cyan-500 '>
          Apr 1, 2024
        </span>
      </time>
      <div className="relative inline-block mb-14 py-8 px-12 translate-y-0.5 headline ">
        <Image src="https://web.archive.org/web/20230314044147im_/http://sgf.dev/images/headlines/dev_night.svg"
        alt='Dev Night'
        width={358}
        height={49}
        />
      </div>
      <DevNightDetails>

      </DevNightDetails>
    </section>
    );
}
// Path: sgfdevs-frontend/src/components/DevNightBanner.tsx
