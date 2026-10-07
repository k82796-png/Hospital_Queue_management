import React, { useState, useEffect } from 'react';
import { Tv, Volume2, Building, Clock, Activity, CheckCircle2 } from 'lucide-react';
import { Department, Doctor, PatientToken } from '../types';
import { audioService } from '../utils/audio';

interface PublicDisplayProps {
  departments: Department[];
  doctors: Doctor[];
  tokens: PatientToken[];
  soundEnabled: boolean;
}

export const PublicDisplay: React.FC<PublicDisplayProps> = ({
  departments,
  doctors,
  tokens,
  soundEnabled,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Actively called or consulting tokens
  const activeConsultations = doctors
    .map((doc) => {
      const activeTok = tokens.find(
        (t) =>
          (t.status === 'called' || t.status === 'in_consultation') &&
          (t.assignedDoctorId === doc.id || doc.currentPatientToken === t.id)
      );
      return {
        doctor: doc,
        token: activeTok || null,
      };
    })
    .filter((item) => item.token !== null);

  // Next 6 waiting tokens across hospital
  const upcomingTokens = tokens
    .filter((t) => t.status === 'waiting')
    .slice(0, 8);

  const handleTestAnnouncement = (tokenId: string, room: string, docName: string) => {
    audioService.announceToken(tokenId, room, docName);
  };

  return (
    <div className="bg-[#051c22] text-white min-h-[calc(100vh-4rem)] p-4 sm:p-8 space-y-6">
      {/* TV Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-teal-900/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md">
            <Building className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase font-sans">
              DISTRICT CIVIL HOSPITAL · OPD CENTRAL DISPLAY
            </h1>
            <p className="text-xs text-teal-300 font-medium">
              SwasthyaFlow Live Patient Calling & Token Status
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-xs text-teal-300 block">CURRENT TIME</span>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tabular-nums tracking-widest">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Main Calling Grid: Now Serving */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-wide text-amber-300 uppercase">
              NOW CALLING · PROCEED TO ROOM
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Please watch your token number and room assignment
          </span>
        </div>

        {activeConsultations.length === 0 ? (
          <div className="bg-[#092c35] rounded-3xl p-12 text-center border border-teal-900">
            <Activity className="w-12 h-12 text-teal-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-lg font-bold text-slate-200">OPD Waiting Session in Progress</h3>
            <p className="text-xs text-teal-300 mt-1">
              Doctors will call the next tokens shortly. Please remain seated in the hall.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeConsultations.map(({ doctor, token }) => (
              <div
                key={doctor.id}
                className="bg-[#0a313b] rounded-3xl p-6 border-2 border-teal-600 shadow-xl relative overflow-hidden"
              >
                {/* Room Banner */}
                <div className="flex items-center justify-between border-b border-teal-800/80 pb-3 mb-4">
                  <span className="text-xs font-bold text-teal-300 uppercase tracking-widest">
                    {doctor.departmentName}
                  </span>
                  <span className="bg-amber-400 text-slate-950 font-black text-sm px-3 py-0.5 rounded-lg font-mono">
                    ROOM {doctor.roomNumber}
                  </span>
                </div>

                {/* Big Token Number */}
                <div className="text-center py-3">
                  <span className="text-xs text-slate-400 uppercase font-semibold block">
                    PATIENT TOKEN
                  </span>
                  <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white block my-1">
                    {token?.id}
                  </span>
                  <span className="text-sm font-bold text-teal-200 block truncate">
                    {token?.patientName}
                  </span>
                </div>

                {/* Doctor and Status */}
                <div className="mt-4 pt-3 border-t border-teal-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">CONSULTING PHYSICIAN</span>
                    <span className="font-semibold text-white">{doctor.name}</span>
                  </div>

                  <button
                    onClick={() =>
                      handleTestAnnouncement(token!.id, doctor.roomNumber, doctor.name)
                    }
                    className="p-2 rounded-lg bg-teal-800 hover:bg-teal-700 text-teal-100 transition-colors cursor-pointer"
                    title="Audio Chime"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Up Next List across Waiting Hall */}
      <div className="bg-[#08262e] rounded-3xl p-6 border border-teal-900 shadow-md">
        <div className="flex items-center justify-between mb-4 border-b border-teal-900/80 pb-3">
          <h3 className="text-sm font-extrabold text-teal-200 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-400" />
            <span>UPCOMING PATIENTS IN QUEUE</span>
          </h3>
          <span className="text-xs text-slate-400">
            Estimated wait calculated dynamically
          </span>
        </div>

        {upcomingTokens.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No further patients waiting in the queue.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
            {upcomingTokens.map((tok) => (
              <div
                key={tok.id}
                className="bg-[#0b333a] p-3 rounded-2xl border border-teal-900/90 text-xs"
              >
                <span className="font-mono font-black text-lg text-amber-300 block">
                  {tok.id}
                </span>
                <span className="text-slate-200 font-semibold block truncate text-[11px] mt-0.5">
                  {tok.patientName}
                </span>
                <span className="text-teal-400 text-[10px] block font-mono mt-1">
                  ~{tok.estimatedWaitRange}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hospital Campus Photo Card and Accessibility Advice */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-[#07242a] rounded-3xl p-6 border border-teal-900">
        <div className="md:col-span-4 rounded-2xl overflow-hidden border border-teal-900 h-36">
          <img
            src="/src/assets/images/hospital_building_1791376280469.jpg"
            alt="District Civil Hospital"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        <div className="md:col-span-8 text-xs text-slate-300 space-y-2">
          <h4 className="text-sm font-bold text-teal-200">
            Need Help or Cannot Find Your Counter?
          </h4>
          <p className="leading-relaxed">
            Please approach the Helpdesk Counter at the main entrance. Senior citizens and persons with disabilities are entitled to priority token assistance. Water dispensers and wheelchair assistance are located near Elevator 2 on every floor.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-slate-400 pt-1">
            <span>Diagnostics & Radiology: Ground Floor (Room 110)</span>
            <span aria-hidden="true">·</span>
            <span>Hospital Pharmacy: Ground Floor Counter 2</span>
          </div>
        </div>
      </div>
    </div>
  );
};
