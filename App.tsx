import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './store';
import { Layout } from './components/Layout';
import { StudentClassroom } from './views/StudentClassroom';
import { StudentProfile } from './views/StudentProfile';
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

  // Default view based on role
  const defaultView = (role?: string) => role === 'admin' ? 'admin-dashboard' : 'my-courses';

  const [currentView, setCurrentView] = useState(() => localStorage.getItem('app_view') || 'my-courses');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(() => localStorage.getItem('app_course_id'));
  // Track which user the persisted view belongs to
  const [viewOwner, setViewOwner] = useState<string | null>(() => localStorage.getItem('app_view_owner'));

  // Handle persistence
  useEffect(() => {
    localStorage.setItem('app_view', currentView);
  }, [currentView]);

  useEffect(() => {
    if (selectedCourseId) {
      localStorage.setItem('app_course_id', selectedCourseId);
    } else {
      localStorage.removeItem('app_course_id');
    }
  }, [selectedCourseId]);

  // When user changes (login / logout / different account), reset the view to the correct default
  useEffect(() => {
    const userId = currentUser?.id ?? null;
    if (userId !== viewOwner) {
      // User changed — clear old state and apply role-based default
      setViewOwner(userId);
      setSelectedCourseId(null);
      if (userId) {
        const view = defaultView(currentUser?.role);
        setCurrentView(view);
        localStorage.setItem('app_view', view);
        localStorage.setItem('app_view_owner', userId);
      } else {
        // Logged out — clear everything
        localStorage.removeItem('app_view');
        localStorage.removeItem('app_course_id');
        localStorage.removeItem('app_view_owner');
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
          <Loader2 size={48} className="text-[#FF5722] animate-spin mx-auto mb-4" />
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
      case 'my-courses':
        return <StudentClassroom onCourseSelect={handleCourseSelect} />;
      case 'my-profile':
        return <StudentProfile />;
      case 'course-player':
        return selectedCourseId ? <CoursePlayer courseId={selectedCourseId} onBack={() => navigate('my-courses')} /> : <StudentClassroom onCourseSelect={handleCourseSelect} />;

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
