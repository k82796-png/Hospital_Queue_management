import React from 'react';
import { X, CheckCircle2, AlertCircle, ArrowRight, Clock, MapPin, User } from 'lucide-react';

interface RameshStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrackRamesh: () => void;
}

export const RameshStoryModal: React.FC<RameshStoryModalProps> = ({
  isOpen,
  onClose,
  onTrackRamesh,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#0b333a] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-600/50 border border-teal-400 flex items-center justify-center text-white">
              <User className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">A Day in the Life: Ramesh's Visit</h2>
              <p className="text-xs text-teal-200 flex items-center gap-2">
                <span>Illustrative case study: 68-year-old patient from rural district</span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> 40 km travel</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 bg-slate-50">
          {/* Quote Banner */}
          <div className="bg-teal-900 text-teal-50 p-4 rounded-xl border border-teal-800 text-center">
            <p className="text-sm italic font-medium">
              "The problem is not the care. It is the uncertainty around it."
            </p>
            <p className="text-xs text-teal-300 mt-1">
              About 5 hours at the hospital · About 7 minutes with the doctor
            </p>
          </div>

          {/* Timeline of traditional ordeal */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-600" />
              <span>Traditional Ordeal (Before SwasthyaFlow)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-center text-xs">
              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
                <span className="font-bold text-slate-900 block">6:30 AM</span>
                <span className="text-slate-600 text-[11px]">Leaves village to beat morning rush</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
                <span className="font-bold text-slate-900 block">8:00 AM</span>
                <span className="text-slate-600 text-[11px]">Reaches hospital, joins manual queue</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
                <span className="font-bold text-slate-900 block">9:15 AM</span>
                <span className="text-slate-600 text-[11px]">Gets token 127, sits in crowded hall</span>
              </div>
              <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-lg text-rose-900">
                <span className="font-bold block">9:15 - 1:00 PM</span>
                <span className="text-[11px]">Waits 4 hours. Afraid to leave for water or toilet</span>
              </div>
              <div className="bg-teal-50 border border-teal-200 p-2.5 rounded-lg text-teal-900">
                <span className="font-bold block">1:00 PM</span>
                <span className="text-[11px]">Sees doctor for ~7 minutes</span>
              </div>
            </div>
          </div>

          {/* Side by side comparison table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-100 flex items-center justify-between">
              <span className="font-bold text-xs text-rose-800">WITHOUT SWASTHYAFLOW</span>
              <span className="font-bold text-xs text-teal-800">WITH SWASTHYAFLOW</span>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              <div className="grid grid-cols-2 p-3 gap-4">
                <div className="flex items-start gap-2 text-slate-600">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>Stands in line just to register</span>
                </div>
                <div className="flex items-start gap-2 text-slate-900 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Registers and gets a digital token at kiosk or counter</span>
                </div>
              </div>

              <div className="grid grid-cols-2 p-3 gap-4">
                <div className="flex items-start gap-2 text-slate-600">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>Cannot leave the hall; afraid of missing turn</span>
                </div>
                <div className="flex items-start gap-2 text-slate-900 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Sees live position on mobile/screen, can step out for tea or water</span>
                </div>
              </div>

              <div className="grid grid-cols-2 p-3 gap-4">
                <div className="flex items-start gap-2 text-slate-600">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>No idea when turn will come</span>
                </div>
                <div className="flex items-start gap-2 text-slate-900 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Told ~25–35 min wait, gets an SMS when turn is approaching</span>
                </div>
              </div>

              <div className="grid grid-cols-2 p-3 gap-4">
                <div className="flex items-start gap-2 text-slate-600">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>Unsure where to go after doctor consultation</span>
                </div>
                <div className="flex items-start gap-2 text-slate-900 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Guided seamlessly to Diagnostics Counter and Pharmacy with SMS pass</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with action to inspect Ramesh's actual live token */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Token GM-127 is active in our live database right now!
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onTrackRamesh();
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-800 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm"
            >
              <span>View Ramesh's Live Token (GM-127)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
