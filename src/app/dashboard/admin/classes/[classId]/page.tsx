'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Users, BookOpen, Layers, GraduationCap, User } from 'lucide-react';
import Link from 'next/link';

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;

  const [classData, setClassData] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rolePrefix, setRolePrefix] = useState('admin');

  useEffect(() => {
    // Determine current role prefix from URL path
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('/super-admin')) {
        setRolePrefix('super-admin');
      } else if (path.includes('/receptionist')) {
        setRolePrefix('receptionist');
      } else {
        setRolePrefix('admin');
      }
    }
  }, []);

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
        setStudents(clsData.students || []);
      }
      if (tchrData.success) {
        setTeachers(tchrData.teachers);
      }
    } catch (error) {
      console.error('Failed to load class hub data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classId) {
      void fetchData();
    }
  }, [classId]);

  const assignClassTeacher = async (sectionId: string, teacherId: string) => {
    if (rolePrefix === 'receptionist') return;
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
    if (rolePrefix === 'receptionist') return;
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

  // Find associated teacher document ID (since API links Section.classTeacher to User._id, but the detail page links to Teacher._id)
  const getTeacherDocId = (userId: string) => {
    const teacher = teachers.find(t => t.userId === userId);
    return teacher ? teacher.id : '';
  };

  if (loading) return <div className="text-center py-12 text-sm text-slate-500">Loading class hub...</div>;
  if (!classData) return <div className="text-center py-12 text-rose-500 text-sm">Class not found.</div>;

  const isReceptionist = rolePrefix === 'receptionist';

  return (
    <div className="space-y-8">
      {/* Header with Navigation Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm shrink-0">
            <button 
              onClick={() => router.back()} 
              title="Go Back"
              className="p-2 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg text-slate-500 dark:text-slate-400 transition cursor-pointer"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </button>
            <button 
              onClick={() => router.forward()} 
              title="Go Forward"
              className="p-2 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg text-slate-500 dark:text-slate-400 transition cursor-pointer"
            >
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">Class Hub: {classData.name}</h1>
            <p className="text-xs text-slate-450 mt-1">Manage sections, subjects, teachers and enrolled students.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sections & Class Teachers Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Layers className="h-5 w-5 text-indigo-500" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Sections & Class Teachers</h3>
          </div>
          <div className="space-y-3">
            {sections.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No sections found.</p>
            ) : (
              sections.map(sec => {
                const teacherDocId = sec.classTeacher ? getTeacherDocId(sec.classTeacher.id) : '';
                return (
                  <div key={sec.id} className="flex flex-col sm:flex-row sm:items-center justify-between border border-slate-100 dark:border-slate-800 rounded-2xl p-4 gap-3">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">Section {sec.name}</span>
                    
                    {isReceptionist ? (
                      sec.classTeacher ? (
                        teacherDocId ? (
                          <Link 
                            href={`/dashboard/${rolePrefix}/teachers/${teacherDocId}`}
                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            Teacher: {sec.classTeacher.name}
                          </Link>
                        ) : (
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Teacher: {sec.classTeacher.name}</span>
                        )
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unassigned</span>
                      )
                    ) : (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
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
                        {sec.classTeacher && teacherDocId && (
                          <Link 
                            href={`/dashboard/${rolePrefix}/teachers/${teacherDocId}`}
                            className="text-[10px] text-center font-bold text-indigo-500 hover:underline hover:text-indigo-650 shrink-0"
                          >
                            View Profile
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Subjects & Subject Teachers Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <BookOpen className="h-5 w-5 text-emerald-500" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Subjects & Subject Teachers</h3>
          </div>
          <div className="space-y-3">
            {subjects.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No subjects allocated.</p>
            ) : (
              subjects.map(sub => {
                const teacherDocId = sub.subjectTeacher ? getTeacherDocId(sub.subjectTeacher.id) : '';
                return (
                  <div key={sub.id} className="flex flex-col sm:flex-row sm:items-center justify-between border border-slate-100 dark:border-slate-800 rounded-2xl p-4 gap-3">
                    <div>
                      <span className="block font-bold text-slate-900 dark:text-white text-sm">{sub.name}</span>
                      <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold mt-1">{sub.code} • {sub.type}</span>
                    </div>

                    {isReceptionist ? (
                      sub.subjectTeacher ? (
                        teacherDocId ? (
                          <Link 
                            href={`/dashboard/${rolePrefix}/teachers/${teacherDocId}`}
                            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            Teacher: {sub.subjectTeacher.name}
                          </Link>
                        ) : (
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Teacher: {sub.subjectTeacher.name}</span>
                        )
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unassigned</span>
                      )
                    ) : (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
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
                        {sub.subjectTeacher && teacherDocId && (
                          <Link 
                            href={`/dashboard/${rolePrefix}/teachers/${teacherDocId}`}
                            className="text-[10px] text-center font-bold text-emerald-500 hover:underline hover:text-emerald-650 shrink-0"
                          >
                            View Profile
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Enrolled Students Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <GraduationCap className="h-5 w-5 text-indigo-500" />
          <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Enrolled Students ({students.length})</h3>
        </div>
        
        {students.length === 0 ? (
          <p className="text-xs text-slate-450 italic py-6 text-center">No students currently registered in this class.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map(stud => (
              <div 
                key={stud.id}
                className="flex items-center justify-between border border-slate-100 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-950/20 rounded-2xl p-4 hover:border-slate-250 dark:hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center shrink-0">
                    {stud.profileImage ? (
                      <img src={stud.profileImage} alt={stud.name} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-4.5 w-4.5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <span className="block font-bold text-slate-900 dark:text-white text-xs leading-none">{stud.name}</span>
                    <span className="block text-[10px] text-slate-400 mt-1 font-mono uppercase">Roll No: {stud.rollNo} • Adm: {stud.admissionNo}</span>
                  </div>
                </div>
                
                <Link 
                  href={`/dashboard/${rolePrefix}/students/${stud.id}`}
                  className="inline-flex items-center justify-center p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 transition"
                >
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
