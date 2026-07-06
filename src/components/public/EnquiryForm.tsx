'use client';

import React, { useState } from 'react';
import { Send, FileCheck, AlertCircle, Camera, Upload } from 'lucide-react';

interface ClassOption {
  id: string;
  name: string;
}

export default function EnquiryForm({ classes }: { classes: ClassOption[] }) {
  const [studentName, setStudentName] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [classApplyingFor, setClassApplyingFor] = useState('');
  const [previousSchool, setPreviousSchool] = useState('');
  const [address, setAddress] = useState('');

  // File Upload base64 strings
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [docBase64, setDocBase64] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // File to Base64 converters
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'doc') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'photo') {
        setPhotoBase64(reader.result as string);
      } else {
        setDocBase64(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !parentName || !parentPhone || !dob || !classApplyingFor || !address) {
      setError('Please fill in all required fields marked with *');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          parentName,
          parentPhone,
          parentEmail,
          dob,
          gender,
          classApplyingFor,
          previousSchool,
          address,
          photographBase64: photoBase64,
          documentBase64: docBase64,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit enquiry');
      }

      setSuccess('Your enquiry has been successfully registered. Admission desk will follow up shortly.');
      // Reset form
      setStudentName('');
      setParentName('');
      setParentPhone('');
      setParentEmail('');
      setDob('');
      setGender('Male');
      setClassApplyingFor('');
      setPreviousSchool('');
      setAddress('');
      setPhotoBase64(null);
      setDocBase64(null);
    } catch (err: any) {
      setError(err.message || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12 space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
          <FileCheck className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Application Received!</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {success}
          </p>
        </div>
        <button
          onClick={() => setSuccess(null)}
          className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400 cursor-pointer"
        >
          Submit another application
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Online Enquiry Form</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Please enter the student profile details accurately. Fields with * are mandatory.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 p-4 text-sm text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid: Student Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Student Name *
          </label>
          <input
            type="text"
            required
            placeholder="John Doe"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Class Applying For *
          </label>
          <select
            required
            value={classApplyingFor}
            onChange={(e) => setClassApplyingFor(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Select Grade Level</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Date of Birth *
          </label>
          <input
            type="date"
            required
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Gender *
          </label>
          <div className="flex gap-4 pt-2">
            {['Male', 'Female', 'Other'].map((g) => (
              <label key={g} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="radio"
                  name="gender"
                  checked={gender === g}
                  onChange={() => setGender(g)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                {g}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Parents Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Parent Name *
          </label>
          <input
            type="text"
            required
            placeholder="Robert Doe"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Parent Phone Number *
          </label>
          <input
            type="tel"
            required
            placeholder="9876543210"
            value={parentPhone}
            onChange={(e) => setParentPhone(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Parent Email
          </label>
          <input
            type="email"
            placeholder="parent@example.com"
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Previous School attended
          </label>
          <input
            type="text"
            placeholder="St. Mary Public School"
            value={previousSchool}
            onChange={(e) => setPreviousSchool(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Address *
          </label>
          <input
            type="text"
            required
            placeholder="House #, Road details, City"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid: Document Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center space-y-2 relative">
          <Camera className="h-5 w-5 text-indigo-500" />
          <div>
            <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">Student Photograph</span>
            <span className="block text-[10px] text-slate-400">JPG/PNG up to 2MB</span>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'photo')}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          {photoBase64 && (
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
              ✓ Attached
            </span>
          )}
        </div>

        <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center space-y-2 relative">
          <Upload className="h-5 w-5 text-indigo-500" />
          <div>
            <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">Birth Certificate / TC</span>
            <span className="block text-[10px] text-slate-400">PDF or Image up to 2MB</span>
          </div>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => handleFileChange(e, 'doc')}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          {docBase64 && (
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
              ✓ Attached
            </span>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3 text-sm font-semibold text-white shadow-md disabled:opacity-50 transition cursor-pointer"
      >
        {loading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <>
            <Send className="h-4.5 w-4.5" />
            Submit Registration Enquiry
          </>
        )}
      </button>
    </form>
  );
}
