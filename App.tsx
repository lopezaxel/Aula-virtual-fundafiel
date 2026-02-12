import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './store';
import { Layout } from './components/Layout';
import { StudentClassroom } from './views/StudentClassroom';
import { CoursePlayer } from './views/CoursePlayer';
import { AdminDashboard } from './views/AdminDashboard';
import { AdminCourseManager } from './views/AdminCourseManager';
import { AdminStudentManager } from './views/AdminStudentManager';
import { AdminSettings } from './views/AdminSettings';
import { Login } from './views/Login';
import { Users, Loader2 } from 'lucide-react';

// Wrapper component to use the store context
const AppContent = () => {
  const { currentUser, loading, session } = useStore();
  const [currentView, setCurrentView] = useState('classroom');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Redirect to appropriate view based on role when user logs in
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        setCurrentView('admin-dashboard');
      } else {
        setCurrentView('classroom');
      }
    }
  }, [currentUser]);

  // Simple routing logic
  const navigate = (view: string) => {
    setCurrentView(view);
    if (view !== 'course-player') {
      setSelectedCourseId(null);
    }
  };

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);
    navigate('course-player');
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Show login if no session
  if (!session || !currentUser) {
    return <Login />;
  }

  const renderContent = () => {
    switch (currentView) {
      // Student Views
      case 'classroom':
        return <StudentClassroom onCourseSelect={handleCourseSelect} />;
      case 'my-courses':
        return <StudentClassroom onCourseSelect={handleCourseSelect} />; // Reuse for prototype
      case 'course-player':
        return selectedCourseId ? <CoursePlayer courseId={selectedCourseId} onBack={() => navigate('classroom')} /> : <StudentClassroom onCourseSelect={handleCourseSelect} />;

      // Admin Views
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'admin-courses':
        return <AdminCourseManager />;

      case 'calendar':
      case 'support':
        return (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <p>Página de prototipo: {currentView}</p>
          </div>
        );
      case 'admin-students':
        return <AdminStudentManager />;
      case 'admin-settings':
        return <AdminSettings />;
      default:
        return <StudentClassroom onCourseSelect={handleCourseSelect} />;
    }
  };

  return (
    <Layout activeView={currentView} onNavigate={navigate}>
      {renderContent()}
    </Layout>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
