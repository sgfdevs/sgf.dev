import { Group } from '@/app/groups/page';
import Image from 'next/image';
import Link from 'next/link';

interface GroupProps {
  group: Group;
}

export default function Group({ group }: GroupProps) {
  function getInitials(name: string) {
    const parts = name.split(' ');
    const firstName = parts[0];
    const lastNameInitial = parts[1].charAt(0);
    return `${firstName} ${lastNameInitial}.`;
  }

  return (
    <>
      <div className={'font-source-sans-3'}>
        <div>
          <Image
            className={
              'aspect-[555/312] rounded-2xl object-fill min-[375px]:min-h-[211.250px] min-[375px]:min-w-[375px] sm:h-[338px] sm:w-[600px] md:h-[182px] md:w-[324px] md:min-w-[324px] lg:h-[338px] lg:w-[600px] xl:mx-0 xl:h-[312.641px] xl:w-[555px]'
            }
            src={group.image}
            alt={'Group Image'}
            width={555}
            height={312.641}
          />
        </div>

        <div className={'px-[30px] md:px-0'}>
          <h2
            className={
              'pt-9 text-[36px] font-bold leading-[40px] text-foreground'
            }
          >
            {group.name}
          </h2>
          <h3
            className={
              'my-[1em] text-[16px] leading-[30px] tracking-[1.78px] text-foreground-light'
            }
          >
            WHAT WE'RE ABOUT
          </h3>

          <div
            className={
              'mb-[1em] space-y-[1em] text-[18px] leading-[1.666em] text-black'
            }
          >
            {group.description.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <Link
            href={`/groups/${group.details}`}
            className={
              'flex h-[40px] w-[129px] items-center justify-center rounded-full bg-foreground-light text-[14px] font-semibold text-white'
            }
          >
            Group Details
          </Link>

          <div className={'pt-[14px]'}>
            <h3
              className={
                'text-[16px] leading-[30px] tracking-[1.78px] text-foreground-light'
              }
            >
              GROUP LEADERS
            </h3>

            <div className={'flex space-x-4'}>
              {group.leaders.map((leader, index) => (
                <div key={`${group.name}-${leader}-${index}`}>
                  <Image
                    className={'rounded-3xl grayscale'}
                    src={leader.image}
                    alt='Group Leader Image'
                    width={96}
                    height={96}
                  />
                  <span className={'text-[14px] font-bold text-foreground'}>
                    {getInitials(leader.name)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
