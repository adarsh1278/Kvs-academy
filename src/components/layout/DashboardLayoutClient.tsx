'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  School,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  Clock,
  ClipboardList,
  Layers,
  FileSpreadsheet,
  Settings,
  Bell,
  Sun,
  Moon,
  TrendingUp,
} from 'lucide-react';

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  profileImage?: string;
  isStale?: boolean;
}

export default function DashboardLayoutClient({
  children,
  user,
}: {
  children: React.ReactNode;
  user: UserSession;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user.isStale) {
      handleLogout();
    }
  }, [user.isStale]);

  const toggleDarkMode = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isDark = mounted ? theme === 'dark' : false;

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/login');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Group links by role
  const getNavLinks = () => {
    if (user.role === 'super_admin' || user.role === 'admin') {
      const rolePath = user.role === 'super_admin' ? 'super-admin' : 'admin';
      const links = [
        { label: 'Overview', href: `/dashboard/${rolePath}`, icon: TrendingUp },
        { label: 'Classes & Sections', href: `/dashboard/${rolePath}/classes`, icon: Layers },
        { label: 'Subjects Management', href: `/dashboard/${rolePath}/subjects`, icon: BookOpen },
        { label: 'Teacher Management', href: `/dashboard/${rolePath}/teachers`, icon: Users },
        { label: 'Student Management', href: `/dashboard/${rolePath}/students`, icon: GraduationCap },
        { label: 'Admission Enquiries', href: `/dashboard/${rolePath}/enquiries`, icon: ClipboardList },
        { label: 'Daily Attendance', href: `/dashboard/${rolePath}/attendance`, icon: Clock },
        { label: 'Notice Circulars', href: `/dashboard/${rolePath}/notices`, icon: Bell },
        { label: 'Fees Management', href: `/dashboard/${rolePath}/fees`, icon: FileSpreadsheet },
        { label: 'Public Website CMS', href: `/dashboard/${rolePath}/cms`, icon: Settings },
      ];

      if (user.role === 'super_admin') {
        links.push({ label: 'User Management', href: '/dashboard/super-admin/users', icon: Users });
      }

      return links;
    }
    if (user.role === 'receptionist') {
      return [
        { label: 'Overview', href: '/dashboard/receptionist', icon: TrendingUp },
        { label: 'Register Admission', href: '/dashboard/receptionist/admissions', icon: ClipboardList },
        { label: 'Search Students', href: '/dashboard/receptionist/students', icon: GraduationCap },
        { label: 'Collect Offline Fees', href: '/dashboard/receptionist/fees', icon: FileSpreadsheet },
      ];
    }
    if (user.role === 'teacher') {
      return [
        { label: 'Overview', href: '/dashboard/teacher', icon: TrendingUp },
        { label: 'Mark Attendance', href: '/dashboard/teacher/attendance', icon: Clock },
        { label: 'Homework manager', href: '/dashboard/teacher/homework', icon: ClipboardList },
        { label: 'My Timetable', href: '/dashboard/teacher/timetable', icon: Calendar },
        { label: 'View Notice board', href: '/dashboard/teacher/notices', icon: Bell },
      ];
    }
    if (user.role === 'student') {
      return [
        { label: 'Dashboard', href: '/dashboard/student', icon: TrendingUp },
        { label: 'My Attendance', href: '/dashboard/student/attendance', icon: Clock },
        { label: 'Homework list', href: '/dashboard/student/homework', icon: ClipboardList },
        { label: 'My Timetable', href: '/dashboard/student/timetable', icon: Calendar },
        { label: 'Notice Board', href: '/dashboard/student/notices', icon: Bell },
      ];
    }
    return [];
  };

  const navLinks = [...getNavLinks(), { label: 'My Profile', href: '/dashboard/profile', icon: Settings }];

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950 font-sans">
      {/* 1. Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <School className="h-5 w-5" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white block leading-tight">
              KVS Academy Portal
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">
              {user.role.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-wider transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom profile info */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold uppercase">
              {user.name.substring(0, 2)}
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-bold text-slate-800 dark:text-white truncate">
                {user.name}
              </span>
              <span className="block text-[10px] text-slate-400 truncate">{user.email}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 py-2.5 text-xs font-bold text-rose-500 transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. Mobile Nav Drawer Toggle Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* 3. Mobile Slide-out Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-350 ease-in-out lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <School className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">KVS Academy ERP</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-wider transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 dark:border-slate-800 p-4 space-y-4">
          <div className="flex items-center gap-3">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="h-10 w-10 rounded-full object-cover shadow-md border border-slate-200 dark:border-slate-800"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold uppercase shrink-0">
                {user.name.substring(0, 2)}
              </div>
            )}
            <div className="min-w-0">
              <span className="block text-xs font-bold text-slate-800 dark:text-white truncate">
                {user.name}
              </span>
              <span className="block text-[10px] text-slate-400 truncate">{user.email}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 text-xs font-bold text-rose-500 transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 4. Right side main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header bar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white cursor-pointer"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden sm:inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 px-3.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              <span>Session: <span className="font-bold">2026-2027</span></span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-55 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Profile link */}
            <Link
              href={`/dashboard/${user.role.replace('_', '-')}`}
              className="flex items-center gap-2.5 hover:opacity-85 transition"
            >
              <div className="hidden md:block text-right">
                <span className="block text-xs font-bold text-slate-800 dark:text-white">
                  {user.name.split(' ')[0]}
                </span>
                <span className="block text-[9px] text-slate-400 uppercase tracking-widest font-semibold">
                  {user.role.replace('_', ' ')}
                </span>
              </div>
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="h-8.5 w-8.5 rounded-full object-cover shadow-md border border-slate-200 dark:border-slate-800"
                />
              ) : (
                <div className="h-8.5 w-8.5 rounded-full bg-indigo-650 text-white font-bold text-xs uppercase flex items-center justify-center shadow-md">
                  {user.name.substring(0, 2)}
                </div>
              )}
            </Link>
          </div>
        </header>

        {/* Inner Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-slate-50 dark:bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
