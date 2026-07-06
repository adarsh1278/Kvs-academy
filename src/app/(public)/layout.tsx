import React from 'react';
import Link from 'next/link';
import { ModeToggle } from '@/components/ModeToggle';
import { connectToDatabase } from '@/lib/db';
import { CMS } from '@/models/CMS';
import {
  School,
  Phone,
  Mail,
  MapPin,
  Clock,
  LogIn,
} from 'lucide-react';

const defaultSettings = {
  schoolName: 'Excellence Academy',
  phone: '+1 (555) 019-2834',
  email: 'info@excellence.edu',
  address: '45 Palm Ave, New Delhi',
};

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  let settings = defaultSettings;

  try {
    await connectToDatabase();
    const config = await CMS.findOne({ key: 'school_settings' });
    if (config?.value) {
      settings = {
        ...defaultSettings,
        ...config.value,
      };
    }
  } catch (error) {
    console.warn('Public layout CMS lookup failed, using defaults.', error);
  }

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Faculty', href: '/faculty' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Admissions', href: '/admissions' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      {/* 1. Top Informational Banner */}
      <div className="bg-indigo-900 text-indigo-100 text-xs py-2 px-4 md:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 border-b border-indigo-800">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3" /> {settings.phone}
          </span>
          <span className="flex items-center gap-1">
            <Mail className="h-3 w-3" /> {settings.email}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {settings.address}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a href="#" className="hover:text-white transition" aria-label="Facebook">
            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
            </svg>
          </a>
          <a href="#" className="hover:text-white transition" aria-label="Twitter">
            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          </a>
          <a href="#" className="hover:text-white transition" aria-label="Instagram">
            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          <a href="#" className="hover:text-white transition" aria-label="YouTube">
            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M23.498 6.163c-.272-1.016-1.071-1.815-2.087-2.087-1.839-.496-9.411-.496-9.411-.496s-7.571 0-9.411.496c-1.017.272-1.815 1.071-2.087 2.087-.496 1.839-.496 9.411-.496 9.411s0 7.571.496 9.411c.272 1.016 1.071 1.815 2.087 2.087 1.84.496 9.411.496 9.411.496s7.571 0 9.411-.496c1.017-.272 1.815-1.071 2.087-2.087.496-1.839.496-9.411.496-9.411s0-7.571-.496-9.411zm-13.848 10.76v-8.2l6.4 4.1-6.4 4.1z"/>
            </svg>
          </a>
        </div>
      </div>

      {/* 2. Primary Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
              <School className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white block leading-tight">
                {settings.schoolName}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest block font-medium">
                Public School
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <ModeToggle />
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition"
            >
              <LogIn className="h-4 w-4" />
              <span>Portal Login</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 3. Page Content */}
      <main className="flex-1 flex flex-col">{children}</main>

      {/* 4. Footer */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1: About */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white">
              <School className="h-8 w-8 text-indigo-400" />
              <span className="text-lg font-bold tracking-tight">{settings.schoolName}</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Fostering academic excellence, moral integrity, and leadership values in students since 1998. Committed to holistic growth.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-indigo-400 transition">About Our School</Link></li>
              <li><Link href="/faculty" className="hover:text-indigo-400 transition">Our Faculty</Link></li>
              <li><Link href="/gallery" className="hover:text-indigo-400 transition">Campus Gallery</Link></li>
              <li><Link href="/admissions" className="hover:text-indigo-400 transition">Admissions Info</Link></li>
              <li><Link href="/contact" className="hover:text-indigo-400 transition">Contact Us</Link></li>
            </ul>
          </div>

          {/* Col 3: Academic Hours */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Working Hours</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>Monday - Friday: 8:00 AM - 2:30 PM</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>Saturday: 8:00 AM - 12:30 PM</span>
              </li>
              <li className="flex items-center gap-2 text-rose-400">
                <Clock className="h-4 w-4 shrink-0" />
                <span>Sunday: Closed (Holidays)</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact details */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact Info</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex gap-2">
                <MapPin className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </li>
              <li className="flex gap-2">
                <Phone className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>{settings.phone}</span>
              </li>
              <li className="flex gap-2">
                <Mail className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>{settings.email}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <span>© 2026 Excellence Academy. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
            <Link href="/login" className="hover:underline text-indigo-400">Staff Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
