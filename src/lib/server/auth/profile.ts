import type { components } from './generated/memberApiSchema';

type EditRequest = components['schemas']['MemberProfileEditRequest'];

// The legacy editor's fields only. Never forward identity, media or arbitrary CMS properties.
export function profileValues(value: EditRequest) {
    return {
        email: value.email ?? '',
        firstName: value.firstName ?? '',
        lastName: value.lastName ?? '',
        jobTitle: value.jobTitle ?? '',
        aboutText: value.aboutText ?? '',
        city: value.city ?? '',
        state: value.state ?? '',
        availableForHire: value.availableForHire ?? false,
        availableForContractWork: value.availableForContractWork ?? false,
        twitterUrl: value.twitterUrl ?? '',
        twitchUrl: value.twitchUrl ?? '',
        facebookUrl: value.facebookUrl ?? '',
        instagramUrl: value.instagramUrl ?? '',
        linkedInUrl: value.linkedInUrl ?? '',
        meetupUrl: value.meetupUrl ?? '',
        websiteUrl: value.websiteUrl ?? '',
        youTubeUrl: value.youTubeUrl ?? '',
        skills: value.skills ?? [],
        groups: value.groups ?? []
    };
}

export function readProfileForm(form: FormData) {
    const errors: Record<string, string[]> = {};
    function text(field: string, max = 512) {
        const values = form.getAll(field);
        const value = values[0];
        if (values.length !== 1 || typeof value !== 'string') {
            errors[field] = ['Enter a value for this field.'];
            return '';
        }
        if (value.length > max) errors[field] = ['This value is too long.'];
        return value.slice(0, max);
    }
    function checked(field: string) {
        const values = form.getAll(field);
        if (values.length > 1 || values.some(value => value !== 'true')) errors[field] = ['Invalid selection.'];
        return values.length === 1 && values[0] === 'true';
    }
    function selections(field: string) {
        const values = form.getAll(field);
        if (values.length > 100 || values.some(value => typeof value !== 'string' || value.length > 36)) {
            errors[field] = ['Choose only listed items.'];
        }
        return values.filter((value): value is string => typeof value === 'string').slice(0, 100).map(value => value.slice(0, 36));
    }
    const values = {
        email: text('email', 1000),
        firstName: text('firstName'),
        lastName: text('lastName'),
        jobTitle: text('jobTitle'),
        aboutText: text('aboutText', 100000),
        city: text('city'),
        state: text('state'),
        availableForHire: checked('availableForHire'),
        availableForContractWork: checked('availableForContractWork'),
        twitterUrl: text('twitterUrl'),
        twitchUrl: text('twitchUrl'),
        facebookUrl: text('facebookUrl'),
        instagramUrl: text('instagramUrl'),
        linkedInUrl: text('linkedInUrl'),
        meetupUrl: text('meetupUrl'),
        websiteUrl: text('websiteUrl'),
        youTubeUrl: text('youTubeUrl'),
        skills: selections('skills'),
        groups: selections('groups')
    } satisfies EditRequest;
    for (const field of form.keys()) {
        if (!Object.hasOwn(values, field)) errors[''] = ['Unexpected profile field.'];
    }
    return { values, errors };
}
