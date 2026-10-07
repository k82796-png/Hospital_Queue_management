import React, { useState } from 'react';
import {
  User,
  Phone,
  Clock,
  Sparkles,
  ArrowRight,
  Printer,
  Volume2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building,
  HeartPulse,
  Pill,
  Activity,
  Search,
} from 'lucide-react';
import { Department, PatientToken, TokenPriority } from '../types';
import { audioService } from '../utils/audio';

interface PatientPortalProps {
  departments: Department[];
  activeToken: PatientToken | null;
  setActiveToken: (token: PatientToken | null) => void;
  onRegisterToken: (tokenData: {
    patientName: string;
    patientPhone: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    priority: TokenPriority;
    departmentId: string;
    symptoms: string;
  }) => Promise<PatientToken | null>;
  onLookupToken: (query: string) => Promise<PatientToken | null>;
  soundEnabled: boolean;
  elderlyMode: boolean;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({
  departments,
  activeToken,
  setActiveToken,
  onRegisterToken,
  onLookupToken,
  soundEnabled,
  elderlyMode,
}) => {
  const [activeTab, setActiveTab] = useState<'register' | 'view_token' | 'lookup'>(
    activeToken ? 'view_token' : 'register'
  );

  // Form State
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [priority, setPriority] = useState<TokenPriority>('normal');
  const [departmentId, setDepartmentId] = useState(
    departments[0]?.id || 'general-medicine'
  );
  const [symptoms, setSymptoms] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Lookup state
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Auto-flag elderly if age >= 60
  const handleAgeChange = (val: string) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) {
      setAge('');
    } else {
      setAge(num);
      if (num >= 60 && priority === 'normal') {
        setPriority('elderly');
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!patientName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!patientPhone.trim() || patientPhone.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number for SMS notifications.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await onRegisterToken({
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        age: Number(age) || 35,
        gender,
        priority,
        departmentId,
        symptoms: symptoms.trim() || 'General OPD consultation',
      });

      if (created) {
        if (soundEnabled) {
          audioService.announceToken(created.id, created.roomNumber, created.assignedDoctorName);
        }
        setActiveTab('view_token');
        // Reset form
        setPatientName('');
        setPatientPhone('');
        setAge('');
        setSymptoms('');
      }
    } catch {
      setErrorMsg('Failed to generate token. Please check hospital server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    if (!lookupQuery.trim()) {
      setLookupError('Please enter a Token ID (e.g. GM-127) or Mobile Number.');
      return;
    }

    setIsSearching(true);
    try {
      const found = await onLookupToken(lookupQuery.trim());
      if (found) {
        setActiveToken(found);
        setActiveTab('view_token');
      } else {
        setLookupError('No token found matching this query.');
      }
    } catch {
      setLookupError('Error finding token. Please verify the ID or phone number.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleVoiceAnnounce = () => {
    if (!activeToken) return;
    audioService.announceToken(
      activeToken.id,
      activeToken.roomNumber,
      activeToken.assignedDoctorName
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedDeptObj = departments.find((d) => d.id === departmentId);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('register')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            New Token Kiosk
          </button>
          <button
            onClick={() => setActiveTab('view_token')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'view_token'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Token Pass {activeToken ? `(${activeToken.id})` : ''}
          </button>
          <button
            onClick={() => setActiveTab('lookup')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'lookup'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Find Existing Token
          </button>
        </div>

        {/* Quick Ramesh Demo Button */}
        <button
          onClick={() => {
            onLookupToken('GM-127').then((t) => {
              if (t) {
                setActiveToken(t);
                setActiveTab('view_token');
              }
            });
          }}
          className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Load Ramesh's Token (GM-127)</span>
        </button>
      </div>

      {/* TAB 1: REGISTRATION KIOSK */}
      {activeTab === 'register' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
            <div className="mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Self-Service Token Registration
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Enter your details to generate an instant OPD digital token. You will receive real-time queue alerts via SMS.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1">
                  Patient Full Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 focus:border-transparent text-sm bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1">
                    Age <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="115"
                    required
                    value={age}
                    onChange={(e) => handleAgeChange(e.target.value)}
                    placeholder="e.g. 68"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 text-sm bg-white tabular-nums"
                  />
                  {typeof age === 'number' && age >= 60 && (
                    <span className="text-[11px] text-amber-700 font-semibold mt-1 block">
                      Senior Citizen Priority applied
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 text-sm bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1">
                    Category
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TokenPriority)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 text-sm bg-white"
                  >
                    <option value="normal">General OPD</option>
                    <option value="elderly">Elderly / Senior (60+)</option>
                    <option value="emergency">Urgent / Fast-Track</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1">
                  Mobile Number (For Live SMS Updates) <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                    <span className="text-xs text-slate-600 ml-1.5 font-mono">+91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full pl-18 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 text-sm font-mono tracking-wider bg-white"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  We send SMS when you have 2 patients ahead, and when your doctor is ready.
                </p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1">
                  Select Department <span className="text-rose-600">*</span>
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 text-sm bg-white font-medium text-slate-800"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code}) - {d.floor}
                    </option>
                  ))}
                </select>
                {selectedDeptObj && (
                  <p className="text-[11px] text-teal-800 mt-1">
                    {selectedDeptObj.description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1">
                  Chief Complaint / Symptoms
                </label>
                <textarea
                  rows={2}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. Knee discomfort, seasonal cough, medicine refill"
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 text-sm bg-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-bold text-sm sm:text-base shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Issuing Digital Token...</span>
                  ) : (
                    <>
                      <span>Generate OPD Token & Join Queue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Information & Accessibility Advice */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-[#0b333a] text-white rounded-2xl p-6 shadow-sm border border-[#13444d]">
              <div className="flex items-center gap-2.5 text-teal-300 text-xs font-semibold mb-2">
                <Building className="w-4 h-4" />
                <span>OPD Digital Queue Kiosk</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight mb-2">
                No Standing in Lines. Relax in the Waiting Hall.
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                SwasthyaFlow calculates dynamic waiting times based on real-time doctor throughput. You can freely step out for water or tea; we notify your mobile phone as your turn nears.
              </p>

              <div className="mt-5 pt-4 border-t border-teal-800/80 space-y-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="text-slate-200">Elderly & senior patients receive priority assistance</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <span className="text-slate-200">SMS updates sent automatically without smartphone requirement</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span className="text-slate-200">Direct digital transfer to Diagnostics & Pharmacy</span>
                </div>
              </div>
            </div>

            {/* Department Directory Quick Guide */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">
                Current OPD Floors
              </h3>
              <div className="space-y-2 text-xs">
                {departments.slice(0, 5).map((d) => (
                  <div key={d.id} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                    <div>
                      <span className="font-semibold text-slate-800">{d.name}</span>
                      <span className="text-slate-400 ml-2 font-mono">[{d.code}]</span>
                    </div>
                    <span className="text-slate-500 text-[11px]">{d.floor}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY DIGITAL TOKEN PASS (MATCHING SLIDE 5 & SLIDE 12!) */}
      {activeTab === 'view_token' && (
        <div>
          {activeToken ? (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* The Exact Card from Slide 5 & Slide 12: Dark Teal Canvas with Crisp White & Cyan Details */}
              <div className="bg-[#0b333a] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-[#144751] relative overflow-hidden">
                {/* Brand water kicker */}
                <div className="flex items-center justify-between border-b border-teal-800/80 pb-4 mb-6">
                  <div>
                    <span className="text-xs tracking-widest text-teal-300 font-bold uppercase">
                      SWASTHYAFLOW · DIGITAL PASS
                    </span>
                    <p className="text-[11px] text-teal-400">Government District Civil Hospital</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleVoiceAnnounce}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-700 text-teal-100 text-xs font-semibold cursor-pointer transition-colors"
                      title="Audio Announcement"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Audio Call</span>
                    </button>
                    <button
                      onClick={handlePrint}
                      className="p-1.5 rounded-lg bg-teal-800 hover:bg-teal-700 text-teal-100 transition-colors cursor-pointer"
                      title="Print Token"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Token Hero Section (Matching Slide 5 & 12) */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <span className="text-xs text-amber-300 font-medium tracking-wide">TOKEN NUMBER</span>
                      <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-mono tabular-nums elderly-token-hero">
                        {activeToken.id}
                      </h2>
                    </div>
                    {activeToken.priority === 'elderly' && (
                      <span className="bg-amber-400 text-slate-950 text-xs font-bold px-3 py-1 rounded-md">
                        Senior Citizen Care
                      </span>
                    )}
                    {activeToken.priority === 'emergency' && (
                      <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-md">
                        Emergency Priority
                      </span>
                    )}
                  </div>

                  {/* Core Details (Matching Slide 5 & 12) */}
                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-teal-800/80 text-sm">
                    <div>
                      <span className="text-slate-400 text-xs block">Department</span>
                      <span className="font-semibold text-white text-base">
                        {activeToken.departmentName}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-xs block">Doctor</span>
                      <span className="font-semibold text-teal-200 text-base">
                        {activeToken.assignedDoctorName || 'Duty Physician'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-xs block">Room / Counter</span>
                      <span className="font-extrabold text-white text-lg font-mono">
                        Room {activeToken.roomNumber}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-xs block">Patients Ahead</span>
                      <span className="font-extrabold text-amber-300 text-lg font-mono tabular-nums">
                        {activeToken.patientsAhead}
                      </span>
                    </div>
                  </div>

                  {/* Highlighted Waiting-Time Box (Matching Slide 5 & 12) */}
                  <div className="bg-[#00838f]/90 text-white rounded-2xl p-5 text-center shadow-inner">
                    <span className="text-xs uppercase tracking-wider font-semibold text-teal-100 block">
                      Estimated Wait
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono tabular-nums block my-0.5">
                      {activeToken.estimatedWaitRange}
                    </span>
                    <span className="text-xs text-teal-100 font-medium">
                      Calculated dynamically via doctor pace & queue length
                    </span>
                  </div>

                  {/* Live Status text (Matching Slide 12) */}
                  <div className="pt-2 text-center">
                    {activeToken.status === 'called' ? (
                      <div className="bg-emerald-600 text-white py-2.5 px-4 rounded-xl font-bold text-sm animate-pulse flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>PLEASE PROCEED TO ROOM {activeToken.roomNumber} NOW!</span>
                      </div>
                    ) : activeToken.status === 'in_consultation' ? (
                      <div className="bg-teal-700 text-white py-2 px-4 rounded-xl font-bold text-xs">
                        Currently In Consultation with {activeToken.assignedDoctorName}
                      </div>
                    ) : activeToken.status === 'diagnostics' ? (
                      <div className="bg-amber-600 text-white py-2 px-4 rounded-xl font-bold text-xs">
                        Proceed to Diagnostics / Radiology (Room 110)
                      </div>
                    ) : activeToken.status === 'pharmacy' ? (
                      <div className="bg-blue-600 text-white py-2 px-4 rounded-xl font-bold text-xs">
                        Proceed to Pharmacy Counter 2 to collect prescribed medicines
                      </div>
                    ) : activeToken.status === 'completed' ? (
                      <div className="bg-slate-700 text-white py-2 px-4 rounded-xl font-bold text-xs">
                        Consultation Visit Completed
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-teal-200 font-medium">
                        {activeToken.patientsAhead <= 2
                          ? 'Your turn is approaching · Please wait near Room ' + activeToken.roomNumber
                          : 'You can sit comfortably in the waiting hall · SMS will be sent when your turn approaches'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Patient Journey Flow: Registration -> Digital Token -> Doctor -> Diagnostics -> Pharmacy */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
                  Multi-Stage Journey Progress (SwasthyaFlow)
                </h3>
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 font-semibold">
                    <span className="block text-[10px] text-teal-700">Step 1</span>
                    <span>Registration</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 font-semibold">
                    <span className="block text-[10px] text-teal-700">Step 2</span>
                    <span>Token Pass</span>
                  </div>
                  <div
                    className={`p-2.5 rounded-xl border font-semibold ${
                      activeToken.stage === 'doctor' || activeToken.stage === 'diagnostics' || activeToken.stage === 'pharmacy' || activeToken.stage === 'completed'
                        ? 'bg-teal-700 text-white border-teal-800'
                        : 'bg-slate-50 text-slate-400 border-slate-200'
                    }`}
                  >
                    <span className="block text-[10px]">Step 3</span>
                    <span>Doctor</span>
                  </div>
                  <div
                    className={`p-2.5 rounded-xl border font-semibold ${
                      activeToken.stage === 'diagnostics' || activeToken.stage === 'pharmacy' || activeToken.stage === 'completed'
                        ? 'bg-amber-600 text-white border-amber-700'
                        : 'bg-slate-50 text-slate-400 border-slate-200'
                    }`}
                  >
                    <span className="block text-[10px]">Step 4</span>
                    <span>Diagnostics</span>
                  </div>
                  <div
                    className={`p-2.5 rounded-xl border font-semibold ${
                      activeToken.stage === 'pharmacy' || activeToken.stage === 'completed'
                        ? 'bg-blue-600 text-white border-blue-700'
                        : 'bg-slate-50 text-slate-400 border-slate-200'
                    }`}
                  >
                    <span className="block text-[10px]">Step 5</span>
                    <span>Pharmacy</span>
                  </div>
                </div>
              </div>

              {/* Digital Medical Record & Prescription (If generated by doctor) */}
              {activeToken.medicalRecord && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-teal-700" />
                      <h3 className="font-bold text-slate-900 text-sm">
                        Digital Clinical Record & Prescription
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Signed by {activeToken.assignedDoctorName}
                    </span>
                  </div>

                  {activeToken.medicalRecord.vitals && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Blood Pressure</span>
                        <span className="font-bold font-mono text-slate-800">
                          {activeToken.medicalRecord.vitals.bp || '120/80'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Pulse</span>
                        <span className="font-bold font-mono text-slate-800">
                          {activeToken.medicalRecord.vitals.pulse || '72 bpm'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Temperature</span>
                        <span className="font-bold font-mono text-slate-800">
                          {activeToken.medicalRecord.vitals.temp || '98.6°F'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Blood Sugar</span>
                        <span className="font-bold font-mono text-slate-800">
                          {activeToken.medicalRecord.vitals.sugar || 'Normal'}
                        </span>
                      </div>
                    </div>
                  )}

                  {activeToken.medicalRecord.diagnosis && (
                    <div>
                      <span className="text-xs font-bold text-slate-700 block mb-1">Diagnosis:</span>
                      <p className="text-xs text-slate-800 bg-teal-50/50 p-2.5 rounded-lg border border-teal-100 font-medium">
                        {activeToken.medicalRecord.diagnosis}
                      </p>
                    </div>
                  )}

                  {activeToken.medicalRecord.prescriptions && activeToken.medicalRecord.prescriptions.length > 0 && (
                    <div>
                      <span className="text-xs font-bold text-slate-700 block mb-1">
                        Prescribed Medicines (Send to Pharmacy):
                      </span>
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                        {activeToken.medicalRecord.prescriptions.map((p, idx) => (
                          <div key={idx} className="p-2.5 flex items-center justify-between bg-white">
                            <div>
                              <span className="font-bold text-teal-900">{p.medicine}</span>
                              <span className="text-slate-500 ml-2">({p.dosage})</span>
                            </div>
                            <div className="text-slate-600 text-right">
                              <span>{p.frequency}</span>
                              <span className="text-slate-400 ml-2">· {p.duration}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeToken.medicalRecord.labTests && activeToken.medicalRecord.labTests.length > 0 && (
                    <div>
                      <span className="text-xs font-bold text-slate-700 block mb-1">
                        Ordered Diagnostics / Lab Tests:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeToken.medicalRecord.labTests.map((t, idx) => (
                          <span
                            key={idx}
                            className="bg-amber-50 text-amber-900 border border-amber-200 text-xs px-2.5 py-1 rounded-md font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 max-w-lg mx-auto">
              <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Active Token Loaded</h3>
              <p className="text-xs text-slate-500 mt-1 mb-5">
                Generate a new token at the kiosk or search using your mobile number or token ID.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setActiveTab('register')}
                  className="px-4 py-2 bg-teal-800 hover:bg-teal-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Register New Token
                </button>
                <button
                  onClick={() => {
                    onLookupToken('GM-127').then((t) => {
                      if (t) {
                        setActiveToken(t);
                        setActiveTab('view_token');
                      }
                    });
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Load Ramesh (GM-127)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TOKEN SEARCH / LOOKUP */}
      {activeTab === 'lookup' && (
        <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Track Existing Token</h2>
          <p className="text-xs text-slate-500 mb-5">
            Check your current waiting status, queue position, or doctor notes.
          </p>

          {lookupError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{lookupError}</span>
            </div>
          )}

          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Enter Token Number or Mobile Number
              </label>
              <input
                type="text"
                required
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                placeholder="e.g. GM-127 or 9876543210"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 text-sm font-mono uppercase bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="w-full py-3 bg-teal-800 hover:bg-teal-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>{isSearching ? 'Searching...' : 'Find My Token'}</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Quick test tokens: </span>
            <button
              onClick={() => {
                setLookupQuery('GM-127');
                onLookupToken('GM-127').then((t) => {
                  if (t) {
                    setActiveToken(t);
                    setActiveTab('view_token');
                  }
                });
              }}
              className="text-teal-700 font-bold hover:underline ml-1 cursor-pointer font-mono"
            >
              GM-127 (Ramesh)
            </button>
            <span className="mx-1">·</span>
            <button
              onClick={() => {
                setLookupQuery('CD-102');
                onLookupToken('CD-102').then((t) => {
                  if (t) {
                    setActiveToken(t);
                    setActiveTab('view_token');
                  }
                });
              }}
              className="text-teal-700 font-bold hover:underline cursor-pointer font-mono"
            >
              CD-102 (Cardiology)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
