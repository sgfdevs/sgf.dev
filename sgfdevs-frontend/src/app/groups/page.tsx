import { groups } from '@/utils/groups/groupData';
import Group from '@/components/Groups/Group';

export interface Group {
  image: string;
  name: string;
  location: string;
  established: string;
  description: string[];
  details: string;
  leaders: {
    name: string;
    image: string;
    location: string;
    isFoundingMember: boolean;
  }[];
  links: {
    youtube: string;
  };
}

export default function Groups() {
  return (
    <>
      <div
        className={
          'relative grid min-h-[440px] rounded-[27px] bg-foreground bg-[url(/groups/header.svg)] bg-no-repeat pt-[90px] [background-position:112%]'
        }
      >
        <div
          className={
            'h-auto w-[400px] pl-[40px] sm:pl-[30px] md:mx-auto md:w-[800px] lg:w-[1200px]'
          }
        >
          <img
            src={'/groups/groups.svg'}
            alt={'Groups Header'}
            className={'[overflow-clip-margin:content-box]'}
          />
        </div>
      </div>
      <div
        className={
          'mx-auto grid -translate-y-[200px] gap-y-[60px] md:grid-cols-[324px,324px] md:gap-x-[60px] md:px-[30px] lg:grid-cols-1 xl:grid-cols-[554px,554px] xl:gap-x-[50px]'
        }
      >
        {groups.map((group: Group, index: number) => (
          <Group key={index} group={group} />
        ))}
      </div>
    </>
  );
}
