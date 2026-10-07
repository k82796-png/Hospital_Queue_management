import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { PatientPortal } from './components/PatientPortal';
import { DoctorDashboard } from './components/DoctorDashboard';
import { AdminPanel } from './components/AdminPanel';
import { PublicDisplay } from './components/PublicDisplay';
import { SMSNotificationModal } from './components/SMSNotificationModal';
import { RameshStoryModal } from './components/RameshStoryModal';
import {
  Department,
  Doctor,
  PatientToken,
  SMSNotification,
  DepartmentMetric,
  HospitalStats,
  TokenPriority,
  PrescriptionItem,
} from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<'patient' | 'doctor' | 'admin' | 'display'>('patient');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [tokens, setTokens] = useState<PatientToken[]>([]);
  const [smsNotifications, setSmsNotifications] = useState<SMSNotification[]>([]);
  const [departmentMetrics, setDepartmentMetrics] = useState<DepartmentMetric[]>([]);
  const [hospitalStats, setHospitalStats] = useState<HospitalStats>({
    totalTokensIssuedToday: 0,
    totalWaitingCurrently: 0,
    totalConsultedToday: 0,
    totalActiveDoctors: 0,
    averageHospitalWaitMins: 0,
    peakRushFlag: false,
  });

  // Active Patient token for Patient Portal
  const [activeToken, setActiveToken] = useState<PatientToken | null>(null);

  // Selected doctor in Doctor Desk
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('doc-1');

  // Admin login status (Password: 1234)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Modals & Accessibility
  const [elderlyMode, setElderlyMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSMSModalOpen, setIsSMSModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);

  // Apply elderly accessibility styling to body
  useEffect(() => {
    if (elderlyMode) {
      document.body.classList.add('elderly-mode');
    } else {
      document.body.classList.remove('elderly-mode');
    }
  }, [elderlyMode]);

  // Fetch full state from server
  const fetchBootstrap = useCallback(async () => {
    try {
      const res = await fetch('/api/bootstrap');
      if (!res.ok) return;
      const data = await res.json();
      setDepartments(data.departments || []);
      setDoctors(data.doctors || []);
      setTokens(data.tokens || []);
      setSmsNotifications(data.smsNotifications || []);
      setDepartmentMetrics(data.departmentMetrics || []);
      setHospitalStats(data.hospitalStats || {
        totalTokensIssuedToday: 0,
        totalWaitingCurrently: 0,
        totalConsultedToday: 0,
        totalActiveDoctors: 0,
        averageHospitalWaitMins: 0,
        peakRushFlag: false,
      });

      // Keep activeToken synchronized if already set
      setActiveToken((prev) => {
        if (!prev) {
          // If no active token, find Ramesh's token (GM-127) as default for easy review!
          const ramesh = data.tokens?.find((t: PatientToken) => t.id === 'GM-127');
          return ramesh || null;
        }
        const updated = data.tokens?.find((t: PatientToken) => t.id === prev.id);
        return updated || prev;
      });
    } catch {
      // Background poll error handled silently
    }
  }, []);

  useEffect(() => {
    fetchBootstrap();
    const interval = setInterval(fetchBootstrap, 3000); // 3-second live sync polling
    return () => clearInterval(interval);
  }, [fetchBootstrap]);

  // 1. Patient: Register new token
  const handleRegisterToken = async (tokenData: {
    patientName: string;
    patientPhone: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    priority: TokenPriority;
    departmentId: string;
    symptoms: string;
  }): Promise<PatientToken | null> => {
    try {
      const res = await fetch('/api/tokens/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tokenData),
      });
      if (!res.ok) return null;
      const data = await res.json();
      setActiveToken(data.token);
      await fetchBootstrap();
      return data.token;
    } catch {
      return null;
    }
  };

  // 2. Patient: Lookup token by ID or Phone
  const handleLookupToken = async (query: string): Promise<PatientToken | null> => {
    try {
      const res = await fetch(`/api/tokens/lookup?q=${encodeURIComponent(query)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.token;
    } catch {
      return null;
    }
  };

  // 3. Doctor: Call next patient in queue
  const handleCallNextPatient = async (doctorId: string): Promise<PatientToken | null> => {
    try {
      const res = await fetch('/api/doctor/call-next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      await fetchBootstrap();
      return data.calledToken;
    } catch {
      return null;
    }
  };

  // 4. Doctor: Start consultation
  const handleStartConsultation = async (tokenId: string, doctorId: string) => {
    try {
      await fetch('/api/doctor/start-consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId, doctorId }),
      });
      await fetchBootstrap();
    } catch {
      // Silent error handle
    }
  };

  // 5. Doctor: Complete visit & records
  const handleCompleteVisit = async (params: {
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
  }) => {
    try {
      await fetch('/api/doctor/complete-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      await fetchBootstrap();
    } catch {
      // Silent error handle
    }
  };

  // 6. Doctor: Update status
  const handleUpdateDoctorStatus = async (doctorId: string, status: Doctor['status']) => {
    try {
      await fetch('/api/doctor/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId, status }),
      });
      await fetchBootstrap();
    } catch {
      // Silent error handle
    }
  };

  // 7. Admin: Login (password 1234)
  const handleAdminLogin = async (password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  // 8. Admin: Assign doctor
  const handleAssignDoctor = async (
    doctorId: string,
    departmentId: string,
    roomNumber: string,
    status: Doctor['status']
  ) => {
    try {
      await fetch('/api/admin/assign-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId, departmentId, roomNumber, status }),
      });
      await fetchBootstrap();
    } catch {
      // Silent error handle
    }
  };

  // 9. Admin: Simulate Monday Morning Rush Surge
  const handleSimulateMondayRush = async () => {
    try {
      await fetch('/api/admin/simulate-monday-rush', {
        method: 'POST',
      });
      await fetchBootstrap();
    } catch {
      // Silent error handle
    }
  };

  // 10. Admin: Open Rush Counter 3 to resolve bottleneck
  const handleOpenRushCounter = async () => {
    try {
      await fetch('/api/admin/open-rush-counter', {
        method: 'POST',
      });
      await fetchBootstrap();
    } catch {
      // Silent error handle
    }
  };

  // 11. Reset Demo
  const handleResetDemo = async () => {
    try {
      await fetch('/api/reset-demo', {
        method: 'POST',
      });
      await fetchBootstrap();
    } catch {
      // Silent error handle
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        elderlyMode={elderlyMode}
        setElderlyMode={setElderlyMode}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        smsCount={smsNotifications.length}
        onOpenSMS={() => setIsSMSModalOpen(true)}
        onOpenStory={() => setIsStoryModalOpen(true)}
      />

      <main className="flex-1">
        {currentView === 'patient' && (
          <PatientPortal
            departments={departments}
            activeToken={activeToken}
            setActiveToken={setActiveToken}
            onRegisterToken={handleRegisterToken}
            onLookupToken={handleLookupToken}
            soundEnabled={soundEnabled}
            elderlyMode={elderlyMode}
          />
        )}

        {currentView === 'doctor' && (
          <DoctorDashboard
            doctors={doctors}
            tokens={tokens}
            departments={departments}
            selectedDoctorId={selectedDoctorId}
            onSelectDoctor={setSelectedDoctorId}
            onCallNextPatient={handleCallNextPatient}
            onStartConsultation={handleStartConsultation}
            onCompleteVisit={handleCompleteVisit}
            onUpdateDoctorStatus={handleUpdateDoctorStatus}
            soundEnabled={soundEnabled}
          />
        )}

        {currentView === 'admin' && (
          <AdminPanel
            departments={departments}
            doctors={doctors}
            tokens={tokens}
            departmentMetrics={departmentMetrics}
            hospitalStats={hospitalStats}
            isAdminLoggedIn={isAdminLoggedIn}
            setIsAdminLoggedIn={setIsAdminLoggedIn}
            onAdminLogin={handleAdminLogin}
            onAssignDoctor={handleAssignDoctor}
            onSimulateMondayRush={handleSimulateMondayRush}
            onOpenRushCounter={handleOpenRushCounter}
            onResetDemo={handleResetDemo}
          />
        )}

        {currentView === 'display' && (
          <PublicDisplay
            departments={departments}
            doctors={doctors}
            tokens={tokens}
            soundEnabled={soundEnabled}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#051c22] border-t border-[#0d3b45] text-slate-400 py-6 px-4 sm:px-6 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-teal-200">SWASTHYAFLOW</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Government Hospital Smart Queue & Waiting-Time Management System</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>District Civil Hospital OPD</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <button
              onClick={() => setIsStoryModalOpen(true)}
              className="text-teal-300 hover:underline cursor-pointer"
            >
              Ramesh's Case Study
            </button>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Admin Passcode: 1234</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SMSNotificationModal
        isOpen={isSMSModalOpen}
        onClose={() => setIsSMSModalOpen(false)}
        notifications={smsNotifications}
      />

      <RameshStoryModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
        onTrackRamesh={() => {
          handleLookupToken('GM-127').then((t) => {
            if (t) {
              setActiveToken(t);
              setCurrentView('patient');
            }
          });
        }}
      />
    </div>
  );
}
