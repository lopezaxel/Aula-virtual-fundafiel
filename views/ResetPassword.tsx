import React, { useState } from 'react';
import { useStore } from '../store';
import { supabase } from '../lib/supabase';
import { Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export const ResetPassword = ({ onComplete }: { onComplete: () => void }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);
        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) throw updateError;

            // Sign out so the user logs in fresh with their new password
            await supabase.auth.signOut();

            setSuccess(true);
            setTimeout(() => {
                onComplete();
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Error al actualizar la contraseña');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-12 text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                            <CheckCircle2 size={40} />
                        </div>
                    </div>
                    <h2 className="text-3xl font-serif font-black text-[#0A1931]">¡Contraseña Guardada!</h2>
                    <p className="text-gray-500 font-medium">Tu contraseña fue actualizada con éxito. Ahora podés ingresar al aula con tu correo y tu nueva contraseña.</p>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Redirigiendo al inicio de sesión...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-4 selection:bg-orange-100 selection:text-[#FF5722]">
            <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 p-8 sm:p-12 border border-white/50 backdrop-blur-sm">
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-[#FF5722]">
                            <Lock size={30} />
                        </div>
                    </div>
                    <h1 className="text-4xl font-serif font-black text-[#0A1931] mb-2 tracking-tight">Nueva Contraseña</h1>
                    <p className="text-gray-500 font-medium tracking-wide text-sm">
                        ESTABLECE TU CLAVE DE ACCESO DEFINITIVA
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nueva Contraseña</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF5722] rounded-2xl outline-none transition-all font-medium"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirmar Contraseña</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF5722] rounded-2xl outline-none transition-all font-medium"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center space-x-3 anim-slide-from-top">
                            <AlertCircle size={20} className="text-red-500 shrink-0" />
                            <p className="text-xs text-red-700 font-bold">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#FF5722] text-white font-black uppercase tracking-[0.2em] text-xs py-5 rounded-2xl transition-all shadow-xl shadow-orange-900/20 hover:bg-[#E64A19] hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-3">
                                <Loader2 size={18} className="animate-spin" />
                                <span>Actualizando...</span>
                            </div>
                        ) : (
                            <span>Guardar Contraseña</span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
