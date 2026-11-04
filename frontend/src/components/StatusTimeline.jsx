import React from 'react';
import { Clock, CheckCircle2, Calendar, Truck, Recycle, XCircle } from 'lucide-react';

const STEPS = [
  { id: 'Pending', label: 'Request Submitted', icon: Clock, desc: 'Awaiting admin review' },
  { id: 'Approved', label: 'Approved', icon: CheckCircle2, desc: 'Accepted for recycling' },
  { id: 'Pickup Scheduled', label: 'Pickup Scheduled', icon: Calendar, desc: 'Driver dispatched' },
  { id: 'Collected', label: 'Collected', icon: Truck, desc: 'In transit to depot' },
  { id: 'Recycled', label: 'Safely Recycled', icon: Recycle, desc: 'Materials recovered' }
];

export default function StatusTimeline({ currentStatus, updatedAt }) {
  if (currentStatus === 'Cancelled') {
    return (
      <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3">
        <XCircle className="w-6 h-6 text-red-600 shrink-0" />
        <div>
          <h5 className="font-bold text-sm">Request Cancelled</h5>
          <p className="text-xs text-red-600 mt-0.5">This collection request was cancelled and is no longer active.</p>
        </div>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex(s => s.id === currentStatus);
  const activeIdx = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="w-full py-4">
      {/* Desktop Stepper */}
      <div className="hidden sm:grid grid-cols-5 gap-2 relative">
        {/* Connecting line */}
        <div className="absolute top-5 left-1/10 right-1/10 h-1 bg-slate-200 -z-0">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${(activeIdx / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isDone = index <= activeIdx;
          const isCurrent = index === activeIdx;

          return (
            <div key={step.id} className="flex flex-col items-center text-center relative z-10">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  isCurrent
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-md scale-110'
                    : isDone
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="mt-2.5">
                <span className={`text-xs font-bold block ${isCurrent ? 'text-emerald-800' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                  {step.label}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {step.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Stacked Stepper */}
      <div className="sm:hidden space-y-4">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isDone = index <= activeIdx;
          const isCurrent = index === activeIdx;

          return (
            <div key={step.id} className="flex items-start gap-3">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isCurrent 
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' 
                    : isDone 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 pt-0.5">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isCurrent ? 'text-emerald-800 font-extrabold' : 'text-slate-700'}`}>
                    {step.label}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
