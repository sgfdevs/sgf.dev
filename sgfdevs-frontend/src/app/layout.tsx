import type { Metadata } from 'next';
import { PropsWithChildren } from 'react';
import './globals.css';
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Springfield Devs - Home',
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang='en'>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
