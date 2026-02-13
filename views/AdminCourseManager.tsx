import React, { useState } from 'react';
import { useStore } from '../store';
import { Course, Lesson, Material } from '../types';
import { Plus, Edit2, Trash2, GripVertical, Video, FileText, ChevronRight, X, Save, Loader2, BookOpen, Upload, Paperclip } from 'lucide-react';

export const AdminCourseManager: React.FC = () => {
  const { courses, addCourse, updateCourse, deleteCourse, currentUser, uploadFile } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Partial<Course>>({});
  const [activeTab, setActiveTab] = useState<'details' | 'curriculum'>('details');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingMaterial, setUploadingMaterial] = useState<number | null>(null);

  const handleCreateNew = () => {
    setCurrentCourse({
      title: '',
      description: '',
      coverImage: 'https://picsum.photos/800/400',
      instructor: currentUser?.name || 'Administrador',
      published: false,
      lessons: []
    });
    setIsEditing(true);
    setActiveTab('details');
  };

  const handleEdit = (course: Course) => {
    setCurrentCourse({ ...course });
    setIsEditing(true);
    setActiveTab('details');
  };

  const handleSaveCourse = async () => {
    if (!currentCourse.title) return alert('El título es requerido');

    setIsSaving(true);
    try {
      if (currentCourse.id) {
        await updateCourse(currentCourse as Course);
      } else {
        await addCourse(currentCourse);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Error al guardar el curso');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer.')) {
      try {
        await deleteCourse(id);
      } catch (error) {
        console.error('Error deleting course:', error);
        alert('Error al eliminar el curso');
      }
    }
  };

  // File Upload Handlers
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const { url, error } = await uploadFile(file, 'covers');
      if (error) throw error;
      if (url) setCurrentCourse({ ...currentCourse, coverImage: url });
    } catch (error) {
      console.error('Error uploading cover:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleMaterialUpload = async (lessonIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMaterial(lessonIndex);
    try {
      const { url, error } = await uploadFile(file, 'materials');
      if (error) throw error;

      if (url) {
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        let type: Material['type'] = 'link';
        if (['pdf'].includes(fileExt || '')) type = 'pdf';
        else if (['doc', 'docx'].includes(fileExt || '')) type = 'doc';
        else if (['xls', 'xlsx'].includes(fileExt || '')) type = 'excel';
        else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt || '')) type = 'image';

        const newMaterial: Material = {
          id: Math.random().toString(36).substr(2, 9),
          title: file.name,
          type,
          url
        };

        const updatedLessons = [...(currentCourse.lessons || [])];
        updatedLessons[lessonIndex].materials = [...(updatedLessons[lessonIndex].materials || []), newMaterial];
        setCurrentCourse({ ...currentCourse, lessons: updatedLessons });
      }
    } catch (error) {
      console.error('Error uploading material:', error);
      alert('Error al subir el material');
    } finally {
      setUploadingMaterial(null);
    }
  };

  const deleteMaterial = (lessonIndex: number, materialId: string) => {
    const updatedLessons = [...(currentCourse.lessons || [])];
    updatedLessons[lessonIndex].materials = updatedLessons[lessonIndex].materials.filter(m => m.id !== materialId);
    setCurrentCourse({ ...currentCourse, lessons: updatedLessons });
  };

  // Lesson Management Handlers (Temporarily simplified for DB sync)
  const addLesson = () => {
    const newLesson: any = {
      title: 'Nueva Lección',
      description: '',
      videoUrl: '',
      materials: []
    };
    setCurrentCourse(prev => ({
      ...prev,
      lessons: [...(prev.lessons || []), newLesson]
    }));
  };

  const updateLesson = (index: number, field: keyof Lesson, value: any) => {
    setCurrentCourse(prev => ({
      ...prev,
      lessons: prev.lessons?.map((l, i) => i === index ? { ...l, [field]: value } : l)
    }));
  };

  const deleteLesson = (index: number) => {
    setCurrentCourse(prev => ({
      ...prev,
      lessons: prev.lessons?.filter((_, i) => i !== index)
    }));
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-900" disabled={isSaving}>
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold text-gray-900">
              {currentCourse.id ? 'Editar Curso' : 'Nuevo Curso'}
            </h2>
          </div>
          <button
            onClick={handleSaveCourse}
            disabled={isSaving}
            className="flex items-center px-6 py-2 bg-[#FF5722] text-white rounded-xl hover:bg-[#E64A19] shadow-lg shadow-orange-900/20 transition-all font-bold disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 size={18} className="mr-2 animate-spin" />
            ) : (
              <Save size={18} className="mr-2" />
            )}
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>

        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'details' ? 'border-[#FF5722] text-[#FF5722]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            Detalles Generales
          </button>
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'curriculum' ? 'border-[#FF5722] text-[#FF5722]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            Contenido / Lecciones
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {activeTab === 'details' ? (
            <div className="max-w-2xl space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título del Curso</label>
                <input
                  type="text"
                  value={currentCourse.title || ''}
                  onChange={e => setCurrentCourse({ ...currentCourse, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF5722] outline-none transition-all font-medium"
                  placeholder="Ej: Masterclass de Finanzas"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={currentCourse.description || ''}
                  onChange={e => setCurrentCourse({ ...currentCourse, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF5722] outline-none transition-all font-medium"
                  placeholder="De qué trata el curso..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Imagen de Portada</label>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-xl hover:bg-gray-50 hover:border-blue-300 transition-all group">
                        {uploadingCover ? (
                          <Loader2 size={18} className="animate-spin text-blue-600" />
                        ) : (
                          <Upload size={18} className="text-gray-400 group-hover:text-blue-500" />
                        )}
                        <span className="text-sm font-medium text-gray-600">Subir desde PC</span>
                      </div>
                      <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                    </label>
                    <div className="text-gray-300 text-xs font-bold">O</div>
                    <input
                      type="text"
                      value={currentCourse.coverImage || ''}
                      onChange={e => setCurrentCourse({ ...currentCourse, coverImage: e.target.value })}
                      className="flex-[2] px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                      placeholder="Pegar URL de imagen..."
                    />
                  </div>
                  {currentCourse.coverImage && (
                    <div className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm aspect-video">
                      <img src={currentCourse.coverImage} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => setCurrentCourse({ ...currentCourse, coverImage: '' })}
                          className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <input
                  id="published"
                  type="checkbox"
                  checked={currentCourse.published || false}
                  onChange={e => setCurrentCourse({ ...currentCourse, published: e.target.checked })}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-md cursor-pointer"
                />
                <label htmlFor="published" className="ml-3 block text-sm text-gray-700 font-bold cursor-pointer">
                  Publicar curso inmediatamente
                </label>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-gray-900 text-lg">Estructura del Curso</h3>
                <button onClick={addLesson} className="flex items-center text-xs font-black uppercase tracking-widest text-[#FF5722] bg-orange-50 px-4 py-2 rounded-xl hover:bg-orange-100 transition-all active:scale-95">
                  <Plus size={16} className="mr-1" /> Añadir Lección
                </button>
              </div>

              {currentCourse.lessons?.map((lesson, index) => (
                <div key={index} className="p-5 bg-white border border-gray-200 rounded-2xl space-y-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex gap-4 items-start">
                    <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                      <GripVertical size={20} />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex gap-4">
                        <input
                          type="text"
                          value={lesson.title}
                          onChange={(e) => updateLesson(index, 'title', e.target.value)}
                          className="flex-1 px-4 py-2.5 bg-gray-50 border-none rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:font-normal"
                          placeholder="Título de la lección"
                        />
                        <button onClick={() => deleteLesson(index)} className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 size={20} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="relative">
                          <Video size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={lesson.videoUrl || ''}
                            onChange={(e) => updateLesson(index, 'videoUrl', e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            placeholder="URL del Video (YouTube/Vimeo)"
                          />
                        </div>
                      </div>

                      {/* Material de Estudio */}
                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-3">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Paperclip size={14} /> Material de Estudio
                          </label>
                          <label className="cursor-pointer">
                            <div className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                              {uploadingMaterial === index ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                              Subir Material
                            </div>
                            <input type="file" onChange={(e) => handleMaterialUpload(index, e)} className="hidden" />
                          </label>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {lesson.materials?.map(material => (
                            <div key={material.id} className="group flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-gray-600">
                              <FileText size={14} className="text-blue-500" />
                              <span className="truncate max-w-[150px]">{material.title}</span>
                              <button onClick={() => deleteMaterial(index, material.id)} className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                          {(!lesson.materials || lesson.materials.length === 0) && uploadingMaterial !== index && (
                            <span className="text-[10px] text-gray-400 italic">No hay archivos adjuntos</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {(!currentCourse.lessons || currentCourse.lessons.length === 0) && (
                <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-gray-100 mb-4">
                    <Video size={32} className="text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-bold">Sin lecciones aún</p>
                  <p className="text-gray-400 text-sm mt-1">Haz clic en "Añadir Lección" para comenzar a armar tu curso.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestor de Cursos</h1>
          <p className="text-gray-500 text-sm mt-1">Crea y administra los contenidos educativos de tu plataforma.</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center px-6 py-3 bg-[#FF5722] text-white rounded-2xl hover:bg-[#E64A19] shadow-xl shadow-orange-900/20 transition-all font-black uppercase tracking-widest text-xs"
        >
          <Plus size={20} className="mr-2 outline-none" />
          Nuevo Curso
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-200 text-[11px] uppercase text-gray-400 font-black tracking-wider">
              <th className="px-6 py-4">Curso</th>
              <th className="px-6 py-4">Instructor</th>
              <th className="px-6 py-4">Lecciones</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {courses.map(course => (
              <tr key={course.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <img src={course.coverImage} className="w-12 h-12 object-cover rounded-lg border border-gray-100 shadow-sm" />
                    <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{course.title}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 font-medium">{course.instructor}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[11px] font-bold rounded">{course.lessons?.length || 0}</span>
                </td>
                <td className="px-6 py-5">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${course.published ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {course.published ? 'Publicado' : 'Borrador'}
                  </span>
                </td>
                <td className="px-6 py-5 text-right space-x-1">
                  <button onClick={() => handleEdit(course)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(course.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center">
                    <BookOpen size={48} className="text-gray-200 mb-4" />
                    <p className="text-gray-500 font-medium">No hay cursos disponibles.</p>
                    <p className="text-gray-400 text-sm mt-1">Haz clic en "Nuevo Curso" para comenzar.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
