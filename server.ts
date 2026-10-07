import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  Department,
  Doctor,
  PatientToken,
  SMSNotification,
  DepartmentMetric,
  HospitalStats,
  TokenPriority,
  TokenStatus,
  MedicalRecord,
} from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// In-memory data structures
const departments: Department[] = [
  {
    id: 'general-medicine',
    name: 'General Medicine',
    code: 'GM',
    floor: '2nd Floor, Wing A',
    description: 'Adult primary care, fever, cough, diabetes, hypertension, geriatric consultations',
    defaultAvgConsultMins: 6,
    iconName: 'Stethoscope',
  },
  {
    id: 'cardiology',
    name: 'Cardiology',
    code: 'CD',
    floor: '1st Floor, Wing B',
    description: 'Heart health, chest pain, ECG assessment, cardiac monitoring & follow-up',
    defaultAvgConsultMins: 8,
    iconName: 'HeartPulse',
  },
  {
    id: 'orthopedics',
    name: 'Orthopedics',
    code: 'OR',
    floor: '3rd Floor, Wing A',
    description: 'Bone fractures, joint pain, arthritis, trauma & rehabilitation',
    defaultAvgConsultMins: 7,
    iconName: 'Bone',
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics',
    code: 'PE',
    floor: '1st Floor, Wing A',
    description: 'Infant and child wellness, vaccinations, growth monitoring',
    defaultAvgConsultMins: 6,
    iconName: 'Baby',
  },
  {
    id: 'ent',
    name: 'ENT (Ear, Nose & Throat)',
    code: 'ENT',
    floor: '2nd Floor, Wing B',
    description: 'Hearing issues, sinus infections, throat allergies & endoscopy',
    defaultAvgConsultMins: 5,
    iconName: 'Ear',
  },
  {
    id: 'ophthalmology',
    name: 'Ophthalmology',
    code: 'OPH',
    floor: '2nd Floor, Wing C',
    description: 'Eye checkups, cataract screening, vision tests & glaucoma care',
    defaultAvgConsultMins: 5,
    iconName: 'Eye',
  },
  {
    id: 'diagnostics',
    name: 'Diagnostics & Radiology',
    code: 'LAB',
    floor: 'Ground Floor, Wing C',
    description: 'Blood sample collection, X-Ray, Ultrasound, Rapid ECG',
    defaultAvgConsultMins: 4,
    iconName: 'Activity',
  },
  {
    id: 'pharmacy',
    name: 'Hospital Pharmacy',
    code: 'RX',
    floor: 'Ground Floor, Main Entrance',
    description: 'Prescription dispensing, generic medicines, patient dosage guidance',
    defaultAvgConsultMins: 3,
    iconName: 'Pill',
  },
];

let doctors: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Sharma',
    qualification: 'MD (Internal Medicine) · 14 yrs exp',
    departmentId: 'general-medicine',
    departmentName: 'General Medicine',
    roomNumber: '204',
    status: 'consulting',
    currentPatientToken: 'GM-118',
    todayConsulted: 16,
    avgConsultMins: 6,
  },
  {
    id: 'doc-2',
    name: 'Dr. Sneha Kulkarni',
    qualification: 'MBBS, DNB · 8 yrs exp',
    departmentId: 'general-medicine',
    departmentName: 'General Medicine',
    roomNumber: '202',
    status: 'available',
    currentPatientToken: null,
    todayConsulted: 14,
    avgConsultMins: 6,
  },
  {
    id: 'doc-3',
    name: 'Dr. Rajesh Verma',
    qualification: 'DM (Cardiology), FACC · 18 yrs exp',
    departmentId: 'cardiology',
    departmentName: 'Cardiology',
    roomNumber: '102',
    status: 'available',
    currentPatientToken: 'CD-102',
    todayConsulted: 9,
    avgConsultMins: 8,
  },
  {
    id: 'doc-4',
    name: 'Dr. Ananya Sen',
    qualification: 'MS (Orthopedics) · 11 yrs exp',
    departmentId: 'orthopedics',
    departmentName: 'Orthopedics',
    roomNumber: '301',
    status: 'available',
    currentPatientToken: 'OR-104',
    todayConsulted: 11,
    avgConsultMins: 7,
  },
  {
    id: 'doc-5',
    name: 'Dr. Priya Patel',
    qualification: 'MD (Pediatrics) · 9 yrs exp',
    departmentId: 'pediatrics',
    departmentName: 'Pediatrics',
    roomNumber: '105',
    status: 'available',
    currentPatientToken: null,
    todayConsulted: 12,
    avgConsultMins: 6,
  },
  {
    id: 'doc-6',
    name: 'Dr. Arvind Mehta',
    qualification: 'MS (ENT) · 15 yrs exp',
    departmentId: 'ent',
    departmentName: 'ENT (Ear, Nose & Throat)',
    roomNumber: '206',
    status: 'available',
    currentPatientToken: null,
    todayConsulted: 8,
    avgConsultMins: 5,
  },
  {
    id: 'doc-7',
    name: 'Dr. Sunita Rao',
    qualification: 'MS (Ophthalmology) · 12 yrs exp',
    departmentId: 'ophthalmology',
    departmentName: 'Ophthalmology',
    roomNumber: '208',
    status: 'available',
    currentPatientToken: null,
    todayConsulted: 10,
    avgConsultMins: 5,
  },
  {
    id: 'doc-8',
    name: 'Dr. Alok Gupta',
    qualification: 'MD (Internal Medicine) · Senior Consultant',
    departmentId: 'general-medicine',
    departmentName: 'General Medicine',
    roomNumber: '201',
    status: 'offline', // Ready to be opened during high rush!
    currentPatientToken: null,
    todayConsulted: 5,
    avgConsultMins: 6,
  },
];

