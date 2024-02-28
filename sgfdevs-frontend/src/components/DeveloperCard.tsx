import {Link} from "@/components/Link";
interface DeveloperCardProps {
    developer: Developer;
}
export default function developerCard({developer}: DeveloperCardProps){
    return(
        <div className="w-56 border rounded-3xl">
            <figure>
                <a href={'/members/'+developer.username}><img className="rounded-t-3xl" src={developer.avatar} alt={developer.name} /></a>
            </figure>

            <div className="p-4 ">
                <dl className="text-center">
                    <dt className="text-foreground text-lg font-semibold"><a href={'/members/'+developer.username}>{developer.name}</a></dt>
                    <dd className="font-normal text-[15px]">{developer.location}</dd>
                </dl>

                <footer className="mt-4">
                    <Link variant='smallButton' className='' href={'/members/'+developer.username}>
                        Profile
                    </Link>
                </footer>
            </div>
        </div>
    )

}
