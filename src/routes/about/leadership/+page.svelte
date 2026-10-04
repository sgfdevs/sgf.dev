<script lang="ts">
    import type { PageProps } from './$types';
    let { data }: PageProps = $props();
    const leadership = $derived(data.leadership);
</script>

<svelte:head><title>{leadership.title}</title></svelte:head>

<main aria-labelledby="leadership-heading">
    <header class="leadership_header">
        <div class="site-container"><h1 id="leadership-heading">Leadership</h1></div>
    </header>
    <div class="site-container clamp">
        <div class="leader_grid officers">
            <ul>
                {#each leadership.officers as member}
                    <li>
                        <figure><img src={member.image} alt={member.name} /></figure>
                        <h2><a href={member.path}>{member.name}</a></h2>
                        <h3>{member.officerTitle ?? ''}</h3>
                        <div class="officer-bio">{@html member.officerBio}</div>
                    </li>
                {/each}
            </ul>
        </div>
        <div class="leader_grid board">
            <header><h2>Board Of Directors</h2></header>
            <ul>
                {#each leadership.boardOfDirectors as member}
                    <li><a href={member.path}>
                        <figure><img src={member.image} alt={member.name} /></figure>
                        <h4>{member.name}</h4>
                    </a></li>
                {/each}
            </ul>
        </div>
        <div class="leader_grid history">
            <header><img src="/images/headlines/history.svg" alt="History" /></header>
            <ul>
                {#each leadership.history as member}
                    <li><a href="#leadership-heading">
                        <figure><img src={member.image} alt={member.name} /></figure>
                        <h4>{member.name}</h4>
                        <p><strong>{member.officerTitle || 'Board Member'}</strong></p>
                    </a></li>
                {/each}
            </ul>
        </div>
        <div class="board_application">
            <p>Interested in joining the board? Apply using the the form below and a board member will contact you.</p>
            <p><a href="https://forms.gle/XaC7zjUP1ue2TVAV6" class="button" target="_blank" rel="noopener noreferrer">Board Member Application</a></p>
        </div>
    </div>
</main>

<style>
    .clamp { max-width: 1500px; }
    .leadership_header { background: var(--color-sgf-dark-blue); color: #fff; text-transform: uppercase; text-align: center; border-radius: 27px; padding: 105px 0 247px; }
    h1 { font-size: 60px; font-weight: 700; line-height: 137px; margin: 0 auto; background: var(--color-sgf-dark-blue) url('/images/headlines/leadership_bg.svg') no-repeat center; background-size: 100% auto; max-width: 1284px; }
    .leader_grid { margin-bottom: 105px; }
    .leader_grid ul { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap: 33px; max-width: 1400px; margin: 0 auto; }
    li { min-width: 0; overflow-wrap: anywhere; }
    figure { margin: 0; padding: 0; }
    figure img { border-radius: 27px; min-height: 200px; object-fit: cover; width: 100%; filter: grayscale(100%); }
    .officers { margin-top: -187px; }
    .officers ul { grid-template-columns: repeat(auto-fit, minmax(min(100%, 305px), 1fr)); }
    .officers figure img { min-height: 305px; }
    h2, h3, h4 { margin: 0; }
    h2 { font-size: 36px; font-weight: 700; color: #153558; letter-spacing: 0; line-height: 40px; }
    h2 a, h4 { color: #153558; }
    h3 { font-weight: 400; font-size: 16px; color: var(--color-sgf-light-blue); letter-spacing: 1.78px; line-height: 30px; text-transform: uppercase; }
    h4 { font-size: 18px; font-weight: 700; letter-spacing: 0; line-height: 40px; }
    p, .officer-bio { font-size: 16px; color: #000; letter-spacing: 0; line-height: 24px; }
    p, .officer-bio :global(p) { margin: 1em 0; }
    .officer-bio :global(a) { color: #000; text-decoration: underline; }
    .officer-bio :global(ul), .officer-bio :global(ol) { display: block; padding-left: 1.5em; }
    .officer-bio :global(ul) { list-style: disc; }
    .officer-bio :global(ol) { list-style: decimal; }
    .officer-bio :global(pre), .officer-bio :global(table) { max-width: 100%; overflow-x: auto; }
    .leader_grid header { text-align: center; margin-bottom: 42px; }
    .leader_grid header h2 { font-size: 24px; color: var(--color-sgf-light-blue); letter-spacing: 2.4px; line-height: 43px; text-transform: uppercase; }
    .history p { margin: 0; }
    .history header { text-align: left; margin-bottom: 36px; display: flex; }
    .history header img { margin-right: 6px; }
    .board_application { margin-bottom: 105px; }
    .button { background: var(--color-sgf-light-blue); border-radius: 25.5px; font-weight: 600; font-size: 14px; color: #fff; padding: 0 24px; min-height: 40px; display: inline-flex; align-items: center; }
    a:focus-visible { outline: 2px solid var(--color-sgf-light-blue); outline-offset: 3px; }
    @media (max-width: 767px) {
        .leadership_header { padding-top: 25px; }
        h1 { font-size: 45px; letter-spacing: 4.5px; background-image: url('/images/headlines/leadership_bg_3.svg'); }
    }
</style>
