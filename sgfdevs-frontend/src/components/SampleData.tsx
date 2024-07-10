import React from 'react';
import DeveloperCard from './DeveloperCard';

export default function SampleData(){

    const exampleDev={
        avatar: "https://sgf.dev/media/o4nhslxo/npadgett.jpg?width=800&rnd=133294228088870000",
        name: "Nathanael Padgett",
        location: "Springfield,  MO",
        bio: "bob",
        skills: [],
        createdAt: new Date,
        username: "npadgett",
        social: " https://nathanaelpadgett.com",
    }

    return(
        <div className='flex space-x-5'>
            <DeveloperCard developer={exampleDev}></DeveloperCard>
            <DeveloperCard developer={exampleDev}></DeveloperCard>
            <DeveloperCard developer={exampleDev}></DeveloperCard>
            <DeveloperCard developer={exampleDev}></DeveloperCard>
            <DeveloperCard developer={exampleDev}></DeveloperCard>
            <DeveloperCard developer={exampleDev}></DeveloperCard>
            <DeveloperCard developer={exampleDev}></DeveloperCard>
            <DeveloperCard developer={exampleDev}></DeveloperCard>
            <DeveloperCard developer={exampleDev}></DeveloperCard>
            <DeveloperCard developer={exampleDev}></DeveloperCard>
            <DeveloperCard developer={exampleDev}></DeveloperCard>
            <DeveloperCard developer={exampleDev}></DeveloperCard>
            <DeveloperCard developer={exampleDev}></DeveloperCard>
            <DeveloperCard developer={exampleDev}></DeveloperCard>
            <DeveloperCard developer={exampleDev}></DeveloperCard>
            <DeveloperCard developer={exampleDev}></DeveloperCard>
            <DeveloperCard developer={exampleDev}></DeveloperCard>
            <DeveloperCard developer={exampleDev}></DeveloperCard>
            <DeveloperCard developer={exampleDev}></DeveloperCard>
            <DeveloperCard developer={exampleDev}></DeveloperCard>
            <DeveloperCard developer={exampleDev}></DeveloperCard>
            <DeveloperCard developer={exampleDev}></DeveloperCard>
            <DeveloperCard developer={exampleDev}></DeveloperCard>
            <DeveloperCard developer={exampleDev}></DeveloperCard>
        </div>
    )
}

