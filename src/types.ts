export type TokenPriority = 'normal' | 'elderly' | 'emergency';

export type TokenStatus =
  | 'waiting'
  | 'called'
  | 'in_consultation'
  | 'diagnostics'
  | 'pharmacy'
  | 'completed'
  | 'cancelled';

export type PatientStage =
  | 'registration'
  | 'token'
  | 'doctor'
  | 'diagnostics'
  | 'pharmacy'
  | 'completed';

export interface PrescriptionItem {
  id: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface MedicalRecord {
  vitals?: {
    bp?: string;
    pulse?: string;
    temp?: string;
    spo2?: string;
    sugar?: string;
  };
  diagnosis?: string;
  clinicalNotes?: string;
  prescriptions: PrescriptionItem[];
  labTests: string[];
  followUpDays?: number;
  updatedAt?: string;
}

export interface PatientToken {
  id: string;
  patientName: string;
  patientPhone: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  priority: TokenPriority;
  departmentId: string;
  departmentName: string;
  symptoms: string;
  status: TokenStatus;
  stage: PatientStage;
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  roomNumber: string;
  createdAt: string;
  calledAt?: string;
  consultationStartedAt?: string;
  completedAt?: string;
  patientsAhead: number;
  estimatedWaitMinutes: number;
  estimatedWaitRange: string;
  medicalRecord?: MedicalRecord;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  floor: string;
  description: string;
  defaultAvgConsultMins: number;
  iconName: string;
}

export interface Doctor {
  id: string;
  name: string;
  qualification: string;
  departmentId: string;
  departmentName: string;
  roomNumber: string;
  status: 'available' | 'consulting' | 'on_break' | 'offline';
  currentPatientToken?: string | null;
  todayConsulted: number;
  avgConsultMins: number;
}

export interface SMSNotification {
  id: string;
  tokenId: string;
  phone: string;
  recipientName: string;
  message: string;
  type: 'token_created' | 'turn_approaching' | 'doctor_called' | 'diagnostics_ready' | 'pharmacy_ready' | 'completed';
  timestamp: string;
  status: 'delivered';
}

export interface DepartmentMetric {
  departmentId: string;
  name: string;
  code: string;
  waitingCount: number;
  currentServingToken: string | null;
  avgWaitMins: number;
  activeDoctorsCount: number;
  totalDoctorsCount: number;
  queueStatus: 'Normal' | 'Moderate' | 'High';
  totalCompletedToday: number;
  activeRooms: string[];
}

export interface HospitalStats {
  totalTokensIssuedToday: number;
  totalWaitingCurrently: number;
  totalConsultedToday: number;
  totalActiveDoctors: number;
  averageHospitalWaitMins: number;
  peakRushFlag: boolean;
}
