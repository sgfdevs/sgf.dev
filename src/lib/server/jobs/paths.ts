import { isCompanySlug } from '../companies/paths';

export function isJobPath(value: unknown): value is string {
	if (typeof value !== 'string') return false;
	const parts = value.split('/');
	return parts.length === 5 && parts[0] === '' && parts[1] === 'companies' &&
		isCompanySlug(parts[2]) && isCompanySlug(parts[3]) && parts[4] === '';
}
