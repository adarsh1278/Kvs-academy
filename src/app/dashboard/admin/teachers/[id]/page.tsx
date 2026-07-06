'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { ArrowLeft, User, Briefcase, BookOpen, Layers } from 'lucide-react';

export default function TeacherDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { selectedTeacher } = useStore();
  const [teacherData, setTeacherData] = useState<any>(selectedTeacher);
  const [classAssignments, setClassAssignments] = useState<any[]>([]);
  const [subjectAssignments, setSubjectAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(!selectedTeacher);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await fetch(`/api/teachers/${id}/assignments`);
        const data = await res.json();
        if (data.success) {
          setTeacherData(data.teacher);
          setClassAssignments(data.classAssignments);
          setSubjectAssignments(data.subjectAssignments);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTeacher();
  }, [id]);

  if (loading) return <div className="text-center py-10">Loading teacher 360° profile...</div>;
  if (!teacherData) return <div className="text-center py-10 text-rose-500">Teacher not found.</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 transition cursor-pointer">
          <ArrowLeft className="h-5 w-5 text-slate-500" />
        </button>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
            {teacherData.profileImage ? (
              <img src={teacherData.profileImage} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <User className="h-6 w-6 text-slate-500" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">{teacherData.name}</h1>
            <p className="text-xs text-slate-500 mt-1 font-mono uppercase">ID: {teacherData.teacherId} • {teacherData.qualification}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
            <Briefcase className="h-5 w-5 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Employment Details</h3>
          </div>
          <div className="space-y-2 text-sm">
            <p><span className="text-slate-400 font-semibold w-24 inline-block">Experience:</span> {teacherData.experience} Years</p>
            <p><span className="text-slate-400 font-semibold w-24 inline-block">Salary:</span> ₹{teacherData.salary}</p>
            <p><span className="text-slate-400 font-semibold w-24 inline-block">Status:</span> {teacherData.status}</p>
            <p><span className="text-slate-400 font-semibold w-24 inline-block">Joined:</span> {teacherData.joiningDate}</p>
            <p><span className="text-slate-400 font-semibold w-24 inline-block">Phone:</span> {teacherData.phone}</p>
            <p><span className="text-slate-400 font-semibold w-24 inline-block">Email:</span> {teacherData.email}</p>
          </div>
        </div>

        {/* Class Teacher Assignments */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
            <Layers className="h-5 w-5 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Class Teacher Roles</h3>
          </div>
          {classAssignments.length > 0 ? (
            <div className="space-y-3">
              {classAssignments.map((ca, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <span className="block text-sm font-black text-slate-800 dark:text-white">{ca.className}</span>
                  <span className="block text-xs font-bold text-emerald-600 dark:text-emerald-400">Section {ca.sectionName}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">Not assigned as a Class Teacher to any section.</p>
          )}
        </div>

        {/* Subject Assignments */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
            <BookOpen className="h-5 w-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Subjects Taught</h3>
          </div>
          {subjectAssignments.length > 0 ? (
            <div className="space-y-3">
              {subjectAssignments.map((sa, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="block text-sm font-black text-slate-800 dark:text-white">{sa.subjectName}</span>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">{sa.className}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-500">{sa.subjectCode}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">Not assigned to teach any specific subjects.</p>
          )}
        </div>
      </div>
    </div>
  );
}
