import React, { useState } from 'react';
import { useStore } from '../store';
import { Users, BookOpen, CheckCircle2, XCircle, Search, Mail, ExternalLink, ShieldCheck, TrendingUp, Phone, Trash2, AlertCircle } from 'lucide-react';

export const AdminStudentManager: React.FC = () => {
    const { allStudents, courses, enrollments, toggleEnrollment, deleteStudent } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const filteredStudents = allStudents.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedStudent = allStudents.find(s => s.id === selectedStudentId);

    const isEnrolled = (studentId: string, courseId: string) => {
        return enrollments.some(e => e.user_id === studentId && e.course_id === courseId);
    };

    const handleDelete = async () => {
        if (!selectedStudentId) return;
        setIsDeleting(true);
        try {
            const { error } = await deleteStudent(selectedStudentId);
            if (error) {
                alert('Error al eliminar alumno: ' + error.message);
            } else {
                setSelectedStudentId(null);
                setShowDeleteConfirm(false);
            }
        } catch (error) {
            alert('Error inesperado al eliminar alumno');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-serif font-black text-[#0A1931] tracking-tight">Gestión de Alumnos</h1>
                    <p className="text-gray-500 font-medium mt-2">Administra el acceso a cursos y monitorea el progreso en Fundación FIEL.</p>
                    <div className="w-20 h-1.5 bg-[#FF5722] mt-4 rounded-full"></div>
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
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF5722] outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map(student => (
                                <button
                                    key={student.id}
                                    onClick={() => setSelectedStudentId(student.id)}
                                    className={`w-full p-4 flex items-center gap-4 hover:bg-orange-50/50 transition-colors text-left ${selectedStudentId === student.id ? 'bg-orange-50 border-r-4 border-[#FF5722]' : ''
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
                            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-slate-200/50 flex items-center gap-8">
                                <img src={selectedStudent.avatar} className="w-24 h-24 rounded-full border-4 border-white shadow-xl ring-4 ring-orange-50" />
                                <div>
                                    <h2 className="text-3xl font-serif font-black text-[#0A1931]">{selectedStudent.name}</h2>
                                    <div className="flex flex-wrap items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                                            <Mail size={14} />
                                            {selectedStudent.email || 'Email no disponible'}
                                        </div>
                                        {selectedStudent.phone && (
                                            <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                                                <Phone size={14} />
                                                {selectedStudent.phone}
                                            </div>
                                        )}
                                        <div className="px-3 py-1 bg-orange-50 text-[#FF5722] text-[10px] font-black rounded-lg uppercase tracking-widest">
                                            Perfil Estudiante
                                        </div>
                                    </div>
                                </div>
                                <div className="ml-auto">
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors title='Eliminar Alumno'"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>

                            {showDeleteConfirm && (
                                <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-4">
                                    <AlertCircle className="text-red-600 shrink-0" size={20} />
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-red-900">¿Confirmas la baja del alumno?</h4>
                                        <p className="text-xs text-red-700 mt-1">
                                            Esta acción eliminará el perfil del alumno y todos sus accesos a cursos. Esta acción no se puede deshacer.
                                        </p>
                                        <div className="flex gap-3 mt-3">
                                            <button
                                                onClick={handleDelete}
                                                disabled={isDeleting}
                                                className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 disabled:opacity-50"
                                            >
                                                {isDeleting ? 'Eliminando...' : 'Sí, Eliminar Alumno'}
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteConfirm(false)}
                                                className="px-3 py-1.5 bg-white text-gray-600 text-xs font-bold rounded-lg border border-gray-200 hover:bg-gray-50"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                                <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                                    <h3 className="font-serif font-bold text-[#0A1931] text-lg flex items-center gap-2">
                                        <ShieldCheck size={18} className="text-[#FF5722]" />
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
                                                    className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${enrolled ? 'border-orange-100 bg-orange-50/20' : 'border-gray-50 hover:border-orange-100 hover:bg-orange-50/5'
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
                                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md ${enrolled
                                                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                            : 'bg-[#FF5722] text-white hover:bg-[#E64A19] active:scale-95'
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
