export type NavLink = {
	label: string;
	href: string;
	external?: boolean;
};

export const archiveLink = 'https://www.youtube.com/playlist?list=PLUyFlCloUuMuS47jYIPiJ0I6djvf1xp6p';
export const eventsLink = 'https://www.meetup.com/sgfdevs/events/';

export const aboutLinks = [
	{ label: 'Springfield Devs', href: '/about/' },
	{ label: 'Method Conference', href: 'https://www.methodconf.com', external: true },
	{ label: 'Leadership', href: '/about/leadership/' },
	{ label: 'Code of Conduct', href: '/about/code-of-conduct/' },
	{ label: 'Sponsorship', href: '/about/sponsorship/' },
	{ label: 'Volunteer to Speak', href: 'https://sessionize.com/sgf-dev-night', external: true }
] satisfies NavLink[];

export const desktopMainLinks = [
	{ label: 'Groups', href: '/groups' },
	{ label: 'Directory', href: '/directory' },
	{ label: 'Archives', href: archiveLink, external: true },
	{ label: 'Events', href: eventsLink, external: true }
] satisfies NavLink[];

export const mobileMainLinks = [
	{ label: 'Groups', href: '/groups/' },
	{ label: 'Directory', href: '/directory/' },
	{ label: 'Archives', href: archiveLink, external: true },
	{ label: 'Events', href: eventsLink, external: true },
	{ label: 'Login', href: '/login' },
	{ label: 'Signup', href: '/register' }
] satisfies NavLink[];

export const footerMainLinks = [
	{ label: 'About', href: '/about/' },
	{ label: 'Directory', href: '/directory/' },
	{ label: 'Chapters', href: '/groups/' }
] satisfies NavLink[];

export const footerSocialLinks = [
	{ label: 'Twitch', href: 'https://www.twitch.tv/sgfdevs', external: true },
	{ label: 'YouTube', href: 'https://www.youtube.com/@SGFDevs', external: true },
	{ label: 'GitHub', href: 'https://github.com/sgfdevs', external: true },
	{ label: 'Facebook', href: 'https://www.facebook.com/sgfdevs', external: true },
	{ label: 'Twitter', href: 'https://twitter.com/sgfdevs/', external: true },
	{ label: 'Instagram', href: 'https://www.instagram.com/sgfdevs/', external: true },
	{ label: 'Discord', href: '/discord' }
] satisfies NavLink[];
