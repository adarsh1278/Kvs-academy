'use client';

import React, { useEffect, useState } from 'react';
import { KeyRound, Save } from 'lucide-react';

type StudentProfile = {
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  emergencyContact?: string;
};

type TeacherProfile = {
  qualification?: string;
  experience?: string;
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Profile Management</h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Manage your account details, contact information, and password.
        </p>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
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
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </section>

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
              className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-700 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              {passSaving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
