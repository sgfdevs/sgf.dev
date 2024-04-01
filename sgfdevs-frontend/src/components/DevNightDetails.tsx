import Image from "next/image"

export function DevNightDetails() {
  return (
<ul className="grid grid-cols-1 gap-12 px-11 ">
  <li className="relative border-2 border-solid border-cyan-500 p-8 ">
    <div className="flex absolute self-center border-box -top-10">
      <a href="" className="w-20 h-20 border-2 rounded-full border-solid border-cyan-500 block">
        <Image src="https://web.archive.org/web/20230314044147im_/http://sgf.dev/images/headlines/dev_night.svg" alt='Speaker Name' height={76} width={76} className="rounded-full object-cover grayscale"/>
      </a>
    </div>
    <a href="https://www.meetup.com/sgfdevs/events/293671834/" title="Meetup Link" >
      <h3 className="text-white underline text-xl font-bold">TED Talk Title</h3>
    </a>
    <dl className="m-0">
      <dt className="m-0 inline-block uppercase tracking-tighter">Presented By </dt>
      <dd className="m-0 inline-block uppercase tracking-tighter">
        <a className="text-cyan-500" href="https://sgf.dev/member/bellis/">Presenter Name</a>
      </dd>
    </dl>
    <dl className="m-0">
      <dt className="m-0 inline-block uppercase tracking-tighter">From </dt>
      <dd className="m-0 inline-block uppercase tracking-tighter">
        <a className="text-cyan-500" href="https://sgf.dev/groups/springfield-aws/">Organization Name</a>
      </dd>
    </dl>
  </li>
</ul>
  )
}
