import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Package, 
  MapPin, 
  Calendar, 
  Phone, 
  Scale, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  XCircle,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import StatusTimeline from '../components/StatusTimeline';

export default function TrackRequestPage({ selectedTrackingCode, setSelectedTrackingCode }) {
  const [searchInput, setSearchInput] = useState(selectedTrackingCode || '');
  const [loading, setLoading] = useState(false);
  const [requestData, setRequestData] = useState(null);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // If passed tracking code from another page, fetch immediately
  useEffect(() => {
    if (selectedTrackingCode) {
      setSearchInput(selectedTrackingCode);
      fetchRequest(selectedTrackingCode);
    }
  }, [selectedTrackingCode]);

  const fetchRequest = async (code) => {
    if (!code || !code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.trackRequest(code.trim());
      setRequestData(data);
    } catch (err) {
      setError(err.message || "No request found with this ID.");
      setRequestData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRequest(searchInput);
  };

  const handleCancel = async () => {
    if (!requestData || requestData.status !== 'Pending') return;
    if (!window.confirm("Are you sure you want to cancel this pending collection request?")) return;

    setCancelling(true);
    try {
      const updated = await api.cancelRequest(requestData.id);
      setRequestData(updated);
    } catch (err) {
      alert(err.message || "Failed to cancel request.");
    } finally {
      setCancelling(false);
    }
  };

  // Sample quick codes for easy testing
  const sampleCodes = ['EW-20261020-A101', 'EW-20261021-B202', 'EW-20261022-C303', 'EW-20261015-D404'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <Search className="w-3.5 h-3.5" />
          <span>Real-time Tracking</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Track E-Waste Collection
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Enter your unique Request Tracking Code to view live progress through verification, driver dispatch, depot collection, and certified recycling.
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
        <div className="relative flex items-center shadow-sm rounded-2xl overflow-hidden bg-white border border-slate-300 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500">
          <div className="pl-4 text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            required
            placeholder="Enter Request ID (e.g. EW-20261020-A101)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full px-4 py-4 text-sm font-semibold text-slate-800 uppercase placeholder:normal-case focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="m-1.5 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold text-xs uppercase tracking-wider transition-colors shrink-0"
          >
            {loading ? "Searching..." : "Track Status"}
          </button>
        </div>

        {/* Quick Sample Links */}
        <div className="mt-3 flex items-center justify-center gap-2 flex-wrap text-xs text-slate-500">
          <span>Demo Tracking IDs:</span>
          {sampleCodes.map(code => (
            <button
              key={code}
              type="button"
              onClick={() => {
                setSearchInput(code);
                fetchRequest(code);
              }}
              className="text-emerald-700 font-mono font-bold hover:underline bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
            >
              {code}
            </button>
          ))}
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-bold">Lookup Failed</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Result Card */}
      {requestData && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-8 animate-in fade-in">
          
          {/* Top Overview */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Tracking Code
              </span>
              <h2 className="text-2xl font-black text-slate-900 font-mono">
                {requestData.request_code}
              </h2>
              <span className="text-xs text-slate-500">
                Created: {new Date(requestData.created_at).toLocaleDateString()}
              </span>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Current Status
              </span>
              <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wide mt-1 ${
                requestData.status === 'Recycled' 
                  ? 'bg-emerald-100 text-emerald-800'
                  : requestData.status === 'Cancelled'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {requestData.status}
              </span>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Recycling Pipeline Progress
            </h4>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
              <StatusTimeline 
                currentStatus={requestData.status} 
                updatedAt={requestData.updated_at} 
              />
            </div>
          </div>

          {/* Item & Logistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" /> Item Details
              </h4>
              <div className="space-y-1.5 text-xs text-slate-600">
                <p><strong>Item:</strong> {requestData.item_name}</p>
                <p><strong>Category:</strong> {requestData.category}</p>
                <p><strong>Quantity:</strong> {requestData.quantity} units</p>
                <p><strong>Weight:</strong> {requestData.weight_kg} kg</p>
                <p><strong>Condition:</strong> {requestData.condition}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" /> Pickup Logistics
              </h4>
              <div className="space-y-1.5 text-xs text-slate-600">
                <p><strong>Address:</strong> {requestData.address}</p>
                <p><strong>City & Postal:</strong> {requestData.city}, {requestData.postal_code}</p>
                <p><strong>Preferred Date:</strong> {requestData.preferred_pickup_date}</p>
                <p><strong>Contact Phone:</strong> {requestData.contact_number}</p>
                {requestData.notes && <p><strong>Notes:</strong> {requestData.notes}</p>}
              </div>
            </div>

          </div>

          {/* Cancellation Option for Eligible Pending Requests */}
          {requestData.status === 'Pending' && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Need to change or cancel this collection?
              </span>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors"
              >
                {cancelling ? "Cancelling..." : "Cancel Request"}
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
