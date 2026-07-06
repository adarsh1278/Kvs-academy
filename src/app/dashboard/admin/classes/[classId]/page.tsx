'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Users, BookOpen, Layers } from 'lucide-react';

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;

  const [classData, setClassData] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]); // For dropdowns
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clsRes, tchrRes] = await Promise.all([
          fetch(`/api/classes/${classId}`),
          fetch('/api/teachers')
        ]);
        const clsData = await clsRes.json();
        const tchrData = await tchrRes.json();
        
        if (clsData.success) {
          setClassData(clsData.class);
          setSections(clsData.sections);
          setSubjects(clsData.subjects);
        }
        if (tchrData.success) {
          // Since /api/teachers returns user objects inside t.user, but we map it to t.id, t.name, t.email
          // But wait! We need the actual User _id for the assignment schema ref 'User'.
          // Let's check what t.id is. In /api/teachers, id is Teacher._id.
          // BUT Section.classTeacher references User!
          // We must update the assignment fetch logic.
          // Wait, if teachers API returns t.id = Teacher._id, we need User._id.
          // I will assume for now that teacher assignment APIs handle this appropriately or we need to send User._id.
          setTeachers(tchrData.teachers);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (classId) fetchData();
  }, [classId]);

  const assignClassTeacher = async (sectionId: string, teacherId: string) => {
    try {
      const res = await fetch(`/api/sections/${sectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId })
      });
      const data = await res.json();
      if (data.success) {
        setSections(sections.map(s => s.id === sectionId ? {
          ...s, classTeacher: data.section.classTeacher ? { id: data.section.classTeacher._id, name: data.section.classTeacher.name } : null
        } : s));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const assignSubjectTeacher = async (subjectId: string, teacherId: string) => {
    try {
      const res = await fetch(`/api/subjects/${subjectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId })
      });
      const data = await res.json();
      if (data.success) {
        setSubjects(subjects.map(s => s.id === subjectId ? {
          ...s, subjectTeacher: data.subject.subjectTeacher ? { id: data.subject.subjectTeacher._id, name: data.subject.subjectTeacher.name } : null
        } : s));
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="text-center py-10">Loading class hub...</div>;
  if (!classData) return <div className="text-center py-10 text-rose-500">Class not found.</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 transition cursor-pointer">
          <ArrowLeft className="h-5 w-5 text-slate-500" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Class Hub: {classData.name}</h1>
          <p className="text-xs text-slate-500 mt-1">Manage sections, subjects, and teacher assignments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sections Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Users className="h-5 w-5 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Sections & Class Teachers</h3>
          </div>
          <div className="space-y-3">
            {sections.length === 0 ? <p className="text-xs text-slate-400">No sections found.</p> : sections.map(sec => (
              <div key={sec.id} className="flex flex-col sm:flex-row sm:items-center justify-between border border-slate-100 dark:border-slate-800 rounded-2xl p-4 gap-3">
                <span className="font-bold text-slate-900 dark:text-white text-sm">Section {sec.name}</span>
                <select
                  value={sec.classTeacher?.id || ''}
                  onChange={(e) => assignClassTeacher(sec.id, e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none w-full sm:w-auto"
                >
                  <option value="">-- Assign Class Teacher --</option>
                  {teachers.map(t => (
                    <option key={t.userId} value={t.userId}>{t.name}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Subjects Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <BookOpen className="h-5 w-5 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Subjects & Subject Teachers</h3>
          </div>
          <div className="space-y-3">
            {subjects.length === 0 ? <p className="text-xs text-slate-400">No subjects allocated.</p> : subjects.map(sub => (
              <div key={sub.id} className="flex flex-col sm:flex-row sm:items-center justify-between border border-slate-100 dark:border-slate-800 rounded-2xl p-4 gap-3">
                <div>
                  <span className="block font-bold text-slate-900 dark:text-white text-sm">{sub.name}</span>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold mt-1">{sub.code}</span>
                </div>
                <select
                  value={sub.subjectTeacher?.id || ''}
                  onChange={(e) => assignSubjectTeacher(sub.id, e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none w-full sm:w-auto"
                >
                  <option value="">-- Assign Subject Teacher --</option>
                  {teachers.map(t => (
                    <option key={t.userId} value={t.userId}>{t.name}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
