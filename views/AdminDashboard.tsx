import React, { useEffect } from 'react';
import { useStore } from '../store';
import { Users, BookOpen, TrendingUp, BarChart3, Loader2 } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { courses, stats, allStudents, refreshStats } = useStore();

  useEffect(() => {
    refreshStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center">
      <div className={`p-3 rounded-lg ${color} mr-4`}>
        <Icon className="text-white" size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-500 text-sm mt-1">Monitorea el crecimiento y rendimiento de tu aula virtual.</p>
        </div>
        <div className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
          Sincronizado con Supabase
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Alumnos" value={stats.totalStudents} icon={Users} color="bg-blue-600" />
        <StatCard title="Cursos Activos" value={stats.activeCourses} icon={BookOpen} color="bg-indigo-600" />
        <StatCard title="Tasa de Finalización" value={`${stats.completionRate}%`} icon={TrendingUp} color="bg-emerald-600" />
        <StatCard title="Total Cursos" value={courses.length} icon={BarChart3} color="bg-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Alumnos Recientes</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-bold">Ver todos</button>
          </div>
          <div className="flex-1">
            {allStudents.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {allStudents.slice(0, 5).map(student => (
                  <div key={student.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <img src={student.avatar} className="w-10 h-10 rounded-full border border-gray-200" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 leading-tight">{student.name}</p>
                      <p className="text-xs text-gray-500">Registrado: {new Date(student.joinedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded uppercase">Activo</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Users size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm font-medium">No hay alumnos registrados aún.</p>
                <p className="text-gray-400 text-xs mt-1">Los nuevos alumnos aparecerán automáticamente aquí.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions / Course Performance */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
          <div className="px-6 py-4 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
            <h3 className="font-bold text-gray-900">Rendimiento de Cursos</h3>
          </div>
          <div className="p-6 space-y-4 bg-white/80 backdrop-blur-sm h-full">
            {courses.length > 0 ? (
              courses.map(course => (
                <div key={course.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-lg bg-gray-50 mr-4 overflow-hidden border border-gray-100">
                      <img src={course.coverImage} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm leading-tight">{course.title}</p>
                      <p className="text-[11px] text-gray-500 font-medium">{course.lessons?.length || 0} Lecciones</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <Users size={12} className="text-gray-400" />
                      <p className="font-black text-gray-900 text-sm">0</p>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Inscritos</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-48 py-8 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <BookOpen size={32} className="text-gray-300 mb-2" />
                <p className="text-gray-400 text-sm font-medium italic">No se encontraron cursos activos.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
