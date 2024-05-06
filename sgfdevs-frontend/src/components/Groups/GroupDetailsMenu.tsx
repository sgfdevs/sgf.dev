import { cn } from '@/utils/cn';
import { Group } from '@/app/groups/page';
import React from 'react';

interface GroupDetailsMenuProps {
  isAboutSectionActive: boolean;
  setIsAboutSectionActive: React.Dispatch<React.SetStateAction<boolean>>;
  group: Group;
}

export default function GroupDetailsMenu({
  isAboutSectionActive,
  setIsAboutSectionActive,
  group,
}: GroupDetailsMenuProps) {
  return (
    <>
      <div className={'mx-[5vmax]'}>
        <div className={'flex gap-x-[60px] pl-[30px] text-[14px]'}>
          <button
            onClick={() => setIsAboutSectionActive(true)}
            className={cn('text-[1.17em] font-bold lg:my-[1rem]', {
              'text-[#6e6d7a]': !isAboutSectionActive,
            })}
          >
            About
          </button>
          <button
            onClick={() => setIsAboutSectionActive(false)}
            className={cn(
              'text-[1.17em] font-bold text-[#6e6d7a] lg:my-[1rem]',
              {
                'text-[#244151]': !isAboutSectionActive,
              },
            )}
          >
            Leaders {group.leaders.length}
          </button>
        </div>
      </div>
      <div className={'mx-[5vmax]'}>
        <div className={'h-[2px] w-full bg-[#f3f3f3]'}></div>
      </div>
    </>
  );
}
