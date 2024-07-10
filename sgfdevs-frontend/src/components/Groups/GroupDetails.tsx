import { Group } from '@/app/groups/page';
import { cn } from '@/utils/cn';

interface GroupDetailsProps {
  group: Group;
}

export default function GroupDetails({ group }: GroupDetailsProps) {
  return (
    <>
      <div
        className={cn(
          'mx-[5vmax] flex flex-col bg-[url(/groups/circuit_graphic.svg)] bg-no-repeat pb-[2rem] pt-[2rem] [background-position-y:-30%]',
          ' lg:flex-row lg:items-center lg:pt-[4rem] lg:[background-position-x:60%] lg:[background-position-y:-35%]',
        )}
      >
        <div className={'order-2 basis-2/3 lg:order-none'}>
          <p
            className={
              'my-[1em] text-center font-source-sans-3 text-[18px] text-foreground-light lg:my-0 lg:text-left'
            }
          >
            GROUP
          </p>
          <h1
            className={
              'my-[2rem] text-center font-source-sans-3 text-[4rem] font-bold leading-[4rem] text-black lg:pr-[1rem] lg:text-left'
            }
          >
            {group?.name}
          </h1>
        </div>

        <div
          className={cn(
            'lg:basis-[40%]] mx-auto h-[440px] w-full max-w-[686px] flex-grow-0 basis-[75%]',
            'after:absolute after:right-0 after:top-[115px] after:-z-10 after:h-[200px] after:w-[315px]',
            'after:bg-foreground after:content-[""] after:md:h-[340px] after:md:w-[440px] lg:max-w-full after:xl:w-[30%]',
          )}
        >
          <iframe
            className={'mx-auto w-full rounded-3xl lg:w-full'}
            src={group?.links?.youtube}
            width={514}
            height={440}
          />
        </div>
      </div>
    </>
  );
}
