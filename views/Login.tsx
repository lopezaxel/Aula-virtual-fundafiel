import React, { useState } from 'react';
import { useStore } from '../store';
import { AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import type { Role } from '../types';

// Custom Logo Component for Fundación FIEL
const Logo = () => (
    <div className="flex flex-col items-center justify-center mb-6">
        <svg width="180" height="150" viewBox="0 0 400 350" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xl hover:scale-105 transition-transform duration-500">
            {/* Curved Orange Stroke Top */}
            <path d="M100 80C150 60 250 60 300 80" stroke="#FF5722" strokeWidth="8" strokeLinecap="round" strokeDasharray="5 5" opacity="0.6" />

            {/* Large Orange F */}
            <text x="50" y="220" fontSize="180" fill="#FF5722" fontWeight="900" style={{ fontFamily: 'Playfair Display, serif' }}>F</text>

            {/* UNDA IEL Text */}
            <text x="140" y="150" fontSize="70" fill="#0A1931" fontWeight="700" style={{ fontFamily: 'serif' }}>UNDA</text>
            <text x="140" y="240" fontSize="70" fill="#0A1931" fontWeight="700" style={{ fontFamily: 'serif' }}>IEL</text>

            {/* Open Book Icon Replacement */}
            <g transform="translate(280, 180) scale(1.5)">
                <path d="M24 4H6a2 2 0 00-2 2v12a2 2 0 002 2h18" stroke="#0A1931" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 18l4-4 4 4 4-4 4 4" stroke="#0A1931" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </g>

            {/* Curved Orange Stroke Bottom */}
            <path d="M80 280C140 310 260 310 320 280" stroke="#FF5722" strokeWidth="12" strokeLinecap="round" />
        </svg>
    </div>
);

export const Login: React.FC = () => {
    const { signIn, signUp, loading } = useStore();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<Role>('student');
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!email || !password) {
            setError('Por favor completa todos los campos');
            return;
        }

        if (isSignUp && !name) {
            setError('Por favor ingresa tu nombre');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        try {
            if (isSignUp) {
                const { error: signUpError } = await signUp(email, password, name, role);
                if (signUpError) {
                    setError(signUpError.message);
                } else {
                    setSuccess('¡Cuenta creada exitosamente! Revisa tu email para confirmar tu cuenta.');
                    setEmail('');
                    setPassword('');
                    setName('');
                }
            } else {
                const { error: signInError } = await signIn(email, password);
                if (signInError) {
                    setError('usuario no existe');
                }
            }
        } catch (err) {
            setError('Ocurrió un error. Por favor intenta nuevamente.');
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-4 selection:bg-orange-100 selection:text-[#FF5722]">
            {/* Background Accent */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-50 rounded-full blur-3xl opacity-50 -mr-64 -mt-64"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-100 rounded-full blur-3xl opacity-50 -ml-64 -mb-64"></div>
            </div>

            <div className="w-full max-w-lg relative z-10">
                <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 p-8 sm:p-12 border border-white/50 backdrop-blur-sm">
                    {/* Brand Section */}
                    <div className="text-center">
                        <Logo />
                        <h1 className="text-4xl font-serif font-black text-[#0A1931] mb-2 tracking-tight">Aula Virtual FIEL</h1>
                        <p className="text-gray-500 font-medium tracking-wide text-sm mb-10">
                            {isSignUp ? 'CREA TU PERFIL PROFESIONAL' : 'BIENVENIDO AL ÁREA DE FORMACIÓN'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Correo Institucional</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full px-5 py-4 bg-gray-50 border ${error ? 'border-red-300 ring-4 ring-red-500/10' : 'border-gray-100 focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF5722]'} rounded-2xl outline-none transition-all font-medium`}
                                placeholder="tu@email.com"
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contraseña</label>
                            <div className="relative group">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full px-5 py-4 bg-gray-50 border ${error ? 'border-red-300 ring-4 ring-red-500/10' : 'border-gray-100 focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF5722]'} rounded-2xl outline-none transition-all font-medium pr-14`}
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[#FF5722] transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
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
                                    <span>Verificando...</span>
                                </div>
                            ) : (
                                <span>Acceder al Aula</span>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-12">
                    Fundación FIEL • Educación e Inclusión Laboral
                </p>
            </div>
        </div>
    );
};
