'use client';

import React, { useMemo, useState } from 'react';
import { UserPlus, Sparkles, User, Users, MapPin, Camera } from 'lucide-react';

interface ClassOpt {
  id: string;
  name: string;
}

interface SectionOpt {
  id: string;
  name: string;
  classId: string;
}

export default function ReceptionistAdmissionsForm({
  classes,
  sections,
}: {
  classes: ClassOpt[];
  sections: SectionOpt[];
}) {
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    admissionNo: '',
    rollNo: '',
    classId: '',
    sectionId: '',
    dob: '',
    gender: 'Male',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    address: '',
    photographBase64: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const filteredSections = useMemo(
    () => sections.filter((s) => s.classId === formData.classId),
    [formData.classId, sections]
  );

  // Auto-generate helper
  const handleAutoGenerate = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const randomRoll = Math.floor(10 + Math.random() * 80);
    const shortName = formData.name.trim().toLowerCase().replace(/\s+/g, '');
    const genEmail = shortName ? `${shortName}.${randomSuffix}@excellence.edu` : `student.${randomSuffix}@excellence.edu`;

    setFormData((prev) => ({
      ...prev,
      admissionNo: `ADM-2026-${randomSuffix}`,
      rollNo: `2610A${randomRoll}`,
      email: genEmail,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === 'classId') {
        return { ...prev, classId: value, sectionId: '' };
      }
      return { ...prev, [name]: value };
    });
  };

  const handlePhotoChange = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        photographBase64: typeof reader.result === 'string' ? reader.result : '',
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/students/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Student successfully registered! Portal credentials have been created.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          admissionNo: '',
          rollNo: '',
          classId: '',
          sectionId: '',
          dob: '',
          gender: 'Male',
          parentName: '',
          parentPhone: '',
          parentEmail: '',
          address: '',
          photographBase64: '',
        });
      } else {
        alert(data.error || 'Failed to register student');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to registration pipeline.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Student Personal info */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <User className="h-4.5 w-4.5 text-indigo-650" />
          <h3 className="text-sm font-bold text-slate-850 dark:text-white uppercase tracking-wider">
            Student Personal Details
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Aarav Mehta"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              required
              value={formData.dob}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-1.5 text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs focus:outline-none"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Student Mobile (Optional)
            </label>
            <input
              type="text"
              name="phone"
              placeholder="e.g. 9876543210"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Profile Photo (Optional)
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-indigo-300 bg-indigo-50 px-3 py-2 text-xs text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/20 dark:text-indigo-300">
              <Camera className="h-4 w-4" />
              {formData.photographBase64 ? 'Photo selected' : 'Upload photo'}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoChange(e.target.files?.[0] || null)} />
            </label>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Assign Grade Class
            </label>
            <select
              name="classId"
              required
              value={formData.classId}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs focus:outline-none"
            >
              <option value="">Select Grade</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Assign Section Division
            </label>
            <select
              name="sectionId"
              required
              disabled={!formData.classId}
              value={formData.sectionId}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs focus:outline-none disabled:opacity-50"
            >
              <option value="">Select Division</option>
              {filteredSections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Credentials details */}
      <div className="space-y-4 pt-2">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-indigo-650" />
            <h3 className="text-sm font-bold text-slate-850 dark:text-white uppercase tracking-wider">
              Admission Registration Key
            </h3>
          </div>
          <button
            type="button"
            onClick={handleAutoGenerate}
            disabled={!formData.name}
            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-50 cursor-pointer"
          >
            Auto-generate registration credentials
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Admission Number
            </label>
            <input
              type="text"
              name="admissionNo"
              required
              placeholder="e.g. ADM-2026-101"
              value={formData.admissionNo}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Roll Number
            </label>
            <input
              type="text"
              name="rollNo"
              required
              placeholder="e.g. 2610A05"
              value={formData.rollNo}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Portal Username Email
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="e.g. aarav.101@excellence.edu"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. Parents Details */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Users className="h-4.5 w-4.5 text-indigo-650" />
          <h3 className="text-sm font-bold text-slate-855 dark:text-white uppercase tracking-wider">
            Parents / Guardian Contact
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Guardian Name
            </label>
            <input
              type="text"
              name="parentName"
              required
              placeholder="e.g. Vikram Mehta"
              value={formData.parentName}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Guardian Phone
            </label>
            <input
              type="text"
              name="parentPhone"
              required
              placeholder="10-digit number"
              value={formData.parentPhone}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Guardian Email (Optional)
            </label>
            <input
              type="email"
              name="parentEmail"
              placeholder="e.g. parent@mail.com"
              value={formData.parentEmail}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 4. Permanent Address */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <MapPin className="h-4.5 w-4.5 text-indigo-650" />
          <h3 className="text-sm font-bold text-slate-855 dark:text-white uppercase tracking-wider">
            Mailing Address
          </h3>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Full Address
          </label>
          <textarea
            name="address"
            required
            rows={2}
            placeholder="Mailing address details..."
            value={formData.address}
            onChange={handleInputChange}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs focus:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3 text-xs font-bold text-white shadow-md transition cursor-pointer"
      >
        <UserPlus className="h-4.5 w-4.5" />
        {submitting ? 'Registering Student...' : 'Confirm Student Admission'}
      </button>
    </form>
  );
}
