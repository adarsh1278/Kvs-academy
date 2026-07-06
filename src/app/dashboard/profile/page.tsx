'use client';

import React, { useEffect, useState } from 'react';
import { KeyRound, Save, Camera, User } from 'lucide-react';

type StudentProfile = {
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  emergencyContact?: string;
  profileImage?: string;
};

type TeacherProfile = {
  qualification?: string;
  experience?: string;
  profileImage?: string;
  subjects?: any[];
  assignedClasses?: any[];
};

type ProfilePayload = {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    status: string;
    designation?: string;
    department?: string;
  };
  studentProfile?: StudentProfile;
  teacherProfile?: TeacherProfile;
};

export default function ProfileManagementPage() {
  const [data, setData] = useState<ProfilePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passSaving, setPassSaving] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [photographBase64, setPhotographBase64] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  async function loadProfile() {
    setLoading(true);
    try {
      const res = await fetch('/api/profile');
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load profile');
      setData(json);
      setPhotographBase64('');
      setPreviewUrl('');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load profile data';
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    if (!data || saving) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: data.user.name,
        phone: data.user.phone || '',
        designation: data.user.designation || '',
        department: data.user.department || '',
      };

      if (data.user.role === 'student' && data.studentProfile) {
        payload.parentName = data.studentProfile.parentName || '';
        payload.parentPhone = data.studentProfile.parentPhone || '';
        payload.parentEmail = data.studentProfile.parentEmail || '';
        payload.emergencyContact = data.studentProfile.emergencyContact || '';
      }

      if (data.user.role === 'teacher' && data.teacherProfile) {
        payload.qualification = data.teacherProfile.qualification || '';
        payload.experience = data.teacherProfile.experience || '';
      }

      if (photographBase64) {
        payload.photographBase64 = photographBase64;
      }

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to save profile');

      alert('Profile updated successfully');
      await loadProfile();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save profile';
      alert(message);
    } finally {
      setSaving(false);
    }
  }

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (passSaving) return;

    setPassSaving(true);
    try {
      const res = await fetch('/api/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to update password');

      setOldPassword('');
      setNewPassword('');
      alert('Password changed successfully');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update password';
      alert(message);
    } finally {
      setPassSaving(false);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPhotographBase64(base64String);
      setPreviewUrl(base64String);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    void (async () => {
      await loadProfile();
    })();
  }, []);

  if (loading) {
    return <div className="text-sm text-slate-500">Loading profile...</div>;
  }

  if (!data) {
    return <div className="text-sm text-rose-500">Unable to load profile information.</div>;
  }

  const currentImageUrl = previewUrl || (data.user.role === 'student' ? data.studentProfile?.profileImage : data.teacherProfile?.profileImage) || '';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Profile Management</h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Manage your account details, contact information, and password.
        </p>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        {/* Avatar Upload */}
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative h-20 w-20 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center group shrink-0">
            {currentImageUrl ? (
              <img src={currentImageUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <User className="h-8 w-8 text-slate-350 dark:text-slate-650" />
            )}
            <label className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer">
              <Camera className="h-4.5 w-4.5" />
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-850 dark:text-white">Profile Picture</h4>
            <p className="text-[10px] text-slate-450 mt-0.5">Click image to upload. Max 2MB.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Name</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
              value={data.user.name}
              onChange={(e) => setData((p) => (p ? { ...p, user: { ...p.user, name: e.target.value } } : p))}
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Email</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs text-slate-500 outline-none dark:border-slate-800 dark:bg-slate-900"
              value={data.user.email}
              disabled
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
              value={data.user.phone || ''}
              onChange={(e) => setData((p) => (p ? { ...p, user: { ...p.user, phone: e.target.value } } : p))}
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Role</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs capitalize text-slate-500 outline-none dark:border-slate-800 dark:bg-slate-900"
              value={data.user.role.replace('_', ' ')}
              disabled
            />
          </div>

          {data.user.role === 'student' && data.studentProfile && (
            <>
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Parent Name</label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                  value={data.studentProfile.parentName || ''}
                  onChange={(e) => setData((p) => (p ? { ...p, studentProfile: { ...p.studentProfile, parentName: e.target.value } } : p))}
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Parent Phone</label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                  value={data.studentProfile.parentPhone || ''}
                  onChange={(e) => setData((p) => (p ? { ...p, studentProfile: { ...p.studentProfile, parentPhone: e.target.value } } : p))}
                />
              </div>
            </>
          )}

          {data.user.role === 'teacher' && data.teacherProfile && (
            <>
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Qualification</label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                  value={data.teacherProfile.qualification || ''}
                  onChange={(e) => setData((p) => (p ? { ...p, teacherProfile: { ...p.teacherProfile, qualification: e.target.value } } : p))}
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Experience</label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                  value={data.teacherProfile.experience || ''}
                  onChange={(e) => setData((p) => (p ? { ...p, teacherProfile: { ...p.teacherProfile, experience: e.target.value } } : p))}
                />
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={saveProfile}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-650 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60 cursor-pointer"
        >
          <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </section>

      {/* Academic Assignments (Only for Teachers) */}
      {data.user.role === 'teacher' && data.teacherProfile && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Teaching Assignments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <span className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">Assigned Classes</span>
              {data.teacherProfile.assignedClasses && data.teacherProfile.assignedClasses.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {data.teacherProfile.assignedClasses.map((cls: any, i: number) => (
                    <span key={i} className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 text-xs font-bold border border-indigo-100 dark:border-indigo-900/50">
                      {cls.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No classes assigned.</p>
              )}
            </div>

            <div className="space-y-2.5">
              <span className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">Subjects Taught</span>
              {data.teacherProfile.subjects && data.teacherProfile.subjects.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {data.teacherProfile.subjects.map((sub: any, i: number) => (
                    <span key={i} className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-100 dark:border-emerald-900/50">
                      {sub.name} ({sub.code})
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No subjects assigned.</p>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <KeyRound className="h-4 w-4" /> Change Password
        </h2>
        <form className="grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={updatePassword}>
          <input
            type="password"
            required
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
            placeholder="Current password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <input
            type="password"
            required
            minLength={6}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <div>
            <button
              type="submit"
              disabled={passSaving}
              className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-700 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white cursor-pointer"
            >
              {passSaving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
