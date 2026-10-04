import type { ContentPagePath } from '../../src/lib/server/pages/paths';

export const media = { publicSourceOrigin: 'https://media.example.test', cmsInternalOrigin: 'http://cms.example.test' };
export function deliveryPage(path: ContentPagePath = '/about/code-of-conduct/') {
	return {
		contentType: 'page', name: 'Code of Conduct', id: '00000000-0000-0000-0000-000000000001',
		createDate: '2026-01-01T00:00:00Z', updateDate: '2026-01-01T00:00:00Z', cultures: {},
		route: { path, startItem: { id: '00000000-0000-0000-0000-000000000002', path: '/' } },
		properties: {
			titleTag: 'Conduct | Springfield Devs', description: 'Our community standards.',
			OgImage: [{ url: '/media/synthetic/banner.jpg', id: 'private-image-id' }],
			blocks: { items: [
				{ content: { contentType: 'markdown', id: 'private-block-id', properties: { content: '## Welcome\n\nBe **kind**. [Join](/register)\n\n- Listen\n- Help' } } },
				{ content: { contentType: 'richTextEditor', properties: { content: { markup: '<p>Read <a href="/media/example/sponsorship.pdf">the PDF</a>.</p>', blocks: [] } } } }
			] },
			officers: ['private-member-picker'], unknownProperty: 'private-value'
		}
	};
}
