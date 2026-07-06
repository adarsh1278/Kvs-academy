'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Save, Sparkles, Phone, Plus, Trash, Image as ImageIcon, Award, Trophy, Users } from 'lucide-react';

export default function CMSPage() {
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [bannerImageBase64, setBannerImageBase64] = useState('');
  const [aboutUs, setAboutUs] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  // Toppers list state
  const [toppers, setToppers] = useState<any[]>([]);
  const [newTopperName, setNewTopperName] = useState('');
  const [newTopperScore, setNewTopperScore] = useState('');
  const [newTopperClass, setNewTopperClass] = useState('Class 12');
  const [newTopperPhotoBase64, setNewTopperPhotoBase64] = useState('');

  // Achievements list state
  const [achievements, setAchievements] = useState<any[]>([]);
  const [newAchTitle, setNewAchTitle] = useState('');
  const [newAchDesc, setNewAchDesc] = useState('');
  const [newAchYear, setNewAchYear] = useState('2026');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cms');
      const data = await res.json();
      if (data.success && data.config) {
        setHeroTitle(data.config.heroTitle || '');
        setHeroSubtitle(data.config.heroSubtitle || '');
        setBannerImage(data.config.bannerImage || '');
        setAboutUs(data.config.aboutUs || '');
        setAddress(data.config.address || '');
        setPhone(data.config.phone || '');
        setToppers(data.config.toppers || []);
        setAchievements(data.config.achievements || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // File pickers
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleTopperPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewTopperPhotoBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Add lists
  const handleAddTopper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopperName || !newTopperScore) return;

    const newTopper = {
      name: newTopperName,
      score: newTopperScore,
      className: newTopperClass,
      photograph: newTopperPhotoBase64 || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300',
      photographBase64: newTopperPhotoBase64, // Send to API for upload
    };

    setToppers([...toppers, newTopper]);
    setNewTopperName('');
    setNewTopperScore('');
    setNewTopperPhotoBase64('');
    // Reset file input
    const fileInput = document.getElementById('topper-photo-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleRemoveTopper = (index: number) => {
    setToppers(toppers.filter((_, i) => i !== index));
  };

  const handleAddAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAchTitle || !newAchDesc) return;

    const newAch = {
      title: newAchTitle,
      description: newAchDesc,
      year: newAchYear,
    };

    setAchievements([...achievements, newAch]);
    setNewAchTitle('');
    setNewAchDesc('');
  };

  const handleRemoveAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heroTitle,
          heroSubtitle,
          bannerImageBase64,
          aboutUs,
          address,
          phone,
          toppers,
          achievements,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('CMS Public Website configs updated successfully!');
        setBannerImageBase64(''); // Reset uploaded base64 since it is saved
        loadData();
      } else {
        alert(data.error || 'Failed to update CMS');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to CMS configuration endpoint.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Public Website CMS</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Modify the homepage banners, school details, board toppers lists, and academic achievements dynamically.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-400">Loading CMS configurations...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Settings Form (7 cols) */}
          <form onSubmit={handleSave} className="lg:col-span-7 space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            {/* Section 1: Hero Banner */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Layout className="h-4.5 w-4.5 text-indigo-650" />
                <h3 className="text-sm font-bold text-slate-855 dark:text-white uppercase tracking-wider">
                  Homepage Hero Banner
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Hero Heading Title
                  </label>
                  <input
                    type="text"
                    required
                    disabled={saving}
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 px-3.5 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Hero Subheading Description
                  </label>
                  <input
                    type="text"
                    required
                    disabled={saving}
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 px-3.5 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Homepage Hero Background Image
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      disabled={saving}
                      onChange={handleBannerChange}
                      className="hidden"
                      id="banner-file-input"
                    />
                    <label
                      htmlFor="banner-file-input"
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-350 cursor-pointer transition shrink-0"
                    >
                      <ImageIcon className="h-4 w-4" /> Upload Hero Photo
                    </label>
                    <div className="text-[10px] text-slate-400 truncate">
                      {bannerImageBase64 ? 'New photo selected (save to upload)' : bannerImage ? 'Current active photo loaded' : 'No photo uploaded'}
                    </div>
                  </div>
                  {(bannerImageBase64 || bannerImage) && (
                    <img
                      src={bannerImageBase64 || bannerImage}
                      alt="Banner Preview"
                      className="mt-3 h-28 w-full object-cover rounded-xl border border-slate-200 dark:border-slate-800"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: About Description */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Sparkles className="h-4.5 w-4.5 text-indigo-650" />
                <h3 className="text-sm font-bold text-slate-855 dark:text-white uppercase tracking-wider">
                  About Section Content
                </h3>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Mission Statement Paragraph
                </label>
                <textarea
                  required
                  disabled={saving}
                  rows={3}
                  value={aboutUs}
                  onChange={(e) => setAboutUs(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Section 3: Contact Info */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Phone className="h-4.5 w-4.5 text-indigo-650" />
                <h3 className="text-sm font-bold text-slate-855 dark:text-white uppercase tracking-wider">
                  Contact Us Footer Particulars
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    School Telephone Line
                  </label>
                  <input
                    type="text"
                    required
                    disabled={saving}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 px-3.5 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Mailing Postal Address
                  </label>
                  <input
                    type="text"
                    required
                    disabled={saving}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 px-3.5 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3 text-xs font-bold text-white shadow-md transition cursor-pointer disabled:opacity-50"
            >
              <Save className="h-4.5 w-4.5" />
              {saving ? 'Publishing Changes...' : 'Save CMS Configurations'}
            </button>
          </form>

          {/* Toppers & Achievements Lists (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. Toppers Board */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Users className="h-4.5 w-4.5 text-indigo-650" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Academic Board Toppers
                </h3>
              </div>

              {/* Add Topper Form */}
              <form onSubmit={handleAddTopper} className="space-y-3 p-3.5 border border-slate-100 dark:border-slate-850 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Topper Name"
                    value={newTopperName}
                    onChange={(e) => setNewTopperName(e.target.value)}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Score (e.g. 98.6%)"
                    value={newTopperScore}
                    onChange={(e) => setNewTopperScore(e.target.value)}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 items-center">
                  <select
                    value={newTopperClass}
                    onChange={(e) => setNewTopperClass(e.target.value)}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="Class 12">Class 12</option>
                    <option value="Class 10">Class 10</option>
                  </select>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleTopperPhotoChange}
                      className="hidden"
                      id="topper-photo-input"
                    />
                    <label
                      htmlFor="topper-photo-input"
                      className="block text-center rounded-lg border border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 px-2 py-1.5 text-[10px] font-semibold text-slate-700 dark:text-slate-350 cursor-pointer"
                    >
                      {newTopperPhotoBase64 ? 'Photo selected' : 'Upload Photo'}
                    </label>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-indigo-650 hover:bg-indigo-750 text-white font-bold py-1.5 text-[10px] cursor-pointer"
                >
                  <Plus className="h-3 w-3" /> Add Board Topper
                </button>
              </form>

              {/* Toppers List */}
              <div className="space-y-3 max-h-56 overflow-y-auto">
                {toppers.length === 0 ? (
                  <p className="text-[10px] text-slate-400 text-center">No toppers added yet.</p>
                ) : (
                  toppers.map((top, idx) => (
                    <div key={idx} className="flex items-center justify-between border border-slate-100 dark:border-slate-850 rounded-xl p-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={top.photograph}
                          alt={top.name}
                          className="h-10 w-10 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-800"
                        />
                        <div className="min-w-0">
                          <span className="block text-xs font-bold text-slate-900 dark:text-white truncate">{top.name}</span>
                          <span className="block text-[9px] text-slate-400 font-semibold">{top.className} • {top.score}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveTopper(idx)}
                        className="text-slate-400 hover:text-rose-500 transition p-1 cursor-pointer"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 2. Achievements Board */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Trophy className="h-4.5 w-4.5 text-indigo-650" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Achievements & Awards
                </h3>
              </div>

              {/* Add Achievement Form */}
              <form onSubmit={handleAddAchievement} className="space-y-3 p-3.5 border border-slate-100 dark:border-slate-850 rounded-2xl bg-slate-55/50 dark:bg-slate-950/20">
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Award Title"
                    value={newAchTitle}
                    onChange={(e) => setNewAchTitle(e.target.value)}
                    className="col-span-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Year"
                    value={newAchYear}
                    onChange={(e) => setNewAchYear(e.target.value)}
                    className="col-span-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs focus:outline-none"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Details Description"
                  value={newAchDesc}
                  onChange={(e) => setNewAchDesc(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-indigo-650 hover:bg-indigo-750 text-white font-bold py-1.5 text-[10px] cursor-pointer"
                >
                  <Plus className="h-3 w-3" /> Add School Award
                </button>
              </form>

              {/* Achievements List */}
              <div className="space-y-3 max-h-56 overflow-y-auto">
                {achievements.length === 0 ? (
                  <p className="text-[10px] text-slate-400 text-center">No awards added yet.</p>
                ) : (
                  achievements.map((ach, idx) => (
                    <div key={idx} className="flex items-start justify-between border border-slate-100 dark:border-slate-850 rounded-xl p-3">
                      <div className="min-w-0 space-y-1 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-750 dark:text-indigo-400 text-[8px] font-bold px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-900 shrink-0">
                            {ach.year}
                          </span>
                          <span className="block text-xs font-bold text-slate-900 dark:text-white truncate">{ach.title}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">{ach.description}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveAchievement(idx)}
                        className="text-slate-400 hover:text-rose-500 transition p-1 cursor-pointer shrink-0"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
