import { DevNightDetails } from '@/components/DevNightDetails';
import { group } from 'console';
import Image from 'next/image';
import { title } from 'process';
import React, { useState, useEffect } from 'react';

export function DevNightBanner() {
  // For testing purposes, single, two, or multiple presentation nights
  // const presentations = [{group: 'Group Name', presenter: 'Presenter Name', otherPresenter: ['Other Presenter Name1', 'Other Presenter Name2'], name: 'TED Talk Title long longer longest est est more more more more more moe moer more more more more moremore mroe mroe', MeetupUrl: '#'}];
  // const presentations = [{group: 'Group Name', presenter: 'Presenter Name', otherPresenter: ['Other Presenter Name1', 'Other Presenter Name2'], name: 'TED Talk Title', MeetupUrl: '#'}, {group: 'Group 2 Name', presenter: 'Presenter 2 Name', otherPresenter: ['Other Presenter 2 Name1', 'Other Presenter 2 Name2'], name: 'TED 2 Talk 2 Title pants pants pants pants ', MeetupUrl: '#'}];
  const presentations = [{group: 'Group Name', presenter: 'Presenter Name', otherPresenter: ['Other Presenter Name1', 'Other Presenter Name2'], name: 'TED Talk Title', MeetupUrl: '#'}, {group: 'Group 2 Name', presenter: 'Presenter 2 Name', otherPresenter: ['Other Presenter 2 Name1', 'Other Presenter 2 Name2'], name: 'TED 2 Talk 2 Title', MeetupUrl: '#'}, {group: 'Group 3 Name', presenter: 'Presenter 3 Name', otherPresenter: ['Other Presenter 3 Name1', 'Other Presenter 3 Name2'], name: 'TED 3 Talk 3 Title', MeetupUrl: '#'}];


  return (
    <section className='dev-night-banner'>
      {/* {nextDevNight && ( */}
      <time className='block text-lg font-bold text-white'>
        <span className='inline-block w-64 border-x-2 border-foreground-light py-3.5'>
          Apr 1, 2024
          {/* {new Date(nextDevNight.Date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })} */}
        </span>
      </time>
      {/* )} */}
      <div className='headline relative m-0 mb-8 inline-block transform -translate-y-1 pt-7.5 px-12 pb-5.5'>
        <Image
          src='https://web.archive.org/web/20230314044147im_/http://sgf.dev/images/headlines/dev_night.svg'
          alt='Dev Night'
          width={358}
          height={49}
        />
      </div>
      <ul className={` flex flex-col flex-wrap justify-center gap-12 items-stretch px-11 md:flex-row `}>
        {presentations.map((presentation, index) => (
        <DevNightDetails key={index} presentation={presentation} index={index} total={presentations.length}/>
        ))}
      </ul>
    </section>
  );
}
// Path: sgfdevs-frontend/src/components/DevNightBanner.tsx

