declare global {
	namespace App {
		interface Locals {
			member: { username: string; name: string } | null;
		}
		interface PageData {}
	}
}

export {};
