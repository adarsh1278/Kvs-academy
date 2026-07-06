'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, RefreshCw, Shield, UserPlus, X } from 'lucide-react';

type Role = 'super_admin' | 'admin' | 'receptionist' | 'teacher' | 'student';

type UserRow = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  status: 'active' | 'inactive';
  createdAt: string;
};

type UserDetailResponse = {
  success: boolean;
  user?: UserDetail;
  studentProfile?: StudentDetail;
  teacherProfile?: TeacherDetail;
  error?: string;
};

type UserDetail = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  designation?: string;
  department?: string;
};

type StudentDetail = {
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  emergencyContact?: string;
};

type TeacherDetail = {
  qualification?: string;
  experience?: string;
  salary?: number | string;
};

const ROLE_OPTIONS: Role[] = ['super_admin', 'admin', 'receptionist', 'teacher', 'student'];

export default function SuperAdminUsersManagerPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<UserDetailResponse | null>(null);

  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'teacher' as Role,
    status: 'active',
    password: 'Admin@123',
  });
  const [creating, setCreating] = useState(false);

  const [saveLoading, setSaveLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (q.trim()) params.set('q', q.trim());
    if (role) params.set('role', role);
    return params.toString();
  }, [page, limit, q, role]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users?${queryString}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch users');

      setUsers(data.users || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch users';
      alert(message);
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  async function loadUserDetail(userId: string) {
    setDetailLoading(true);
    setSelectedUserId(userId);
    try {
      const res = await fetch(`/api/users?userId=${userId}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch user detail');
      setDetail(data);
      setNewPassword('');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load user profile details';
      alert(message);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (creating) return;
    setCreating(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to create user');

      setCreateForm({
        name: '',
        email: '',
        phone: '',
        role: 'teacher',
        status: 'active',
        password: 'Admin@123',
      });
      await loadUsers();
      alert('User account created successfully');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create user';
      alert(message);
    } finally {
      setCreating(false);
    }
  }

  async function handleSaveDetail() {
    if (!detail?.user?._id || saveLoading) return;

    setSaveLoading(true);
    try {
      const payload: Record<string, unknown> = {
        userId: detail.user._id,
        name: detail.user.name,
        email: detail.user.email,
        phone: detail.user.phone || '',
        role: detail.user.role,
        status: detail.user.status,
        designation: detail.user.designation || '',
        department: detail.user.department || '',
      };

      if (newPassword.trim()) {
        payload.newPassword = newPassword.trim();
      }

      if (detail.user.role === 'student' && detail.studentProfile) {
        payload.parentName = detail.studentProfile.parentName || '';
        payload.parentPhone = detail.studentProfile.parentPhone || '';
        payload.parentEmail = detail.studentProfile.parentEmail || '';
        payload.emergencyContact = detail.studentProfile.emergencyContact || '';
      }

      if (detail.user.role === 'teacher' && detail.teacherProfile) {
        payload.qualification = detail.teacherProfile.qualification || '';
        payload.experience = detail.teacherProfile.experience || '';
        payload.salary = Number(detail.teacherProfile.salary || 0);
      }

      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to save profile');

      await Promise.all([loadUsers(), loadUserDetail(detail.user._id)]);
      alert('Profile updated successfully');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      alert(message);
    } finally {
      setSaveLoading(false);
    }
  }

  useEffect(() => {
    void (async () => {
      await loadUsers();
    })();
  }, [loadUsers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">User Management Control Room</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Centralized account management for students, teachers, admins, and staff with password reset and role updates.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <section className="xl:col-span-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <UserPlus className="h-4 w-4" /> Create Account
          </h2>
          <form className="space-y-3" onSubmit={handleCreateUser}>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
              placeholder="Full name"
              value={createForm.name}
              onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
              placeholder="Email"
              type="email"
              value={createForm.email}
              onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
              required
            />
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
              placeholder="Mobile number"
              value={createForm.phone}
              onChange={(e) => setCreateForm((p) => ({ ...p, phone: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                value={createForm.role}
                onChange={(e) => setCreateForm((p) => ({ ...p, role: e.target.value as Role }))}
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r.replace('_', ' ')}
                  </option>
                ))}
              </select>
              <select
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                value={createForm.status}
                onChange={(e) => setCreateForm((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
              placeholder="Temporary password"
              value={createForm.password}
              onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
            />
            <button
              type="submit"
              disabled={creating}
              className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {creating ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </section>

        <section className="xl:col-span-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                placeholder="Search by name, email, mobile"
                value={q}
                onChange={(e) => {
                  setPage(1);
                  setQ(e.target.value);
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                value={role}
                onChange={(e) => {
                  setPage(1);
                  setRole(e.target.value);
                }}
              >
                <option value="">All roles</option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r.replace('_', ' ')}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={loadUsers}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200"
              >
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 dark:border-slate-800">
                  <th className="py-2">Name</th>
                  <th className="py-2">Login ID</th>
                  <th className="py-2">Mobile</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="py-6 text-slate-400" colSpan={5}>Loading users...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td className="py-6 text-slate-400" colSpan={5}>No users found.</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr
                      key={u._id}
                      onClick={() => loadUserDetail(u._id)}
                      className="cursor-pointer border-b border-slate-100 text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/40"
                    >
                      <td className="py-3 font-bold text-slate-900 dark:text-white">{u.name}</td>
                      <td className="py-3">{u.email}</td>
                      <td className="py-3">{u.phone || 'N/A'}</td>
                      <td className="py-3 capitalize">{u.role.replace('_', ' ')}</td>
                      <td className="py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${u.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs dark:border-slate-800">
            <span className="text-slate-500">Page {page} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-xl border border-slate-200 px-3 py-1.5 font-bold text-slate-600 disabled:opacity-50 dark:border-slate-800 dark:text-slate-300"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-xl border border-slate-200 px-3 py-1.5 font-bold text-slate-600 disabled:opacity-50 dark:border-slate-800 dark:text-slate-300"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>

      {selectedUserId && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              <Shield className="h-4 w-4" /> Full Profile Editor
            </h3>
            <button
              type="button"
              onClick={() => {
                setSelectedUserId('');
                setDetail(null);
              }}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {detailLoading || !detail?.user ? (
            <p className="text-xs text-slate-400">Loading full profile...</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="space-y-2 lg:col-span-6">
                <label className="text-[10px] font-bold uppercase text-slate-400">Name</label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                  value={detail.user.name || ''}
                  onChange={(e) => setDetail((p) => (p ? { ...p, user: { ...p.user, name: e.target.value } } : p))}
                />
              </div>
              <div className="space-y-2 lg:col-span-6">
                <label className="text-[10px] font-bold uppercase text-slate-400">Email</label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                  value={detail.user.email || ''}
                  onChange={(e) => setDetail((p) => (p ? { ...p, user: { ...p.user, email: e.target.value } } : p))}
                />
              </div>
              <div className="space-y-2 lg:col-span-4">
                <label className="text-[10px] font-bold uppercase text-slate-400">Mobile</label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                  value={detail.user.phone || ''}
                  onChange={(e) => setDetail((p) => (p ? { ...p, user: { ...p.user, phone: e.target.value } } : p))}
                />
              </div>
              <div className="space-y-2 lg:col-span-4">
                <label className="text-[10px] font-bold uppercase text-slate-400">Role</label>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                  value={detail.user.role}
                  onChange={(e) => setDetail((p) => (p ? { ...p, user: { ...p.user, role: e.target.value } } : p))}
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 lg:col-span-4">
                <label className="text-[10px] font-bold uppercase text-slate-400">Status</label>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                  value={detail.user.status}
                  onChange={(e) => setDetail((p) => (p ? { ...p, user: { ...p.user, status: e.target.value } } : p))}
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </div>

              {detail.user.role === 'student' && detail.studentProfile && (
                <>
                  <div className="space-y-2 lg:col-span-6">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Parent Name</label>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                      value={detail.studentProfile.parentName || ''}
                      onChange={(e) => setDetail((p) => (p ? { ...p, studentProfile: { ...p.studentProfile, parentName: e.target.value } } : p))}
                    />
                  </div>
                  <div className="space-y-2 lg:col-span-6">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Parent Phone</label>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                      value={detail.studentProfile.parentPhone || ''}
                      onChange={(e) => setDetail((p) => (p ? { ...p, studentProfile: { ...p.studentProfile, parentPhone: e.target.value } } : p))}
                    />
                  </div>
                </>
              )}

              {detail.user.role === 'teacher' && detail.teacherProfile && (
                <>
                  <div className="space-y-2 lg:col-span-4">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Qualification</label>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                      value={detail.teacherProfile.qualification || ''}
                      onChange={(e) => setDetail((p) => (p ? { ...p, teacherProfile: { ...p.teacherProfile, qualification: e.target.value } } : p))}
                    />
                  </div>
                  <div className="space-y-2 lg:col-span-4">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Experience</label>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                      value={detail.teacherProfile.experience || ''}
                      onChange={(e) => setDetail((p) => (p ? { ...p, teacherProfile: { ...p.teacherProfile, experience: e.target.value } } : p))}
                    />
                  </div>
                  <div className="space-y-2 lg:col-span-4">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Salary</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                      value={detail.teacherProfile.salary || 0}
                      onChange={(e) => setDetail((p) => (p ? { ...p, teacherProfile: { ...p.teacherProfile, salary: e.target.value } } : p))}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2 lg:col-span-12">
                <label className="text-[10px] font-bold uppercase text-slate-400">Reset Password</label>
                <input
                  type="password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Leave empty to keep current password"
                />
              </div>

              <div className="lg:col-span-12">
                <button
                  type="button"
                  disabled={saveLoading}
                  onClick={handleSaveDetail}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saveLoading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
