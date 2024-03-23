import { Source_Sans_3 } from 'next/font/google';
import type { Metadata } from 'next';
import { PropsWithChildren } from 'react';
import './globals.css';
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer';

const source_sans_3 = Source_Sans_3({
  weight: 'variable',
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-source-sans-3',
});
export const metadata: Metadata = {
  title: 'Springfield Devs - Home',
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang='en'>
      <body className={`${source_sans_3.variable}`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
