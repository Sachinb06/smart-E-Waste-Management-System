import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Package, 
  Users, 
  Download, 
  Building2, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Truck, 
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUSES = ["Pending", "Approved", "Pickup Scheduled", "Collected", "Recycled", "Cancelled"];

export default function AdminDashboardPage({ setActivePage, setSelectedTrackingCode }) {
  const { user, isAdmin } = useAuth();
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [reqs, userList, binList] = await Promise.all([
        api.getRequests(),
        api.getAdminUsers(),
        api.getIoTBins()
      ]);
      setRequests(reqs);
      setUsers(userList);
      setBins(binList);
    } catch (err) {
      console.error("Admin data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleStatusChange = async (requestId, nextStatus) => {
    setUpdatingId(requestId);
    try {
      const updated = await api.updateRequestStatus(requestId, nextStatus);
      setRequests(prev => prev.map(r => r.id === requestId ? updated : r));
    } catch (err) {
      alert("Status update failed: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.request_code.toLowerCase().includes(searchFilter.toLowerCase()) ||
      req.item_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      req.city.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            E-Waste Logistics Management
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Dispatch drivers, update collection statuses, manage centers, and export dispatch CSV logs.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <a
            href={api.getExportCsvUrl()}
            download="ewaste_collection_requests.csv"
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" /> Export Requests (CSV)
          </a>

          <button
            onClick={loadAdminData}
            className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-xs"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Admin KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400">Total Requests</span>
          <div className="text-3xl font-black text-slate-900">{requests.length}</div>
          <span className="text-[11px] text-slate-500">Across all recycling users</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400">Awaiting Dispatch</span>
          <div className="text-3xl font-black text-blue-600">
            {requests.filter(r => r.status === 'Pending' || r.status === 'Approved').length}
          </div>
          <span className="text-[11px] text-blue-700 font-semibold">Pending / Approved</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400">Registered Users</span>
          <div className="text-3xl font-black text-slate-900">{users.length}</div>
          <span className="text-[11px] text-slate-500">System accounts</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400">Recycled Completed</span>
          <div className="text-3xl font-black text-emerald-600">
            {requests.filter(r => r.status === 'Recycled').length}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold">100% material recovery</span>
        </div>
      </div>

      {/* Collection Requests Management Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Collection Requests Pipeline</h2>
            <p className="text-xs text-slate-500">Review requests and transition statuses through the 5-step workflow</p>
          </div>

          {/* Search & Status Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none"
            >
              <option value="All">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-3 px-3">Tracking ID</th>
                <th className="py-3 px-3">Item Details</th>
                <th className="py-3 px-3">Weight / Qty</th>
                <th className="py-3 px-3">Location & Phone</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Workflow Transition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredRequests.map(req => (
                <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-3">
                    <button
                      onClick={() => {
                        setSelectedTrackingCode(req.request_code);
                        setActivePage('track');
                      }}
                      className="font-mono font-bold text-emerald-700 hover:underline"
                    >
                      {req.request_code}
                    </button>
                    <span className="text-[10px] text-slate-400 block">
                      {new Date(req.created_at).toLocaleDateString()}
                    </span>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="font-bold text-slate-900 block">{req.item_name}</span>
                    <span className="text-[11px] text-slate-500">{req.category}</span>
                  </td>

                  <td className="py-3.5 px-3">
                    <span>{req.weight_kg} kg</span>
                    <span className="text-[11px] text-slate-400 block">{req.quantity} pcs</span>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="text-slate-700 block">{req.city} ({req.postal_code})</span>
                    <span className="text-[11px] text-slate-400">{req.contact_number}</span>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      req.status === 'Recycled' ? 'bg-emerald-100 text-emerald-800' :
                      req.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {req.status}
                    </span>
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3.5 px-3 text-right">
                    <select
                      value={req.status}
                      disabled={updatingId === req.id}
                      onChange={(e) => handleStatusChange(req.id, e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      {STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registered Users Directory */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" /> Registered System Users
          </h2>
          <span className="text-xs font-bold text-slate-400">{users.length} Total Users</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map(u => (
            <div key={u.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                {u.full_name?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-xs text-slate-900 truncate">{u.full_name}</div>
                <div className="text-[11px] text-slate-500 truncate">{u.email}</div>
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-md inline-block mt-0.5 ${
                  u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                }`}>
                  {u.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
