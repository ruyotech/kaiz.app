'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-slate-950/90 backdrop-blur-lg border-b border-white/10 py-3' : 'py-6'
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center font-bold text-xl">
            K
          </div>
          <span className="text-xl font-bold">Kaiz </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/community" className="text-slate-300 hover:text-white transition-colors">
            Community
          </Link>
          <Link href="/about" className="text-slate-300 hover:text-white transition-colors">
            About
          </Link>
          <Link href="/pricing" className="text-slate-300 hover:text-white transition-colors">
            Pricing
          </Link>
          <Link href="/faq" className="text-slate-300 hover:text-white transition-colors">
            FAQ
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button variant="gradient" asChild>
            <Link href="/register">Start Free</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
