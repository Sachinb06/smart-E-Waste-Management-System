import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Search, 
  Filter, 
  Phone, 
  Clock, 
  Mail, 
  Navigation, 
  Plus, 
  Trash2, 
  Building2, 
  CheckCircle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const FILTER_CATEGORIES = [
  "All",
  "Mobile Phones & Gadgets",
  "Computers & Accessories",
  "Batteries",
  "Cables & Chargers",
  "TVs & Monitors",
  "Other Electronic Waste"
];

export default function CentersLocatorPage() {
  const { isAdmin } = useAuth();
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Admin Add Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCenter, setNewCenter] = useState({
    name: '',
    address: '',
    city: '',
    postal_code: '',
    phone: '',
    email: '',
    operating_hours: 'Mon - Sat: 9:00 AM - 6:00 PM',
    accepted_categories: ['Mobile Phones & Gadgets', 'Computers & Accessories']
  });

  const loadCenters = async () => {
    setLoading(true);
    try {
      const data = await api.getCenters(searchQuery, selectedCategory);
      setCenters(data);
    } catch (err) {
      console.error("Failed to load centers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCenters();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadCenters();
  };

  const handleDeleteCenter = async (id) => {
    if (!window.confirm("Are you sure you want to delete this collection center?")) return;
    try {
      await api.deleteCenter(id);
      loadCenters();
    } catch (err) {
      alert("Failed to delete center: " + err.message);
    }
  };

  const handleCreateCenter = async (e) => {
    e.preventDefault();
    try {
      await api.createCenter(newCenter);
      setIsAddModalOpen(false);
      setNewCenter({
        name: '',
        address: '',
        city: '',
        postal_code: '',
        phone: '',
        email: '',
        operating_hours: 'Mon - Sat: 9:00 AM - 6:00 PM',
        accepted_categories: ['Mobile Phones & Gadgets', 'Computers & Accessories']
      });
      loadCenters();
    } catch (err) {
      alert("Failed to create center: " + err.message);
    }
  };

  const toggleCategorySelection = (cat) => {
    setNewCenter(prev => {
      const exists = prev.accepted_categories.includes(cat);
      return {
        ...prev,
        accepted_categories: exists 
          ? prev.accepted_categories.filter(c => c !== cat)
          : [...prev.accepted_categories, cat]
      };
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>Certified Recycling Depots</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            E-Waste Collection Centers
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            Locate verified government-authorized electronic waste drop-off stations and community recycling centers near you.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="self-start md:self-auto px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add New Center
          </button>
        )}
      </div>

      {/* Search and Category Filter Controls */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search by center name, city, street address, or zip code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shrink-0 transition-colors"
          >
            Search
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {FILTER_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Centers Grid */}
      {loading ? (
        <div className="text-center py-20">
          <p className="text-sm font-bold text-slate-500">Loading collection centers...</p>
        </div>
      ) : centers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Collection Centers Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try broadening your search term or select "All" categories to view nearby drop-off stations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {centers.map(center => (
            <div 
              key={center.id} 
              className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow p-6 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {center.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{center.address}, {center.city} {center.postal_code}</span>
                    </div>
                  </div>

                  <span className="shrink-0 text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{center.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{center.operating_hours}</span>
                  </div>
                </div>

                {/* Accepted Categories */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Accepted E-Waste Streams:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {center.accepted_categories.map((cat, idx) => (
                      <span 
                        key={idx} 
                        className="px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(center.name + ' ' + center.address + ' ' + center.city)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                  Get Directions <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                {isAdmin && (
                  <button
                    onClick={() => handleDeleteCenter(center.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete Center (Admin)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Admin Add Center Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Add New Collection Center</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateCenter} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Center Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Westside E-Waste Recovery Hub"
                  value={newCenter.name}
                  onChange={e => setNewCenter({ ...newCenter, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Street Address *</label>
                <input
                  type="text"
                  required
                  value={newCenter.address}
                  onChange={e => setNewCenter({ ...newCenter, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">City *</label>
                  <input
                    type="text"
                    required
                    value={newCenter.city}
                    onChange={e => setNewCenter({ ...newCenter, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={newCenter.postal_code}
                    onChange={e => setNewCenter({ ...newCenter, postal_code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Phone *</label>
                  <input
                    type="text"
                    required
                    value={newCenter.phone}
                    onChange={e => setNewCenter({ ...newCenter, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Operating Hours</label>
                  <input
                    type="text"
                    value={newCenter.operating_hours}
                    onChange={e => setNewCenter({ ...newCenter, operating_hours: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Accepted E-Waste Streams</label>
                <div className="grid grid-cols-2 gap-2">
                  {FILTER_CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newCenter.accepted_categories.includes(cat)}
                        onChange={() => toggleCategorySelection(cat)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-[11px] text-slate-700">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold"
                >
                  Save Center
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
