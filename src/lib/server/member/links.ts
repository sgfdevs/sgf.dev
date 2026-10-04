// URL checks shared by public profile links and the sanitizer's decoded link attributes.
export function safeMemberHttpUrl(value: string | null): string | null {
	if (!value || !/^https?:\/\//i.test(value) || /[\s\\\u0000-\u001f\u007f]/.test(value)) return null;
	try {
		if (/[\s\\\u0000-\u001f\u007f]/.test(decodeURIComponent(value))) return null;
		const url = new URL(value);
		return ['http:', 'https:'].includes(url.protocol) && url.hostname && !url.username && !url.password
			? url.href : null;
	} catch {
		return null;
	}
}
