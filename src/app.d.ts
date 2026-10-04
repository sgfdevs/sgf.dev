declare global {
	namespace App {
		interface Locals {
			member: { username: string; name: string } | null;
		}
		interface PageData {
			contentPage?: import('./lib/server/pages/mapper').ContentPageView;
		}
	}
}

export {};
