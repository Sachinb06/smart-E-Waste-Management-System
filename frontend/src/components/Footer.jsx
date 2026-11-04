import React from 'react';
import { Recycle, ShieldAlert, Heart, Phone, Mail, ArrowUpRight } from 'lucide-react';

export default function Footer({ setActivePage }) {
  return (
    <footer className="bg-forest-950 text-slate-300 pt-16 pb-12 border-t border-emerald-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Banner Alert: Safe Battery Handling */}
        <div className="mb-12 p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 to-red-950/40 border border-amber-600/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-200">Emergency Notice: Damaged or Swollen Batteries</h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Never place punctured, swollen, or smoking lithium batteries into standard bins. Store in sand and request emergency hazardous pickup.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActivePage('request')}
            className="shrink-0 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            Report Hazardous Item <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <Recycle className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg text-white">Smart E-Waste</span>
            </div>
            <p className="text-emerald-400 font-semibold text-sm">
              "Sort Today | Recycle Tomorrow | A Greener Future"
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pioneering intelligent electronic waste classification with live computer vision and ultrasonic smart IoT monitoring.
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h5 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Quick Links</h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => setActivePage('detect')} className="hover:text-emerald-400 transition-colors">
                  AI Camera Detection
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('centers')} className="hover:text-emerald-400 transition-colors">
                  Find Collection Centers
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('request')} className="hover:text-emerald-400 transition-colors">
                  Schedule E-Waste Pickup
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('track')} className="hover:text-emerald-400 transition-colors">
                  Track Recycling Status
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('iot')} className="hover:text-emerald-400 transition-colors">
                  Smart IoT Bins Monitor
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('analytics')} className="hover:text-emerald-400 transition-colors">
                  Recycling Analytics
                </button>
              </li>
            </ul>
          </div>

          {/* 7 Recognized Categories */}
          <div>
            <h5 className="text-white text-sm font-bold uppercase tracking-wider mb-4">E-Waste Categories</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Mobile Phones & Gadgets
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Computers & Accessories
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Batteries (Insulated)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Cables & Chargers
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> TVs & Monitors
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Other Electronic Waste
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h5 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Contact & Support</h5>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2.5 text-slate-300">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>E-Waste Helpline: 1800-ECO-WASTE</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>support@smart-ewaste.org</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed pt-2">
                Committed to UN Sustainable Development Goal 12: Responsible Consumption and Production.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 Smart E-Waste Management System. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Designed for a cleaner planet <Heart className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
          </p>
        </div>

      </div>
    </footer>
  );
}
