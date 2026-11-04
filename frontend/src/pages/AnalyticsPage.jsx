import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  Scale, 
  Package, 
  CheckCircle2, 
  Clock, 
  Recycle,
  Sparkles,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { api } from '../services/api';

const COLORS = [
  '#10b981', // emerald-500
  '#3b82f6', // blue-500
  '#f59e0b', // amber-500
  '#8b5cf6', // purple-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#64748b'  // slate-500
];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalyticsOverview()
      .then(res => setData(res))
      .catch(err => console.error("Analytics fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-bold text-slate-500">
        Aggregating database statistics...
      </div>
    );
  }

  const categoryData = data?.categories_breakdown || [];
  const statusData = data?.status_breakdown || [];
  const trendData = data?.monthly_trends || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* Header */}
      <div className="space-y-2 pb-6 border-b border-slate-200">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Application Analytics & Metrics</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          E-Waste Recycling Analytics
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Visualizing verified application records across AI detections, collection request statuses, cumulative materials diverted, and IoT bin volume.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Total AI Detections</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {data?.total_detections || 0}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold">Processed via YOLO Computer Vision</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Collection Requests</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {data?.total_requests || 0}
          </div>
          <span className="text-[11px] text-slate-500">
            {data?.pending_requests || 0} Pending / {data?.completed_requests || 0} Recycled
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Total Weight Diverted</span>
            <Scale className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-700">
            {data?.total_weight_kg || 0} kg
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold">Prevented from landfills</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>IoT Smart Bins</span>
            <Recycle className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {data?.active_bins_count || 4} Active
          </div>
          <span className="text-[11px] text-slate-500">Autonomous ultrasonic sensing</span>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* 1. Items Detected by Category (Donut / Pie Chart) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-600" /> E-Waste by Category
            </h3>
            <p className="text-xs text-slate-500">Distribution of items detected through the AI camera</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} items`, 'Count']}
                  contentStyle={{ borderRadius: '1rem', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Collection Requests by Status (Bar Chart) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" /> Requests by Pipeline Status
            </h3>
            <p className="text-xs text-slate-500">Live counts across the 5 recycling workflow stages</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 15, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="status" 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Monthly Trends Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" /> Monthly E-Waste Diverted (kg)
            </h3>
            <p className="text-xs text-slate-500">Cumulative weight collected over recent months</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  formatter={(val) => [`${val} kg`, 'Collected Weight']}
                  contentStyle={{ borderRadius: '1rem', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="weight_kg" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorWeight)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
