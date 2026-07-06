'use client';

import React, { useState, useEffect } from 'react';

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // 2 second loading screen
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;
  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-slate-950 transition-opacity duration-500">
      <div className="relative flex flex-col items-center animate-pulse">
        {/* Placeholder for the user's uploaded logo */}
        <div className="h-32 w-32 md:h-48 md:w-48 relative mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/kvs-logo.png" 
            alt="KVS Academy Logo" 
            className="w-full h-full object-contain drop-shadow-2xl animate-bounce"
            onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=KVS&background=4f46e5&color=fff&size=256' }}
          />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-indigo-900 dark:text-indigo-100 tracking-tight text-center">
          KVS <span className="text-indigo-600 dark:text-indigo-400">Academy</span>
        </h1>
        <div className="mt-8 flex gap-2">
          <div className="h-3 w-3 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-3 w-3 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-3 w-3 bg-indigo-600 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}
