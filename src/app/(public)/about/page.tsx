import React from 'react';
import { Landmark, Compass, Eye, ShieldAlert, Award, Calendar } from 'lucide-react';
import { connectToDatabase } from '@/lib/db';
import { CMS } from '@/models/CMS';
import { Notice } from '@/models/Notice';

const defaultAbout = {
  title: 'Inspiring Academic Growth Since 1998',
  history:
    "Excellence Academy was established in 1998 with a vision to provide quality education and foster all-around development. Over the last two decades, we have grown into one of the region's premier educational institutions, combining rigorous academics with extensive co-curricular programs.",
  mission: 'To cultivate a learning environment that nurtures intellectual curiosity, integrity, and social responsibility.',
  vision: 'To be a globally recognized center of excellence in early and secondary education, producing empathetic leaders.',
};

export default async function AboutPage() {
  let aboutData = defaultAbout;
  let notices: any[] = [];

  try {
    await connectToDatabase();
    const cmsRecord = await CMS.findOne({ key: 'about_us' });
    if (cmsRecord) {
      aboutData = { ...defaultAbout, ...cmsRecord.value };
    }

    notices = await Notice.find({ expiryDate: { $gte: new Date() } })
      .sort({ createdAt: -1 })
      .limit(10);
  } catch (error) {
    console.warn('MongoDB query failed on about page, using fallback content.', error);
    notices = [
      {
        title: 'Admissions Open for Academic Session 2026-27',
        content: 'Registration process is live. Families can apply online or visit the admin office.',
        createdAt: new Date(),
      },
      {
        title: 'Summer Vacation Circular 2026',
        content: 'The school will remain closed for summer break from May 15th to June 30th.',
        createdAt: new Date(Date.now() - 86400000 * 2),
      },
    ];
  }

  const values = [
    { title: 'Academic Rigor', desc: 'Focusing on deep conceptual understanding and competitive standard readiness.', icon: Award },
    { title: 'Character Building', desc: 'Instilling ethical values, civic duties, discipline and community empathy.', icon: Compass },
    { title: 'Global Outlook', desc: 'Integrating modern digital skills and multi-cultural academic exposures.', icon: Eye },
  ];

  return (
    <div className="py-12 md:py-16 space-y-16">
      {/* 1. Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          About Our School
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-500 dark:text-slate-400">
          Learn about our background, vision for learning, and explore recent administrative notices.
        </p>
      </div>

      {/* 2. Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-black text-slate-950 dark:text-white leading-tight">
            {aboutData.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">
            {aboutData.history}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 p-6 space-y-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white"><Compass className="h-5 w-5" /></span>
              <h3 className="font-bold text-slate-950 dark:text-white">Our Mission</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{aboutData.mission}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 p-6 space-y-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white"><Eye className="h-5 w-5" /></span>
              <h3 className="font-bold text-slate-950 dark:text-white">Our Vision</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{aboutData.vision}</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
          <img
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800"
            alt="School Campus"
            className="w-full h-96 object-cover"
          />
        </div>
      </div>

      {/* 3. Core Values */}
      <div className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Our Foundations</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold">Core Pillars of Excellence</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v, idx) => {
              const Icon = v.icon;
              return (
                <div key={idx} className="flex flex-col items-center text-center space-y-3 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">{v.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Notice Board (Detailed circular list) */}
      <div id="notices" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-24">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-slate-950 dark:text-white">Official Circular Board</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Read current notices issued by the administration.</p>
        </div>

        <div className="space-y-4">
          {notices.length === 0 ? (
            <div className="text-center py-10 text-slate-500">No active circulars at this moment.</div>
          ) : (
            notices.map((notice, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-3"
              >
                <div className="flex justify-between items-center">
                  <span className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(notice.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-950 dark:text-white">{notice.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                  {notice.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
