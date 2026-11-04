import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Phone, 
  Package, 
  Scale, 
  AlertTriangle, 
  ArrowRight,
  Info,
  Clock,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const EWASTE_CATEGORIES = [
  "Mobile Phones & Gadgets",
  "Computers & Accessories",
  "Batteries",
  "Cables & Chargers",
  "TVs & Monitors",
  "Other Electronic Waste"
];

const CONDITIONS = [
  "Used / Non-functional",
  "Repairable",
  "Working / Obsolete",
  "Broken / Damaged Glass",
  "Swollen / Hazardous Battery"
];

export default function CollectionRequestPage({ 
  prefillData, 
  setActivePage, 
  setSelectedTrackingCode 
}) {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    item_name: prefillData?.itemName || '',
    category: prefillData?.category || 'Mobile Phones & Gadgets',
    quantity: 1,
    weight_kg: 1.0,
    condition: prefillData?.condition || 'Used / Non-functional',
    address: '742 Evergreen Terrace',
    city: 'Metro City',
    postal_code: '10001',
    preferred_pickup_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    contact_number: user?.phone || '+1 (555) 014-9922',
    notes: '',
    detection_id: prefillData?.detectionId || null
  });

  const [submitting, setSubmitting] = useState(false);
  const [successResponse, setSuccessResponse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (prefillData) {
      setFormData(prev => ({
        ...prev,
        item_name: prefillData.itemName || prev.item_name,
        category: prefillData.category && prefillData.category !== 'Unknown / Not E-Waste' ? prefillData.category : prev.category,
        condition: prefillData.condition || prev.condition,
        detection_id: prefillData.detectionId || prev.detection_id
      }));
    }
  }, [prefillData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await api.createRequest({
        ...formData,
        quantity: parseInt(formData.quantity, 10),
        weight_kg: parseFloat(formData.weight_kg)
      });
      setSuccessResponse(res);
    } catch (err) {
      setError(err.message || "Failed to submit collection request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackCreated = () => {
    if (successResponse) {
      setSelectedTrackingCode(successResponse.request_code);
      setActivePage('track');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <Truck className="w-3.5 h-3.5" />
          <span>Doorstep E-Waste Logistics</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Schedule E-Waste Collection
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Our certified recycling logistics fleet picks up discarded electronics directly from your doorstep and guarantees non-polluting material recovery.
        </p>
      </div>

      {/* Prefill Detection Notification */}
      {prefillData?.itemName && !successResponse && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Prefilled with AI Camera Detection: <strong>{prefillData.itemName}</strong> ({prefillData.category})
            </span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
            Auto-Populated
          </span>
        </div>
      )}

      {/* Success Modal / Card */}
      {successResponse ? (
        <div className="bg-white rounded-3xl border border-emerald-200 shadow-xl p-8 text-center space-y-6 animate-in fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Collection Request Confirmed!
            </h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Your request has been logged in the Smart E-Waste system. Our recycling dispatch team has been notified.
            </p>
          </div>

          <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Unique Tracking ID</span>
            <div className="text-2xl font-black text-emerald-700 font-mono tracking-wider select-all">
              {successResponse.request_code}
            </div>
            <p className="text-[11px] text-slate-500">Save this code to check real-time status anytime.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleTrackCreated}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Track Request Live</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setSuccessResponse(null);
                setFormData(prev => ({ ...prev, item_name: '', notes: '' }));
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      ) : (
        /* The Collection Request Form */
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">
          
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Item Details */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Package className="w-4 h-4 text-emerald-600" />
              1. Item Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Item Description / Model *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dell Latitude Laptop & Power Brick"
                  value={formData.item_name}
                  onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">E-Waste Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {EWASTE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Approximate Weight (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={formData.weight_kg}
                  onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Item Condition *</label>
                <select
                  required
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {CONDITIONS.map(cond => (
                    <option key={cond} value={cond}>{cond}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* Section 2: Pickup Location & Schedule */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              2. Pickup Location & Schedule
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="Street name, apartment, building"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Postal Code *</label>
                <input
                  type="text"
                  required
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Preferred Pickup Date *</label>
                <input
                  type="date"
                  required
                  value={formData.preferred_pickup_date}
                  onChange={(e) => setFormData({ ...formData, preferred_pickup_date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Contact Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Additional Instructions / Gate Code (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Leave with security desk, batteries already taped, ring doorbell"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-emerald-600" />
              Free door-step collection provided by certified e-waste partners.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-extrabold text-sm shadow-md shadow-emerald-600/30 transition-all flex items-center gap-2"
            >
              {submitting ? "Submitting Request..." : "Confirm & Schedule Pickup"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
