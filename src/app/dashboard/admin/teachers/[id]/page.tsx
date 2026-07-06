'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { 
  ArrowLeft, 
  User, 
  Briefcase, 
  BookOpen, 
  Layers, 
  Edit, 
  Save, 
  X,
  Mail,
  Phone,
  GraduationCap
} from 'lucide-react';

export default function TeacherDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { selectedTeacher } = useStore();
  const [teacherData, setTeacherData] = useState<any>(selectedTeacher);
  const [classAssignments, setClassAssignments] = useState<any[]>([]);
  const [subjectAssignments, setSubjectAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Available options from database
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [allSections, setAllSections] = useState<any[]>([]);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editQualification, setEditQualification] = useState('');
  const [editExperience, setEditExperience] = useState('');
  const [editSalary, setEditSalary] = useState(0);
  const [editStatus, setEditStatus] = useState('Active');
  
  // Selected IDs for teacher assignments
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

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

  const fetchOptions = async () => {
    try {
      const [classRes, subjectRes] = await Promise.all([
        fetch('/api/classes'),
        fetch('/api/subjects'),
      ]);
      const classJson = await classRes.json();
      const subjectJson = await subjectRes.json();
      if (classJson.success) {
        setAllClasses(classJson.classes || []);
        setAllSections(classJson.sections || []);
      }
      if (subjectJson.success) {
        setAllSubjects(subjectJson.subjects || []);
      }
    } catch (error) {
      console.error('Failed to fetch options', error);
    }
  };

  useEffect(() => {
    if (id) {
      void fetchTeacher();
      void fetchOptions();
    }
  }, [id]);

  const startEditing = () => {
    setEditName(teacherData.name || '');
    setEditEmail(teacherData.email || '');
    setEditPhone(teacherData.phone === 'N/A' ? '' : teacherData.phone || '');
    setEditQualification(teacherData.qualification || '');
    setEditExperience(teacherData.experience || '');
    setEditSalary(teacherData.salary || 0);
    setEditStatus(teacherData.status || 'Active');
    
    setSelectedClassIds(teacherData.assignedClassIds || []);
    setSelectedSectionIds(classAssignments.map(ca => ca.sectionId));
    setSelectedSubjectIds(subjectAssignments.map(sa => sa.subjectId));
    
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editName || !editEmail) {
      alert('Name and Email are required.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/teachers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          phone: editPhone,
          qualification: editQualification,
          experience: editExperience,
          salary: editSalary,
          status: editStatus,
          assignedClassIds: selectedClassIds,
          subjectIds: selectedSubjectIds,
          classTeacherSectionIds: selectedSectionIds,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to update teacher details');
      }
      alert('Teacher details updated successfully.');
      setIsEditing(false);
      void fetchTeacher();
    } catch (err: any) {
      alert(err.message || 'An error occurred while updating profile.');
    } finally {
      setSaving(false);
    }
  };

  const toggleClassSelection = (classId: string) => {
    setSelectedClassIds(prev => 
      prev.includes(classId) ? prev.filter(id => id !== classId) : [...prev, classId]
    );
  };

  const toggleSectionSelection = (sectionId: string) => {
    setSelectedSectionIds(prev => 
      prev.includes(sectionId) ? prev.filter(id => id !== sectionId) : [...prev, sectionId]
    );
  };

  const toggleSubjectSelection = (subjectId: string) => {
    setSelectedSubjectIds(prev => 
      prev.includes(subjectId) ? prev.filter(id => id !== subjectId) : [...prev, subjectId]
    );
  };

  if (loading) return <div className="text-center py-12 text-sm text-slate-500">Loading teacher 360° profile...</div>;
  if (!teacherData) return <div className="text-center py-12 text-rose-500 text-sm">Teacher not found.</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 transition cursor-pointer">
            <ArrowLeft className="h-4.5 w-4.5 text-slate-500" />
          </button>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-300 dark:border-slate-700">
              {teacherData.profileImage ? (
                <img src={teacherData.profileImage} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <User className="h-6 w-6 text-slate-500" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{teacherData.name}</h1>
              <p className="text-xs text-slate-400 mt-1 font-mono uppercase">ID: {teacherData.teacherId} • {teacherData.qualification}</p>
            </div>
          </div>
        </div>

        {!isEditing ? (
          <button
            onClick={startEditing}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-650 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700 cursor-pointer shadow-sm"
          >
            <Edit className="h-4 w-4" /> Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 cursor-pointer shadow-sm disabled:opacity-60"
            >
              <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
            >
              <X className="h-4 w-4" /> Cancel
            </button>
          </div>
        )}
      </div>

      {!isEditing ? (
        // VIEW MODE
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Details Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <Briefcase className="h-5 w-5 text-indigo-500" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Employment Details</h3>
            </div>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between py-0.5 border-b border-slate-50 dark:border-slate-950/20 pb-2">
                <span className="text-slate-400 font-semibold">Status</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  teacherData.status === 'Active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                }`}>{teacherData.status}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-50 dark:border-slate-950/20 pb-2">
                <span className="text-slate-400 font-semibold">Email</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium font-mono">{teacherData.email}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-50 dark:border-slate-950/20 pb-2">
                <span className="text-slate-400 font-semibold">Phone</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium font-mono">{teacherData.phone}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-50 dark:border-slate-950/20 pb-2">
                <span className="text-slate-400 font-semibold">Experience</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">{teacherData.experience}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-50 dark:border-slate-950/20 pb-2">
                <span className="text-slate-400 font-semibold">Salary</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">₹{teacherData.salary}</span>
              </div>
              <div className="flex justify-between py-0.5 pb-1">
                <span className="text-slate-400 font-semibold">Joined</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{teacherData.joiningDate}</span>
              </div>
            </div>
          </div>

          {/* Class Teacher Assignments */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <Layers className="h-5 w-5 text-emerald-500" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Class Teacher Roles</h3>
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
              <p className="text-xs text-slate-450 italic py-4">Not assigned as a Class Teacher to any section.</p>
            )}
          </div>

          {/* Subject Assignments */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <BookOpen className="h-5 w-5 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Subjects Taught</h3>
            </div>
            {subjectAssignments.length > 0 ? (
              <div className="space-y-3">
                {subjectAssignments.map((sa, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="block text-sm font-black text-slate-800 dark:text-white">{sa.subjectName}</span>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">{sa.className}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 px-2 py-1 rounded-lg border border-indigo-100/50 dark:border-indigo-900/30">{sa.subjectCode}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-455 italic py-4">Not assigned to teach any specific subjects.</p>
            )}
          </div>
        </div>
      ) : (
        // EDIT MODE CONSOLE
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tab 1: Edit Basic Details */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 lg:col-span-1">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
              <Briefcase className="h-5 w-5 text-indigo-500" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Basic Information</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Qualification</label>
                <input
                  type="text"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500"
                  value={editQualification}
                  onChange={e => setEditQualification(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Experience</label>
                <input
                  type="text"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500"
                  value={editExperience}
                  onChange={e => setEditExperience(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Salary (₹)</label>
                <input
                  type="number"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500"
                  value={editSalary}
                  onChange={e => setEditSalary(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Employment Status</label>
                <select
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500"
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Resigned">Resigned</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tab 2: Reassign Class Teacher Roles */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 lg:col-span-1">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
              <Layers className="h-5 w-5 text-emerald-500" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Class Teacher Roles</h3>
            </div>

            <p className="text-[10px] text-slate-400 italic mb-2">Assign which sections this teacher oversees as Class Teacher:</p>
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {allClasses.map(cls => {
                const classSections = allSections.filter(sec => sec.classId === cls.id);
                if (classSections.length === 0) return null;
                return (
                  <div key={cls.id} className="space-y-1.5 p-3.5 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-2xl">
                    <span className="block text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">{cls.name}</span>
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      {classSections.map(sec => {
                        const isChecked = selectedSectionIds.includes(sec.id);
                        return (
                          <label 
                            key={sec.id}
                            className={`flex items-center gap-2 p-2 rounded-xl border text-[11px] font-bold cursor-pointer transition ${
                              isChecked 
                                ? 'bg-emerald-50/30 border-emerald-200 dark:bg-emerald-950/15 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400' 
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                            }`}
                          >
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSectionSelection(sec.id)}
                              className="accent-emerald-600 rounded"
                            />
                            Section {sec.name}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* General Class Assignment metric (assignedClasses list) */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
              <label className="block text-[10px] font-bold uppercase text-slate-450 tracking-wider">General Class Selection</label>
              <p className="text-[9px] text-slate-400 italic mb-2">Associate other classes this teacher handles for dashboard metric reports:</p>
              <div className="flex flex-wrap gap-1.5">
                {allClasses.map(cls => {
                  const isChecked = selectedClassIds.includes(cls.id);
                  return (
                    <button
                      key={cls.id}
                      onClick={() => toggleClassSelection(cls.id)}
                      className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold transition cursor-pointer ${
                        isChecked 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-900 dark:text-indigo-400' 
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400'
                      }`}
                    >
                      {cls.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tab 3: Reassign Subjects */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 lg:col-span-1">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
              <BookOpen className="h-5 w-5 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Subjects Taught</h3>
            </div>

            <p className="text-[10px] text-slate-400 italic mb-2">Assign which subjects this teacher handles:</p>
            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
              {allClasses.map(cls => {
                const classSubjects = allSubjects.filter(sub => sub.className === cls.name);
                if (classSubjects.length === 0) return null;
                return (
                  <div key={cls.id} className="space-y-2 p-3.5 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-2xl">
                    <span className="block text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">{cls.name}</span>
                    <div className="space-y-1.5">
                      {classSubjects.map(sub => {
                        const isChecked = selectedSubjectIds.includes(sub.id);
                        return (
                          <label 
                            key={sub.id}
                            className={`flex items-center justify-between p-2 rounded-xl border text-[11px] font-bold cursor-pointer transition ${
                              isChecked 
                                ? 'bg-amber-50/30 border-amber-200 dark:bg-amber-950/15 dark:border-amber-900/50 text-amber-700 dark:text-amber-400' 
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input 
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleSubjectSelection(sub.id)}
                                className="accent-amber-600 rounded"
                              />
                              <span>{sub.name}</span>
                            </div>
                            <span className="text-[9px] font-mono opacity-80 uppercase">{sub.code}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
