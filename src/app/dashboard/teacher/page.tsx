import React from 'react';
import Link from 'next/link';
import {
  Users,
  BookOpen,
  Calendar,
  Clock,
  ClipboardList,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { connectToDatabase } from '@/lib/db';
import { Teacher } from '@/models/Teacher';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const defaultTeacher = {
  name: 'Mr. Sanjay Gupta',
  teacherId: 'TCH-2026-001',
  qualification: 'M.Sc. in Mathematics, B.Ed.',
  subjects: ['Mathematics', 'Science'],
  classes: ['Class 10 A'],
  schedule: [
    { period: 'Period 1', time: '08:30 AM - 09:15 AM', class: 'Class 10 A', subject: 'Mathematics' },
    { period: 'Period 3', time: '10:00 AM - 10:45 AM', class: 'Class 10 B', subject: 'Mathematics' },
  ],
};

export default async function TeacherDashboard() {
  let teacherData = defaultTeacher;

  try {
    await connectToDatabase();
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (token) {
      const decoded = await verifyToken(token);
      if (decoded) {
        const profile = await Teacher.findOne({ user: decoded.id })
          .populate('subjects')
          .populate('assignedClasses');

        if (profile) {
          teacherData = {
            name: decoded.name,
            teacherId: profile.teacherId,
            qualification: profile.qualification,
            subjects: profile.subjects.map((s: any) => s.name),
            classes: profile.assignedClasses.map((c: any) => c.name),
            schedule: defaultTeacher.schedule, // Fallback schedule mockup
          };
        }
      }
    }
  } catch (error) {
    console.warn('MongoDB query failed on teacher dashboard, using defaults.', error);
  }

  const widgets = [
    { label: 'Mark Attendance', desc: 'Log daily class registers', href: '/dashboard/teacher/attendance', icon: UserCheck, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/50' },
    { label: 'Issue Homework', desc: 'Publish worksheets & attachments', href: '/dashboard/teacher/homework', icon: ClipboardList, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/50' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Instructor Dashboard</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Welcome back, <span className="font-bold text-indigo-600 dark:text-indigo-400">{teacherData.name}</span>. Review your daily teaching timetable.
        </p>
      </div>

      {/* Quick shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {widgets.map((widget, i) => {
          const Icon = widget.icon;
          return (
            <Link
              key={i}
              href={widget.href}
              className={`flex items-center gap-4 rounded-3xl border p-6 bg-white dark:bg-slate-900 hover:shadow-md transition cursor-pointer ${widget.color.split(' ')[2]}`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${widget.color.split(' ')[0]} ${widget.color.split(' ')[1]}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{widget.label}</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{widget.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Info card & Timetable split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Profile Dossier summary (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Teacher Dossier</h3>
          <div className="space-y-2.5 text-xs text-slate-650 dark:text-slate-400">
            <div>
              <span className="block text-[10px] text-slate-400 uppercase">Employee ID</span>
              <span className="font-bold text-slate-850 dark:text-slate-200">{teacherData.teacherId}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase">Qualifications</span>
              <span className="font-semibold text-slate-800 dark:text-slate-300">{teacherData.qualification}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase">My Classes</span>
              <span className="font-semibold text-slate-805 dark:text-slate-200">{teacherData.classes.join(', ')}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase">My Subjects</span>
              <span className="font-semibold text-slate-805 dark:text-slate-200">{teacherData.subjects.join(', ')}</span>
            </div>
          </div>
        </div>

        {/* Timetable schedule (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Class Schedule</h3>
          <div className="space-y-3">
            {teacherData.schedule.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-slate-800 p-4"
              >
                <div className="space-y-1">
                  <span className="block text-xs font-bold text-slate-900 dark:text-white">{item.subject}</span>
                  <span className="text-[10px] text-slate-450 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {item.time}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-bold text-indigo-600 dark:text-indigo-400">{item.class}</span>
                  <span className="text-[10px] text-slate-400">{item.period}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
