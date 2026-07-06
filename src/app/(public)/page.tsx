import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Trophy,
  Award,
  Users,
  Building,
  GraduationCap,
  Calendar,
  ChevronRight,
  Flame,
  MapPin,
  Phone,
  Clock,
} from 'lucide-react';
import { connectToDatabase } from '@/lib/db';
import { CMS } from '@/models/CMS';
import { Notice } from '@/models/Notice';
import { Event } from '@/models/Event';

// Fallback mock CMS content if connection fails or CMS is empty
const defaultCMS = {
  home_hero: {
    title: 'Excellence Academy',
    subtitle: 'Empowering minds, shaping futures, and building leaders of tomorrow.',
    bannerImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200',
    ctaText: 'Apply for Admission',
    ctaLink: '/admissions',
    address: '45 Palm Ave, New Delhi',
    phone: '+91 11 2345 6789',
  },
  principal_message: {
    name: 'Dr. Rajesh Sharma',
    title: "Principal's Message",
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
    message:
      'Dear Parents and Students, Welcome to Excellence Academy. Our commitment is to provide a safe, nurturing, and intellectually challenging environment. We believe that every child is unique and has the potential to make a positive impact on the world. We work hand-in-hand with parents to ensure our students grow into responsible, creative, and successful global citizens.',
  },
  director_message: {
    name: 'Mrs. Anita Verma',
    title: "Director's Message",
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    message:
      'At Excellence Academy, our focus is on comprehensive development. Education goes beyond textbooks; it encompasses sports, visual and performing arts, communication skills, and character building. We are dedicated to providing state-of-the-art infrastructure and highly qualified faculty to enable our students to compete at international levels.',
  },
};

