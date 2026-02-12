import React, { useState, useEffect, useRef } from 'react';
import {
  Palette,
  Settings,
  Globe,
  Mail,
  Bell,
  Shield,
  Save,
  Image as ImageIcon,
  Moon,
  Sun,
  Database,
  CheckCircle2
} from 'lucide-react';

export const AdminSettings = () => {
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
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'security', label: 'Seguridad', icon: Shield },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-6 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 z-50">
          <CheckCircle2 size={20} />
          <span className="font-medium">¡Cambios guardados con éxito!</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h1>
          <p className="text-gray-500 mt-1">Administra las preferencias generales y personalización de tu plataforma.</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md active:scale-95 font-medium"
        >
          <Save size={18} />
          <span>Guardar Cambios</span>
        </button>
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
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
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

          {activeTab === 'branding' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Personalización Visual</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Logotipo Institucional</label>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 overflow-hidden relative group">
                          {logo ? (
                            <img src={logo} alt="Logo Preview" className="w-full h-full object-contain" />
                          ) : (
                            <ImageIcon size={32} />
                          )}
                          <div
                            onClick={handleLogoClick}
                            className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <span className="text-xs font-medium">Cambiar</span>
                          </div>
                        </div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          onClick={handleLogoClick}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
                        >
                          Cargar Imagen
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Recomendado: PNG o SVG de 200x50px.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Color Primario</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-10 h-10 border-none rounded cursor-pointer ring-1 ring-gray-200 shadow-sm"
                        />
                        <span className="text-sm font-mono text-gray-600 uppercase font-medium">{primaryColor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Tema del Dashboard</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button className="flex flex-col items-center gap-3 p-4 border-2 border-blue-600 bg-blue-50 rounded-xl transition-all">
                          <Sun className="text-blue-600" />
                          <span className="text-sm font-medium text-blue-600">Claro</span>
                        </button>
                        <button className="flex flex-col items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all opacity-50 cursor-not-allowed">
                          <Moon className="text-gray-400" />
                          <span className="text-sm font-medium text-gray-600">Oscuro</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-400 italic mt-1 text-center font-medium">* Modo oscuro en desarrollo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Comunicaciones</h3>
                <div className="space-y-4">
                  {[
                    { title: 'Bienvenida a nuevos alumnos', desc: 'Enviar correo automático al inscribirse.', icon: Mail },
                    { title: 'Recordatorios de curso', desc: 'Alertas sobre fechas de finalización próximas.', icon: Bell },
                    { title: 'Confirmación de pago', desc: 'Enviar recibo digital tras compra de curso.', icon: Database },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-200 transition-colors">
                      <div className="flex gap-4 items-center">
                        <div className="p-2 bg-gray-50 rounded-lg">
                          <item.icon size={20} className="text-gray-500" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={idx === 0} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Seguridad y Acceso</h3>
                <div className="space-y-4">
                  <div className="p-4 border border-red-100 bg-red-50 rounded-xl">
                    <h4 className="text-sm font-semibold text-red-900 mb-2">Zona Crítica</h4>
                    <p className="text-xs text-red-700 mb-4">Estas configuraciones afectan la integridad de los datos de la plataforma.</p>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors active:scale-95 shadow-sm">
                      Restablecer base de datos
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
