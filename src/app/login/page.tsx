'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  LogIn,
  Eye,
  EyeOff,
  ShieldCheck,
  GraduationCap,
  Users,
  Briefcase,
  KeyRound,
  School,
  AlertCircle,
  Download,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // PWA Install Prompt State
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  React.useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    setInstallPrompt(null);
  };

  const demoAccounts = [
    { label: 'Super Admin', email: 'superadmin@excellence.edu', role: 'super_admin', icon: ShieldCheck, color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-900' },
    { label: 'Admin', email: 'admin@excellence.edu', role: 'admin', icon: Users, color: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900' },
    { label: 'Receptionist', email: 'receptionist@excellence.edu', role: 'receptionist', icon: Briefcase, color: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-900' },
    { label: 'Teacher', email: 'teacher@excellence.edu', role: 'teacher', icon: KeyRound, color: 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900' },
    { label: 'Student', email: 'student@excellence.edu', role: 'student', icon: GraduationCap, color: 'bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900' },
  ];

  const handleQuickFill = (demoEmail: string) => {
    setIdentifier(demoEmail);
    setPassword('Admin@123');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push(redirectPath);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-slate-50 dark:bg-slate-950">
      {/* Left side: Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-indigo-700 via-indigo-900 to-slate-900 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 text-2xl font-bold tracking-tight">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
              <School className="h-6 w-6 text-white" />
            </div>
            <span>Excellence Academy</span>
          </Link>
        </div>

        <div className="my-auto relative z-10 max-w-lg space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            Comprehensive School Management & Public CMS
          </h1>
          <p className="text-lg text-indigo-200/90 font-light">
            Access secure personal profiles, register admissions, process offline fees with audit trails, coordinate homework, and mark real-time attendance in a single interface.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 backdrop-blur-sm">
              <h3 className="font-semibold text-white">Full-Stack ERP</h3>
              <p className="text-xs text-indigo-200/70 mt-1">Multi-role permissions for Staff, Teachers, and Students.</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 backdrop-blur-sm">
              <h3 className="font-semibold text-white">Public CMS</h3>
              <p className="text-xs text-indigo-200/70 mt-1">Update banners, news, principal message & enquiries instantly.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-indigo-300/80 flex items-center justify-between border-t border-white/10 pt-6">
          <span>© 2026 Excellence Academy. All rights reserved.</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure SSL 256-Bit
          </span>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12 md:px-12 lg:px-16">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col space-y-2 text-center lg:text-left">
            <School className="h-10 w-10 text-indigo-600 dark:text-indigo-400 mx-auto lg:mx-0 lg:hidden mb-2" />
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome Back
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sign in to access your administrative, teacher, or student dashboard.
            </p>
          </div>

          {installPrompt && (
            <button
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 px-4 py-3 text-xs font-bold text-indigo-700 dark:text-indigo-300 shadow-sm transition cursor-pointer"
            >
              <Download className="h-4.5 w-4.5" /> Install Excellence Academy ERP App
            </button>
          )}

          <div className="space-y-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Quick Connect (Demo Mode)
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Click a profile to auto-fill. Password for all: <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-600 dark:text-slate-300 font-bold">Admin@123</span>
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {demoAccounts.map((account) => {
                const Icon = account.icon;
                return (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => handleQuickFill(account.email)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition cursor-pointer ${account.color}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {account.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 p-4 text-sm text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Email or Mobile Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="name@excellence.edu or 9876543210"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-4 pr-11 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3 text-sm font-semibold text-white shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            For website public page testing, go to the{' '}
            <Link
              href="/"
              className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              School Home Page
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mb-3" />
          <span>Loading portal login...</span>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
