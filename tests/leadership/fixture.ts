import type { PublicLeadershipDto } from '../../src/lib/server/leadership/mapper';
export const media = { publicSourceOrigin: 'https://media.example.test', cmsInternalOrigin: 'http://127.0.0.1:5099' };
export function leadershipFixture(): PublicLeadershipDto {
    const first = { name: 'Z synthetic officer', username: 'Ada123', imageUrl: '/media/synthetic/officer.png',
        officerTitle: 'President', officerBio: '<p>Public <strong>officer</strong> biography.</p>' };
    const second = { name: 'A synthetic officer', username: 'Bea456', imageUrl: '/images/pipey.jpg',
        officerTitle: '', officerBio: '<p>Second biography.</p>' };
    return {
        officers: [first, second],
        boardOfDirectors: [{ ...second, officerTitle: null, officerBio: null }, { ...first, officerTitle: null, officerBio: null }],
        history: [{ ...first, officerBio: null }, { ...second, officerBio: null }, { ...first, officerBio: null }]
    };
}
