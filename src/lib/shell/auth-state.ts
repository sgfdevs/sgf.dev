export type ShellMemberState =
	| { kind: 'anonymous' }
	| { kind: 'member'; label: string; accountHref?: string };
