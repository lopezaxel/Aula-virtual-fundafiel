import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Course, User, Role, Profile } from './types';
import { supabase } from './lib/supabase';
import type { Session, AuthError } from '@supabase/supabase-js';

// --- CONTEXT ---

interface StoreContextType {
  // Auth state
  session: Session | null;
  currentUser: User | null;
  loading: boolean;

  // Auth methods
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, name: string, role: Role) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;

  // Course management
  courses: Course[];
  fetchCourses: () => Promise<void>;
  addCourse: (course: Partial<Course>) => Promise<{ data: any, error: any }>;
  updateCourse: (course: Course) => Promise<{ error: any }>;
  deleteCourse: (id: string) => Promise<{ error: any }>;

  // Student management
  allStudents: User[];
  fetchAllStudents: () => Promise<void>;
  enrollments: { user_id: string, course_id: string }[];
  fetchEnrollments: () => Promise<void>;
  toggleEnrollment: (userId: string, courseId: string, enroll: boolean) => Promise<void>;
  lessonProgress: string[]; // List of completed lesson IDs
  toggleLessonCompletion: (lessonId: string, completed: boolean) => Promise<void>;

  // Stats
  stats: {
    totalStudents: number;
    activeCourses: number;
    completionRate: number;
  };
  refreshStats: () => Promise<void>;

  // Storage
  uploadFile: (file: File, folder: 'covers' | 'materials') => Promise<{ url: string | null, error: any }>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children?: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [enrollments, setEnrollments] = useState<{ user_id: string, course_id: string }[]>([]);
  const [lessonProgress, setLessonProgress] = useState<string[]>([]);
  const [stats, setStats] = useState({ totalStudents: 0, activeCourses: 0, completionRate: 0 });

  // Load session and user on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch initial data when user is loaded
  useEffect(() => {
    if (currentUser) {
      fetchCourses();
      fetchEnrollments();
      fetchLessonProgress();
      if (currentUser.role === 'admin') {
        fetchAllStudents();
        refreshStats();
      }
    }
  }, [currentUser]);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (profile) {
        setCurrentUser({
          id: profile.id,
          name: profile.name,
          email: session?.user?.email || '',
          role: profile.role as Role,
          avatar: profile.avatar || 'https://picsum.photos/id/64/100/100',
          joinedAt: profile.created_at
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*, lessons(*, materials(*))')
      .order('created_at', { ascending: false });

    if (data) {
      setCourses(data.map((c: any) => ({
        id: c.id,
        title: c.title,
        description: c.description || '',
        coverImage: c.cover_image || 'https://picsum.photos/800/400',
        instructor: c.instructor || '',
        published: c.published || false,
        lessons: (c.lessons || []).map((l: any) => ({
          id: l.id,
          title: l.title,
          description: l.description,
          videoUrl: l.video_url,
          duration: l.duration,
          materials: l.materials || []
        }))
      })));
    }
  };

  const fetchAllStudents = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student');

    if (data) {
      setAllStudents(data.map(p => ({
        id: p.id,
        name: p.name,
        email: '', // Email not in profiles table for privacy/security without join
        role: 'student',
        avatar: p.avatar || 'https://picsum.photos/id/64/100/100',
        joinedAt: p.created_at
      })));
    }
  };

  const fetchEnrollments = async () => {
    const { data } = await supabase.from('enrollments').select('*');
    if (data) setEnrollments(data);
  };

  const toggleEnrollment = async (userId: string, courseId: string, enroll: boolean) => {
    try {
      if (enroll) {
        const { error } = await supabase.from('enrollments').insert({ user_id: userId, course_id: courseId });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('enrollments').delete().match({ user_id: userId, course_id: courseId });
        if (error) throw error;
      }
      await fetchEnrollments();
      await refreshStats();
    } catch (error) {
      console.error('Error toggling enrollment:', error);
      alert('Error al gestionar la inscripción');
    }
  };

  const fetchLessonProgress = async () => {
    if (!currentUser) return;
    const { data } = await supabase
      .from('lesson_progress')
      .select('lesson_id')
      .eq('user_id', currentUser.id)
      .eq('completed', true);

    if (data) setLessonProgress(data.map((p: any) => p.lesson_id));
  };

  const toggleLessonCompletion = async (lessonId: string, completed: boolean) => {
    if (!currentUser) return;
    try {
      if (completed) {
        const { error } = await supabase
          .from('lesson_progress')
          .upsert({
            user_id: currentUser.id,
            lesson_id: lessonId,
            completed: true,
            updated_at: new Date().toISOString()
          });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('lesson_progress')
          .delete()
          .match({ user_id: currentUser.id, lesson_id: lessonId });
        if (error) throw error;
      }
      await fetchLessonProgress();
    } catch (error) {
      console.error('Error updating lesson progress:', error);
    }
  };

  const refreshStats = async () => {
    const { count: studentCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');
    const { count: courseCount } = await supabase.from('courses').select('*', { count: 'exact', head: true }).eq('published', true);

    setStats({
      totalStudents: studentCount || 0,
      activeCourses: courseCount || 0,
      completionRate: 0 // Placeholder for real logic
    });
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    return { error };
  };

  const signUp = async (email: string, password: string, name: string, role: Role) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } }
    });
    setLoading(false);
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const addCourse = async (course: Partial<Course>) => {
    const { lessons, ...courseOnly } = course;
    const courseData = {
      title: courseOnly.title,
      description: courseOnly.description,
      cover_image: courseOnly.coverImage,
      instructor: courseOnly.instructor,
      published: courseOnly.published
    };

    const { data: newCourse, error: courseError } = await supabase
      .from('courses')
      .insert(courseData)
      .select()
      .single();

    if (courseError) return { error: courseError };

    if (lessons && lessons.length > 0) {
      for (const lesson of lessons) {
        const { data: newLesson, error: lessonError } = await supabase
          .from('lessons')
          .insert({
            course_id: newCourse.id,
            title: lesson.title,
            description: lesson.description || '',
            video_url: lesson.videoUrl,
            duration: lesson.duration
          })
          .select()
          .single();

        if (!lessonError && lesson.materials && lesson.materials.length > 0) {
          await supabase.from('materials').insert(
            lesson.materials.map(m => ({
              lesson_id: newLesson.id,
              title: m.title,
              type: m.type,
              url: m.url
            }))
          );
        }
      }
    }

    fetchCourses();
    return { data: newCourse, error: null };
  };

  const updateCourse = async (updatedCourse: Course) => {
    const { lessons, ...courseOnly } = updatedCourse;
    const courseData = {
      title: courseOnly.title,
      description: courseOnly.description,
      cover_image: courseOnly.coverImage,
      instructor: courseOnly.instructor,
      published: courseOnly.published
    };

    const { error: courseError } = await supabase
      .from('courses')
      .update(courseData)
      .eq('id', updatedCourse.id);

    if (courseError) return { error: courseError };

    // Simple strategy for prototype: clear and recreate lessons
    // (Ideally we would diff them, but this ensures consistency for now)
    await supabase.from('lessons').delete().eq('course_id', updatedCourse.id);

    if (lessons && lessons.length > 0) {
      for (const lesson of lessons) {
        const { data: newLesson, error: lessonError } = await supabase
          .from('lessons')
          .insert({
            course_id: updatedCourse.id,
            title: lesson.title,
            description: lesson.description || '',
            video_url: lesson.videoUrl,
            duration: lesson.duration
          })
          .select()
          .single();

        if (!lessonError && lesson.materials && lesson.materials.length > 0) {
          await supabase.from('materials').insert(
            lesson.materials.map(m => ({
              lesson_id: newLesson.id,
              title: m.title,
              type: m.type,
              url: m.url
            }))
          );
        }
      }
    }

    fetchCourses();
    return { error: null };
  };

  const deleteCourse = async (id: string) => {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (!error) fetchCourses();
    return { error };
  };

  const uploadFile = async (file: File, folder: 'covers' | 'materials') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('aula-virtual')
      .upload(filePath, file);

    if (uploadError) return { url: null, error: uploadError };

    const { data: { publicUrl } } = supabase.storage
      .from('aula-virtual')
      .getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  };

  return (
    <StoreContext.Provider value={{
      session,
      currentUser,
      loading,
      signIn,
      signUp,
      signOut,
      courses,
      fetchCourses,
      addCourse,
      updateCourse,
      deleteCourse,
      allStudents,
      fetchAllStudents,
      enrollments,
      fetchEnrollments,
      toggleEnrollment,
      stats,
      refreshStats,
      uploadFile,
      lessonProgress,
      toggleLessonCompletion
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
