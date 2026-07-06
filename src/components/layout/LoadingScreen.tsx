'use client';

import React, { useState, useEffect } from 'react';

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Custom loading screen animation lasts 1.5 seconds, then fades out
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;
  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-indigo-950 text-white transition-opacity duration-500 ease-out">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,transparent_70%)]" />
      
      <div className="relative flex flex-col items-center max-w-sm px-6 text-center space-y-6">
        {/* Animated Logo Frame */}
        <div className="h-28 w-28 md:h-36 md:w-36 rounded-full overflow-hidden border-4 border-indigo-500/30 bg-white p-0.5 shadow-2xl animate-in zoom-in-50 duration-700 ease-out">
          <img 
            src="/KVS CURVE LOGO.jpg.jpeg" 
            alt="KVS Academy Logo" 
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        {/* School Name with tracking and slide up animation */}
        <div className="space-y-2 animate-in slide-in-from-bottom-8 duration-700 delay-100 ease-out">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
            KVS ACADEMY
          </h1>
          
          {/* Tagline */}
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-indigo-300">
            प्रज्ञानम् ब्रह्म • Knowledge is Supreme
          </p>
        </div>

        {/* Small loader line */}
        <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden relative">
          <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-indigo-400 rounded-full animate-infinite-loading" />
        </div>
      </div>

      <style jsx global>{`
        @keyframes infinite-loading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
        .animate-infinite-loading {
          animation: infinite-loading 1.2s infinite linear;
        }
      `}</style>
    </div>
  );
}
