'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Eye, EyeOff, Loader2, Mail, Lock, User, Check } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const passwordRequirements = [
    { text: 'At least 8 characters', met: password.length >= 8 },
    { text: 'Contains a number', met: /\d/.test(password) },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { text: 'Passwords match', met: password === confirmPassword && password.length > 0 },
  ];

  const allRequirementsMet = passwordRequirements.every((req) => req.met);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!allRequirementsMet) {
      setError('Please meet all password requirements');
      return;
    }

    try {
      await register({ email, password, fullName });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="w-full max-w-md relative z-10">
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-slate-400">Start your personal growth journey</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm animate-fade-in">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>

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
            <label className="text-sm font-medium text-slate-300">Password</label>
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

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Password Requirements */}
          <div className="space-y-2 p-3 rounded-lg bg-slate-800/30 border border-white/5">
            <p className="text-xs text-slate-400 mb-2">Password requirements:</p>
            <div className="grid grid-cols-2 gap-2">
              {passwordRequirements.map((req, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 text-xs ${
                    req.met ? 'text-green-400' : 'text-slate-500'
                  }`}
                >
                  <Check className={`w-3 h-3 ${req.met ? 'opacity-100' : 'opacity-30'}`} />
                  {req.text}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !allRequirementsMet}
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        {/* Terms */}
        <p className="mt-4 text-xs text-slate-500 text-center">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
