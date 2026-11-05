import React, { useState, useEffect } from 'react';
import { 
  User, 
  Package, 
  Clock, 
  CheckCircle2, 
  Camera, 
  ArrowRight, 
  Search, 
  XCircle, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { api, getMediaUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function UserDashboardPage({ setActivePage, setSelectedTrackingCode }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUserData = async () => {
    try {
      const [reqs, dets] = await Promise.all([
        api.getRequests(),
        api.getDetections()
      ]);
      setRequests(reqs);
      setDetections(dets);
    } catch (err) {
      console.error("Failed to load user records", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const completedCount = requests.filter(r => r.status === 'Recycled').length;

  const handleTrackCode = (code) => {
    setSelectedTrackingCode(code);
    setActivePage('track');
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this pending collection request?")) return;
    try {
      await api.cancelRequest(id);
      loadUserData();
    } catch (err) {
      alert("Failed to cancel: " + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* User Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-600 to-green-700 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md shadow-emerald-700/20">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
            Eco-Champion Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.full_name || 'E-Waste Recycler'}!
          </h1>
          <p className="text-xs text-emerald-100 max-w-lg leading-relaxed">
            Monitor your household e-waste collections, view previous AI detections, and track material recovery metrics.
          </p>
        </div>

        <button
          onClick={() => setActivePage('detect')}
          className="shrink-0 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-emerald-900 font-extrabold text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2"
        >
          <Camera className="w-4 h-4 text-emerald-600" />
          Launch AI Camera
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400">Total Requests</span>
          <div className="text-3xl font-black text-slate-900">{requests.length}</div>
          <p className="text-[11px] text-slate-500">Submitted collection requests</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400">Pending Collections</span>
          <div className="text-3xl font-black text-blue-600">{pendingCount}</div>
          <p className="text-[11px] text-slate-500">Awaiting driver pickup</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400">Safely Recycled</span>
          <div className="text-3xl font-black text-emerald-600">{completedCount}</div>
          <p className="text-[11px] text-slate-500">Materials recovered</p>
        </div>
      </div>

      {/* Active Collection Requests Table / Cards */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Your Collection Requests</h2>
            <p className="text-xs text-slate-500">Track and manage your scheduled pickups</p>
          </div>
          <button
            onClick={() => setActivePage('request')}
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
          >
            New Request <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-slate-400 text-center py-8">Loading your requests...</p>
        ) : requests.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-600">No requests submitted yet.</p>
            <button
              onClick={() => setActivePage('detect')}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold inline-block mt-2"
            >
              Start by Scanning an Item
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map(req => (
              <div 
                key={req.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-emerald-700">
                      {req.request_code}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      req.status === 'Recycled' ? 'bg-emerald-100 text-emerald-800' :
                      req.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{req.item_name}</h4>
                  <p className="text-xs text-slate-500">
                    {req.category} • {req.quantity} units ({req.weight_kg} kg) • Preferred: {req.preferred_pickup_date}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTrackCode(req.request_code)}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5 text-emerald-600" /> Track Status
                  </button>

                  {req.status === 'Pending' && (
                    <button
                      onClick={() => handleCancel(req.id)}
                      className="px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detection History */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="text-lg font-extrabold text-slate-900">Recent AI Detections</h2>
          <p className="text-xs text-slate-500">Objects scanned and classified with the camera model</p>
        </div>

        {detections.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">No detection history recorded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {detections.map(det => (
              <div key={det.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="aspect-video rounded-xl bg-slate-900 overflow-hidden relative">
                  <img
                    src={getMediaUrl(det.image_path)}
                    alt={det.detected_object}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="%2394a3b8"><text x="20" y="55" font-size="12">Captured Item</text></svg>';
                    }}
                  />
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/75 text-emerald-400 font-mono text-[10px] font-bold">
                    {(det.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 capitalize">{det.detected_object}</h4>
                  <span className="text-[11px] text-slate-500 block">{det.category}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md inline-block mt-1">
                    Bin: {det.recommended_bin}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