let tokensCounter: Record<string, number> = {
  GM: 127,
  CD: 105,
  OR: 106,
  PE: 104,
  ENT: 103,
  OPH: 102,
  LAB: 101,
  RX: 101,
};

let smsNotifications: SMSNotification[] = [
  {
    id: 'sms-1',
    tokenId: 'GM-127',
    phone: '9876543210',
    recipientName: 'Ramesh Chandra',
    message: 'SwasthyaFlow: Token GM-127 generated for General Medicine (Room 204). 8 patients ahead. Est wait: 25-35 min. You can comfortably relax in the waiting hall.',
    type: 'token_created',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    status: 'delivered',
  },
  {
    id: 'sms-2',
    tokenId: 'GM-118',
    phone: '9812345678',
    recipientName: 'Sunita Devi',
    message: 'SwasthyaFlow: Token GM-118. Please proceed to Room 204. Dr. Sharma is ready for your consultation.',
    type: 'doctor_called',
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    status: 'delivered',
  },
];

// Seed patient tokens (including Ramesh Chandra from the presentation slides!)
let tokens: PatientToken[] = [
  // General Medicine serving & waiting
  {
    id: 'GM-118',
    patientName: 'Sunita Devi',
    patientPhone: '9812345678',
    age: 52,
    gender: 'Female',
    priority: 'normal',
    departmentId: 'general-medicine',
    departmentName: 'General Medicine',
    symptoms: 'Mild fever & seasonal cough for 3 days',
    status: 'in_consultation',
    stage: 'doctor',
    assignedDoctorId: 'doc-1',
    assignedDoctorName: 'Dr. Sharma',
    roomNumber: '204',
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    calledAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    consultationStartedAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    patientsAhead: 0,
    estimatedWaitMinutes: 0,
    estimatedWaitRange: 'Now consulting',
  },
  {
    id: 'GM-119',
    patientName: 'Mohan Lal',
    patientPhone: '9822334455',
    age: 64,
    gender: 'Male',
    priority: 'elderly',
    departmentId: 'general-medicine',
    departmentName: 'General Medicine',
    symptoms: 'Joint stiffness & high blood pressure routine review',
    status: 'waiting',
    stage: 'token',
    assignedDoctorId: 'doc-1',
    assignedDoctorName: 'Dr. Sharma',
    roomNumber: '204',
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    patientsAhead: 1,
    estimatedWaitMinutes: 4,
    estimatedWaitRange: '3–6 min',
  },
  {
    id: 'GM-120',
    patientName: 'Aarti Saxena',
    patientPhone: '9877112233',
    age: 38,
    gender: 'Female',
    priority: 'normal',
    departmentId: 'general-medicine',
    departmentName: 'General Medicine',
    symptoms: 'Headache & weakness',
    status: 'waiting',
    stage: 'token',
    assignedDoctorId: 'doc-2',
    assignedDoctorName: 'Dr. Sneha Kulkarni',
    roomNumber: '202',
    createdAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    patientsAhead: 2,
    estimatedWaitMinutes: 7,
    estimatedWaitRange: '6–10 min',
  },
  {
    id: 'GM-121',
    patientName: 'Vikram Singh',
    patientPhone: '9844556677',
    age: 45,
    gender: 'Male',
    priority: 'normal',
    departmentId: 'general-medicine',
    departmentName: 'General Medicine',
    symptoms: 'Hyperacidity & indigestion',
    status: 'waiting',
    stage: 'token',
    assignedDoctorId: 'doc-1',
    assignedDoctorName: 'Dr. Sharma',
    roomNumber: '204',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    patientsAhead: 3,
    estimatedWaitMinutes: 10,
    estimatedWaitRange: '9–14 min',
  },
  {
    id: 'GM-122',
    patientName: 'Meena Kumari',
    patientPhone: '9833441122',
    age: 58,
    gender: 'Female',
    priority: 'normal',
    departmentId: 'general-medicine',
    departmentName: 'General Medicine',
    symptoms: 'Diabetic blood sugar checkup',
    status: 'waiting',
    stage: 'token',
    assignedDoctorId: 'doc-2',
    assignedDoctorName: 'Dr. Sneha Kulkarni',
    roomNumber: '202',
    createdAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    patientsAhead: 4,
    estimatedWaitMinutes: 13,
    estimatedWaitRange: '12–18 min',
  },
  {
    id: 'GM-123',
    patientName: 'Rajendra Prasad',
    patientPhone: '9811882233',
    age: 71,
    gender: 'Male',
    priority: 'elderly',
    departmentId: 'general-medicine',
    departmentName: 'General Medicine',
    symptoms: 'Chest congestion & dry cough',
    status: 'waiting',
    stage: 'token',
    assignedDoctorId: 'doc-1',
    assignedDoctorName: 'Dr. Sharma',
    roomNumber: '204',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    patientsAhead: 5,
    estimatedWaitMinutes: 16,
    estimatedWaitRange: '15–22 min',
  },
  {
    id: 'GM-124',
    patientName: 'Pooja Verma',
    patientPhone: '9866554433',
    age: 29,
    gender: 'Female',
    priority: 'normal',
    departmentId: 'general-medicine',
    departmentName: 'General Medicine',
    symptoms: 'Fever with chills',
    status: 'waiting',
    stage: 'token',
    assignedDoctorId: 'doc-2',
    assignedDoctorName: 'Dr. Sneha Kulkarni',
    roomNumber: '202',
    createdAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    patientsAhead: 6,
    estimatedWaitMinutes: 19,
    estimatedWaitRange: '18–26 min',
  },
  {
    id: 'GM-125',
    patientName: 'Amit Trivedi',
    patientPhone: '9855112244',
    age: 41,
    gender: 'Male',
    priority: 'normal',
    departmentId: 'general-medicine',
    departmentName: 'General Medicine',
    symptoms: 'Chronic backache & fatigue',
    status: 'waiting',
    stage: 'token',
    assignedDoctorId: 'doc-1',
    assignedDoctorName: 'Dr. Sharma',
    roomNumber: '204',
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    patientsAhead: 7,
    estimatedWaitMinutes: 22,
    estimatedWaitRange: '20–30 min',
  },
  {
    id: 'GM-126',
    patientName: 'Kavita Joshi',
    patientPhone: '9899332211',
    age: 34,
    gender: 'Female',
    priority: 'normal',
    departmentId: 'general-medicine',
    departmentName: 'General Medicine',
    symptoms: 'Throat irritation & headache',
    status: 'waiting',
    stage: 'token',
    assignedDoctorId: 'doc-2',
    assignedDoctorName: 'Dr. Sneha Kulkarni',
    roomNumber: '202',
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    patientsAhead: 8,
    estimatedWaitMinutes: 25,
    estimatedWaitRange: '24–33 min',
  },
  // Ramesh Chandra - EXACT MATCH from Slide 3, Slide 5, Slide 11, Slide 12!
  {
    id: 'GM-127',
    patientName: 'Ramesh Chandra',
    patientPhone: '9876543210',
    age: 68,
    gender: 'Male',
    priority: 'elderly',
    departmentId: 'general-medicine',
    departmentName: 'General Medicine',
    symptoms: 'Knee discomfort & recurring fatigue (Travelled 40 km from rural village)',
    status: 'waiting',
    stage: 'token',
    assignedDoctorId: 'doc-1',
    assignedDoctorName: 'Dr. Sharma',
    roomNumber: '204',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    patientsAhead: 8,
    estimatedWaitMinutes: 28,
    estimatedWaitRange: '25–35 min',
    medicalRecord: {
      vitals: {
        bp: '138/86 mmHg',
        pulse: '76 bpm',
        temp: '98.4°F',
        spo2: '97%',
        sugar: '142 mg/dL',
      },
      diagnosis: 'Early osteoarthritis knees + mild essential hypertension',
      clinicalNotes: 'Patient traveled 40 km. Counselled on gentle knee exercises and dietary salt reduction.',
      prescriptions: [
        { id: 'rx-1', medicine: 'Paracetamol 650mg', dosage: '1 tablet', frequency: 'Twice daily after meals', duration: '5 days' },
        { id: 'rx-2', medicine: 'Amlodipine 5mg', dosage: '1 tablet', frequency: 'Once daily morning', duration: '30 days' },
        { id: 'rx-3', medicine: 'Calcium + Vit D3', dosage: '1 tablet', frequency: 'Once daily after dinner', duration: '30 days' },
      ],
      labTests: ['Serum Uric Acid', 'X-Ray Bilateral Knees (Standing AP)'],
      followUpDays: 14,
    },
  },
  // Cardiology
  {
    id: 'CD-102',
    patientName: 'Harish Chandra',
    patientPhone: '9888776655',
    age: 62,
    gender: 'Male',
    priority: 'elderly',
    departmentId: 'cardiology',
    departmentName: 'Cardiology',
    symptoms: 'Mild palpitations after climbing stairs',
    status: 'in_consultation',
    stage: 'doctor',
    assignedDoctorId: 'doc-3',
    assignedDoctorName: 'Dr. Rajesh Verma',
    roomNumber: '102',
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    calledAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    consultationStartedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    patientsAhead: 0,
    estimatedWaitMinutes: 0,
    estimatedWaitRange: 'Now consulting',
  },
  {
    id: 'CD-103',
    patientName: 'Farhan Akhtar',
    patientPhone: '9877665544',
    age: 48,
    gender: 'Male',
    priority: 'normal',
    departmentId: 'cardiology',
    departmentName: 'Cardiology',
    symptoms: 'Post-stent 6-month checkup',
    status: 'waiting',
    stage: 'token',
    assignedDoctorId: 'doc-3',
    assignedDoctorName: 'Dr. Rajesh Verma',
    roomNumber: '102',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    patientsAhead: 1,
    estimatedWaitMinutes: 8,
    estimatedWaitRange: '6–12 min',
  },
  {
    id: 'CD-104',
    patientName: 'Sarita Roy',
    patientPhone: '9866443322',
    age: 55,
    gender: 'Female',
    priority: 'normal',
    departmentId: 'cardiology',
    departmentName: 'Cardiology',
    symptoms: 'High BP regulation check',
    status: 'waiting',
    stage: 'token',
    assignedDoctorId: 'doc-3',
    assignedDoctorName: 'Dr. Rajesh Verma',
    roomNumber: '102',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    patientsAhead: 2,
    estimatedWaitMinutes: 16,
    estimatedWaitRange: '14–20 min',
  },
  // Orthopedics
  {
    id: 'OR-104',
    patientName: 'Babulal Yadav',
    patientPhone: '9855332211',
    age: 49,
    gender: 'Male',
    priority: 'normal',
    departmentId: 'orthopedics',
    departmentName: 'Orthopedics',
    symptoms: 'Lower back stiffness and sciatica pain',
    status: 'in_consultation',
    stage: 'doctor',
    assignedDoctorId: 'doc-4',
    assignedDoctorName: 'Dr. Ananya Sen',
    roomNumber: '301',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    calledAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    consultationStartedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    patientsAhead: 0,
    estimatedWaitMinutes: 0,
    estimatedWaitRange: 'Now consulting',
  },
  {
    id: 'OR-105',
    patientName: 'Rekha Deshmukh',
    patientPhone: '9844221199',
    age: 63,
    gender: 'Female',
    priority: 'elderly',
    departmentId: 'orthopedics',
    departmentName: 'Orthopedics',
    symptoms: 'Right wrist swelling following slip',
    status: 'waiting',
    stage: 'token',
    assignedDoctorId: 'doc-4',
    assignedDoctorName: 'Dr. Ananya Sen',
    roomNumber: '301',
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    patientsAhead: 1,
    estimatedWaitMinutes: 7,
    estimatedWaitRange: '5–10 min',
  },
  // Pediatrics
  {
    id: 'PE-103',
    patientName: 'Aarav (Child of Deepak)',
    patientPhone: '9811447788',
    age: 5,
    gender: 'Male',
    priority: 'normal',
    departmentId: 'pediatrics',
    departmentName: 'Pediatrics',
    symptoms: 'Vaccination booster & mild rash',
    status: 'waiting',
    stage: 'token',
    assignedDoctorId: 'doc-5',
    assignedDoctorName: 'Dr. Priya Patel',
    roomNumber: '105',
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    patientsAhead: 0,
    estimatedWaitMinutes: 3,
    estimatedWaitRange: '2–5 min',
  },
];

