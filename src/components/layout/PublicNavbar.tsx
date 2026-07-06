'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogIn } from 'lucide-react';
import { ModeToggle } from '@/components/ModeToggle';

interface PublicNavbarProps {
  schoolName: string;
}

export default function PublicNavbar({ schoolName }: PublicNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Faculty', href: '/faculty' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Admissions', href: '/admissions' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md overflow-hidden p-2">
             {/* KVS Custom SVG Logo */}
             <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
                {/* Gear outline */}
                <path d="M50 5 C55 5, 58 8, 59 12 L65 14 C68 12, 73 13, 76 16 C79 19, 80 24, 78 27 L80 33 C84 34, 87 37, 87 42 L95 44 C95 49, 95 51, 95 56 L87 58 C87 63, 84 66, 80 67 L78 73 C80 76, 79 81, 76 84 C73 87, 68 88, 65 86 L59 88 C58 92, 55 95, 50 95 C45 95, 42 92, 41 88 L35 86 C32 88, 27 87, 24 84 C21 81, 20 76, 22 73 L20 67 C16 66, 13 63, 13 58 L5 56 C5 51, 5 49, 5 44 L13 42 C13 37, 16 34, 20 33 L22 27 C20 24, 21 19, 24 16 C27 13, 32 12, 35 14 L41 12 C42 8, 45 5, 50 5 Z" fill="none" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
                {/* Inner Book / Hat */}
                <path d="M30 35 L50 25 L70 35 L50 45 Z" fill="currentColor" />
                {/* Hanging Tassel */}
                <path d="M70 35 L70 50 M68 50 L72 50 L71 55 L69 55 Z" fill="currentColor" />
                {/* Pen Nib */}
                <path d="M45 45 L55 45 L55 65 L50 80 L45 65 Z" fill="currentColor" />
                <circle cx="50" cy="65" r="3" fill="#4f46e5" className="text-white dark:text-slate-900" />
             </svg>
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white block leading-tight">
              {schoolName}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest block font-medium">
              Public School
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition ${
                  isActive 
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold' 
                    : 'text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action CTAs & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <ModeToggle />
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition"
          >
            <LogIn className="h-4 w-4" />
            <span>Portal Login</span>
          </Link>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 absolute top-20 left-0 w-full shadow-lg pb-4 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-3 py-3 rounded-xl text-base font-medium transition ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' 
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition"
              >
                <LogIn className="h-4 w-4" />
                <span>Portal Login</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
