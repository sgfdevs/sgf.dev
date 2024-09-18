import RichText from '@/components/RichText';

export default function Sponsorship() {
  const sponsorshipPageHtmlString =
    '<header><h1>Sponsorship</h1></header><div><p>Springfield Devs is able to exist because of our sponsors. If you are interested in becoming sponsor reach out to us at <a href="emailto:sponsorships@sgf.dev">sponsorships@sgf.dev</a></p><p>Review current <a href="https://sgf.dev/media/urqjvv5h/sgfdevssponsorship2023-3.pdf">Sponsorship Packages</a></p><h2>How your Sponsorship Helps</h2><p><strong>Supporting Dev Night and other Events</strong></p><p>By sponsoring Springfield Devs, you help pay for hosting our monthly events, maintaining our web presence and provide seed money for larger events throughout the year</p><p><strong>Promotion within your Organization</strong></p><p>By promoting our group within your organization you encourage the collaboration and learning of the entire Springfield development community which ultimately creates a better environment for your business and others in the area to thrive.</p><p><strong>Visibility</strong></p><p>By remaining visible in the community you inspire up and coming developers to pursue job opportunities in our industry and remain in the Springfield area when they pursue career opportunities.</p><p><strong>Individuals:</strong>Not a company or organization, but still want to help? We are also accepting sponsorship from individuals in the community.  Slightly different perks and sponsor levels, but supporting the organization nonetheless</p><p><a href="https://sgf.dev/media/jfubfk3y/sgfdevssponsorship2023-individuals.pdf">Individual Supporters</a></p></div>';
  return (
    <>
      <RichText htmlString={sponsorshipPageHtmlString} />
    </>
  );
}
