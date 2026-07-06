'use client';

import React, { useState } from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';

const galleryCategories = ['All', 'Academics', 'Sports', 'Infrastructure', 'Events'];

const galleryItems = [
  {
    url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600',
    caption: 'Annual Science Exhibition 2026',
    category: 'Events',
  },
  {
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600',
    caption: 'Smart Classroom Science Lecture',
    category: 'Academics',
  },
  {
    url: 'https://images.unsplash.com/photo-1567057419565-4349c49d8a04?w=600',
    caption: 'Inter-School Football Finals',
    category: 'Sports',
  },
  {
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600',
    caption: 'Central Library Study Hall',
    category: 'Infrastructure',
  },
  {
    url: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600',
    caption: 'Computer Science Practical Lab',
    category: 'Infrastructure',
  },
  {
    url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600',
    caption: 'Kindergarten Annual Activity Meet',
    category: 'Events',
  },
  {
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600',
    caption: 'School Trek and Outdoor Campaign',
    category: 'Sports',
  },
  {
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600',
    caption: 'Administrative & Reception Block',
    category: 'Infrastructure',
  },
  {
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600',
    caption: 'Literature & Language Club Quiz',
    category: 'Academics',
  },
];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredItems =
    selectedCategory === 'All'
      ? galleryItems
      : galleryItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="py-12 md:py-16 space-y-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Campus Gallery
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-500 dark:text-slate-400">
          A visual journey through school life, sports tournaments, labs, and student activities.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center flex-wrap gap-2 px-4 max-w-7xl mx-auto">
        {galleryCategories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition cursor-pointer border ${
              selectedCategory === category
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-850'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, idx) => (
            <div
              key={idx}
              className="group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="overflow-hidden aspect-video relative">
                <img
                  src={item.url}
                  alt={item.caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                  {item.category}
                </span>
              </div>
              <div className="p-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Camera className="h-4.5 w-4.5" />
                </div>
                <p className="text-sm font-bold text-slate-850 dark:text-slate-200 line-clamp-1">
                  {item.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
