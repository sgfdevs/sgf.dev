<script lang="ts">
	let { documents }: { documents: { articles: string; bylaws: string } } = $props();
</script>

<section class="about_landing">
	<div class="site-container">
		<div class="content">
			<h1>Educating, inspiring and supporting developers, agencies and professionals in the Greater Springfield, MO area.</h1>
			<p>Engage with your local tech community to share your passion and knowledge, grow your skills and network, and discover interesting projects and innovations happening right here in southwest Missouri!</p>
			<p><a href="/register" class="button wide">Join Today</a></p>
		</div>
	</div>
</section>

<section class="about_content">
	<h2>A place for everyone to connect, grow, and become part of their local tech community</h2>
	<p>Whether you’re a seasoned professional, an up-and-coming junior developer, a student still learning the basics of your craft, or a hobbyist who loves to tinker and learn more—Springfield Devs is for you.</p>
	<p>Development of all kinds—software, application, mobile, gaming, virtual reality, web—you name it, you’ll find common interests with people who would love to geek out with you and learn together. Backend, frontend, full stack, cyber security, devops, data science, or whatever flavor gets your taste buds tingling, you’re in the right place. Designers, project managers, scrum masters, instructors, analysts and anyone/everyone interested in tech and making cool things: welcome home!</p>
	<p>Springfield Devs is a community hub for knowledge sharing, networking, employment opportunities, and good fun centered around learning and developing with technologies.</p>
	<h2>Inclusive and supportive, by design</h2>
	<p>Everyone is welcome and encouraged to participate in our many activities, discussions, and events. No matter your experience level, age, gender, race, creed, or favorite science fiction fandom--you are welcome here! We strive to be a safe community, both online and in-person, and require everyone to abide by our Code of Conduct. And we mean it.</p>
	<h2>Get involved</h2>
	<p>Take the first step! Join our <a href="/discord">Discord</a> to see what all the hubbub is about. RSVP to our next meeting, either virtual or in-person, and see how low-key and easy it is to get connected (introverts welcome!). Create a <a href="/register">profile</a> on our website and find job opportunities or seek out others with similar interests.</p>
</section>

<section class="cards about_grid" aria-label="About Springfield Devs">
	<article class="card intro_card about_intro">
		<dl><dt>Sponsorship Opportunities</dt><dd>Connect with the developer community in Springfield</dd></dl>
		<footer><a href="/about/sponsorship/" class="button outline black">Become a Sponsor</a></footer>
	</article>
	<article class="card about_card">
		<dl><dt>How We Act</dt><dd>Code of Conduct</dd></dl>
		<footer><a href="/about/code-of-conduct/" class="button inverse">Read</a></footer>
	</article>
	<article class="card about_card">
		<dl><dt>Why We Exist</dt><dd>Articles of Incorporation</dd></dl>
		<footer><a href={documents.articles} class="button inverse">Check it Out</a></footer>
	</article>
	<article class="card about_card">
		<dl><dt>Governance</dt><dd>Bylaws</dd></dl>
		<footer><a href={documents.bylaws} class="button inverse">Download Document</a></footer>
	</article>
</section>

<style>
	.about_landing { padding: 102px 0; position: relative; overflow: hidden; color: #fff; border-radius: 20px; background: url('/images/circuitry/circuit_graphic.svg') 52vw center / 700px 450px no-repeat, var(--color-sgf-dark-blue); min-height: 353px; }
	.about_landing .content { max-width: 49%; }
	h1 { font-size: 36px; line-height: 43px; font-weight: 600; margin: 0 0 20px; }
	p { margin: 0 0 20px; }
	.about_content { margin: 0 auto; max-width: 90ch; padding: 28px 23px; }
	.about_content h2 { font-size: 32px; line-height: 40px; margin: 20px 0 0; color: var(--color-sgf-dark-blue); font-weight: 600; }
	.about_content p { padding-bottom: 1rem; }
	.about_content a { color: var(--color-sgf-light-blue); text-decoration: underline; }
	.about_grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(315px, 100%), 1fr)); gap: 25px 27px; padding: 4rem 2rem; }
	.card { border-radius: 27px; min-height: 284px; padding: 28px 23px; display: flex; flex-direction: column; }
	.card dl { margin: 0; }
	.card dt { font-weight: 700; font-size: 14px; color: var(--color-sgf-dark-blue); margin-bottom: 15px; padding-bottom: 1rem; }
	.card dd { margin: 0; font-weight: 700; font-size: 27px; line-height: 34px; }
	.card footer { margin-top: auto; padding-top: 5rem; }
	.about_card { background: var(--color-sgf-light-blue); color: #fff; }
	.about_intro dt { font-size: 27px; }
	.about_intro dd { font-weight: 400; color: #000; }
	.button { display: inline-flex; align-items: center; justify-content: center; border-radius: var(--radius-sgf-button); padding: 0 24px; height: 40px; font-weight: 600; font-size: 14px; color: #fff; background: var(--color-sgf-light-blue); }
	.button.inverse { background: var(--color-sgf-dark-blue); }
	.button.outline { border: 1px solid #000; background: transparent; color: #000; }
	.button.wide { padding: 0 40px; }
	@media (max-width: 1400px) { .about_landing { padding: 50px 0 96px; background-position: 57vw center; } .about_landing .content { max-width: 58ch; } }
	@media (max-width: 1024px) { .about_landing { padding: 130px 0 70px; background-position: 65vw 80%; background-size: 568px 257px; } .about_landing .content { max-width: 795px; } .about_landing p { max-width: 450px; } }
	@media (max-width: 768px) { .about_landing { background-image: none; padding: 170px 0 40px; } .about_landing::after { position: absolute; top: -23px; left: 0; content: ''; background: url('/images/circuitry/circuit_graphic.svg') right bottom / 120% no-repeat; height: 180px; width: 100%; } .about_landing .site-container { padding: 0 15px; } .about_landing .content, .about_landing p { max-width: 100%; } h1, .about_content h2 { font-size: 20px; line-height: 30px; } .about_grid { padding: 2rem 23px; } }
</style>
