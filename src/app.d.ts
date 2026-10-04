declare global {
	namespace App {
		interface Locals {
			member: { username: string; name: string } | null;
		}
		interface PageData {
			jobs?: import('./lib/server/jobs/mapper').JobsView;
			job?: import('./lib/server/jobs/mapper').JobView;
			contentPage?: import('./lib/server/pages/mapper').ContentPageView;
		}
	}
}

export {};
