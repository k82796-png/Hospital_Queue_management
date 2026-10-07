import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  Users,
  Clock,
  Activity,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Lock,
  DoorOpen,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import {
  Department,
  Doctor,
  DepartmentMetric,
  HospitalStats,
  PatientToken,
} from '../types';

interface AdminPanelProps {
  departments: Department[];
  doctors: Doctor[];
  tokens: PatientToken[];
  departmentMetrics: DepartmentMetric[];
  hospitalStats: HospitalStats;
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (val: boolean) => void;
  onAdminLogin: (password: string) => Promise<boolean>;
  onAssignDoctor: (
    doctorId: string,
    departmentId: string,
    roomNumber: string,
    status: Doctor['status']
  ) => Promise<void>;
  onSimulateMondayRush: () => Promise<void>;
  onOpenRushCounter: () => Promise<void>;
  onResetDemo: () => Promise<void>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  departments,
  doctors,
  tokens,
  departmentMetrics,
  hospitalStats,
  isAdminLoggedIn,
  setIsAdminLoggedIn,
  onAdminLogin,
  onAssignDoctor,
  onSimulateMondayRush,
  onOpenRushCounter,
  onResetDemo,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Selected doctor modal for assignment
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [assignDeptId, setAssignDeptId] = useState('');
  const [assignRoom, setAssignRoom] = useState('');
  const [assignStatus, setAssignStatus] = useState<Doctor['status']>('available');
  const [isSavingAssign, setIsSavingAssign] = useState(false);

