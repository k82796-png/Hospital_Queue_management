import React, { useState } from 'react';
import {
  User,
  Stethoscope,
  PhoneCall,
  CheckCircle2,
  Clock,
  FilePlus,
  Plus,
  Trash2,
  AlertCircle,
  Activity,
  Send,
  Pill,
  Microscope,
  RotateCcw,
} from 'lucide-react';
import { Doctor, PatientToken, PrescriptionItem, Department } from '../types';
import { audioService } from '../utils/audio';

interface DoctorDashboardProps {
  doctors: Doctor[];
  tokens: PatientToken[];
  departments: Department[];
  selectedDoctorId: string;
  onSelectDoctor: (docId: string) => void;
  onCallNextPatient: (doctorId: string) => Promise<PatientToken | null>;
  onStartConsultation: (tokenId: string, doctorId: string) => Promise<void>;
  onCompleteVisit: (params: {
    tokenId: string;
    doctorId: string;
    medicalRecord: {
      vitals?: { bp?: string; pulse?: string; temp?: string; spo2?: string; sugar?: string };
      diagnosis?: string;
      clinicalNotes?: string;
      prescriptions: PrescriptionItem[];
      labTests: string[];
      followUpDays?: number;
    };
    nextAction: 'complete' | 'refer_diagnostics' | 'refer_pharmacy';
  }) => Promise<void>;
  onUpdateDoctorStatus: (doctorId: string, status: Doctor['status']) => Promise<void>;
  soundEnabled: boolean;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  doctors,
  tokens,
  departments,
  selectedDoctorId,
  onSelectDoctor,
  onCallNextPatient,
  onStartConsultation,
  onCompleteVisit,
  onUpdateDoctorStatus,
  soundEnabled,
}) => {
  const doctor = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];

  // Active token for this doctor
  const activeToken = tokens.find(
    (t) =>
      (t.status === 'called' || t.status === 'in_consultation') &&
      (t.assignedDoctorId === doctor?.id || doctor?.currentPatientToken === t.id)
  );

  // Department waiting queue
  const departmentQueue = tokens.filter(
    (t) => t.departmentId === doctor?.departmentId && t.status === 'waiting'
  );

  // Consulted today
  const consultedList = tokens.filter(
    (t) =>
      t.assignedDoctorId === doctor?.id &&
      (t.status === 'completed' || t.status === 'diagnostics' || t.status === 'pharmacy')
  );

  // Clinical record form state
  const [bp, setBp] = useState('120/80');
  const [pulse, setPulse] = useState('74');
  const [temp, setTemp] = useState('98.4');
  const [spo2, setSpo2] = useState('98%');
  const [sugar, setSugar] = useState('110');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDays, setFollowUpDays] = useState(7);

  // Prescriptions builder
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    {
      id: 'rx-1',
      medicine: 'Paracetamol 650mg',
      dosage: '1 Tab',
      frequency: 'SOS / After Meals',
      duration: '3 days',
    },
  ]);

  // Selected Lab Tests
  const [selectedLabs, setSelectedLabs] = useState<string[]>([]);
  const commonLabs = [
    'Complete Blood Count (CBC)',
    'Blood Sugar (Fasting & PP)',
    'Lipid Profile',
    'Renal Function Test (KFT)',
    'Chest X-Ray PA View',
    'ECG (12-Lead)',
    'Urine Routine',
  ];

  const [isCalling, setIsCalling] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [activeTab, setActiveTab] = useState<'consultation' | 'queue' | 'history'>('consultation');

  const addPrescriptionRow = () => {
    setPrescriptions((prev) => [
      ...prev,
      {
        id: `rx-${Date.now()}`,
        medicine: '',
        dosage: '1 Tab',
        frequency: 'Twice daily',
        duration: '5 days',
      },
    ]);
  };

  const removePrescriptionRow = (id: string) => {
    setPrescriptions((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePrescriptionRow = (id: string, field: keyof PrescriptionItem, val: string) => {
    setPrescriptions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    );
  };

  const toggleLabTest = (test: string) => {
    setSelectedLabs((prev) =>
      prev.includes(test) ? prev.filter((t) => t !== test) : [...prev, test]
    );
  };

  const handleCallNext = async () => {
    if (!doctor) return;
    setIsCalling(true);
    try {
      const nextPat = await onCallNextPatient(doctor.id);
      if (nextPat) {
        if (soundEnabled) {
          audioService.announceToken(nextPat.id, doctor.roomNumber, doctor.name);
        }
        // Pre-fill diagnosis if patient has recorded symptoms
        if (nextPat.symptoms) {
          setNotes(`Patient presents with: ${nextPat.symptoms}`);
        }
      }
    } finally {
      setIsCalling(false);
    }
  };

  const handleStartConsult = async () => {
    if (!activeToken || !doctor) return;
    await onStartConsultation(activeToken.id, doctor.id);
  };

  const handleFinishConsultation = async (
    nextAction: 'complete' | 'refer_diagnostics' | 'refer_pharmacy'
  ) => {
    if (!activeToken || !doctor) return;
    setIsFinishing(true);
    try {
      await onCompleteVisit({
        tokenId: activeToken.id,
        doctorId: doctor.id,
        medicalRecord: {
          vitals: {
            bp,
            pulse: `${pulse} bpm`,
            temp: `${temp}°F`,
            spo2,
            sugar: `${sugar} mg/dL`,
          },
          diagnosis: diagnosis.trim() || 'General acute condition addressed',
          clinicalNotes: notes.trim(),
          prescriptions: prescriptions.filter((p) => p.medicine.trim() !== ''),
          labTests: selectedLabs,
          followUpDays,
        },
        nextAction,
      });

      // Clear record inputs
      setDiagnosis('');
      setNotes('');
      setSelectedLabs([]);
      setPrescriptions([
        {
          id: 'rx-1',
          medicine: 'Paracetamol 650mg',
          dosage: '1 Tab',
          frequency: 'After Meals',
          duration: '3 days',
        },
      ]);
    } finally {
      setIsFinishing(false);
    }
  };

  if (!doctor) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Doctor Header & Selector Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-teal-100 border-2 border-teal-600 shrink-0">
            <img
              src="/src/assets/images/doctor_portrait_1791376292497.jpg"
              alt={doctor.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to avatar icon
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{doctor.name}</h1>
              <span className="font-mono text-xs bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded">
                Room {doctor.roomNumber}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">{doctor.qualification}</p>
            <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
              <span className="font-semibold text-teal-900">{doctor.departmentName}</span>
              <span aria-hidden="true">·</span>
              <span>Today Consulted: <strong className="font-mono tabular-nums text-slate-900">{doctor.todayConsulted}</strong></span>
            </div>
          </div>
        </div>

        {/* Doctor Switcher & Room Status Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col">
            <label className="text-[11px] text-slate-500 font-medium">Switch Doctor Profile:</label>
            <select
              value={selectedDoctorId}
              onChange={(e) => onSelectDoctor(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold bg-white text-slate-800"
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} · Room {d.roomNumber} ({d.departmentName})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-[11px] text-slate-500 font-medium">Doctor Duty Status:</label>
            <select
              value={doctor.status}
              onChange={(e) => onUpdateDoctorStatus(doctor.id, e.target.value as Doctor['status'])}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer ${
                doctor.status === 'available'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : doctor.status === 'consulting'
                  ? 'bg-teal-50 text-teal-900 border-teal-300'
                  : doctor.status === 'on_break'
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              <option value="available">🟢 Available for Patients</option>
              <option value="consulting">🔵 Consulting in Room</option>
              <option value="on_break">🟡 On Short Break</option>
              <option value="offline">⚪ Off-Duty</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('consultation')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'consultation'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Consultation Desk
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'queue'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Department Queue</span>
            <span className="font-mono bg-teal-100 text-teal-900 px-1.5 py-0.2 rounded text-[11px] font-bold">
              {departmentQueue.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Consulted Records ({consultedList.length})
          </button>
        </div>

        {/* Primary Call Next Button */}
        <button
          onClick={handleCallNext}
          disabled={isCalling || departmentQueue.length === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer ${
            departmentQueue.length === 0
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-teal-800 hover:bg-teal-700 text-white'
          }`}
        >
          <PhoneCall className="w-4 h-4 text-amber-300" />
          <span>Call Next Patient</span>
          {departmentQueue.length > 0 && (
            <span className="bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded text-[11px] font-mono">
              ({departmentQueue[0].id})
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: CONSULTATION DESK */}
      {activeTab === 'consultation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Active Patient Card / Stage */}
          <div className="lg:col-span-5 space-y-4">
            {activeToken ? (
              <div className="bg-[#0b333a] text-white rounded-2xl p-6 shadow-md border border-[#144751] relative">
                <div className="flex items-center justify-between pb-3 border-b border-teal-800/80 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-teal-300 tracking-wide uppercase">
                      ACTIVE PATIENT IN ROOM
                    </span>
                    {activeToken.priority === 'elderly' && (
                      <span className="bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px]">
                        Senior 60+
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-xs text-teal-200">
                    {activeToken.status === 'called' ? '📢 Patient Called' : '🩺 In Consultation'}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <span className="text-4xl font-extrabold font-mono text-white">
                      {activeToken.id}
                    </span>
                    <h3 className="text-lg font-bold text-teal-100 mt-1">
                      {activeToken.patientName}
                    </h3>
                  </div>
                  <div className="text-right text-xs text-slate-300">
                    <span className="block font-semibold">{activeToken.age} yrs · {activeToken.gender}</span>
                    <span className="block font-mono text-slate-400 mt-0.5">+{activeToken.patientPhone}</span>
                  </div>
                </div>

                <div className="bg-[#07242b] p-3 rounded-xl border border-teal-900 text-xs mb-4">
                  <span className="text-slate-400 block text-[11px] font-medium">Chief Complaint:</span>
                  <p className="text-teal-100 font-medium mt-0.5">
                    {activeToken.symptoms || 'General OPD consultation'}
                  </p>
                </div>

                {activeToken.status === 'called' && (
                  <button
                    onClick={handleStartConsult}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Patient Entered Room · Start Consultation</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                <User className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="font-bold text-slate-800 text-sm">Room {doctor.roomNumber} is Idle</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Click 'Call Next Patient' to bring in the next waiting patient from {doctor.departmentName}.
                </p>
                <button
                  onClick={handleCallNext}
                  disabled={departmentQueue.length === 0}
                  className="px-4 py-2 bg-teal-800 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Call Next ({departmentQueue.length} Waiting)
                </button>
              </div>
            )}

            {/* Next 3 in queue preview */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Up Next in {doctor.departmentName}
              </h4>
              {departmentQueue.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">Queue is currently clear.</p>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {departmentQueue.slice(0, 3).map((item, idx) => (
                    <div key={item.id} className="py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-teal-900 bg-teal-50 px-1.5 py-0.5 rounded">
                          {item.id}
                        </span>
                        <span className="font-medium text-slate-700">{item.patientName}</span>
                      </div>
                      <span className="text-slate-400 text-[11px]">
                        {idx === 0 ? 'Next' : `~${item.estimatedWaitRange}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Medical Record & Prescriptions Editor */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FilePlus className="w-5 h-5 text-teal-700" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Clinical Record & Prescription Builder
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Auto-saves and dispatches via SMS
              </span>
            </div>

            {/* Vitals Form */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-2">
                Patient Vitals
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div>
                  <span className="text-[10px] text-slate-500 block">BP (mmHg)</span>
                  <input
                    type="text"
                    value={bp}
                    onChange={(e) => setBp(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono bg-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Pulse (bpm)</span>
                  <input
                    type="text"
                    value={pulse}
                    onChange={(e) => setPulse(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono bg-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Temp (°F)</span>
                  <input
                    type="text"
                    value={temp}
                    onChange={(e) => setTemp(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono bg-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">SpO2 (%)</span>
                  <input
                    type="text"
                    value={spo2}
                    onChange={(e) => setSpo2(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono bg-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Sugar (mg/dL)</span>
                  <input
                    type="text"
                    value={sugar}
                    onChange={(e) => setSugar(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Diagnosis */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Clinical Diagnosis
              </label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Early osteoarthritis knees / Upper respiratory tract infection"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium text-slate-800"
              />
            </div>

            {/* Clinical Notes */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Doctor's Consultation Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Advised gentle knee mobilization exercises, low-sodium diet, warm compress..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
              />
            </div>

            {/* Prescriptions Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800">
                  Prescription Medicines (Transfers directly to Pharmacy)
                </label>
                <button
                  type="button"
                  onClick={addPrescriptionRow}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Medicine</span>
                </button>
              </div>

              <div className="space-y-2">
                {prescriptions.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs"
                  >
                    <div className="col-span-4">
                      <input
                        type="text"
                        placeholder="Medicine Name (e.g. Paracetamol 650mg)"
                        value={item.medicine}
                        onChange={(e) => updatePrescriptionRow(item.id, 'medicine', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="Dosage"
                        value={item.dosage}
                        onChange={(e) => updatePrescriptionRow(item.id, 'dosage', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="Frequency (e.g. BD)"
                        value={item.frequency}
                        onChange={(e) => updatePrescriptionRow(item.id, 'frequency', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="Duration"
                        value={item.duration}
                        onChange={(e) => updatePrescriptionRow(item.id, 'duration', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => removePrescriptionRow(item.id)}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnostics Selection */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-2">
                Order Diagnostic Tests (Refer to Lab Counter)
              </label>
              <div className="flex flex-wrap gap-2">
                {commonLabs.map((lab) => {
                  const isChecked = selectedLabs.includes(lab);
                  return (
                    <button
                      type="button"
                      key={lab}
                      onClick={() => toggleLabTest(lab)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                          : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '}
                      {lab}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Completion Actions */}
            <div className="pt-4 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-800 block mb-2">
                Complete Consultation & Guide Next Step:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  disabled={!activeToken || isFinishing}
                  onClick={() => handleFinishConsultation('complete')}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Discharge / Consultation Done</span>
                </button>

                <button
                  type="button"
                  disabled={!activeToken || isFinishing}
                  onClick={() => handleFinishConsultation('refer_diagnostics')}
                  className="py-2.5 px-3 rounded-xl bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Microscope className="w-4 h-4 text-amber-200" />
                  <span>Send to Diagnostics (Lab)</span>
                </button>

                <button
                  type="button"
                  disabled={!activeToken || isFinishing}
                  onClick={() => handleFinishConsultation('refer_pharmacy')}
                  className="py-2.5 px-3 rounded-xl bg-teal-800 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Pill className="w-4 h-4 text-teal-200" />
                  <span>Send to Pharmacy Counter</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FULL DEPARTMENT QUEUE */}
      {activeTab === 'queue' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Active Waiting Queue · {doctor.departmentName}
              </h2>
              <p className="text-xs text-slate-500">
                Patients are prioritized by urgency, elderly status, and arrival order.
              </p>
            </div>
            <span className="font-mono text-xs font-bold bg-teal-50 text-teal-900 px-3 py-1.5 rounded-lg border border-teal-200">
              {departmentQueue.length} Patients in Queue
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2.5 px-3 font-semibold">Token</th>
                  <th className="py-2.5 px-3 font-semibold">Patient Name</th>
                  <th className="py-2.5 px-3 font-semibold">Age / Category</th>
                  <th className="py-2.5 px-3 font-semibold">Symptoms</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Ahead</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Est. Wait</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departmentQueue.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-teal-900">
                      {item.id}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-900">
                      {item.patientName}
                    </td>
                    <td className="py-3 px-3">
                      <span>{item.age} yrs</span>
                      {item.priority === 'elderly' && (
                        <span className="ml-2 font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">
                          Elderly
                        </span>
                      )}
                      {item.priority === 'emergency' && (
                        <span className="ml-2 font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded text-[10px]">
                          Urgent
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                      {item.symptoms}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold">
                      {item.patientsAhead}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-teal-800 font-bold">
                      {item.estimatedWaitRange}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CONSULTED TODAY RECORDS */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-4">
            Patients Consulted Today by {doctor.name}
          </h2>
          {consultedList.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              No consultations completed yet in this active session.
            </p>
          ) : (
            <div className="space-y-3">
              {consultedList.map((token) => (
                <div
                  key={token.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-teal-900 text-sm">
                        {token.id}
                      </span>
                      <span className="font-bold text-slate-800">{token.patientName}</span>
                      <span className="text-slate-500">({token.age} yrs, {token.gender})</span>
                    </div>
                    <p className="text-slate-600 mt-1">
                      <strong className="text-slate-700">Diagnosis:</strong>{' '}
                      {token.medicalRecord?.diagnosis || 'Addressed'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-slate-400 block text-[11px]">
                      {token.completedAt ? new Date(token.completedAt).toLocaleTimeString() : 'Completed'}
                    </span>
                    <span className="text-teal-700 font-medium">Stage: {token.stage}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
