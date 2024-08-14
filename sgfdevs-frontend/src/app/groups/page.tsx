import React from 'react';

const groupsData = [
  {
    key: 'c0106aba-d2fd-48b1-819c-10c37157805e',
    alias: 'Springfield AWS',
    level: 3,
    info: {
      parent: {
        key: 'd132ca12-4e57-439b-990b-6d97ac5aa3b6',
        name: 'Groups',
      },
      path: '/Home/Groups/SpringfieldAWS',
      trashed: false,
      contentType: 'group',
      createDate: '2020-12-14T04:13:38',
      nodeName: {
        default: 'Springfield AWS',
      },
      sortOrder: 2,
      published: {
        default: true,
      },
      schedule: {},
      template: {
        key: '35290af4-f801-4a0d-af0c-10702707b22b',
        name: 'Group',
      },
    },
    properties: {
      aboutText:
        'Springfield Amazon Web Services (SGF AWS) User Group is a community-based user group that promotes and advocates for Amazon Web Services in the Springfield Missouri region.\n\nWe meet during Dev Night (every 1st Wednesday) at The eFactory. Social/Food/Drinks 6pm, Announcements 6:30pm, Presentation 7pm-8pm. Visit our Meetup Page (https://meetup.com/sgf-aws) for any last minute meeting announcements.',
      establishedText: 'Established 2017',
      facebookUrl: '',
      groupImage: 'umb://media/c7bc7685879d4d038690adeb9d33419c',
      instagramUrl: '',
      introImageVideo: '',
      leaders: ['umb://member/2a6668e1d589477d8f279ef4a774292c'],
      linkedInUrl: '',
      location: 'Springfield, MO',
      meetupUrl: '',
      skillTags: '',
      twitchUrl: '',
      twitterUrl: '',
      websiteUrl: '',
      youTubeUrl: '',
    },
  },
  {
    key: 'c0106aba-d2fd-48b1-819c-10c37157805e',
    alias: 'Springfield AWS',
    level: 3,
    info: {
      parent: {
        key: 'd132ca12-4e57-439b-990b-6d97ac5aa3b6',
        name: 'Groups',
      },
      path: '/Home/Groups/SpringfieldAWS',
      trashed: false,
      contentType: 'group',
      createDate: '2020-12-14T04:13:38',
      nodeName: {
        default: 'Springfield AWS',
      },
      sortOrder: 2,
      published: {
        default: true,
      },
      schedule: {},
      template: {
        key: '35290af4-f801-4a0d-af0c-10702707b22b',
        name: 'Group',
      },
    },
    properties: {
      aboutText:
        'Springfield Amazon Web Services (SGF AWS) User Group is a community-based user group that promotes and advocates for Amazon Web Services in the Springfield Missouri region.\n\nWe meet during Dev Night (every 1st Wednesday) at The eFactory. Social/Food/Drinks 6pm, Announcements 6:30pm, Presentation 7pm-8pm. Visit our Meetup Page (https://meetup.com/sgf-aws) for any last minute meeting announcements.',
      establishedText: 'Established 2017',
      facebookUrl: '',
      groupImage: 'umb://media/c7bc7685879d4d038690adeb9d33419c',
      instagramUrl: '',
      introImageVideo: '',
      leaders: ['umb://member/2a6668e1d589477d8f279ef4a774292c'],
      linkedInUrl: '',
      location: 'Springfield, MO',
      meetupUrl: '',
      skillTags: '',
      twitchUrl: '',
      twitterUrl: '',
      websiteUrl: '',
      youTubeUrl: '',
    },
  },
];

const GroupsPage = () => {
  // Filter out "Springfield Devs" group
  const groups = groupsData.filter((group) => group.alias !== 'Springfield Devs');

  return (
    <div>
      <div className="circuit_header bg-foreground pt-[90px] rounded-[27px] min-h-[440px] ">
        <div className="container medium_clamp">
          <img src="http://placekitten.com/200/300" alt="Groups" />
        </div>
      </div>

      <div className="group_listing grid grid-columns gap-[60px] max-w-[1230px] grid-auto-fit ">
        {groups.map((group) => (
          <section key={group.key}>
            {group.properties.groupImage && (
              <div className="image">
                <img src="http://placekitten.com/200/300" alt={group.alias} />
                {/* <img src={group.properties.groupImage} alt={group.alias} /> */}
              </div>
            )}

            <div className="content">
              <h2>{group.info.nodeName.default}</h2>
              <h3>What we&aposre about</h3>
              <div
                dangerouslySetInnerHTML={{ __html: group.properties.aboutText }}
              />

              <a href={group.info.path} className="button">
                Group Details
              </a>

              {group.properties.leaders && group.properties.leaders.length > 0 && (
                <dl>
                  <dt>Group Leaders</dt>
                  {group.properties.leaders.map((leader) => (
                    <dd key={leader}>
                      {/* Figure out what to actually do with the images later */}
                      <a href="#">
                        <img src="http://placekitten.com/200/300" alt="Leader" />
                        <span>Leader Name</span>
                      </a>
                    </dd>
                  ))}
                </dl>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default GroupsPage;