import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Settings,
  Globe,
  Save,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Role } from '../types';
import { useStore } from '../store';

export const AdminSettings = () => {
  const { createUserByAdmin } = useStore();
  const [activeTab, setActiveTab] = useState('general');
  const [platformName, setPlatformName] = useState('Foundation');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [logo, setLogo] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('admin_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.platformName) setPlatformName(parsed.platformName);
        if (parsed.primaryColor) setPrimaryColor(parsed.primaryColor);
        if (parsed.logo) setLogo(parsed.logo);
      } catch (e) {
        console.error("Error loading settings", e);
      }
    }
  }, []);

  const handleSave = () => {
    const settings = {
      platformName,
      primaryColor,
      logo,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('admin_settings', JSON.stringify(settings));

    // Show success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'users', label: 'Usuarios', icon: Users },
  ];

  const [newUser, setNewUser] = useState({ email: '', password: '', name: '', role: 'student' as Role });
  const [creatingUser, setCreatingUser] = useState(false);
  const [userSuccess, setUserSuccess] = useState<string | null>(null);
  const [userError, setUserError] = useState<string | null>(null);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    setUserError(null);
    setUserSuccess(null);

    try {
      // We'll call the store method we're about to add
      const { error } = await createUserByAdmin(newUser.email, newUser.password, newUser.name, newUser.role as Role);
      if (error) {
        setUserError(error.message);
      } else {
        setUserSuccess('Usuario creado exitosamente.');
        setNewUser({ email: '', password: '', name: '', role: 'student' });
      }
    } catch (err) {
      setUserError('Error inesperado al crear usuario.');
    } finally {
      setCreatingUser(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-6 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 anim-slide-from-top z-50">
          <CheckCircle2 size={20} />
          <span className="font-medium">¡Cambios guardados con éxito!</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h1>
          <p className="text-gray-500 mt-1">Administra las preferencias generales y los usuarios de tu plataforma.</p>
        </div>
        {activeTab === 'general' && (
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md active:scale-95 font-medium"
          >
            <Save size={18} />
            <span>Guardar Cambios</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200 p-4 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm border border-gray-100'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8">
          {activeTab === 'general' && (
            <div className="space-y-6 anim-slide-from-bottom">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Ajustes Generales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Nombre de la Plataforma</label>
                    <input
                      type="text"
                      value={platformName}
                      onChange={(e) => setPlatformName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="Ej: Aula Virtual Fundafiel"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Idioma Predeterminado</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                      <option>Español (ES)</option>
                      <option>English (EN)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-4 items-start">
                <Globe className="text-blue-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900">Configuración Regional</h4>
                  <p className="text-sm text-blue-700 mt-1">Afecta el formato de fecha, moneda y zona horaria de los reportes y actividades.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6 anim-slide-from-bottom">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Gestión de Usuarios</h3>
                <form onSubmit={handleCreateUser} className="max-w-md space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                      placeholder="Ej: Ana García"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Correo Electrónico</label>
                    <input
                      type="email"
                      required
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                      placeholder="alumno@email.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Contraseña Temporal</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Rol de Usuario</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                    >
                      <option value="student">Alumno</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>

                  {userError && (
                    <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-100">
                      {userError}
                    </div>
                  )}

                  {userSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100">
                      {userSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={creatingUser}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-95 font-bold uppercase tracking-widest text-xs disabled:opacity-50"
                  >
                    {creatingUser ? <Loader2 size={18} className="animate-spin" /> : <Users size={18} />}
                    <span>Crear Usuario</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
