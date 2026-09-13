import { apiClient, saveTokens } from './client';

// ---------- Auth ----------
export async function registerUser(payload: {
  full_name: string;
  email: string;
  password: string;
  date_of_birth?: string;
  role: 'patient' | 'physician';
}) {
  const { data } = await apiClient.post('/api/v1/auth/register', payload);
  return data;
}

export async function login(email: string, password: string) {
  const form = new URLSearchParams();
  form.append('username', email);
  form.append('password', password);
  const { data } = await apiClient.post('/api/v1/auth/login', form.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  await saveTokens(data.access_token, data.refresh_token);
  return data;
}

export async function forgotPassword(email: string) {
  const { data } = await apiClient.post('/api/v1/auth/forgot-password', { email });
  return data;
}

export async function fetchCurrentUser() {
  const { data } = await apiClient.get('/api/v1/users/me');
  return data;
}

// ---------- Onboarding: patient profile ----------
export async function submitHealthProfile(payload: {
  diabetes_status: string;
  weight_kg: number;
  height_cm: number;
  physical_activity_level: string;
  family_history_diabetes: string;
}) {
  const { data } = await apiClient.post('/api/v1/patient-profile/health-profile', payload);
  return data;
}

export async function submitLifestyle(payload: {
  smoking_status: string;
  alcohol_use: string;
  dietary_habit: string;
  preferred_language: string;
}) {
  const { data } = await apiClient.post('/api/v1/patient-profile/lifestyle', payload);
  return data;
}

export async function submitNotificationPreferences(payload: {
  medication_reminders: boolean;
  glucose_reminders: boolean;
  meal_reminders: boolean;
  activity_reminders: boolean;
}) {
  const { data } = await apiClient.post('/api/v1/patient-profile/notifications', payload);
  return data;
}

// ---------- Risk assessment ----------
export async function fetchRiskQuestions() {
  const { data } = await apiClient.get('/api/v1/risk-assessment/questions');
  return data;
}

export async function submitRiskAssessment(payload: {
  health_profile: {
    age: number;
    weight_kg: number;
    height_cm: number;
    family_history: string;
    smoking_status: string;
  };
  answers: Record<string, string>;
}) {
  const { data } = await apiClient.post('/api/v1/risk-assessment/submit', payload);
  return data;
}

export async function fetchLatestRiskResult() {
  const { data } = await apiClient.get('/api/v1/risk-assessment/latest');
  return data;
}

// ---------- Medications ----------
export async function fetchTodayMedications() {
  const { data } = await apiClient.get('/api/v1/medications/today');
  return data;
}

export async function logDose(
  logId: string,
  payload: { actual_time_taken?: string; notes?: string; skipped: boolean }
) {
  const { data } = await apiClient.post(`/api/v1/medications/logs/${logId}`, payload);
  return data;
}

// ---------- Care plan ----------
export async function fetchCarePlan(forDate: string) {
  const { data } = await apiClient.get('/api/v1/care-plan', { params: { for_date: forDate } });
  return data;
}

export async function toggleCarePlanTask(taskId: string, logDate: string, isCompleted: boolean) {
  const { data } = await apiClient.post(`/api/v1/care-plan/tasks/${taskId}/toggle`, {
    log_date: logDate,
    is_completed: isCompleted,
  });
  return data;
}

// ---------- Dashboard ----------
export async function fetchDashboard() {
  const { data } = await apiClient.get('/api/v1/dashboard');
  return data;
}

// ---------- Glucose ----------
export async function logGlucoseReading(payload: {
  reading_type: 'fasting' | 'post_meal' | 'bedtime' | 'random';
  value_mg_dl: number;
  meal_reference?: string | null;
  notes?: string | null;
}) {
  const { data } = await apiClient.post('/api/v1/glucose', payload);
  return data;
}

export async function fetchTodaysGlucose() {
  const { data } = await apiClient.get('/api/v1/glucose/today');
  return data;
}

// ---------- Physician ----------
export async function fetchMyPatients() {
  const { data } = await apiClient.get('/api/v1/physician/patients');
  return data;
}

export async function fetchPatientReport(patientId: string) {
  const { data } = await apiClient.get(`/api/v1/physician/patients/${patientId}/report`);
  return data;
}

export async function updateDoctorNotes(patientId: string, doctorNotes: string) {
  const { data } = await apiClient.patch(`/api/v1/physician/patients/${patientId}/notes`, {
    doctor_notes: doctorNotes,
  });
  return data;
}

export async function submitPrescription(patientId: string, payload: {
  medications: { name: string; dosage: string; frequency_label: string; instructions?: string }[];
  dietary: { carbs_per_day_g: number; calories: number; restrictions: string[] };
  exercise: { minutes_per_week: number; recommended_types: string[] };
  glucose_targets: { fasting: number; post_meal: number; hba1c: number };
  follow_up_date: string;
  generate_care_plan: boolean;
}) {
  const { data } = await apiClient.post(`/api/v1/physician/patients/${patientId}/prescriptions`, payload);
  return data;
}
