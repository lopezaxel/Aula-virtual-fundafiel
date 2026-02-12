import React, { useState } from 'react';
import { useStore } from '../store';
import { BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import type { Role } from '../types';

export const Login: React.FC = () => {
    const { signIn, signUp, loading } = useStore();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<Role>('student');
    const [error, setError] = useState<string | null>(null);
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
                    setSuccess('¡Cuenta creada exitosamente! Por favor revisa tu email (incluyendo spam) para confirmar tu cuenta. Una vez confirmado, podrás iniciar sesión.');
                    // Clear form
                    setEmail('');
                    setPassword('');
                    setName('');
                }
            } else {
                const { error: signInError } = await signIn(email, password);
                if (signInError) {
                    if (signInError.message.includes('Email not confirmed')) {
                        setError('Por favor confirma tu email antes de iniciar sesión. Revisa tu bandeja de entrada.');
                    } else {
                        setError('Email o contraseña incorrectos. Si acabas de registrarte, asegúrate de haber confirmado tu email.');
                    }
                }
            }
        } catch (err) {
            setError('Ocurrió un error. Por favor intenta nuevamente.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
                        <BookOpen size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Aula Virtual Fundafiel</h1>
                    <p className="text-gray-600">
                        {isSignUp ? 'Crea tu cuenta para comenzar' : 'Inicia sesión para continuar'}
                    </p>
                </div>

                {/* Login/Register Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name field (only for signup) */}
                        {isSignUp && (
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre completo
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    placeholder="Juan Pérez"
                                    disabled={loading}
                                />
                            </div>
                        )}

                        {/* Email field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                placeholder="tu@email.com"
                                disabled={loading}
                            />
                        </div>

                        {/* Password field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                placeholder="••••••••"
                                disabled={loading}
                            />
                        </div>

                        {/* Role selector (only for signup) */}
                        {isSignUp && (
                            <div>
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de cuenta
                                </label>
                                <select
                                    id="role"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as Role)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    disabled={loading}
                                >
                                    <option value="student">Alumno</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                        )}

                        {/* Error message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                                <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        {/* Success message */}
                        {success && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm text-green-700">{success}</p>
                            </div>
                        )}

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    <span>Procesando...</span>
                                </>
                            ) : (
                                <span>{isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}</span>
                            )}
                        </button>
                    </form>

                    {/* Toggle between login and signup */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError(null);
                                setSuccess(null);
                            }}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            disabled={loading}
                        >
                            {isSignUp ? '¿Ya tienes una cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-8">
                    © 2026 Fundación Fundafiel. Todos los derechos reservados.
                </p>
            </div>
        </div>
    );
};
