import React, { useEffect } from 'react';
import { useStore } from '../store';
import { Users, BookOpen, TrendingUp, BarChart3, Loader2 } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { courses, stats, allStudents, refreshStats } = useStore();

  useEffect(() => {
    refreshStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-slate-200/50 flex items-center transition-all hover:-translate-y-1">
      <div className={`p-4 rounded-2xl ${color} mr-5 shadow-lg`}>
        <Icon className="text-white" size={24} />
      </div>
      <div>
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-2">{title}</p>
        <p className="text-3xl font-serif font-black text-[#0A1931]">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-serif font-black text-[#0A1931] tracking-tight">Panel Administrativo</h1>
          <p className="text-gray-500 font-medium mt-2">Gestiona el ecosistema educativo de la Fundación FIEL.</p>
          <div className="w-20 h-1.5 bg-[#FF5722] mt-4 rounded-full"></div>
        </div>
        <div className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
          Sincronizado con Supabase
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Alumnos" value={stats.totalStudents} icon={Users} color="bg-[#0A1931]" />
        <StatCard title="Cursos Activos" value={stats.activeCourses} icon={BookOpen} color="bg-[#FF5722]" />
        <StatCard title="Tasa Finalización" value={`${stats.completionRate}%`} icon={TrendingUp} color="bg-emerald-600" />
        <StatCard title="Total Cursos" value={courses.length} icon={BarChart3} color="bg-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students Table */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col">
          <div className="px-8 py-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
            <h3 className="font-serif font-bold text-[#0A1931] text-lg">Alumnos Recientes</h3>
            <button className="text-xs font-black uppercase tracking-widest text-[#FF5722] hover:text-[#E64A19] transition-colors">Ver todos</button>
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
                    <div className="px-2 py-1 bg-orange-50 text-[#FF5722] text-[10px] font-black rounded-lg uppercase tracking-tighter">Activo</div>
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
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-50 bg-white/90 backdrop-blur-sm">
            <h3 className="font-serif font-bold text-[#0A1931] text-lg">Rendimiento de Cursos</h3>
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
