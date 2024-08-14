"use client";

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const MemberPage = () => {
  const router = useRouter();
  const { username } = router.query;
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (router.isReady && username) {
      console.log("Username from route: ", username);
      setIsReady(true);
    }
  }, [router.isReady, username]);

  const exampleDev = {
    avatar:
      'https://sgf.dev/media/o4nhslxo/npadgett.jpg?width=800&rnd=133294228088870000',
    name: 'Nathanael Padgett',
    location: 'Springfield, MO',
    bio: 'bob',
    skills: [],
    createdAt: new Date(),
    username: 'npadgett',
    social: 'https://nathanaelpadgett.com',
  };

  if (!isReady) {
    return <div>Loading...</div>;
  }

  if (username !== exampleDev.username) {
    return <div>Member not found</div>;
  }

  return (
    <div>
      <h1>Member: {exampleDev.name}</h1>
      <img src={exampleDev.avatar} alt={exampleDev.name} />
      <p>Location: {exampleDev.location}</p>
      <p>Bio: {exampleDev.bio}</p>
      <p>Skills: {exampleDev.skills.join(', ')}</p>
      <p>Joined: {exampleDev.createdAt.toDateString()}</p>
      <p>Website: <a href={exampleDev.social}>{exampleDev.social}</a></p>
    </div>
  );
};

export default MemberPage;

