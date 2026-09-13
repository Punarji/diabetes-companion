import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../store/authContext';
import LoginPage from '../pages/Login/LoginPage';
import PatientDashboardPage from '../pages/PatientDashboard/PatientDashboardPage';
import PatientDetailPage from '../pages/PatientDetail/PatientDetailPage';
import PrescriptionIntakeForm from '../pages/PrescriptionIntake/PrescriptionIntakeForm';
import CarePlanEditorPage from '../pages/CarePlanEditor/CarePlanEditorPage';
import MessagingPage from '../pages/Messaging/MessagingPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { physician, loading } = useAuth();
  if (loading) return null;
  if (!physician) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><PatientDashboardPage /></PrivateRoute>} />
      <Route path="/patients/:patientId" element={<PrivateRoute><PatientDetailPage /></PrivateRoute>} />
      <Route path="/patients/:patientId/prescribe" element={<PrivateRoute><PrescriptionIntakeForm /></PrivateRoute>} />
      <Route path="/patients/:patientId/care-plan" element={<PrivateRoute><CarePlanEditorPage /></PrivateRoute>} />
      <Route path="/messages" element={<PrivateRoute><MessagingPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