export default async function PublicHomePage() {
  let cmsData = defaultCMS;
  let notices: any[] = [];
  let events: any[] = [];

  try {
    await connectToDatabase();

    const schoolSettings = await CMS.findOne({ key: 'school_settings' });

    const cmsRecords = await CMS.find({});
    const cmsMap: any = {};
    cmsRecords.forEach((record) => {
      cmsMap[record.key] = record.value;
    });

    if (Object.keys(cmsMap).length > 0) {
      cmsData = { ...defaultCMS, ...cmsMap };
    }

    if (schoolSettings?.value) {
      cmsData = {
        ...cmsData,
        home_hero: {
          ...cmsData.home_hero,
          title: schoolSettings.value.heroTitle || cmsData.home_hero.title,
          subtitle: schoolSettings.value.heroSubtitle || cmsData.home_hero.subtitle,
          bannerImage: schoolSettings.value.bannerImage || cmsData.home_hero.bannerImage,
        },
      };
      (cmsData as any).toppers = schoolSettings.value.toppers || [];
      (cmsData as any).achievements = schoolSettings.value.achievements || [];
    }

    // Fetch active notices
    notices = await Notice.find({ expiryDate: { $gte: new Date() } })
      .sort({ createdAt: -1 })
      .limit(3);

    // Fetch upcoming events
    events = await Event.find({ isPublic: true })
      .sort({ startDate: 1 })
      .limit(3);
  } catch (error) {
    console.warn('MongoDB query failed on public home page, using fallback content.', error);
    // Populating default notices if DB is down
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
    events = [
      {
        title: 'Annual Science & Tech Fair 2026',
        description: 'Students showcase working prototypes, research papers and robotics exhibits.',
        startDate: new Date('2026-08-10'),
        location: 'Main Auditorium',
        image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600',
      },
      {
        title: 'Inter-School Sports Meet',
        description: 'Championship tournaments across basketball, football, and athletics.',
        startDate: new Date('2026-09-18'),
        location: 'Sports Field',
        image: 'https://images.unsplash.com/photo-1567057419565-4349c49d8a04?w=600',
      },
    ];
  }

  const { home_hero, principal_message, director_message } = cmsData;

  const stats = [
    { label: 'Students Enrolled', value: '1,200+', icon: GraduationCap },
    { label: 'Expert Educators', value: '55+', icon: Users },
    { label: 'Modern Laboratories', value: '6', icon: Building },
    { label: 'Years of Legacy', value: '28', icon: Trophy },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Banner */}
      <section
        className="relative min-h-[600px] flex items-center bg-cover bg-center text-white py-24"
        style={{
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.85)), url(${home_hero.bannerImage})`,
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:30px_30px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 px-3.5 py-1.5 text-sm font-semibold text-indigo-300 backdrop-blur-md">
              <Flame className="h-4 w-4" /> Welcome to Excellence Academy
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-white">
              {home_hero.title}
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 font-light leading-relaxed">
              {home_hero.subtitle}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href={home_hero.ctaLink}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition duration-200"
              >
                <span>{home_hero.ctaText}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/40 hover:bg-slate-900/60 px-6 py-3.5 text-sm font-semibold text-slate-200 transition backdrop-blur-sm"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-md">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="flex flex-col items-center text-center p-4 border-r border-slate-100 dark:border-slate-800 last:border-0"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mb-3">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Messages from Leadership (Principal & Director) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Principal Message Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm flex flex-col md:flex-row gap-6 items-start">
          <img
            src={principal_message.photo}
            alt={principal_message.name}
            className="w-full md:w-44 h-56 object-cover rounded-2xl shrink-0 shadow-inner"
          />
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs px-3 py-1 rounded-full uppercase">
              {principal_message.title}
            </div>
            <h3 className="text-xl font-bold text-slate-950 dark:text-white">{principal_message.name}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
              "{principal_message.message}"
            </p>
          </div>
        </div>

        {/* Director Message Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm flex flex-col md:flex-row gap-6 items-start">
          <img
            src={director_message.photo}
            alt={director_message.name}
            className="w-full md:w-44 h-56 object-cover rounded-2xl shrink-0 shadow-inner"
          />
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs px-3 py-1 rounded-full uppercase">
              {director_message.title}
            </div>
            <h3 className="text-xl font-bold text-slate-950 dark:text-white">{director_message.name}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
              "{director_message.message}"
            </p>
          </div>
        </div>
      </section>

      {/* 4. Notice Board Preview & Upcoming Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Notice Board Column */}
        <div className="lg:col-span-1 bg-gradient-to-b from-indigo-950 to-slate-950 rounded-3xl border border-indigo-900 p-8 text-white space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight">Active Notices</h3>
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
          </div>
          <div className="space-y-4 divider-y divider-indigo-900/50">
            {notices.map((notice, index) => (
              <div key={index} className="pt-4 first:pt-0 space-y-2">
                <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">
                  {new Date(notice.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <h4 className="font-bold text-slate-100 hover:text-indigo-300 transition cursor-pointer">
                  {notice.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2">{notice.content}</p>
              </div>
            ))}
          </div>
          <Link
            href="/about#notices"
            className="inline-flex items-center gap-1 text-xs text-indigo-400 font-bold hover:text-indigo-300 transition"
          >
            <span>View All Circulars</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Events Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              Upcoming Events
            </h3>
            <Link
              href="/gallery"
              className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              View Gallery
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition"
              >
                <img src={event.image} alt={event.title} className="h-44 w-full object-cover" />
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {new Date(event.startDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    {event.location && (
                      <>
                        <span>•</span>
                        <span>{event.location}</span>
                      </>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-950 dark:text-white leading-snug">{event.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Toppers Section */}
      {((cmsData as any).toppers || []).length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">Our Board Exam Toppers</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Celebrating the stellar academic performances of our meritorious students in CBSE board examinations.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {((cmsData as any).toppers || []).map((top: any, idx: number) => (
              <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 text-center shadow-sm space-y-4 hover:shadow-md transition animate-fadeIn">
                <img src={top.photograph} alt={top.name} className="h-24 w-24 rounded-full object-cover mx-auto border-2 border-indigo-100 dark:border-indigo-900 shadow-inner" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{top.name}</h4>
                  <span className="block text-[10px] text-slate-400 font-semibold">{top.className}</span>
                  <span className="inline-block mt-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-750 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 font-black text-xs px-2.5 py-1 rounded-full">{top.score}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Achievements Section */}
      {((cmsData as any).achievements || []).length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">Awards & Achievements</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Excellence Academy is decorated with multiple recognitions for excellence in pedagogy, sports, and infrastructure.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {((cmsData as any).achievements || []).map((ach: any, idx: number) => (
              <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex gap-4 items-start hover:shadow-md transition">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 shrink-0 border border-amber-100 dark:border-amber-900">
                  <Trophy className="h-6 w-6" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold text-[9px] px-1.5 py-0.5 rounded shrink-0">{ach.year}</span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{ach.title}</h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{ach.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Map and Location Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">Locate Our Campus</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Conveniently situated in the institutional area, easily accessible via school transit and public metro networks.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Map iframe (8 cols) */}
          <div className="lg:col-span-8 h-96 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm relative">
            <iframe
              title="Excellence Academy Campus Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.5620139789397!2d77.2281896768805!3d28.613939075674317!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b347ec0ad%3A0x153577d100000000!2sIndia%20Gate!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              className="absolute inset-0 w-full h-full border-0 grayscale dark:invert-[0.9] dark:hue-rotate-180"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          
          {/* Contact Details Card (4 cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-8 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px] text-indigo-650">Admissions & Contact</h4>
              <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
                Our admissions bureau and campus visiting desks are open Monday through Saturday for campus tours, fee consultations, and registrations.
              </p>
            </div>
            
            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex gap-3 items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-750 dark:text-indigo-400 shrink-0 border border-indigo-100/50 dark:border-indigo-900/30">
                  <MapPin className="h-4 w-4" />
                </div>
                <span>{cmsData.home_hero.address || '45 Palm Ave, New Delhi'}</span>
              </div>
              <div className="flex gap-3 items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-750 dark:text-indigo-400 shrink-0 border border-indigo-100/50 dark:border-indigo-900/30">
                  <Phone className="h-4 w-4" />
                </div>
                <span>{cmsData.home_hero.phone || '+91 11 2345 6789'}</span>
              </div>
              <div className="flex gap-3 items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-750 dark:text-indigo-400 shrink-0 border border-indigo-100/50 dark:border-indigo-900/30">
                  <Clock className="h-4 w-4" />
                </div>
                <span>Office Hours: 8:00 AM - 3:00 PM</span>
              </div>
            </div>
            
            <Link
              href="/contact"
              className="w-full text-center rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 py-3 text-xs font-bold text-white transition cursor-pointer"
            >
              Get Directions
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Enrollment Callout banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-xl border border-indigo-600">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:20px_20px]" />
          <div className="relative z-10 max-w-xl space-y-4">
            <h3 className="text-3xl font-black tracking-tight leading-tight">
              Join the Excellence Family
            </h3>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed font-light">
              Registration forms for student admission are currently being accepted online. Read details regarding the curriculum, fees structure, and submit an enquiry.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/admissions"
                className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-6 py-3 rounded-xl text-sm transition"
              >
                Start Enquiry Form
              </Link>
              <Link
                href="/contact"
                className="border border-indigo-500 hover:border-indigo-400 hover:bg-indigo-800 bg-indigo-800/40 text-indigo-200 font-bold px-6 py-3 rounded-xl text-sm transition"
              >
                Contact Admissions Office
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
