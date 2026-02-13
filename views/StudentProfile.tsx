import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { User, Mail, Phone, Camera, Save, Loader2, CheckCircle } from 'lucide-react';

export const StudentProfile: React.FC = () => {
    const { currentUser, updateProfile, uploadFile } = useStore();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        avatar: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.name || '',
                email: currentUser.email || '',
                phone: currentUser.phone || '',
                avatar: currentUser.avatar || ''
            });
        }
    }, [currentUser]);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const { url, error } = await uploadFile(file, 'avatars');
            if (error) throw error;
            if (url) {
                setFormData(prev => ({ ...prev, avatar: url }));
            }
        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Error al subir la imagen');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveSuccess(false);

        try {
            const { error } = await updateProfile({
                name: formData.name,
                avatar: formData.avatar,
                phone: formData.phone
            });

            if (error) throw error;
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error al guardar los cambios');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-10 text-center sm:text-left">
                <h1 className="text-4xl font-serif font-black text-[#0A1931] tracking-tight">Mi Perfil</h1>
                <p className="text-gray-500 mt-2 font-medium">Administra tu información personal y foto de perfil en la Fundación FIEL.</p>
                <div className="w-20 h-1.5 bg-[#FF5722] mt-4 rounded-full mx-auto sm:mx-0"></div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200 border border-gray-100 overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <div className="p-8 space-y-8">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white bg-gray-100 shadow-xl relative ring-4 ring-orange-50">
                                    <img
                                        src={formData.avatar || `https://ui-avatars.com/api/?name=${formData.name}&background=random`}
                                        className="w-full h-full object-cover"
                                        alt="Profile"
                                    />
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <Loader2 className="text-white animate-spin" size={24} />
                                        </div>
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 p-3 bg-[#FF5722] text-white rounded-full shadow-lg cursor-pointer hover:bg-[#E64A19] transition-all transform hover:scale-110 active:scale-90">
                                    <Camera size={20} />
                                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploading} />
                                </label>
                            </div>
                            <div className="flex-1 text-center sm:text-left pt-4">
                                <h3 className="text-2xl font-serif font-bold text-[#0A1931]">{formData.name || 'Tu Nombre'}</h3>
                                <p className="text-base text-gray-500 font-medium">{formData.email}</p>
                                <p className="text-xs text-[#FF5722] font-black uppercase tracking-wider mt-2 bg-orange-50 inline-block px-3 py-1 rounded-full">Alumno Verificado</p>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Nombre y Apellido Completo</label>
                                <div className="relative">
                                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        placeholder="Ej: Juan Pérez"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Correo Electrónico</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        disabled
                                        value={formData.email}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed outline-none"
                                        placeholder="tu@email.com"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 italic">El correo no se puede cambiar por seguridad</p>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Número de Celular</label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-[1rem] focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF5722] outline-none transition-all font-medium"
                                        placeholder="Ej: +54 9 11 1234 5678"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                        {saveSuccess ? (
                            <div className="flex items-center text-emerald-600 text-sm font-bold animate-in fade-in slide-in-from-left-2">
                                <CheckCircle size={18} className="mr-2" />
                                ¡Cambios guardados con éxito!
                            </div>
                        ) : (
                            <div className="text-gray-400 text-sm">
                                Asegúrate de guardar tus cambios antes de salir.
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex items-center px-8 py-3 bg-[#FF5722] text-white rounded-[1rem] font-black uppercase tracking-widest text-xs hover:bg-[#E64A19] shadow-xl shadow-orange-900/20 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 size={18} className="mr-2 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save size={18} className="mr-2" />
                                    Guardar Perfil
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
