import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        foreground: '#153557',
        ['foreground-light']: '#619ece',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'scroll-left':
          'linear-gradient(90deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 70%, rgba(255, 255, 255, 0.4) 100%);',
      },
      backgroundSize: {
        'sponsor-top': '149px 51px,calc(100% - 155px) 2px, 8px 8px',
        'sponsor-bottom': '41px 31px, calc(100% - 225px) 2px, 8px 8px',
        '120': '120%',
      },
      backgroundPosition: {
        'sponsor-top': '0 10px,147px 10px, right 7px',
        'sponsor-bottom': '0 10px,35px 10px, calc(100% - 184px) 7px',
      },
      fontFamily: {
        ['font-awesome-5-pro']: 'Font Awesome 5 Pro',
      },
      fontSize: {
        sm: ['14px', 'inherit'],
        md: ['18px', '1.5rem'],
        xl: ['1.5rem', '2rem'],
      },
      letterSpacing: {
        none: '0',
        relaxed: '-0.013em;',
      },
      maxWidth: {
        sm: '316px',
      },
    },
  },
  plugins: [],
};
export default config;
