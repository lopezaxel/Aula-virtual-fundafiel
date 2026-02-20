import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './store';
import { supabase } from './lib/supabase';
import { Layout } from './components/Layout';
import { StudentClassroom } from './views/StudentClassroom';
import { StudentProfile } from './views/StudentProfile';
import { CoursePlayer } from './views/CoursePlayer';
import { AdminDashboard } from './views/AdminDashboard';
import { AdminCourseManager } from './views/AdminCourseManager';
import { AdminStudentManager } from './views/AdminStudentManager';
import { AdminSettings } from './views/AdminSettings';
import { Login } from './views/Login';
import { ResetPassword } from './views/ResetPassword';
import { Loader2 } from 'lucide-react';

// Wrapper component to use the store context
const AppContent = () => {
  const { currentUser, loading, session } = useStore();

  // Default view based on role
  const defaultView = (role?: string) => role === 'admin' ? 'admin-dashboard' : 'my-courses';

  const [currentView, setCurrentView] = useState(() => localStorage.getItem('app_view') || 'my-courses');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(() => localStorage.getItem('app_course_id'));
  const [viewOwner, setViewOwner] = useState<string | null>(() => localStorage.getItem('app_view_owner'));

  // ─── Detect PASSWORD_RECOVERY event from Supabase (triggered when user clicks the reset link) ───
  // This is the only reliable way to intercept the recovery flow: the SDK processes
  // the URL hash automatically and fires this event BEFORE our component reads the URL.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, _session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Override any other view and show the password reset panel
        setCurrentView('reset-password');
        localStorage.setItem('app_view', 'reset-password');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle persistence
  useEffect(() => {
    if (currentView !== 'reset-password') {
      localStorage.setItem('app_view', currentView);
    }
  }, [currentView]);

  useEffect(() => {
    if (selectedCourseId) {
      localStorage.setItem('app_course_id', selectedCourseId);
    } else {
      localStorage.removeItem('app_course_id');
    }
  }, [selectedCourseId]);

  // When user changes (login / logout / different account), reset the view to the correct default
  // But NOT if we're in the reset-password flow
  useEffect(() => {
    const userId = currentUser?.id ?? null;
    if (userId !== viewOwner) {
      setViewOwner(userId);
      setSelectedCourseId(null);
      if (userId) {
        // Don't override if we are in the reset password flow
        if (currentView !== 'reset-password') {
          const view = defaultView(currentUser?.role);
          setCurrentView(view);
          localStorage.setItem('app_view', view);
        }
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

  // ─── Reset Password view: shown OUTSIDE the Layout, without logging in first ───
  // This handles the case where the user clicks the email link and lands here
  if (currentView === 'reset-password') {
    return (
      <ResetPassword
        onComplete={() => {
          // After setting the password, clear the flag and redirect to login
          localStorage.removeItem('app_view');
          setCurrentView('my-courses');
        }}
      />
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
