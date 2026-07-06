'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface AnalyticsChartsProps {
  monthlyAdmissionData: Array<{ month: string; value: number }>;
  feeCollectionData: Array<{ label: string; collected: number; pending: number }>;
  attendanceSummary: Array<{ name: string; value: number; color: string }>;
}

export default function AnalyticsCharts({
  monthlyAdmissionData,
  feeCollectionData,
  attendanceSummary,
}: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. Fee Collection Chart (Bar) */}
      <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
            Fee Collection Summary
          </h3>
          <p className="text-[10px] text-slate-400">Class-wise collected vs pending dues</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={feeCollectionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <Legend verticalAlign="top" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
              <Bar dataKey="collected" name="Collected" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" name="Pending" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Monthly Admission Trends (Line) */}
      <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
            Admission Trends
          </h3>
          <p className="text-[10px] text-slate-400">Monthly registration volume</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyAdmissionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <Line type="monotone" dataKey="value" name="Admissions" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Today's Attendance breakdown (Pie) */}
      <div className="lg:col-span-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="space-y-3 text-center md:text-left">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
            Attendance Distribution
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Visual division of today's attendance reports compiled by teachers.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            {attendanceSummary.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 dark:text-slate-400">
                  {item.name}: <span className="font-bold text-slate-900 dark:text-white">{item.value}%</span>
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="h-44 flex justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={attendanceSummary}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
              >
                {attendanceSummary.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
