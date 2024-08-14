"use client";

import { useSearchParams } from 'next/navigation';

const GroupPage = () => {
  const searchParams = useSearchParams();
  const groupName = searchParams.get('group-name');

  return (
    <div>
      <h1>Group: {groupName}</h1>
      {/* Add more group-specific content here */}
    </div>
  );
};

export default GroupPage;
