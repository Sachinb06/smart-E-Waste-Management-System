import React, { useEffect, useState } from 'react';
import { 
  Camera, 
  MapPin, 
  Truck, 
  Recycle, 
  Leaf, 
  ShieldCheck, 
  AlertOctagon, 
  TrendingUp, 
  Sparkles, 
  ArrowRight, 
  BatteryCharging, 
  Laptop, 
  Smartphone, 
  CheckCircle,
  Cpu,
  Globe2,
  Activity
} from 'lucide-react';
import { api } from '../services/api';

export default function HomePage({ setActivePage, onStartDetection }) {
  const [stats, setStats] = useState({
    total_detections: 0,
    total_requests: 0,
    total_weight_kg: 0,
    active_bins_count: 4
  });

  useEffect(() => {
    api.getAnalyticsOverview()
      .then(res => setStats(res))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-24 pb-20">

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 border-b border-emerald-100/60">
        {/* Subtle background blurs */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-green-200/30 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-bold shadow-xs">
              <Leaf className="w-4 h-4 text-emerald-600" />
              <span>Sort Today | Recycle Tomorrow | A Greener Future</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Intelligent Electronic Waste Management with{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
                Live AI Camera Detection
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Identify electronic waste instantly with computer vision, receive automated collection bin recommendations, and schedule responsible home pickups in seconds.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <button
                onClick={() => setActivePage('detect')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5"
              >
                <Camera className="w-5 h-5" />
                Start AI Detection
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActivePage('centers')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border border-slate-200 shadow-sm hover:border-emerald-300 transition-all flex items-center justify-center gap-2"
              >
                <MapPin className="w-5 h-5 text-emerald-600" />
                Find Collection Centers
              </button>

              <button
                onClick={() => setActivePage('request')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-base border border-emerald-200 transition-all flex items-center justify-center gap-2"
              >
                <Truck className="w-5 h-5 text-emerald-700" />
                Schedule E-Waste Pickup
              </button>
            </div>

            {/* Impact Highlights Bar */}
            <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
                  {stats.total_detections}
                </div>
                <div className="text-xs font-semibold text-slate-500 mt-0.5">Objects Identified</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {stats.total_requests}
                </div>
                <div className="text-xs font-semibold text-slate-500 mt-0.5">Collection Requests</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                  {stats.total_weight_kg} kg
                </div>
                <div className="text-xs font-semibold text-slate-500 mt-0.5">E-Waste Diverted</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-800">
                  {stats.active_bins_count} Bins
                </div>
                <div className="text-xs font-semibold text-slate-500 mt-0.5">IoT Monitored Hubs</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. MAIN APPLICATION WORKFLOW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-extrabold text-emerald-600 tracking-wider uppercase bg-emerald-50 px-3 py-1 rounded-full">
            Seamless 8-Step Lifecycle
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">
            How Smart E-Waste Management Works
          </h2>
          <p className="text-sm text-slate-600">
            From optical camera detection to certified material recovery, our closed-loop system ensures zero landfill contamination.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-lg mb-4">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Start Camera & Capture</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Activate your front or rear webcam. Hold any electronic item into view and click Capture or upload an image.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-lg mb-4">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">AI Inference & Detection</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              YOLO deep learning processes the image frame, drawing bounding boxes, estimating confidence, and mapping to 7 e-waste categories.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-lg mb-4">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Bin & Safety Recommendation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Immediately see the designated collection bin and essential safety instructions (e.g. hazardous battery insulation).
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-lg mb-4">
              4
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Request & Track Recycling</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Submit your doorstep collection request with prefilled classification, receive a unique tracking ID, and follow the live status.
            </p>
          </div>
        </div>
      </section>

      {/* 3. INTRODUCTION TO ELECTRONIC WASTE & THE 3 R's */}
      <section className="bg-emerald-950 text-white py-20 rounded-3xl mx-4 sm:mx-8 lg:mx-auto max-w-7xl overflow-hidden relative">
        <div className="max-w-5xl mx-auto px-6 sm:px-12 space-y-12">
          
          <div className="space-y-4 text-center">
            <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase bg-emerald-900/60 px-3.5 py-1 rounded-full border border-emerald-700/50">
              Awareness & Philosophy
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              What is Electronic Waste (E-Waste)?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Electronic waste refers to discarded electrical or electronic devices — from smartphones, laptops, and lithium batteries to household appliances. Rapid technological obsolescence makes e-waste the world's fastest-growing domestic waste stream, generating over 53 million metric tonnes annually.
            </p>
          </div>

          {/* Reduce, Reuse, Recycle */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="text-lg font-bold text-emerald-300">1. Reduce</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Extend device lifespans through maintenance, avoiding unnecessary gadget upgrades, and buying repairable, modular electronics.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                2
              </div>
              <h4 className="text-lg font-bold text-emerald-300">2. Reuse</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Donate still-functioning hardware to schools, non-profits, or refurbish old computers with lightweight OS distributions.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                3
              </div>
              <h4 className="text-lg font-bold text-emerald-300">3. Recycle</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                When devices reach end-of-life, deposit them into certified smart collection bins for non-toxic precious metal extraction.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 4. ENVIRONMENTAL IMPACTS VS BENEFITS OF RECYCLING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Environmental Impacts */}
          <div className="bg-red-50/60 border border-red-100 rounded-3xl p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-red-950">Environmental Hazards of Improper Disposal</h3>
                <p className="text-xs text-red-700">What happens when electronics end up in regular trash</p>
              </div>
            </div>

            <ul className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <span><strong>Toxic Heavy Metals:</strong> Lead from CRT screens, mercury from backlights, and cadmium from rechargeable batteries poison biological systems.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <span><strong>Groundwater Leachate:</strong> Landfilled e-waste breaks down into toxic chemical runoff that seeps into subterranean drinking water aquifers.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <span><strong>Open Burning Air Pollution:</strong> Informal scrap burning releases brominated dioxins and furans that cause severe respiratory illnesses.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <span><strong>Thermal Battery Runaway:</strong> Crushed lithium batteries in trash compactors trigger hazardous industrial fires.</span>
              </li>
            </ul>
          </div>

          {/* Benefits of Responsible Recycling */}
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-3xl p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-emerald-950">Benefits of Responsible E-Waste Recycling</h3>
                <p className="text-xs text-emerald-700">Creating a circular economy through urban mining</p>
              </div>
            </div>

            <ul className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong>Precious Metal Recovery:</strong> 1 ton of recycled smartphones contains up to 300g of pure gold — over 50x richer than gold mined from earth ore.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong>Energy & Carbon Savings:</strong> Recycling aluminum and copper consumes 85% to 95% less energy than primary ore extraction.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong>Supply Chain Security:</strong> Conserves rare earth elements (neodymium, dysprosium) needed for renewable energy and electric vehicles.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong>Regulatory Compliance:</strong> Ensures adherence to international WEEE (Waste Electrical & Electronic Equipment) environmental standards.</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* 5. SEVEN CORE CATEGORIES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase bg-emerald-50 px-3 py-1 rounded-full">
            Standardized Classification
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">
            Recognized E-Waste Categories
          </h2>
          <p className="text-xs text-slate-500">
            Our AI detector maps every scanned object to one of seven specialized recycling streams.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center hover:border-emerald-400 transition-all">
            <Smartphone className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-900">Mobile & Gadgets</h4>
            <span className="text-[10px] text-slate-400 block mt-1">Smartphones, tablets, smartwatches</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center hover:border-emerald-400 transition-all">
            <Laptop className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-900">Computers</h4>
            <span className="text-[10px] text-slate-400 block mt-1">Laptops, keyboards, motherboards</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center hover:border-emerald-400 transition-all">
            <BatteryCharging className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-900">Batteries</h4>
            <span className="text-[10px] text-slate-400 block mt-1">Li-ion, power banks, dry cells</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center hover:border-emerald-400 transition-all">
            <Cpu className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-900">Cables & Chargers</h4>
            <span className="text-[10px] text-slate-400 block mt-1">USB cords, adapters, wires</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center hover:border-emerald-400 transition-all">
            <Globe2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-900">TVs & Monitors</h4>
            <span className="text-[10px] text-slate-400 block mt-1">LED screens, CRT, displays</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center hover:border-emerald-400 transition-all">
            <Activity className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-900">Other E-Waste</h4>
            <span className="text-[10px] text-slate-400 block mt-1">Microwaves, remotes, appliances</span>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-10 rounded-3xl bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-emerald-700/20">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Recycle an Old Device?
            </h3>
            <p className="text-sm text-emerald-100 leading-relaxed">
              Point your camera at the device right now to test live AI classification and get certified safe recycling guidance.
            </p>
          </div>
          <button
            onClick={() => setActivePage('detect')}
            className="shrink-0 px-8 py-4 rounded-2xl bg-white hover:bg-slate-100 text-emerald-900 font-extrabold text-base shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Camera className="w-5 h-5 text-emerald-600" />
            Launch AI Camera Detection
          </button>
        </div>
      </section>

    </div>
  );
}
