import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { AuthPage } from './components/Auth/AuthPage';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './components/Dashboard/Dashboard';
import { StudentsList } from './pages/Students/StudentsList';
import { StudentForm } from './pages/Students/StudentForm';
import { StudentDetails } from './pages/Students/StudentDetails';
import { WorkoutsList } from './pages/Workouts/WorkoutsList';
import { WorkoutForm } from './pages/Workouts/WorkoutForm';
import { AssessmentsList } from './pages/Assessments/AssessmentsList';
import { AssessmentForm } from './pages/Assessments/AssessmentForm';
import { PaymentsList } from './pages/Payments/PaymentsList';
import { PaymentForm } from './pages/Payments/PaymentForm';
import { PersonalSettings } from './pages/Settings/PersonalSettings';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        
        {/* Students Routes */}
        <Route path="/alunos" element={<StudentsList />} />
        <Route path="/alunos/novo" element={<StudentForm />} />
        <Route path="/alunos/:id" element={<StudentDetails />} />
        <Route path="/alunos/:id/editar" element={<StudentForm />} />
        
        {/* Workouts Routes */}
        <Route path="/treinos" element={<WorkoutsList />} />
        <Route path="/treinos/novo" element={<WorkoutForm />} />
        <Route path="/treinos/:id/editar" element={<WorkoutForm />} />
        
        {/* Assessments Routes */}
        <Route path="/avaliacoes" element={<AssessmentsList />} />
        <Route path="/avaliacoes/nova" element={<AssessmentForm />} />
        <Route path="/avaliacoes/:id/editar" element={<AssessmentForm />} />
        
        {/* Payments Routes */}
        <Route path="/pagamentos" element={<PaymentsList />} />
        <Route path="/pagamentos/novo" element={<PaymentForm />} />
        <Route path="/pagamentos/:id/editar" element={<PaymentForm />} />
        
        {/* Settings Routes */}
        <Route path="/configuracoes" element={<PersonalSettings />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;