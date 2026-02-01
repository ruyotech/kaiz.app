import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign In - Kaiz',
  description: 'Sign in to your Kaiz account',
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 z-10">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          <span className="text-white font-semibold text-xl">Kaiz</span>
        </Link>
      </header>
      
      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4">
        {/* Background decoration */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px]" />
        </div>
        {children}
      </main>
    </div>
  );
}