  // Simulation notification banner
  const [simulationNotice, setSimulationNotice] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const ok = await onAdminLogin(passwordInput);
      if (ok) {
        setIsAdminLoggedIn(true);
        setPasswordInput('');
      } else {
        setLoginError('Invalid password. Default password is 1234');
      }
    } catch {
      setLoginError('Authentication service unreachable');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleOpenAssignModal = (doc: Doctor) => {
    setEditingDoctor(doc);
    setAssignDeptId(doc.departmentId);
    setAssignRoom(doc.roomNumber);
    setAssignStatus(doc.status);
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;
    setIsSavingAssign(true);
    try {
      await onAssignDoctor(editingDoctor.id, assignDeptId, assignRoom, assignStatus);
      setEditingDoctor(null);
      setSimulationNotice(`Updated assignment for ${editingDoctor.name}.`);
    } finally {
      setIsSavingAssign(false);
    }
  };

  const handleTriggerSurge = async () => {
    await onSimulateMondayRush();
    setSimulationNotice(
      'Monday morning rush simulated! General Medicine flagged with High load. Test opening Counter 3!'
    );
  };

  const handleResolveSurge = async () => {
    await onOpenRushCounter();
    setSimulationNotice(
      'Counter 3 (Room 201) activated under Dr. Alok Gupta! Doctor capacity +50%, average wait dropped.'
    );
  };

  // If not logged in, show Password gate (password 1234)
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-1">
            Hospital Administration Access
          </h1>
          <p className="text-xs text-slate-500 mb-6">
            Authorized hospital superintendents and department heads only.
          </p>

          {loginError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Admin Password
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password (1234)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 text-sm font-mono bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-teal-800 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              {isLoggingIn ? 'Authenticating...' : 'Sign In to Admin Command'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
            <span>Passcode:</span>
            <button
              onClick={() => setPasswordInput('1234')}
              className="font-mono font-bold text-teal-700 hover:underline cursor-pointer bg-teal-50 px-2 py-0.5 rounded border border-teal-200"
            >
              Click to use: 1234
            </button>
          </div>
        </div>
      </div>
    );
  }

  // General Medicine metric check for Monday rush
  const gmMetric = departmentMetrics.find((m) => m.departmentId === 'general-medicine');
  const isHighRushInGM = gmMetric?.queueStatus === 'High';
  const isCounter3Active = doctors.find((d) => d.id === 'doc-8')?.status === 'available';

  // Multi-stage flow counts
  const stageCounts = {
    registration: tokens.filter((t) => t.stage === 'registration').length,
    waiting: tokens.filter((t) => t.status === 'waiting').length,
    consultation: tokens.filter((t) => t.status === 'in_consultation' || t.status === 'called').length,
    diagnostics: tokens.filter((t) => t.status === 'diagnostics').length,
    pharmacy: tokens.filter((t) => t.status === 'pharmacy').length,
    completed: tokens.filter((t) => t.status === 'completed').length + 54,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner: Department Overview & Logout */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h1 className="text-xl font-bold text-slate-900">
              Department-Wide Traffic Command
            </h1>
            <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded font-mono">
              Admin Mode
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time patient queues, doctor allocations, and bottleneck resolution.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onResetDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            title="Reset system to clean initial state"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
          <button
            onClick={() => setIsAdminLoggedIn(false)}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
          >
            Lock Panel
          </button>
        </div>
      </div>

      {/* Hospital Key Health Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Total Patients Waiting</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tabular-nums">
              {hospitalStats.totalWaitingCurrently}
            </span>
            <span className="text-xs font-semibold text-teal-800">Hospital-wide</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Doctors On-Duty</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tabular-nums">
              {hospitalStats.totalActiveDoctors}
            </span>
            <span className="text-xs text-slate-500">Across {departments.length} Depts</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Avg Hospital Wait Time</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-teal-900 tabular-nums">
              {hospitalStats.averageHospitalWaitMins}m
            </span>
            <span className="text-xs text-teal-700 font-medium">Dynamic estimate</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Bottleneck Alert Status</span>
          <div className="flex items-baseline justify-between mt-1">
            <span
              className={`text-base sm:text-lg font-bold ${
                isHighRushInGM ? 'text-rose-600' : 'text-emerald-700'
              }`}
            >
              {isHighRushInGM ? 'Surge Detected' : 'Normal Traffic'}
            </span>
            <span className="text-[11px] text-slate-400">
              {isHighRushInGM ? 'Action Needed' : 'Flow Steady'}
            </span>
          </div>
        </div>
      </div>

      {/* Real Scenario Banner: Monday Morning Rush (Slides 14 & 15!) */}
      <div
        className={`rounded-2xl p-5 border transition-all ${
          isHighRushInGM
            ? 'bg-amber-50/80 border-amber-300'
            : 'bg-teal-900 text-white border-teal-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles
                className={`w-4 h-4 ${isHighRushInGM ? 'text-amber-600' : 'text-amber-300'}`}
              />
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isHighRushInGM ? 'text-amber-900' : 'text-teal-200'
                }`}
              >
                Interactive Case: The Monday Morning Rush (Slide 14 & 15)
              </span>
            </div>
            <p
              className={`text-xs sm:text-sm font-medium ${
                isHighRushInGM ? 'text-slate-800' : 'text-slate-200'
              }`}
            >
              {isHighRushInGM
                ? 'General Medicine currently has high load with rising wait times. Resolve bottleneck by opening Counter 3 (Room 201) under Dr. Alok Gupta!'
                : 'Test the bottleneck scenario where General Medicine surges with 8 additional rural/elderly patients.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {!isHighRushInGM ? (
              <button
                onClick={handleTriggerSurge}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Simulate Monday Rush Surge
              </button>
            ) : !isCounter3Active ? (
              <button
                onClick={handleResolveSurge}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <DoorOpen className="w-4 h-4 text-emerald-200" />
                <span>Open Counter 3 (Room 201) & Resolve Rush</span>
              </button>
            ) : (
              <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold px-3 py-1.5 rounded-xl">
                ✓ Counter 3 Activated · Queue Balanced
              </span>
            )}
          </div>
        </div>

        {simulationNotice && (
          <div className="mt-3 pt-3 border-t border-slate-200/40 text-xs font-semibold flex items-center gap-1.5 text-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{simulationNotice}</span>
          </div>
        )}
      </div>

      {/* Multi-Stage Patient Flow Pipeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
          Hospital-Wide Patient Flow Pipeline (Slide 2 & 7)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
            <span className="text-[11px] text-slate-500 block">Waiting in Token Queue</span>
            <span className="text-xl font-bold font-mono text-slate-900 block mt-0.5">
              {stageCounts.waiting}
            </span>
          </div>

          <div className="bg-teal-50 border border-teal-200 p-3 rounded-xl">
            <span className="text-[11px] text-teal-800 block">In Doctor Consultation</span>
            <span className="text-xl font-bold font-mono text-teal-900 block mt-0.5">
              {stageCounts.consultation}
            </span>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
            <span className="text-[11px] text-amber-800 block">At Diagnostics / Labs</span>
            <span className="text-xl font-bold font-mono text-amber-900 block mt-0.5">
              {stageCounts.diagnostics}
            </span>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl">
            <span className="text-[11px] text-blue-800 block">At Pharmacy Dispensing</span>
            <span className="text-xl font-bold font-mono text-blue-900 block mt-0.5">
              {stageCounts.pharmacy}
            </span>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
            <span className="text-[11px] text-emerald-800 block">Discharged / Completed</span>
            <span className="text-xl font-bold font-mono text-emerald-900 block mt-0.5">
              {stageCounts.completed}
            </span>
          </div>
        </div>
      </div>

      {/* Department-Wide Patient Traffic Efficiency Grid (Slide 13 & 15) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Department Patient Traffic & Wait Time Grid
            </h2>
            <p className="text-xs text-slate-500">
              Monitor queue rush levels, live tokens, and allocate doctor capacity.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {departmentMetrics.map((dm) => (
            <div
              key={dm.departmentId}
              className={`rounded-2xl p-4 border transition-all ${
                dm.queueStatus === 'High'
                  ? 'bg-rose-50/70 border-rose-300'
                  : dm.queueStatus === 'Moderate'
                  ? 'bg-amber-50/50 border-amber-200'
                  : 'bg-slate-50/60 border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{dm.name}</h3>
                  <span className="font-mono text-[11px] text-slate-500 font-bold">
                    [{dm.code}]
                  </span>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    dm.queueStatus === 'High'
                      ? 'bg-rose-600 text-white'
                      : dm.queueStatus === 'Moderate'
                      ? 'bg-amber-500 text-white'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {dm.queueStatus} Rush
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-200/60 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Waiting</span>
                  <span className="font-bold font-mono text-slate-900 text-base">
                    {dm.waitingCount}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block">Current Serving</span>
                  <span className="font-bold font-mono text-teal-800 text-base">
                    {dm.currentServingToken || 'None'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block">Avg Wait</span>
                  <span className="font-bold font-mono text-slate-800">
                    {dm.avgWaitMins} min
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block">Doctors On-Duty</span>
                  <span className="font-bold font-mono text-slate-800">
                    {dm.activeDoctorsCount} / {dm.totalDoctorsCount}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Rooms: {dm.activeRooms.join(', ') || 'None'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Doctor Allocation & Counter Management */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Doctor Roster & Room Counter Assignments
            </h2>
            <p className="text-xs text-slate-500">
              Assign doctors to rooms, change department allocations, and open rush counters.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2.5 px-3 font-semibold">Doctor Name</th>
                <th className="py-2.5 px-3 font-semibold">Department</th>
                <th className="py-2.5 px-3 font-semibold">Room / Counter</th>
                <th className="py-2.5 px-3 font-semibold">Duty Status</th>
                <th className="py-2.5 px-3 font-semibold">Consulted Today</th>
                <th className="py-2.5 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {doctors.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {doc.name}
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">
                    {doc.departmentName}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-teal-900">
                    Room {doc.roomNumber}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`font-semibold text-[11px] px-2 py-0.5 rounded ${
                        doc.status === 'available'
                          ? 'bg-emerald-50 text-emerald-800'
                          : doc.status === 'consulting'
                          ? 'bg-teal-50 text-teal-800'
                          : doc.status === 'on_break'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {doc.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono tabular-nums text-slate-700">
                    {doc.todayConsulted}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleOpenAssignModal(doc)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-[11px] cursor-pointer transition-colors"
                    >
                      Reassign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reassign Doctor Modal */}
      {editingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Reassign {editingDoctor.name}
            </h3>

            <form onSubmit={handleSaveAssignment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Department
                </label>
                <select
                  value={assignDeptId}
                  onChange={(e) => setAssignDeptId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Room / Counter Number
                </label>
                <input
                  type="text"
                  required
                  value={assignRoom}
                  onChange={(e) => setAssignRoom(e.target.value)}
                  placeholder="e.g. 201"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Status
                </label>
                <select
                  value={assignStatus}
                  onChange={(e) => setAssignStatus(e.target.value as Doctor['status'])}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="available">Available (Accepting Tokens)</option>
                  <option value="consulting">Consulting in Room</option>
                  <option value="on_break">On Break</option>
                  <option value="offline">Offline / Standby</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingDoctor(null)}
                  className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAssign}
                  className="px-4 py-2 bg-teal-800 hover:bg-teal-700 text-white rounded-lg font-bold cursor-pointer transition-colors shadow-xs"
                >
                  {isSavingAssign ? 'Saving...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
