import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });

export const metadata: Metadata = {
  title: 'LightIt — AI-Powered Startup Investor Matchmaking',
  description: 'Connect founders with investors using AI-powered matching. LightIt intelligently pairs high-potential startups with the right investors for maximum impact.',
  keywords: ['startup funding', 'investor matching', 'AI matchmaking', 'venture capital', 'startup platform'],
  openGraph: {
    title: 'LightIt — Where Startups Meet Investors',
    description: 'AI-powered matchmaking platform connecting founders with investors.',
    type: 'website',
    url: 'https://lightit.io',
  },
  twitter: { card: 'summary_large_image', title: 'LightIt', description: 'AI-powered startup investor matchmaking' },
};

import { ThemeProvider } from '@/components/ThemeProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#0d0d1f', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
            duration: 4000,
          }}
        />
        </ThemeProvider>
      </body>
    </html>
  );
}
