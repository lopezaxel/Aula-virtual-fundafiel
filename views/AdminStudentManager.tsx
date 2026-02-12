import React, { useState } from 'react';
import { useStore } from '../store';
import { Users, BookOpen, CheckCircle2, XCircle, Search, Mail, ExternalLink, ShieldCheck, TrendingUp } from 'lucide-react';

export const AdminStudentManager: React.FC = () => {
    const { allStudents, courses, enrollments, toggleEnrollment } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

    const filteredStudents = allStudents.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedStudent = allStudents.find(s => s.id === selectedStudentId);

    const isEnrolled = (studentId: string, courseId: string) => {
        return enrollments.some(e => e.user_id === studentId && e.course_id === courseId);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestión de Alumnos</h1>
                    <p className="text-gray-500 text-sm mt-1">Administra el acceso a cursos y monitorea el progreso de tus estudiantes.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lista de Alumnos */}
                <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar alumno..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map(student => (
                                <button
                                    key={student.id}
                                    onClick={() => setSelectedStudentId(student.id)}
                                    className={`w-full p-4 flex items-center gap-4 hover:bg-blue-50/50 transition-colors text-left ${selectedStudentId === student.id ? 'bg-blue-50 border-r-4 border-blue-600' : ''
                                        }`}
                                >
                                    <img src={student.avatar} className="w-10 h-10 rounded-full border border-gray-200" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 truncate">{student.name}</p>
                                        <p className="text-xs text-gray-500">Miembro desde: {new Date(student.joinedAt).toLocaleDateString()}</p>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="p-12 text-center">
                                <Users size={32} className="mx-auto text-gray-300 mb-2" />
                                <p className="text-gray-400 text-sm">No se encontraron alumnos.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Detalle y Gestión de Cursos */}
                <div className="lg:col-span-2 space-y-6">
                    {selectedStudent ? (
                        <>
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-6">
                                <img src={selectedStudent.avatar} className="w-20 h-20 rounded-full border-4 border-blue-50 shadow-sm" />
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{selectedStudent.name}</h2>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                                            <Mail size={14} />
                                            {selectedStudent.email || 'Email no disponible'}
                                        </div>
                                        <div className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-wider">
                                            Perfil Estudiante
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        <ShieldCheck size={18} className="text-blue-600" />
                                        Permisos de Acceso a Cursos
                                    </h3>
                                    <span className="text-xs font-medium text-gray-400">
                                        Controla qué contenidos puede ver este alumno
                                    </span>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {courses.map(course => {
                                            const enrolled = isEnrolled(selectedStudent.id, course.id);
                                            return (
                                                <div
                                                    key={course.id}
                                                    className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between ${enrolled ? 'border-blue-100 bg-blue-50/30' : 'border-gray-100 hover:border-gray-200'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden shrink-0">
                                                            <img src={course.coverImage} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-sm line-clamp-1">{course.title}</p>
                                                            <p className="text-[10px] text-gray-500 uppercase font-bold">Inscrito: {enrolled ? 'SÍ' : 'NO'}</p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => toggleEnrollment(selectedStudent.id, course.id, !enrolled)}
                                                        className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase transition-all shadow-sm ${enrolled
                                                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                            : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                                                            }`}
                                                    >
                                                        {enrolled ? 'Quitar Acceso' : 'Habilitar'}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {courses.length === 0 && (
                                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            <BookOpen size={40} className="mx-auto text-gray-300 mb-2" />
                                            <p className="text-gray-400 text-sm italic">Debes crear cursos primero para poder asignarlos.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Progress Summary (Placeholder) */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <TrendingUp size={18} className="text-emerald-600" />
                                    Resumen de Actividad
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                                        <p className="text-2xl font-black text-gray-900">0</p>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase">Cursos Completos</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                                        <p className="text-2xl font-black text-gray-900">0%</p>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase">Progreso Global</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                                        <p className="text-2xl font-black text-gray-900">N/A</p>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase">Último Acceso</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 py-20 px-10 text-center">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-100 mb-6">
                                <Users size={40} className="text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Selecciona un Alumno</h3>
                            <p className="text-gray-500 mt-2 max-w-xs mx-auto">
                                Elige un alumno de la lista de la izquierda para ver su perfil y gestionar sus permisos de acceso.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
