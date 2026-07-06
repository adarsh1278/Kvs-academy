'use client';

import React, { useEffect, useState } from 'react';
import { Camera, CheckCircle2, Save } from 'lucide-react';

type SetupState = {
  phone: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  emergencyContact: string;
};

export default function StudentProfileSetupWizard({ initiallyOpen = false }: { initiallyOpen?: boolean }) {
  const [open, setOpen] = useState(initiallyOpen);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoBase64, setPhotoBase64] = useState('');
  const [state, setState] = useState<SetupState>({
    phone: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    emergencyContact: '',
  });

  async function loadSetupState() {
    setLoading(true);
    try {
      const res = await fetch('/api/students/setup');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load setup state');

      setState({
        phone: json.profile.phone || '',
        parentName: json.profile.parentName || '',
        parentPhone: json.profile.parentPhone || '',
        parentEmail: json.profile.parentEmail || '',
        emergencyContact: json.profile.emergencyContact || '',
      });
      setOpen(!json.isComplete);
    } catch (error: unknown) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void (async () => {
      await loadSetupState();
    })();
  }, []);

  function handlePhotoFile(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoBase64(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch('/api/students/setup', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...state,
          photographBase64: photoBase64,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to save setup details');

      alert('Profile setup completed successfully');
      setOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to save setup details';
      alert(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-xl bg-indigo-100 p-2 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Complete Your Profile Setup</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Please add your mobile number and profile photo before continuing.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Mobile Number</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
              value={state.phone}
              onChange={(e) => setState((p) => ({ ...p, phone: e.target.value }))}
              placeholder="Enter your mobile number"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Parent Name</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
              value={state.parentName}
              onChange={(e) => setState((p) => ({ ...p, parentName: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Parent Mobile</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
              value={state.parentPhone}
              onChange={(e) => setState((p) => ({ ...p, parentPhone: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Emergency Contact</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
              value={state.emergencyContact}
              onChange={(e) => setState((p) => ({ ...p, emergencyContact: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Parent Email (Optional)</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
              value={state.parentEmail}
              onChange={(e) => setState((p) => ({ ...p, parentEmail: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Profile Photo</label>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-indigo-300 bg-indigo-50 px-3 py-3 text-xs text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/20 dark:text-indigo-300">
              <Camera className="h-4 w-4" />
              {photoBase64 ? 'Photo selected' : 'Select profile photo'}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoFile(e.target.files?.[0] || null)} />
            </label>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Complete Setup'}
          </button>
        </div>
      </div>
    </div>
  );
}
