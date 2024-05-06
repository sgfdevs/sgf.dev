'use client';

import { groups } from '@/utils/groups/groupData';
import GroupDetailsAbout from '@/components/Groups/GroupDetailsAbout';
import GroupDetails from '@/components/Groups/GroupDetails';
import GroupDetailsMenu from '@/components/Groups/GroupDetailsMenu';
import GroupDetailsLeaders from '@/components/Groups/GroupDetailsLeaders';
import { useState } from 'react';

export default function Page({ params }: { params: { groupName: string } }) {
  const [isAboutSectionActive, setIsAboutSectionActive] = useState(true);
  const group = groups.find((group) => group.details === params.groupName);

  if (!group) {
    return <div>Group not found</div>;
  }

  return (
    <>
      <GroupDetails group={group} />
      <GroupDetailsMenu
        isAboutSectionActive={isAboutSectionActive}
        setIsAboutSectionActive={setIsAboutSectionActive}
        group={group}
      />

      {isAboutSectionActive ? (
        <GroupDetailsAbout group={group} />
      ) : (
        <GroupDetailsLeaders group={group} />
      )}
    </>
  );
}
