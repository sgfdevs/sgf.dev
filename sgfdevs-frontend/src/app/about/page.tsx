import Link from 'next/link';

export default function About() {
  return (
    <div className='flex-1 max-w-full flex-col max-h-100vh font-source-sans-3'>
     <section className='w-full  max-h-auto pb-11 pt-10 text-white mx-auto bg-foreground rounded-3xl bg-[url(/circuit_graphic.svg)] bg-no-repeat bg-right'>
      <div className='flex-col md:w-1/2 h-auto p-8 md:p-20'>
        <h1 className='text-4xl md:text-4xl font-bold tracking-tight text-white'>
         Educating, inspiring and supporting developers, agencies and professionals in the Greater Springfield, MO area.
        </h1>
        <p className='mt-4 text-lg md:text-md text-white'>
        Engage with your local tech community to share your passion and knowledge, grow your skills and network,  and discover interesting projects and innovations happening right here in southwest Missouri!
        </p>
      </div>
      </section>
      <section>
        <div className='w-full md:w-1/2 md:px-0 m-auto pt-5 space-y-5 bg-forground'>
          <h2 className='text-3xl font-bold text-black py-5'>A place for everyone to connect, grow, and become part of their local tech community
          </h2>
          <p className='text-base text-black'>
            Whether you’re a seasoned professional, an up-and-coming junior developer, a student still learning the basics of your craft, or a hobbyist who loves to tinker and learn more—Springfield Devs is for you.
          </p>
          <p className='text-base text-black'>
            Development of all kinds—software, application, mobile, gaming, virtual reality, web—you name it, you’ll find common interests with people who would love to geek out with you and learn together. Backend, frontend, full stack, cyber security, devops, data science, or whatever flavor gets your taste buds tingling, you’re in the right place. Designers, project managers, scrum masters, instructors, analysts and anyone/everyone interested in tech and making cool things: welcome home!
          </p>
          <p className='text-base text-black'>
            Springfield Devs is a community hub for knowledge sharing, networking, employment opportunities, and good fun centered around learning and developing with technologies.
          </p>
          <h2 className='text-3xl font-bold text-black'>Inclusive and supportive, by design
          </h2>
          <p className='text-base text-black'>
          Everyone is welcome and encouraged to participate in our many activities, discussions, and events. No matter your experience level, age, gender, race, creed, or favorite science fiction fandom--you are welcome here! We strive to be a safe community, both online and in-person, and require everyone to abide by our Code of Conduct. And we mean it.
          </p>
          <h2 className='text-3xl font-bold text-black'>Get involved
          </h2>
          <p className='text-base text-black'>
          Take the first step! Join our <a href='https://sgf.dev/discord' className='text-sky-400'>Discord</a> to see what all the hubbub is about. RSVP to our next meeting, either virtual or in-person, and see how low-key and easy it is to get connected (introverts welcome!). Create a <a href="../register" className="text-sky-400">profile</a> on our website and find job opportunities or seek out others with similar interests.
          </p>
        </div>
      </section>
        <div className="flex flex-wrap gap-x-5 gap-y-5 md:grid md:grid-cols-2 lg:grid-cols-3 min-[1440px]:grid-cols-4 p-10 py-20">
        {/* Card 1 */}
          <div className='flex min-h-[284px] w-full flex-col gap-x-5 bg-foreground-light p-8 rounded-3xl bg-[#f0f0f0]'>
            <h2 className='text-sm font-bold text-black'>Sponsorship Opportunities
            </h2>
            <p className='text-2xl font-bold text-black pt-5'>
            Connect with the developer community in Springfield
            </p>
          <div className="flex mt-auto">
            {/* Links to current site page */}
            <button className='bg-white text-sm md:text-base text-[#153558] border-[#153558] border-2 font-bold rounded-full py-2 px-4'><Link href="https://sgf.dev/media/prgasrsw/springfield_devs_sponsorship.pdf">Become a  Sponsor</Link></button>
           </div>
          </div>
      {/* Card 2 */}
      <div className='flex min-h-[284px] w-full flex-col gap-x-5 bg-foreground-light p-8 rounded-3xl'>
        <h2 className='text-sm text-black font-bold'>How We Act
        </h2>
        <p className='text-2xl font-bold text-white pt-5'>
        Code of Conduct
        </p>
        <div className="flex mt-auto">

        <button className='bg-foreground text-sm md:text-base text-white font-bold rounded-full py-2 px-4'><Link href="./code-of-conduct">Read</Link></button>
        </div>
        </div>
        {/* Card 3 */}
        <div className='flex min-h-[284px] w-full flex-col gap-x-5 bg-foreground-light p-8 rounded-3xl'>
          <h2 className='text-sm text-black font-bold'>Why We Exist
          </h2>
          <p className='text-2xl font-bold text-white pt-5'>
          Articles of Incorporation
          </p>
          <div className="flex mt-auto">
            {/* Links to current site page */}
          <button className='bg-foreground text-sm md:text-base text-white font-bold rounded-full py-2 px-4'><Link href="https://sgf.dev/media/kbxmwecj/articles-of-incorporation.pdf">Check it Out</Link></button>
        </div>
        </div>
        {/* Card 4 */}
        <div className='flex min-h-[284px] w-full flex-col gap-x-5 bg-foreground-light p-8 rounded-3xl'>
          <h2 className='text-sm text-black font-bold'>Governance
          </h2>
          <p className='text-2xl font-bold text-white pt-5'>
          Bylaws
          </p>
          <div className="flex mt-auto">
            {/* Links to current site page */}
          <button className='bg-foreground text-sm md:text-base text-white font-bold rounded-full py-2 px-4'><Link href="https://sgf.dev/media/wy0hhb5d/bylaws.pdf">Download</Link></button>
          </div>
          </div>
          </div>
    </div>
  );
}
