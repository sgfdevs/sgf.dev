<script lang="ts">
    import { enhance } from '$app/forms';
    import type { PageProps } from './$types';
    let { data, form }: PageProps = $props();
    const values = $derived(form?.values ?? data.values);
    const nameFields = [
        { name: 'email', label: 'Email', type: 'email', max: 1000 },
        { name: 'firstName', label: 'First Name', type: 'text', max: 512 },
        { name: 'lastName', label: 'Last Name', type: 'text', max: 512 },
        { name: 'jobTitle', label: 'Job Title', type: 'text', max: 512 }
    ] as const;
    const links = [
        { name: 'twitterUrl', label: 'Twitter URL' },
        { name: 'twitchUrl', label: 'Twitch URL' },
        { name: 'facebookUrl', label: 'Facebook URL' },
        { name: 'instagramUrl', label: 'Instagram URL' },
        { name: 'linkedInUrl', label: 'LinkedIn URL' },
        { name: 'meetupUrl', label: 'Meetup URL' },
        { name: 'websiteUrl', label: 'Website URL' },
        { name: 'youTubeUrl', label: 'YouTube URL' }
    ] as const;
</script>

<svelte:head><title>Springfield Devs - Account</title></svelte:head>

{#snippet errors(field: string)}
    {#each form?.errors?.[field] ?? [] as message}
        <span id={`${field}-error`} class="error" role="alert">{message}</span>
    {/each}
{/snippet}

<main class="site-container account">
    <form method="POST" class="form" use:enhance>
        <header>
            <h1>Edit your profile</h1>
            <p><a href={data.profileHref}>View your public profile</a></p>
            {#if data.saved && !form}<p role="status">Profile updated</p>{/if}
            {@render errors('')}
        </header>
        <div class="field">
            <img class="avatar" src={data.image} width="200" height="200" alt="Your current profile" />
            <p>Your current profile image is read-only.</p>
        </div>
        {#each nameFields as field}
            <div class="field">
                <div class="label-row"><label for={field.name}>{field.label}</label>{@render errors(field.name)}</div>
                <input id={field.name} name={field.name} type={field.type} maxlength={field.max}
                    required={field.name !== 'jobTitle'} value={values[field.name]}
                    aria-invalid={!!form?.errors?.[field.name]} aria-describedby={form?.errors?.[field.name] ? `${field.name}-error` : undefined} />
            </div>
        {/each}
        <div class="field">
            <div class="label-row"><label for="aboutText">About Text</label>{@render errors('aboutText')}</div>
            <p id="about-help">You can use Markdown to format your biography.</p>
            <textarea id="aboutText" name="aboutText" rows="10" maxlength="100000" value={values.aboutText}
                aria-invalid={!!form?.errors?.aboutText} aria-describedby={form?.errors?.aboutText ? 'about-help aboutText-error' : 'about-help'}></textarea>
        </div>
        <fieldset class="field">
            <legend>Skills</legend>
            {@render errors('skills')}
            <ul class="checkbox-list">
                {#each data.skills as skill}
                    <li><label><input type="checkbox" name="skills" value={skill.key} checked={values.skills.includes(skill.key)} /> {skill.name}</label></li>
                {/each}
            </ul>
        </fieldset>
        <fieldset class="field">
            <legend>Interest groups</legend>
            {@render errors('groups')}
            <ul class="checkbox-list">
                {#each data.groups as group}
                    <li><label><input type="checkbox" name="groups" value={group.key} checked={values.groups.includes(group.key)} /> {group.name}</label></li>
                {/each}
            </ul>
        </fieldset>
        {#each [{ name: 'city', label: 'City' }, { name: 'state', label: 'State' }] as field}
            <div class="field">
                <div class="label-row"><label for={field.name}>{field.label}</label>{@render errors(field.name)}</div>
                <input id={field.name} name={field.name} type="text" maxlength="512" value={values[field.name as 'city' | 'state']}
                    aria-invalid={!!form?.errors?.[field.name]} aria-describedby={form?.errors?.[field.name] ? `${field.name}-error` : undefined} />
            </div>
        {/each}
        <div class="field">
            <label class="toggle"><input type="checkbox" name="availableForHire" value="true" checked={values.availableForHire} /> Available For Hire</label>
            {@render errors('availableForHire')}
        </div>
        <div class="field">
            <label class="toggle"><input type="checkbox" name="availableForContractWork" value="true" checked={values.availableForContractWork} /> Available For Contract Work</label>
            {@render errors('availableForContractWork')}
        </div>
        {#each links as field}
            <div class="field">
                <div class="label-row"><label for={field.name}>{field.label}</label>{@render errors(field.name)}</div>
                <input id={field.name} name={field.name} type="text" maxlength="512" value={values[field.name]}
                    aria-invalid={!!form?.errors?.[field.name]} aria-describedby={form?.errors?.[field.name] ? `${field.name}-error` : undefined} />
            </div>
        {/each}
        <footer><button class="button tall wide" type="submit">Save</button></footer>
    </form>
    <form method="POST" action="/logout" class="logout"><button class="button" type="submit">Logout</button></form>
</main>

<style>
    .account { padding-bottom: 75px; }
    .form, .logout { max-width: 675px; margin: 0 auto; }
    header { margin-bottom: 35px; }
    h1 { font-size: 36px; color: #000; }
    .field { margin: 0 0 35px; }
    fieldset { padding: 0; border: 0; }
    .label-row { display: flex; flex-wrap: wrap; align-items: baseline; gap: 8px; margin-bottom: 3px; }
    label, legend { font-size: 18px; font-weight: 900; color: #000; letter-spacing: 0.5px; }
    .field input:not([type="checkbox"]), textarea { box-sizing: border-box; width: 100%; padding: 16px; border: 1px solid #c1c1c1; border-radius: 3px; font: inherit; color: var(--color-sgf-text); background: white; }
    .field input:not([type="checkbox"]) { height: 64px; }
    textarea { resize: vertical; }
    .checkbox-list { padding: 0; list-style: none; display: flex; flex-wrap: wrap; gap: 16px; }
    .checkbox-list label, .toggle { font-size: 16px; font-weight: normal; }
    input[type="checkbox"] { accent-color: var(--color-sgf-dark-blue); }
    .avatar { object-fit: cover; }
    a { color: var(--color-sgf-light-blue); }
    .button { cursor: pointer; display: inline-flex; align-items: center; border: 0; border-radius: var(--radius-sgf-button-tall); padding: 14px 30px; background: var(--color-sgf-light-blue); color: white; font: inherit; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.57px; }
    .tall { height: 64px; }
    .wide { padding: 0 36px; }
    .logout { margin-top: 35px; }
    .error { color: #a11818; font-weight: bold; font-size: 14px; }
</style>
