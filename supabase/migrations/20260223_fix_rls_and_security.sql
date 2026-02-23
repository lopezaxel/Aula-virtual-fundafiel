-- ============================================================
-- CORRECCIÓN: Cambiar políticas RLS para leer el rol desde
-- la tabla 'profiles' en lugar del JWT user_metadata.
-- Esto garantiza comportamiento consistente en cualquier PC
-- independientemente del estado del token JWT.
-- ============================================================

-- Crear una función auxiliar segura (security definer) que
-- devuelve el rol del usuario actual leyendo desde 'profiles'.
-- Usar SECURITY DEFINER para evitar recursión en RLS de profiles.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- ============================================================
-- TABLA: courses
-- ============================================================
DROP POLICY IF EXISTS "Admins have full access on courses" ON public.courses;
CREATE POLICY "Admins have full access on courses"
  ON public.courses
  FOR ALL
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

-- ============================================================
-- TABLA: enrollments
-- ============================================================
DROP POLICY IF EXISTS "Admins have full access on enrollments" ON public.enrollments;
CREATE POLICY "Admins have full access on enrollments"
  ON public.enrollments
  FOR ALL
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

-- ============================================================
-- TABLA: lessons
-- ============================================================
DROP POLICY IF EXISTS "Admins have full access on lessons" ON public.lessons;
CREATE POLICY "Admins have full access on lessons"
  ON public.lessons
  FOR ALL
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

-- ============================================================
-- TABLA: materials
-- ============================================================
DROP POLICY IF EXISTS "Admins have full access on materials" ON public.materials;
CREATE POLICY "Admins have full access on materials"
  ON public.materials
  FOR ALL
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

-- ============================================================
-- TABLA: lesson_progress
-- ============================================================
DROP POLICY IF EXISTS "Admins can view all progress" ON public.lesson_progress;
CREATE POLICY "Admins can view all progress"
  ON public.lesson_progress
  FOR SELECT
  USING (public.get_my_role() = 'admin');

-- ============================================================
-- TABLA: profiles
-- ============================================================
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    (auth.uid() = id)
    OR
    (public.get_my_role() = 'admin')
  );

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

-- ============================================================
-- TABLA: courses - también arreglar la política de estudiantes
-- ============================================================
DROP POLICY IF EXISTS "Students can view enrolled courses" ON public.courses;
CREATE POLICY "Students can view enrolled courses"
  ON public.courses
  FOR SELECT
  USING (
    published = true
    AND (
      public.get_my_role() = 'admin'
      OR EXISTS (
        SELECT 1 FROM public.enrollments
        WHERE enrollments.course_id = courses.id
          AND enrollments.user_id = auth.uid()
      )
    )
  );

-- Fix security warnings
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, name, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'avatar', 'https://picsum.photos/id/64/100/100')
  );
  RETURN NEW;
END;
$$;
