import { Group } from '@/app/groups/page';

interface GroupLeaderProps {
  group: Group;
}

export default function GroupDetailsLeaders({ group }: GroupLeaderProps) {
  return (
    <>
      <div className={'mx-[5vmax] mb-10 font-source-sans-3'}>
        <h3 className={'my-[1em] text-[1.17em] font-bold'}>Leaders</h3>

        <div
          className={
            'flex flex-shrink-0 flex-col gap-y-4 md:flex-row md:gap-x-4 md:gap-y-0'
          }
        >
          {group.leaders.map((leader, index) => (
            <>
              <div
                key={index}
                className={
                  'relative min-w-[313px] max-w-[423px] rounded-t-[2rem]'
                }
              >
                <img
                  className={
                    'max-h-[227px] w-full rounded-t-[2rem] object-cover'
                  }
                  src={leader.image}
                  alt='Group Leader Image'
                />

                {leader.isFoundingMember && (
                  <figcaption
                    className={
                      'absolute right-0 top-1/2 ml-auto content-normal bg-foreground-light pl-4 pr-[5px] text-[14px] leading-[23px] text-white [clip-path:polygon(0_0,100%_0,100%_100%,0_100%,7px_50%)]'
                    }
                  >
                    Founding Member
                  </figcaption>
                )}

                <div
                  className={
                    'flex max-h-[128px] min-h-[105px] flex-col items-center rounded-b-[2rem] border border-[#f5f7f7] bg-white  px-4 pb-[13px] pt-[14px]'
                  }
                >
                  <span className={'font-semibold text-foreground'}>
                    {leader.name}
                  </span>
                  <span
                    className={'text-[15px] leading-[1rem] text-foreground'}
                  >
                    {leader.location}
                  </span>

                  <button
                    className={
                      'mr-auto mt-5 h-[30px] rounded-full border border-foreground-light px-[14px] text-[14px] font-semibold text-foreground'
                    }
                  >
                    Profile
                  </button>
                </div>
              </div>
            </>
          ))}
        </div>
      </div>
    </>
  );
}
