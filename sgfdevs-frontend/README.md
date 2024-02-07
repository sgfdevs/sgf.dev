# SGF Devs Frontend

This is a work in progress rewrite of our frontend in NextJS and TailwindUI. This is purely experimental at this phase.

## Prerequisites and Setup
* NodeJS >= v18.17.0
* npm >= 9.5.0

Recommended management of NodeJS environments is through [Node Version Manager](https://github.com/nvm-sh/nvm).

## Contribution Flow
First, fork this repository. 

When you first clone your repository, make sure you are on the branch `v2`. All code should be added to your own v2 branch in your forked repository. Then, create a pull request against this repository with your change.

We also ask that contributions add minimal amount of warnings to `npm run lint`, for code clarity sakes.

## Local Development
It's likely going to be easier to work on this code from within the `sgfdevs-frontend/` folder. Examples assume you are executing commands from this folder.

Install dependencies:

```bash
➜  sgfdevs-frontend: npm install
```

Starting the local server server:
```bash 
➜  sgfdevs-frontend: npm run dev
   ▲ Next.js 14.0.4
   - Local:        http://localhost:3000
```
##  Resources

* [TailwindUI](https://tailwindcss.com/)
* [NextJS](https://nextjs.org/)
* [Beginners Guide to NextJS](https://welearncode.com/beginners-guide-nextjs/)
* [Tailwind Components and Resources](https://tailwindcss.com/resources)
