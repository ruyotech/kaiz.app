import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Kaiz LifeOS - Run Your Life Like a Product Team',
  description: 'Transform your life with Agile methodology. Track goals, build habits, join challenges, and connect with a community of achievers.',
  keywords: ['productivity', 'goal tracking', 'habits', 'agile', 'life management', 'challenges'],
  openGraph: {
    title: 'Kaiz LifeOS - Run Your Life Like a Product Team',
    description: 'Transform your life with Agile methodology.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
