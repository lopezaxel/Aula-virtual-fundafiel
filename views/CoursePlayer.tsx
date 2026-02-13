import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { ArrowLeft, CheckCircle, FileText, Download, Play, CheckCircle2 } from 'lucide-react';
import { Course, Lesson } from '../types';

interface CoursePlayerProps {
  courseId: string;
  onBack: () => void;
}

export const CoursePlayer: React.FC<CoursePlayerProps> = ({ courseId, onBack }) => {
  const { courses, lessonProgress, toggleLessonCompletion } = useStore();
  const course = courses.find(c => c.id === courseId);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    if (course && course.lessons.length > 0) {
      setActiveLesson(course.lessons[0]);
    }
  }, [course]);

  // Utility to convert normal YouTube links to embeddable ones
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    try {
      if (url.includes('watch?v=')) {
        const id = url.split('v=')[1].split('&')[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      if (url.includes('youtu.be/')) {
        const id = url.split('.be/')[1].split('?')[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      return url;
    } catch (e) {
      return url;
    }
  };

  const isCompleted = (lessonId: string) => lessonProgress.includes(lessonId);

  if (!course || !activeLesson) return <div>Cargando curso...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <button
        onClick={onBack}
        className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors w-fit underline-offset-4 hover:underline"
      >
        <ArrowLeft size={16} className="mr-1" />
        Volver a Classroom
      </button>

      <div className="flex flex-col lg:flex-row gap-6 h-full">
        <div className="flex-1 flex flex-col overflow-y-auto pr-2 custom-scrollbar">
          <div className="bg-black rounded-xl overflow-hidden aspect-video shadow-2xl mb-6 ring-1 ring-white/10">
            <iframe
              className="w-full h-full"
              src={getEmbedUrl(activeLesson.videoUrl)}
              title={activeLesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-black text-gray-900 mb-2 leading-tight">{activeLesson.title}</h1>
                <p className="text-gray-500 font-medium flex items-center gap-2 italic">
                  {course.title}
                </p>
              </div>
              <button
                onClick={() => toggleLessonCompletion(activeLesson.id, !isCompleted(activeLesson.id))}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 ${isCompleted(activeLesson.id)
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100'
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200'
                  }`}
              >
                {isCompleted(activeLesson.id) ? (
                  <>
                    <CheckCircle2 size={20} className="fill-emerald-600 text-white" />
                    Completada
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Completar Lección
                  </>
                )}
              </button>
            </div>

            <div className="prose prose-blue max-w-none text-gray-600 mb-8 leading-relaxed whitespace-pre-wrap">
              {activeLesson.description}
            </div>

            {activeLesson.materials.length > 0 && (
              <div className="pt-8 border-t border-gray-100">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] mb-4">Materiales de la Lección</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeLesson.materials.map(material => (
                    <a
                      key={material.id}
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 border border-gray-200 rounded-2xl hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
                    >
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mr-4 group-hover:rotate-6 transition-transform">
                        <FileText size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-700">{material.title}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-0.5">{material.type}</p>
                      </div>
                      <Download size={18} className="text-gray-300 group-hover:text-blue-600 group-hover:translate-y-0.5 transition-all" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-96 flex flex-col bg-white rounded-2xl border border-gray-200 h-fit max-h-full overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-black text-gray-900 text-lg">Contenido del Curso</h3>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{course.lessons.length} Lecciones</p>
              <div className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-black shadow-sm shadow-blue-200">
                {Math.round((lessonProgress.filter(id => course.lessons.some(l => l.id === id)).length / course.lessons.length) * 100)}%
              </div>
            </div>
          </div>
          <div className="overflow-y-auto p-3 space-y-2 max-h-[60vh] custom-scrollbar">
            {course.lessons.map((lesson, index) => {
              const isActive = activeLesson.id === lesson.id;
              const completed = isCompleted(lesson.id);
              return (
                <button
                  key={lesson.id}
                  onClick={() => setActiveLesson(lesson)}
                  className={`w-full flex items-start p-4 rounded-xl text-left transition-all ${isActive
                    ? 'bg-blue-50 border border-blue-100 shadow-sm'
                    : 'hover:bg-gray-50 border border-transparent'
                    }`}
                >
                  <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center text-xs mr-4 flex-shrink-0 font-black transition-colors ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : completed ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                    {completed ? <CheckCircle2 size={16} /> : index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-bold truncate ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                      {lesson.title}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1 flex items-center">
                      <Play size={10} className="mr-1 fill-gray-400" /> Lección
                    </p>
                  </div>
                  {completed && !isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-2 mt-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
