'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('erajbabayev@gmail.com');
  const [password, setPassword] = useState('Safiya373!');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    console.log('Login attempt:', { email, password });
    try {
      await login(email, password);
      console.log('Login successful, redirecting...');
      // Check if admin and redirect accordingly
      const isAdmin = useAuthStore.getState().isAdmin;
      router.push(isAdmin ? '/admin' : '/dashboard');
      router.refresh();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password');
    }
  };

  return (
    <div className="w-full max-w-md relative z-10">
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-slate-400">Sign in to continue your journey</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm animate-fade-in">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg pl-10 pr-12 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </div>

        {/* Admin Login Hint (Development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-3 rounded-lg bg-slate-800/50 border border-white/5">
            <p className="text-xs text-slate-500 text-center">
              Admin? Use admin credentials to access the admin panel.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
