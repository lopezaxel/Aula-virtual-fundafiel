export type Role = 'admin' | 'student';

export interface Material {
  id: string;
  title: string;
  type: 'pdf' | 'doc' | 'excel' | 'image' | 'link';
  url: string;
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  videoUrl: string; // YouTube URL
  duration: string;
  materials: Material[];
  completed?: boolean; // User specific state
}

export interface Course {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  instructor: string;
  lessons: Lesson[];
  published: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  joinedAt: string;
}

export interface Profile {
  id: string;
  role: Role;
  name: string;
  avatar: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}
