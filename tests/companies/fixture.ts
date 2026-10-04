export const skillTerm = '11111111-2222-3333-4444-555555555555';
export const companyPath = '/companies/Custom-Sponsor/';
export function companyFixture() {
	return {
		id: 'private-company-id', name: 'Synthetic sponsor', contentType: 'company',
		route: { path: companyPath, startItem: { id: 'private-root-id', path: '/' } },
		properties: {
			image: [{ id: 'private-media-id', url: '/media/synthetic/logo.png' }],
			headline: 'A synthetic sponsor headline', aboutText: 'Biography **unchanged**.\n\n<script>window.__companyInjected=true</script><iframe src="https://evil.invalid"></iframe>',
			featuredImage: [{ url: '/media/synthetic/featured.png' }], featuredEmbed: null,
			location: 'Springfield, MO', websiteUrl: 'https://example.test', twitterUrl: 'javascript:bad()',
			linkedInUrl: 'https://example.test/social', facebookUrl: null, instagramUrl: null,
			isFoundingSponsor: true, skillTags: [{ name: 'Rust', directoryFilterValue: skillTerm }],
			companyTags: ['private-unused-picker'], umbracoUrlName: 'Custom-Sponsor'
		}
	};
}
