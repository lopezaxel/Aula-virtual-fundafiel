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
  Menu,
  User
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
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
          ? 'bg-[#FF5722] text-white shadow-lg shadow-orange-900/20 font-bold'
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
      >
        <Icon size={20} />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-sans selection:bg-orange-100 selection:text-[#FF5722]">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0A1931] border-r border-white/5 fixed h-full z-10 shadow-2xl">
        <div className="p-6 flex items-center space-x-4 border-b border-white/5 bg-[#081426]">
          <div className="w-10 h-10 bg-[#FF5722] rounded-xl flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform">
            <span className="text-white font-serif font-black text-2xl">F</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-serif font-bold text-white leading-tight">Fundación</span>
            <span className="text-xs font-bold text-[#FF5722] uppercase tracking-[0.2em]">F I E L</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {currentUser?.role === 'student' ? (
            <>
              <div className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] opacity-50">Aprendizaje</div>
              <NavItem view="my-courses" icon={BookOpen} label="Mis Cursos" />
              <NavItem view="my-profile" icon={User} label="Mi Perfil" />
              <NavItem view="calendar" icon={Calendar} label="Calendario" />

              <div className="mt-8 px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] opacity-50">Ayuda</div>
              <NavItem view="support" icon={HelpCircle} label="Soporte" />
            </>
          ) : (
            <>
              <div className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] opacity-50">Administración</div>
              <NavItem view="admin-dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavItem view="admin-courses" icon={BookOpen} label="Gestor de Cursos" />
              <NavItem view="admin-students" icon={Users} label="Alumnos" />
              <NavItem view="admin-settings" icon={Settings} label="Configuración" />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-white/5 bg-[#081426]">
          <div className="flex items-center space-x-3 px-4 py-2 bg-white/5 rounded-2xl border border-white/10">
            <img src={currentUser?.avatar} alt="User" className="w-8 h-8 rounded-full border border-white/20" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{currentUser?.name}</p>
              <p className="text-[10px] text-[#FF5722] font-black uppercase tracking-wider">{currentUser?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-400 hover:text-[#FF5722] rounded transition-colors"
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
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#0A1931] h-full shadow-xl">
              <div className="p-6 flex items-center space-x-4 border-b border-white/5 bg-[#081426]">
                <div className="w-10 h-10 bg-[#FF5722] rounded-xl flex items-center justify-center">
                  <span className="text-white font-serif font-black text-2xl">F</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-serif font-bold text-white leading-tight">Fundación</span>
                  <span className="text-xs font-bold text-[#FF5722] uppercase tracking-[0.2em]">F I E L</span>
                </div>
              </div>
              <nav className="flex-1 px-2 py-4 space-y-1">
                {/* Re-use Nav Items logic simplified for mobile if needed, but for now copying structure */}
                {currentUser?.role === 'student' ? (
                  <>
                    <NavItem view="my-courses" icon={BookOpen} label="Mis Cursos" />
                    <NavItem view="my-profile" icon={User} label="Mi Perfil" />
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
