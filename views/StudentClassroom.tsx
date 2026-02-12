import React from 'react';
import { useStore } from '../store';
import { PlayCircle, Clock, BookOpen, Lock } from 'lucide-react';

interface StudentClassroomProps {
  onCourseSelect: (courseId: string) => void;
}

export const StudentClassroom: React.FC<StudentClassroomProps> = ({ onCourseSelect }) => {
  const { courses, enrollments, currentUser } = useStore();

  // Filtrar cursos: deben estar publicados Y el usuario debe estar inscrito (si es alumno)
  const availableCourses = courses.filter(course => {
    if (!course.published) return false;
    // Si es administrador, ve todos los publicados. Si es alumno, solo los inscritos.
    if (currentUser?.role === 'admin') return true;
    return enrollments.some(e => e.user_id === currentUser?.id && e.course_id === course.id);
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mi Aula Virtual</h1>
        <p className="text-gray-500 mt-1">Explora tus cursos y continúa con tu aprendizaje.</p>
      </div>

      {availableCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableCourses.map(course => (
            <div
              key={course.id}
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full"
              onClick={() => onCourseSelect(course.id)}
            >
              <div className="relative h-48 bg-gray-200 overflow-hidden">
                <img
                  src={course.coverImage}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <PlayCircle className="text-white drop-shadow-lg" size={48} />
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                    {course.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock size={14} className="mr-1" />
                    <span>{course.lessons?.length || 0} Lecciones</span>
                  </div>
                  <div className="flex items-center">
                    <img src={`https://ui-avatars.com/api/?name=${course.instructor}&background=random`} alt={course.instructor} className="w-6 h-6 rounded-full mr-2" />
                    <span className="text-xs font-medium text-gray-700">{course.instructor}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-96 py-12 px-6 text-center bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md mb-4">
            <Lock className="text-gray-300" size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No tienes cursos activos</h3>
          <p className="text-gray-500 mt-2 max-w-sm mx-auto">
            Aún no tienes acceso a ningún curso. Póngase en contacto con el administrador para que le otorgue los permisos necesarios.
          </p>
        </div>
      )}
    </div>
  );
};
