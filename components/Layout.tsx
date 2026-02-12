import React from 'react';
import { useStore } from '../store';
import {
  BookOpen,
  Calendar,
  HelpCircle,
  Settings,
  Users,
  LayoutDashboard,
  LogOut,
  Bell,
  Search,
  Menu
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onNavigate: (view: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate }) => {
  const { currentUser, signOut } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  const NavItem = ({ view, icon: Icon, label }: { view: string, icon: any, label: string }) => {
    const isActive = activeView === view || (activeView.startsWith(view));
    return (
      <button
        onClick={() => {
          onNavigate(view);
          setMobileMenuOpen(false);
        }}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
          ? 'bg-blue-50 text-blue-600 font-medium'
          : 'text-gray-600 hover:bg-gray-100'
          }`}
      >
        <Icon size={20} />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-10">
        <div className="p-6 flex items-center space-x-2 border-b border-gray-100">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">F</span>
          </div>
          <span className="text-xl font-bold text-gray-800">Foundation</span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {currentUser?.role === 'student' ? (
            <>
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Aprendizaje</div>
              <NavItem view="classroom" icon={LayoutDashboard} label="Classroom" />
              <NavItem view="my-courses" icon={BookOpen} label="Mis Cursos" />
              <NavItem view="calendar" icon={Calendar} label="Calendario" />

              <div className="mt-8 px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Ayuda</div>
              <NavItem view="support" icon={HelpCircle} label="Soporte" />
            </>
          ) : (
            <>
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Administración</div>
              <NavItem view="admin-dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavItem view="admin-courses" icon={BookOpen} label="Gestor de Cursos" />
              <NavItem view="admin-students" icon={Users} label="Alumnos" />
              <NavItem view="admin-settings" icon={Settings} label="Configuración" />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center space-x-3 px-4 py-2">
            <img src={currentUser?.avatar} alt="User" className="w-8 h-8 rounded-full" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{currentUser?.name}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{currentUser?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20">
          <div className="flex items-center md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-600">
              <Menu size={24} />
            </button>
          </div>

          <div className="hidden md:flex flex-1 max-w-lg mx-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar cursos, lecciones..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-500">
              <Bell size={20} />
            </button>
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              <LogOut size={18} />
              <span>Salir</span>
            </button>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileMenuOpen(false)}></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white h-full">
              <div className="p-5 border-b border-gray-200">
                <span className="text-xl font-bold text-gray-800">Foundation</span>
              </div>
              <nav className="flex-1 px-2 py-4 space-y-1">
                {/* Re-use Nav Items logic simplified for mobile if needed, but for now copying structure */}
                {currentUser?.role === 'student' ? (
                  <>
                    <NavItem view="classroom" icon={LayoutDashboard} label="Classroom" />
                    <NavItem view="my-courses" icon={BookOpen} label="Mis Cursos" />
                  </>
                ) : (
                  <>
                    <NavItem view="admin-dashboard" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem view="admin-courses" icon={BookOpen} label="Gestor de Cursos" />
                  </>
                )}
                <div className="mt-8">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 bg-red-50 rounded-lg flex items-center space-x-2"
                  >
                    <LogOut size={18} />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
