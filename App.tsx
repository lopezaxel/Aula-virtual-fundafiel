import React, { useState, useEffect, Component, ReactNode } from 'react';
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
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

// ─── Error Boundary ───
// Catches any unhandled JS error inside a child view and shows a
// friendly recovery screen instead of a blank/white page.
interface ErrorBoundaryState { hasError: boolean; message: string; }
class ErrorBoundary extends Component<{ children: ReactNode; onReset: () => void }, ErrorBoundaryState> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, message: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error?.message || 'Error desconocido' };
  }
  componentDidCatch(error: Error, info: any) {
    console.error('View crashed:', error, info);
  }
  reset() {
    this.setState({ hasError: false, message: '' });
    this.props.onReset();
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center px-6">
          <AlertTriangle size={48} className="text-amber-400 mb-4" />
          <h2 className="text-lg font-bold text-gray-800 mb-1">Algo salió mal en esta sección</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-sm">{this.state.message}</p>
          <button
            onClick={() => this.reset()}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FF5722] text-white rounded-xl font-bold hover:bg-[#E64A19] transition-all"
          >
            <RefreshCw size={16} />
            Volver al inicio
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── History-aware navigate helper ───
// Each navigation pushes a state entry so the browser Back button
// sends a popstate event that we can intercept and handle inside the app.
const pushHistory = (view: string) => {
  window.history.pushState({ view }, '', window.location.pathname);
};

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

  // ─── Browser Back / Forward button support ───
  // When the user presses the browser Back button, the popstate event fires.
  // We read the view from the history state and navigate to it internally,
  // which prevents leaving the SPA entirely.
  useEffect(() => {
    // Push an initial history entry so there's always something to go back to
    // within the app (avoids falling through to an external page).
    if (!window.history.state?.view) {
      pushHistory(currentView);
    }

    const handlePopState = (e: PopStateEvent) => {
      const view = e.state?.view;
      if (view) {
        setCurrentView(view);
        localStorage.setItem('app_view', view);
      } else {
        // No state in history entry — re-push current view to stay inside the app
        pushHistory(currentView);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
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

  // Simple routing logic — also pushes to browser history so Back works
  const navigate = (view: string) => {
    setCurrentView(view);
    pushHistory(view);
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

  // Navigate back to the default view for this user (used by ErrorBoundary reset)
  const navigateToDefault = () => {
    const view = defaultView(currentUser?.role);
    navigate(view);
  };

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
      <ErrorBoundary key={currentView} onReset={navigateToDefault}>
        {renderContent()}
      </ErrorBoundary>
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
