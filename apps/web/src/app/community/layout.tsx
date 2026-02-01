import type { Metadata } from 'next';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';

export const metadata: Metadata = {
  title: 'Community - Kaiz ',
  description: 'Join the most supportive community of achievers. Find accountability partners, join challenges, and celebrate wins together.',
};

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