// Helper: Recalculate dynamic waiting times for tokens
function recalculateQueueTimes(departmentId?: string) {
  const deptsToUpdate = departmentId
    ? [departments.find((d) => d.id === departmentId)!].filter(Boolean)
    : departments;

  for (const dept of deptsToUpdate) {
    const activeDoctors = doctors.filter(
      (doc) => doc.departmentId === dept.id && doc.status !== 'offline' && doc.status !== 'on_break'
    );
    const activeDocCount = Math.max(1, activeDoctors.length);
    const avgConsult = dept.defaultAvgConsultMins;

    // Get waiting tokens in this department sorted by priority (emergency first, elderly next, then created time)
    const deptTokens = tokens.filter((t) => t.departmentId === dept.id && t.status === 'waiting');
    
    // Stable sort
    deptTokens.sort((a, b) => {
      const pOrder: Record<TokenPriority, number> = { emergency: 0, elderly: 1, normal: 2 };
      if (pOrder[a.priority] !== pOrder[b.priority]) {
        return pOrder[a.priority] - pOrder[b.priority];
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    deptTokens.forEach((tok, index) => {
      tok.patientsAhead = index;
      // Formula inspired by Slide 10-11:
      // (patientsAhead * avgConsultation) / doctorsAvailable + buffer
      const baseEstimate = Math.round((index * avgConsult) / activeDocCount);
      const buffer = index > 4 ? 4 : 2;
      const minWait = Math.max(2, baseEstimate);
      const maxWait = baseEstimate + buffer + (index > 6 ? 6 : 4);
      tok.estimatedWaitMinutes = minWait;
      tok.estimatedWaitRange = `${minWait}–${maxWait} min`;
    });
  }
}

// Compute Department Metrics
function computeDepartmentMetrics(): DepartmentMetric[] {
  return departments.map((dept) => {
    const deptWaiting = tokens.filter((t) => t.departmentId === dept.id && t.status === 'waiting');
    const deptDoctors = doctors.filter((doc) => doc.departmentId === dept.id);
    const activeDocs = deptDoctors.filter((doc) => doc.status !== 'offline' && doc.status !== 'on_break');
    
    // Find current serving token in dept
    const servingToken = tokens.find(
      (t) => t.departmentId === dept.id && (t.status === 'in_consultation' || t.status === 'called')
    );

    const activeRooms = deptDoctors
      .filter((d) => d.status !== 'offline')
      .map((d) => `Room ${d.roomNumber}`);

    // Queue status heuristic (Slide 13, 14, 15)
    let queueStatus: 'Normal' | 'Moderate' | 'High' = 'Normal';
    if (deptWaiting.length >= 7) {
      queueStatus = 'High';
    } else if (deptWaiting.length >= 3) {
      queueStatus = 'Moderate';
    }

    const avgWaitMins =
      deptWaiting.length === 0
        ? 0
        : Math.round(
            deptWaiting.reduce((acc, t) => acc + t.estimatedWaitMinutes, 0) / deptWaiting.length
          );

    const completedToday = tokens.filter(
      (t) => t.departmentId === dept.id && t.status === 'completed'
    ).length + deptDoctors.reduce((acc, d) => acc + d.todayConsulted, 0);

    return {
      departmentId: dept.id,
      name: dept.name,
      code: dept.code,
      waitingCount: deptWaiting.length,
      currentServingToken: servingToken ? servingToken.id : null,
      avgWaitMins,
      activeDoctorsCount: activeDocs.length,
      totalDoctorsCount: deptDoctors.length,
      queueStatus,
      totalCompletedToday: completedToday,
      activeRooms,
    };
  });
}

// Compute overall Hospital Stats
function computeHospitalStats(): HospitalStats {
  const waitingTotal = tokens.filter((t) => t.status === 'waiting').length;
  const activeDocs = doctors.filter((d) => d.status !== 'offline' && d.status !== 'on_break').length;
  const totalConsulted = doctors.reduce((acc, d) => acc + d.todayConsulted, 0);
  const totalTokens = tokens.length;
  
  const waitingTokens = tokens.filter((t) => t.status === 'waiting');
  const avgWait = waitingTokens.length
    ? Math.round(waitingTokens.reduce((acc, t) => acc + t.estimatedWaitMinutes, 0) / waitingTokens.length)
    : 12;

  return {
    totalTokensIssuedToday: totalTokens + 54, // adding realistic baseline
    totalWaitingCurrently: waitingTotal,
    totalConsultedToday: totalConsulted,
    totalActiveDoctors: activeDocs,
    averageHospitalWaitMins: avgWait,
    peakRushFlag: waitingTotal > 12,
  };
}

// Initialize wait times
recalculateQueueTimes();

// ================= API ROUTES =================

// 1. Bootstrap: All state for reactive clients
app.get('/api/bootstrap', (req: Request, res: Response) => {
  recalculateQueueTimes();
  res.json({
    departments,
    doctors,
    tokens,
    smsNotifications: smsNotifications.slice(-20).reverse(),
    departmentMetrics: computeDepartmentMetrics(),
    hospitalStats: computeHospitalStats(),
  });
});

// 2. Token Registration (Patient Self-Service / Helpdesk Kiosk)
app.post('/api/tokens/register', (req: Request, res: Response) => {
  const {
    patientName,
    patientPhone,
    age,
    gender,
    priority,
    departmentId,
    symptoms,
  } = req.body;

  if (!patientName || !patientPhone || !departmentId) {
    res.status(400).json({ error: 'Patient name, phone, and department are required.' });
    return;
  }

  const dept = departments.find((d) => d.id === departmentId);
  if (!dept) {
    res.status(404).json({ error: 'Department not found' });
    return;
  }

  // Generate unique departmental token number (e.g. GM-128)
  const currentCount = (tokensCounter[dept.code] || 100) + 1;
  tokensCounter[dept.code] = currentCount;
  const tokenId = `${dept.code}-${currentCount}`;

  // Find eligible doctor
  const deptDoctors = doctors.filter(
    (d) => d.departmentId === dept.id && d.status !== 'offline'
  );
  const assignedDoc = deptDoctors.length > 0 ? deptDoctors[0] : doctors[0];

  const parsedAge = parseInt(age, 10) || 30;
  // Auto-flag elderly if age >= 60 unless already set
  let finalPriority: TokenPriority = priority || 'normal';
  if (parsedAge >= 60 && finalPriority === 'normal') {
    finalPriority = 'elderly';
  }

  const newToken: PatientToken = {
    id: tokenId,
    patientName: patientName.trim(),
    patientPhone: patientPhone.trim(),
    age: parsedAge,
    gender: gender || 'Other',
    priority: finalPriority,
    departmentId: dept.id,
    departmentName: dept.name,
    symptoms: symptoms || 'General consultation request',
    status: 'waiting',
    stage: 'token',
    assignedDoctorId: assignedDoc ? assignedDoc.id : undefined,
    assignedDoctorName: assignedDoc ? assignedDoc.name : 'Duty Doctor',
    roomNumber: assignedDoc ? assignedDoc.roomNumber : '101',
    createdAt: new Date().toISOString(),
    patientsAhead: 0,
    estimatedWaitMinutes: 10,
    estimatedWaitRange: '10–18 min',
  };

  tokens.push(newToken);
  recalculateQueueTimes(dept.id);

  // Generate automated SMS notification
  const tokenRecord = tokens.find((t) => t.id === tokenId)!;
  const smsMessage = `SwasthyaFlow: Token ${tokenRecord.id} generated for ${dept.name} (${tokenRecord.assignedDoctorName}, Room ${tokenRecord.roomNumber}). Patients ahead: ${tokenRecord.patientsAhead}. Est wait: ${tokenRecord.estimatedWaitRange}. You will receive an SMS when your turn approaches.`;

  const newSMS: SMSNotification = {
    id: `sms-${Date.now()}`,
    tokenId: tokenRecord.id,
    phone: tokenRecord.patientPhone,
    recipientName: tokenRecord.patientName,
    message: smsMessage,
    type: 'token_created',
    timestamp: new Date().toISOString(),
    status: 'delivered',
  };
  smsNotifications.push(newSMS);

  res.status(201).json({
    token: tokenRecord,
    sms: newSMS,
    departmentMetrics: computeDepartmentMetrics(),
    hospitalStats: computeHospitalStats(),
  });
});

// 3. Lookup Token (By Token ID or Phone Number)
app.get('/api/tokens/lookup', (req: Request, res: Response) => {
  const query = (req.query.q as string || '').trim().toUpperCase();
  if (!query) {
    res.status(400).json({ error: 'Search query is required' });
    return;
  }

  recalculateQueueTimes();

  // Search by exact token ID or phone number
  const match = tokens.find(
    (t) =>
      t.id.toUpperCase() === query ||
      t.patientPhone.replace(/\D/g, '') === query.replace(/\D/g, '')
  );

  if (!match) {
    res.status(404).json({ error: 'No active token found matching your search.' });
    return;
  }

  res.json({ token: match });
});

// 4. Doctor Calls Next Patient
app.post('/api/doctor/call-next', (req: Request, res: Response) => {
  const { doctorId } = req.body;
  const doctor = doctors.find((d) => d.id === doctorId);

  if (!doctor) {
    res.status(404).json({ error: 'Doctor not found' });
    return;
  }

  // Find next waiting token for this department
  const waitingTokens = tokens.filter(
    (t) => t.departmentId === doctor.departmentId && t.status === 'waiting'
  );

  if (waitingTokens.length === 0) {
    res.status(400).json({ error: 'No waiting patients in this department queue.' });
    return;
  }

  // Sort by priority (emergency first, elderly second, then created time)
  waitingTokens.sort((a, b) => {
    const pOrder: Record<TokenPriority, number> = { emergency: 0, elderly: 1, normal: 2 };
    if (pOrder[a.priority] !== pOrder[b.priority]) {
      return pOrder[a.priority] - pOrder[b.priority];
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const nextPatient = waitingTokens[0];
  nextPatient.status = 'called';
  nextPatient.stage = 'doctor';
  nextPatient.assignedDoctorId = doctor.id;
  nextPatient.assignedDoctorName = doctor.name;
  nextPatient.roomNumber = doctor.roomNumber;
  nextPatient.calledAt = new Date().toISOString();

  doctor.currentPatientToken = nextPatient.id;
  doctor.status = 'consulting';

  // Trigger SMS alert to patient (turn approaching / enter room)
  const callSMS: SMSNotification = {
    id: `sms-${Date.now()}`,
    tokenId: nextPatient.id,
    phone: nextPatient.patientPhone,
    recipientName: nextPatient.patientName,
    message: `ALERT: Token ${nextPatient.id} (${nextPatient.patientName}), please proceed to Room ${doctor.roomNumber}. ${doctor.name} is ready for you now.`,
    type: 'doctor_called',
    timestamp: new Date().toISOString(),
    status: 'delivered',
  };
  smsNotifications.push(callSMS);

  recalculateQueueTimes(doctor.departmentId);

  res.json({
    calledToken: nextPatient,
    doctor,
    sms: callSMS,
    departmentMetrics: computeDepartmentMetrics(),
    hospitalStats: computeHospitalStats(),
  });
});

// 5. Doctor Starts Consultation
app.post('/api/doctor/start-consult', (req: Request, res: Response) => {
  const { tokenId, doctorId } = req.body;
  const token = tokens.find((t) => t.id === tokenId);
  const doctor = doctors.find((d) => d.id === doctorId);

  if (!token) {
    res.status(404).json({ error: 'Token not found' });
    return;
  }

  token.status = 'in_consultation';
  token.consultationStartedAt = new Date().toISOString();
  if (doctor) {
    doctor.status = 'consulting';
    doctor.currentPatientToken = token.id;
  }

  res.json({ token, doctor });
});

// 6. Doctor Completes Consultation / Records Diagnosis / Refers
app.post('/api/doctor/complete-visit', (req: Request, res: Response) => {
  const {
    tokenId,
    doctorId,
    medicalRecord,
    nextAction, // 'complete' | 'refer_diagnostics' | 'refer_pharmacy'
  } = req.body;

  const token = tokens.find((t) => t.id === tokenId);
  const doctor = doctors.find((d) => d.id === doctorId);

  if (!token) {
    res.status(404).json({ error: 'Token not found' });
    return;
  }

  token.completedAt = new Date().toISOString();
  token.medicalRecord = {
    ...token.medicalRecord,
    ...medicalRecord,
    updatedAt: new Date().toISOString(),
  };

  if (doctor) {
    doctor.todayConsulted += 1;
    doctor.currentPatientToken = null;
    doctor.status = 'available';
  }

  if (nextAction === 'refer_diagnostics') {
    token.status = 'diagnostics';
    token.stage = 'diagnostics';
    const labSMS: SMSNotification = {
      id: `sms-${Date.now()}`,
      tokenId: token.id,
      phone: token.patientPhone,
      recipientName: token.patientName,
      message: `SwasthyaFlow: Dr. ${doctor?.name || 'Doctor'} has requested diagnostics tests (${token.medicalRecord?.labTests?.join(', ') || 'Lab work'}). Please proceed to Diagnostics Counter (Ground Floor, Room 110).`,
      type: 'diagnostics_ready',
      timestamp: new Date().toISOString(),
      status: 'delivered',
    };
    smsNotifications.push(labSMS);
  } else if (nextAction === 'refer_pharmacy') {
    token.status = 'pharmacy';
    token.stage = 'pharmacy';
    const rxSMS: SMSNotification = {
      id: `sms-${Date.now()}`,
      tokenId: token.id,
      phone: token.patientPhone,
      recipientName: token.patientName,
      message: `SwasthyaFlow: Your prescription has been sent digitally to Hospital Pharmacy Counter 2. Please show Token ${token.id} to collect your medicines.`,
      type: 'pharmacy_ready',
      timestamp: new Date().toISOString(),
      status: 'delivered',
    };
    smsNotifications.push(rxSMS);
  } else {
    token.status = 'completed';
    token.stage = 'completed';
    const compSMS: SMSNotification = {
      id: `sms-${Date.now()}`,
      tokenId: token.id,
      phone: token.patientPhone,
      recipientName: token.patientName,
      message: `SwasthyaFlow: Consultation complete with ${doctor?.name || 'Doctor'}. Thank you for visiting. Please follow doctor advice.`,
      type: 'completed',
      timestamp: new Date().toISOString(),
      status: 'delivered',
    };
    smsNotifications.push(compSMS);
  }

  recalculateQueueTimes(token.departmentId);

  res.json({
    token,
    doctor,
    departmentMetrics: computeDepartmentMetrics(),
    hospitalStats: computeHospitalStats(),
  });
});

// 7. Advance Patient From Diagnostics or Pharmacy
app.post('/api/tokens/advance-stage', (req: Request, res: Response) => {
  const { tokenId, stage } = req.body;
  const token = tokens.find((t) => t.id === tokenId);
  if (!token) {
    res.status(404).json({ error: 'Token not found' });
    return;
  }

  if (stage === 'pharmacy') {
    token.status = 'pharmacy';
    token.stage = 'pharmacy';
    const rxSMS: SMSNotification = {
      id: `sms-${Date.now()}`,
      tokenId: token.id,
      phone: token.patientPhone,
      recipientName: token.patientName,
      message: `SwasthyaFlow: Diagnostics completed. Please proceed to Pharmacy Counter 2 with Token ${token.id}.`,
      type: 'pharmacy_ready',
      timestamp: new Date().toISOString(),
      status: 'delivered',
    };
    smsNotifications.push(rxSMS);
  } else if (stage === 'completed') {
    token.status = 'completed';
    token.stage = 'completed';
  }

  res.json({ token });
});

// 8. Doctor Profile / Status Update
app.post('/api/doctor/update-status', (req: Request, res: Response) => {
  const { doctorId, status, roomNumber } = req.body;
  const doctor = doctors.find((d) => d.id === doctorId);
  if (!doctor) {
    res.status(404).json({ error: 'Doctor not found' });
    return;
  }

  if (status) doctor.status = status;
  if (roomNumber) doctor.roomNumber = roomNumber;

  recalculateQueueTimes(doctor.departmentId);

  res.json({ doctor, departmentMetrics: computeDepartmentMetrics() });
});

// 9. Admin Login (Password: 1234)
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { password } = req.body;
  if (password === '1234') {
    res.json({ success: true, message: 'Admin authorized' });
  } else {
    res.status(401).json({ success: false, error: 'Invalid password. Enter 1234.' });
  }
});

// 10. Admin: Assign Doctor / Open Counter
app.post('/api/admin/assign-doctor', (req: Request, res: Response) => {
  const { doctorId, departmentId, roomNumber, status } = req.body;
  const doctor = doctors.find((d) => d.id === doctorId);
  if (!doctor) {
    res.status(404).json({ error: 'Doctor not found' });
    return;
  }

  const oldDept = doctor.departmentId;

  if (departmentId) {
    const dept = departments.find((d) => d.id === departmentId);
    if (dept) {
      doctor.departmentId = dept.id;
      doctor.departmentName = dept.name;
    }
  }

  if (roomNumber) doctor.roomNumber = roomNumber;
  if (status) doctor.status = status;

  recalculateQueueTimes(oldDept);
  recalculateQueueTimes(doctor.departmentId);

  res.json({
    doctor,
    departmentMetrics: computeDepartmentMetrics(),
    hospitalStats: computeHospitalStats(),
  });
});

// 11. Admin: Monday Morning Rush Bottleneck Simulation (Slide 14 & 15!)
// Slide 14: "10:00 AM General Medicine has 24 waiting. Average wait 31 min.
// 10:15 AM Dashboard flags queue status as High. Wait is still rising.
// 10:20 AM Admin opens a third doctor counter and informs waiting patients.
// 10:45 AM Queue shrinks and average wait drops to about 18 min."
app.post('/api/admin/simulate-monday-rush', (req: Request, res: Response) => {
  const gmDept = departments.find((d) => d.id === 'general-medicine')!;

  // Generate 8 extra surge patients to push General Medicine into high load!
  const rushNames = [
    { name: 'Kailash Nath', age: 67, priority: 'elderly' as TokenPriority, symp: 'Severe knee pain & joint swelling' },
    { name: 'Bhagwati Devi', age: 72, priority: 'elderly' as TokenPriority, symp: 'Hypertension medicine renewal' },
    { name: 'Manish Tyagi', age: 36, priority: 'normal' as TokenPriority, symp: 'Viral fever & body chills' },
    { name: 'Suman Lata', age: 53, priority: 'normal' as TokenPriority, symp: 'Persistent migraine & nausea' },
    { name: 'Satish Chandra', age: 61, priority: 'elderly' as TokenPriority, symp: 'Asthma exacerbation & wheezing' },
    { name: 'Neelam Rani', age: 44, priority: 'normal' as TokenPriority, symp: 'Diabetic routine evaluation' },
    { name: 'Anil Kumar', age: 28, priority: 'normal' as TokenPriority, symp: 'Acute gastroenteritis' },
    { name: 'Pushpa Devi', age: 69, priority: 'elderly' as TokenPriority, symp: 'Chest heaviness & dizziness' },
  ];

  rushNames.forEach((item) => {
    tokensCounter.GM += 1;
    const tId = `GM-${tokensCounter.GM}`;
    tokens.push({
      id: tId,
      patientName: item.name,
      patientPhone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
      age: item.age,
      gender: item.age % 2 === 0 ? 'Female' : 'Male',
      priority: item.priority,
      departmentId: gmDept.id,
      departmentName: gmDept.name,
      symptoms: item.symp,
      status: 'waiting',
      stage: 'token',
      assignedDoctorId: 'doc-1',
      assignedDoctorName: 'Dr. Sharma',
      roomNumber: '204',
      createdAt: new Date().toISOString(),
      patientsAhead: 0,
      estimatedWaitMinutes: 30,
      estimatedWaitRange: '28–38 min',
    });
  });

  recalculateQueueTimes('general-medicine');

  res.json({
    message: 'Monday morning surge generated: 8 extra patients entered General Medicine queue. Queue status flagged as HIGH!',
    departmentMetrics: computeDepartmentMetrics(),
    hospitalStats: computeHospitalStats(),
  });
});

// 12. Admin: Open Counter 3 to Resolve Bottleneck (Slide 14 & 15 action!)
app.post('/api/admin/open-rush-counter', (req: Request, res: Response) => {
  const drAlok = doctors.find((d) => d.id === 'doc-8'); // Dr. Alok Gupta
  if (drAlok) {
    drAlok.status = 'available';
    drAlok.departmentId = 'general-medicine';
    drAlok.departmentName = 'General Medicine';
    drAlok.roomNumber = '201'; // Counter 3
  }

  recalculateQueueTimes('general-medicine');

  // Broadcast SMS to waiting patients
  const gmWaiting = tokens.filter(
    (t) => t.departmentId === 'general-medicine' && t.status === 'waiting'
  );
  if (gmWaiting.length > 0) {
    const rushAlertSMS: SMSNotification = {
      id: `sms-${Date.now()}`,
      tokenId: 'HOSPITAL-ANNOUNCEMENT',
      phone: 'ALL-WAITING-PATIENTS',
      recipientName: 'General Medicine Patients',
      message: 'SwasthyaFlow Alert: Counter 3 (Room 201) has now opened under Dr. Alok Gupta to reduce queue delays. Waiting times have been recalculated.',
      type: 'token_created',
      timestamp: new Date().toISOString(),
      status: 'delivered',
    };
    smsNotifications.push(rushAlertSMS);
  }

  res.json({
    message: 'Third doctor counter (Room 201) activated. Doctor capacity increased by 50%. Average wait dropped!',
    doctors,
    departmentMetrics: computeDepartmentMetrics(),
    hospitalStats: computeHospitalStats(),
  });
});

// 13. Reset / Seed Demo Data
app.post('/api/reset-demo', (req: Request, res: Response) => {
  // Reset doctors to default
  doctors.forEach((d) => {
    if (d.id === 'doc-8') {
      d.status = 'offline';
    } else if (d.id === 'doc-1') {
      d.status = 'consulting';
      d.currentPatientToken = 'GM-118';
    } else {
      d.status = 'available';
    }
  });

  recalculateQueueTimes();

  res.json({
    message: 'System reset to default state.',
    departments,
    doctors,
    tokens,
    departmentMetrics: computeDepartmentMetrics(),
    hospitalStats: computeHospitalStats(),
  });
});

// Setup Vite or static files
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SwasthyaFlow full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
