import React from 'react';
import {
  Bell,
  Volume2,
  VolumeX,
  Eye,
  Activity,
  User,
  ShieldCheck,
  Tv,
} from 'lucide-react';

interface HeaderProps {
  currentView: 'patient' | 'doctor' | 'admin' | 'display';
  setCurrentView: (view: 'patient' | 'doctor' | 'admin' | 'display') => void;
  elderlyMode: boolean;
  setElderlyMode: (mode: boolean | ((prev: boolean) => boolean)) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean | ((prev: boolean) => boolean)) => void;
  smsCount: number;
  onOpenSMS: () => void;
  onOpenStory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  elderlyMode,
  setElderlyMode,
  soundEnabled,
  setSoundEnabled,
  smsCount,
  onOpenSMS,
  onOpenStory,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#07242b] border-b border-[#0f3e46] text-white">
      {/* Accessibility Sub-bar for Elderly Patients */}
      <div className="bg-[#041a1f] px-4 py-1.5 border-b border-[#0c333a] flex flex-wrap items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-teal-300">District Civil Hospital</span>
          <span aria-hidden="true" className="text-slate-500">·</span>
          <span>Smart Queue & Waiting-Time Management</span>
          <span aria-hidden="true" className="text-slate-500">·</span>
          <span className="text-emerald-400 font-medium">OPD Live System</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenStory}
            className="text-amber-300 hover:text-amber-200 underline font-medium cursor-pointer transition-colors"
          >
            Case Study: Ramesh's 5hr Wait vs SwasthyaFlow
          </button>
          <button
            onClick={() => setElderlyMode((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
              elderlyMode
                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                : 'bg-[#0b333a] text-slate-200 hover:bg-[#11454f]'
            }`}
            title="Increase font sizes and maximize contrast for senior citizens"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{elderlyMode ? 'Elderly Mode: ON (Large Font)' : 'Elderly Mode: OFF'}</span>
          </button>
        </div>
      </div>

      {/* Main Top Bar Contract: 3 Zones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-sm font-bold text-lg">
            <Activity className="w-5 h-5 text-teal-100" />
          </div>
          <div className="flex flex-col">
            <button
              onClick={() => setCurrentView('patient')}
              className="text-xl font-bold tracking-tight text-white hover:text-teal-200 text-left transition-colors"
            >
              SWASTHYAFLOW
            </button>
            <span className="text-[11px] text-teal-300 -mt-1 font-normal tracking-wide">
              Less Waiting. Better Healthcare.
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setCurrentView('patient')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              currentView === 'patient'
                ? 'bg-teal-700/80 text-white shadow-inner font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-[#0c353d]'
            }`}
          >
            <User className="w-4 h-4 text-teal-300" />
            <span>Patient Kiosk</span>
          </button>

          <button
            onClick={() => setCurrentView('doctor')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              currentView === 'doctor'
                ? 'bg-teal-700/80 text-white shadow-inner font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-[#0c353d]'
            }`}
          >
            <Activity className="w-4 h-4 text-teal-300" />
            <span>Doctor Desk</span>
          </button>

          <button
            onClick={() => setCurrentView('admin')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              currentView === 'admin'
                ? 'bg-teal-700/80 text-white shadow-inner font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-[#0c353d]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>Admin Control</span>
          </button>

          <button
            onClick={() => setCurrentView('display')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              currentView === 'display'
                ? 'bg-teal-700/80 text-white shadow-inner font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-[#0c353d]'
            }`}
          >
            <Tv className="w-4 h-4 text-cyan-300" />
            <span className="hidden sm:inline">Waiting Hall TV</span>
            <span className="sm:hidden">Display</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Sound + SMS Simulator) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            title={soundEnabled ? 'Chime sound is active' : 'Chime sound is muted'}
            className="p-2 rounded-lg bg-[#0c353d] hover:bg-[#12424b] text-slate-200 transition-colors cursor-pointer"
            aria-label="Toggle sound announcements"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          <button
            onClick={onOpenSMS}
            className="relative flex items-center gap-1.5 px-3 py-2 bg-teal-800 hover:bg-teal-700 text-white text-xs sm:text-sm font-medium rounded-lg shadow-sm transition-colors cursor-pointer"
            title="View Real-Time SMS Notifications Stream"
          >
            <Bell className="w-4 h-4 text-amber-300" />
            <span className="hidden md:inline font-medium">SMS Alerts</span>
            {smsCount > 0 && (
              <span className="bg-amber-400 text-slate-900 font-bold px-1.5 py-0.2 rounded-full text-[10px] ml-1">
                {smsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
