import React from 'react';
import { AlertTriangle, Flame, ShieldAlert } from 'lucide-react';

export default function HazardWarningBadge({ isHazard, warningText, category }) {
  if (!isHazard && !warningText) return null;

  return (
    <div className="rounded-2xl bg-red-50 border-2 border-red-200 p-4 shadow-sm animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
          <Flame className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-600 text-white tracking-wide">
              Critical Safety Protocol
            </span>
            <span className="text-xs font-bold text-red-900">
              Hazardous {category || 'Material'} Detected
            </span>
          </div>
          <p className="text-xs text-red-800 leading-relaxed font-medium">
            {warningText || 
              "This item presents a potential fire or toxicity hazard. Do NOT place inside standard bins. Tape terminals, keep in non-flammable storage, and submit a priority hazardous collection request."}
          </p>
        </div>
      </div>
    </div>
  );
}
