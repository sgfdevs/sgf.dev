import React from 'react';

const groupData = {
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
}

const upcomingPresentations = []; // Assuming data comes from same source as upcoming DevBanner 

const GroupPage = () => {

  const upcomingPresentations: any[] = []; // Assuming data comes from an API or context

  return (
    <main className="group mx-[5vmax]">
      <header className="group-header flex flex-col flex-wrap items-center text-black py-8 text-center bg-no-repeat bg-[url('/images/circuitry/circuit_graphic.svg')] bg-[0%_-30%] lg:bg-[60%_-35%] lg:flex-row lg:flex-nowrap lg:py-16 lg:text-left">
        <div className="information flex-grow flex-shrink basis-auto order-2 w-full lg:order-initial lg:w-[33%]">
          <p className="category text-foreground-light uppercase">Group</p>
          <h1 className="text-[4rem] leading-4 my-[2rem] mx-auto pr-4">
            {groupData.info.nodeName.default}
          </h1>
  
          {groupData.properties.websiteUrl && (
            <a href={groupData.properties.websiteUrl} className="button">
              Visit Site
            </a>
          )}
        </div>
        {/* /.information */}
  
        <div className="video flex-grow flex-shrink basis-auto w-[75%] lg:w-[40%] relative">
          <iframe
            className="rounded-8 block h-[440px] w-full"
            src="https://www.youtube.com/embed/3a5mR5xoUbc"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        {/* /.video */}
      </header>
      {/* /.group-header */}
  
      <section className="group-content tabs relative w-full flex flex-wrap justify-center lg:justify-start">
        <input
          name="tabs"
          type="radio"
          id="tab-1"
          defaultChecked
          className="tab absolute opacity-0"
        />
        <label
          htmlFor="tab-1"
          className="label block cursor-pointer text-[#6e6d7a] font-bold p-[20px_30px] w-full transition-colors duration-100"
        >
          About
        </label>
        <div className="panel about hidden">
          <div className="col-1">
            <div className="metadata bg-[#e6e6e6] rounded-[1rem] h-[10rem] p-[2rem] flex flex-col justify-center ">
              {groupData.properties.location && (
                <div className="location mt-[0.5rem]">
                  <i className="icon fas fa-map-marker-alt text-foreground leading-[1.4px] mr-[0.5rem] "></i>
                  {groupData.properties.location}
                </div>
              )}
              {groupData.properties.establishedText && (
                <div className="member-since mt-[0.5rem]">
                  <i className="icon fas fa-calendar-alt  text-foreground leading-[1.4px] mr-[0.5rem]"></i>
                  {groupData.properties.establishedText}
                </div>
              )}
            </div>
  
            {groupData.properties.groupImage && (
              <div className="image">
                <img
                  src={groupData.properties.groupImage}
                  alt={groupData.info.nodeName.default}
                />
              </div>
            )}
  
            <div className="socials">
              <h3>Social</h3>
              <ul>
                {groupData.properties.websiteUrl && (
                  <li className="social website">
                    <a href={groupData.properties.websiteUrl}>
                      <i className="icon fa fa-globe text-foreground leading-[1.4px] mr-[0.5rem]"></i>{" "}
                      {groupData.properties.websiteUrl}
                    </a>
                  </li>
                )}
                {groupData.properties.twitterUrl && (
                  <li className="social twitter">
                    <a href={groupData.properties.twitterUrl}>
                      <i className="icon fab fa-twitter text-foreground leading-[1.4px] mr-[0.5rem]"></i> Twitter
                    </a>
                  </li>
                )}
                {groupData.properties.linkedInUrl && (
                  <li className="social linkedin">
                    <a href={groupData.properties.linkedInUrl}>
                      <i className="icon fab fa-linkedin text-foreground leading-[1.4px] mr-[0.5rem]"></i> LinkedIn
                    </a>
                  </li>
                )}
                {groupData.properties.facebookUrl && (
                  <li className="social facebook">
                    <a href={groupData.properties.facebookUrl}>
                      <i className="icon fab fa-facebook text-foreground leading-[1.4px] mr-[0.5rem]"></i> Facebook
                    </a>
                  </li>
                )}
                {groupData.properties.instagramUrl && (
                  <li className="social instagram">
                    <a href={groupData.properties.instagramUrl}>
                      <i className="icon fab fa-instagram text-foreground leading-[1.4px] mr-[0.5rem]"></i> Instagram
                    </a>
                  </li>
                )}
                {groupData.properties.youTubeUrl && (
                  <li className="social youtube">
                    <a href={groupData.properties.youTubeUrl}>
                      <i className="icon fab fa-youtube  text-foreground leading-[1.4px] mr-[0.5rem]"></i> Youtube
                    </a>
                  </li>
                )}
              </ul>
            </div>
            {/* /.social */}
          </div>
  
          <div className="col-2">
            <div className="bio">
              <h3>Biography</h3>
              <div
                dangerouslySetInnerHTML={{ __html: groupData.properties.aboutText }}
              />
            </div>
            {/* /.bio */}
  
            {groupData.properties.skillTags && (
              <div className="skills">
                <h3>Skills</h3>
                <div className="skill-list">
                  {groupData.properties.skillTags.split("").map((skill, index) => (
                    <a
                      key={index}
                      href={`/directory/?skill=${skill}`}
                      className="button outline skill text-[#000] border-[#e6e6e6]"
                    >
                      {skill}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* /.panel */}
  
        {upcomingPresentations.length > 0 && (
          <>
            <input name="tabs" type="radio" id="tab-2" className="tab absolute opacity-0" />
            <label
              htmlFor="tab-2"
              className="label block cursor-pointer text-[#6e6d7a] font-bold p-[20px_30px] w-full transition-colors duration-100"
            >
              Upcoming Events <span>{upcomingPresentations.length}</span>
            </label>
            <div className="panel archive hidden border-t-2 border-solid flex-col ">
              <h3 className='w-full'>Events</h3>
              <div className="cards grid w-full">
                {upcomingPresentations.map((presentation, index) => (
                  <div key={index} className="card company_card">
                    <figure>
                      <img
                        className='w-full rounded-[0.5rem]'
                        src={presentation.presenter.profileImage}
                        alt={presentation.presenter.name}
                      />
                      <figcaption>
                        {presentation.presenter.isFoundingMember && (
                          <div>Founding Sponsor</div>
                        )}
                      </figcaption>
                    </figure>
                    <div className="content">
                      <dl>
                        <dt>{presentation.name}</dt>
                        <dd>{presentation.presenter.name}</dd>
                        <dd>{presentation.parentEvent.name}</dd>
                      </dl>
                      <footer>
                        <a href="#" className="button outline small">
                          Details
                        </a>
                      </footer>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
  
        {groupData.properties.leaders.length > 0 && (
          <>
            <input name="tabs" type="radio" id="tab-3" className="tab absolute opacity-0" />
            <label
              htmlFor="tab-3"
              className="label block cursor-pointer text-[#6e6d7a] font-bold p-[20px_30px] w-full transition-colors duration-100"
            >
              Leaders <span className="font-normal ml-[.2rem]">{groupData.properties.leaders.length}</span>
            </label>
            <div className="panel archive hidden border-t-2 border-solid flex-col ">
              <h3 className='w-full'>Leaders</h3>
              <div className="cards grid w-full">
                {groupData.properties.leaders.map((leader, index) => (
                  <div key={index} className="card company_card">
                    <figure>
                      <img
                        className='w-full rounded-[0.5rem]'
                        src={"images/chris.jpg"}
                        alt={leader.name}
                        // src={leader.profileImage}
                        // alt={leader.name}
                      />
                      <figcaption>
                        <div>Founding Member</div>
                        <div>2024 Supporting Member</div>
                      </figcaption>
                    </figure>
                    <div className="content">
                      <dl>
                        <dt>Leader Name</dt>
                        <dd>City, State</dd>
                      </dl>
                      <footer>
                        <a href="#" className="button outline small">
                          Profile
                        </a>
                      </footer>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </section>
      {/* /.group-content */}
    </main>
    /* /.group */
  );
}

export default GroupPage;
