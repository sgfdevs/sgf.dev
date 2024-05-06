'use client';

import { Group } from '@/app/groups/page';
import Image from 'next/image';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { FaCalendarAlt } from 'react-icons/fa';

interface GroupActionProps {
  group: Group;
}

export default function GroupDetailsAbout({ group }: GroupActionProps) {
  return (
    <>
      <div
        className={
          'mx-[5vmax] flex flex-col gap-y-6 pt-[2rem] font-source-sans-3 lg:grid lg:grid-cols-[2fr_1fr] lg:grid-rows-[auto,auto,auto] lg:gap-x-[2rem]'
        }
      >
        <div
          className={
            'text-[#254151 flex w-full flex-col items-start gap-y-4 rounded-3xl bg-[#e6e6e6] px-[30px] py-[40px] text-[18px] leading-[1.666em] md:order-1 lg:col-start-2 lg:w-full lg:p-[2rem]'
          }
        >
          <div className={'flex items-center gap-x-2'}>
            <FaMapMarkerAlt size={'1.8rem'} />
            <span>{group.location}</span>
          </div>

          <div className={'flex items-center gap-x-2'}>
            <FaCalendarAlt size={'1.8rem'} />
            <span>Established {group.established}</span>
          </div>
        </div>

        <div
          className={
            'flex justify-center lg:order-2 lg:col-start-2 lg:justify-start'
          }
        >
          <Image
            className={'w-full rounded-3xl'}
            src={group.image}
            alt={'Group Image'}
            width={514}
            height={440}
          />
        </div>

        <div className={'lg:order-last lg:col-start-2'}>
          <h3 className={'text-[1.17em] font-bold'}>Social</h3>
        </div>

        <div className={'md:order-last lg:col-start-1 lg:row-span-full'}>
          <h3 className={'text-[1.17em] font-bold lg:my-[1rem]'}>Biography</h3>
          <div
            className={
              'space-y-[1em] pt-[24px] text-[18px] leading-[1.666em] text-[#254151]'
            }
          >
            {group.description.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
